// functions/api/[[path]].js - Professional Security, Normalization & Pagination Engine

const SECURITY_CONFIG = {
    SESSION_EXPIRY: 86400 * 7, // 1 week
    SALT_ROUNDS: 100000,
    MAX_TITLE_LENGTH: 255,
    MAX_CONTENT_LENGTH: 500000,
    RATE_LIMIT_WINDOW: 60, // seconds
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_REGISTER_ATTEMPTS: 3,
    MAX_COMMENT_PER_MIN: 5,
    MAX_SEARCH_PER_MIN: 30,
    MAX_WRITE_PER_MIN: 10,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 8
};

const RESERVED_USERNAMES = ['admin', 'system', 'anonymous', 'archive_admin', 'root', 'moderator', 'yomiwiki'];

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api', '');
    const method = request.method;
    const clientIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";

    const securityHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Yomi-Request",
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    if (method === "OPTIONS") return new Response(null, { headers: securityHeaders });

    // --- [Helpers] ---
    async function hashPassword(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]);
        const saltBuffer = enc.encode(salt);
        const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: saltBuffer, iterations: SECURITY_CONFIG.SALT_ROUNDS, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        const exported = await crypto.subtle.exportKey("raw", key);
        return btoa(String.fromCharCode(...new Uint8Array(exported)));
    }

    async function createSession(username, role) {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({ sub: username, role: role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + SECURITY_CONFIG.SESSION_EXPIRY }));
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey("raw", enc.encode(env.SESSION_SECRET || "fallback_secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const signature = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`));
        return `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
    }

    async function verifySession(token) {
        if (!token) return null;
        try {
            const [header, payload, signature] = token.split('.');
            const enc = new TextEncoder();
            const key = await crypto.subtle.importKey("raw", enc.encode(env.SESSION_SECRET || "fallback_secret"), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
            const valid = await crypto.subtle.verify("HMAC", key, Uint8Array.from(atob(signature), c => c.charCodeAt(0)), enc.encode(`${header}.${payload}`));
            if (!valid) return null;
            const data = JSON.parse(atob(payload));
            if (data.exp < Math.floor(Date.now() / 1000)) return null;
            return data;
        } catch (e) { return null; }
    }

    async function checkBan(ip, username) {
        return await env.DB.prepare("SELECT * FROM bans WHERE (target_type = 'ip' AND target_value = ?) OR (target_type = 'user' AND target_value = ?)").bind(ip, username || "").first();
    }

    async function logAndCheckRateLimit(ip, action, limit = SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
        const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM ip_logs WHERE ip_address = ? AND action = ? AND timestamp > datetime('now', '-60 seconds')").bind(ip, action).first();
        context.waitUntil(env.DB.prepare("INSERT INTO ip_logs (ip_address, action) VALUES (?, ?)").bind(ip, action).run());
        return count < limit;
    }

    // --- [IMPORTANT: CONSISTENT TITLE NORMALIZATION] ---
    function normalizeTitle(rawTitle) { 
        try {
            const decoded = decodeURIComponent(rawTitle || "");
            return decoded.replace(/[_\s]+/g, '_').trim();
        } catch (e) {
            return (rawTitle || "").replace(/[_\s]+/g, '_').trim();
        }
    }

    async function getAgentTier(username) {
        if (!username || username === 'Anonymous_Agent') return { level: "0", title: "UNVERIFIED", count: 0 };
        const { count: revCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM revisions WHERE editor_info = ?").bind(username).first();
        const { count: commCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM comments WHERE author = ?").bind(username).first();
        const total = revCount + commCount;
        
        // Tier requirements significantly increased for realistic progression
        if (total >= 2000) return { level: "IV", title: "OVERSEER", count: total };
        if (total >= 500) return { level: "III", title: "FIELD LEAD", count: total };
        if (total >= 100) return { level: "II", title: "SENIOR AGENT", count: total };
        return { level: "I", title: "JUNIOR AGENT", count: total };
    }

    function getClassificationLevel(classification) {
        if (!classification) return 0;
        const upper = classification.toUpperCase();
        if (upper.includes("TOP_SECRET") || upper.includes("IV")) return 4;
        if (upper.includes("SECRET") || upper.includes("III")) return 3;
        if (upper.includes("CONFIDENTIAL") || upper.includes("II")) return 2;
        if (upper.includes("RESTRICTED") || upper.includes("I")) return 1;
        return 0;
    }

    try {
        console.log(`[API_REQUEST]: ${method} ${path}`);
        if (["POST", "DELETE", "PUT"].includes(method)) {
            if (!(await logAndCheckRateLimit(clientIP, "WRITE_ACTION", SECURITY_CONFIG.MAX_WRITE_PER_MIN))) return new Response(JSON.stringify({ error: "RATE_LIMIT" }), { status: 429, headers: securityHeaders });
            const sessionForBan = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const ban = await checkBan(clientIP, sessionForBan?.sub);
            if (ban) return new Response(JSON.stringify({ error: "ACCESS_REVOKED", reason: ban.reason }), { status: 403, headers: securityHeaders });
        }

        let resData, status = 200;

        if (path === '/auth/register' && method === "POST") {
            if (!(await logAndCheckRateLimit(clientIP, "REGISTER_ATTEMPT", SECURITY_CONFIG.MAX_REGISTER_ATTEMPTS))) {
                return new Response(JSON.stringify({ error: "TOO_MANY_REGISTRATIONS" }), { status: 429, headers: securityHeaders });
            }
            const { username, password, email } = await request.json();
            if (!username || username.length < 3 || username.length > 20) return new Response(JSON.stringify({ error: "INVALID_USERNAME" }), { status: 400, headers: securityHeaders });
            const salt = crypto.randomUUID();
            const hash = await hashPassword(password, salt);
            try {
                await env.DB.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)").bind(username, email || null, `${salt}:${hash}`).run();
                resData = { success: true };
            } catch (e) { resData = { error: "USERNAME_TAKEN" }; status = 409; }
        }

        else if (path === '/auth/login' && method === "POST") {
            if (!(await logAndCheckRateLimit(clientIP, "LOGIN_ATTEMPT", SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS))) {
                return new Response(JSON.stringify({ error: "TOO_MANY_LOGIN_ATTEMPTS" }), { status: 429, headers: securityHeaders });
            }
            const { username, password } = await request.json();
            const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
            if (!user || (await hashPassword(password, user.password_hash.split(':')[0])) !== user.password_hash.split(':')[1]) {
                resData = { error: "AUTH_FAILED" }; status = 401;
            } else {
                resData = { success: true, token: await createSession(user.username, user.role), username: user.username, role: user.role };
            }
        }

        if (path.startsWith('/article/') && method === "GET") {
            try {
                const identifier = path.replace('/article/', '');
                const revId = url.searchParams.get('rev');
                
                let article;
                const isNumericId = /^\d+$/.test(identifier);

                if (revId) {
                    // Fetch specific revision (by title for now as per legacy, or could be enhanced)
                    const title = normalizeTitle(identifier);
                    article = await env.DB.prepare("SELECT a.title, r.content_snapshot as current_content, r.editor_info as author, r.timestamp as updated_at, r.edit_summary FROM revisions r JOIN articles a ON r.article_id = a.id WHERE (a.title = ? OR a.id = ?) AND r.id = ?").bind(title, isNumericId ? parseInt(identifier) : -1, revId).first();
                    if (article) article.is_revision = true;
                } else {
                    if (isNumericId) {
                        article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
                    } else {
                        article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(normalizeTitle(identifier)).first();
                    }
                }
                
                if (!article) { status = 404; resData = { error: "RECORD_NOT_FOUND" }; }
                else {
                    let fullContent = article.current_content;
                    if (article.is_chunked && !revId) {
                        const { results } = await env.DB.prepare("SELECT content FROM article_chunks WHERE article_id = ? ORDER BY chunk_order ASC").bind(article.id).all();
                        fullContent = results.map(r => r.content).join('');
                    }
                    
                    const { results: backlinks } = await env.DB.prepare("SELECT from_title FROM links WHERE to_title = ? LIMIT 50").bind(article.title).all();
                    const { results: rawComments } = await env.DB.prepare("SELECT * FROM comments WHERE article_title = ? ORDER BY timestamp DESC").bind(article.title).all();

                    // Enrich comments with author tiers
                    const enrichedComments = await Promise.all(rawComments.map(async c => ({
                        ...c,
                        author_tier: await getAgentTier(c.author)
                    })));

                    // BOARD LOGIC
                    let subArticles = [];
                    if (identifier.startsWith('Sector:')) {
                        // Optimization: Fetch only ID and Title for the list, excluding heavy content
                        const { results } = await env.DB.prepare("SELECT id, title, author, updated_at FROM articles WHERE title LIKE ? AND is_deleted = 0 ORDER BY updated_at DESC LIMIT 100").bind(`${identifier}/%`).all();
                        subArticles = results;
                    }

                    resData = { 
                        ...article, 
                        current_content: fullContent, 
                        backlinks: backlinks.map(b => b.from_title),
                        comments: enrichedComments,
                        sub_articles: subArticles,
                        author_tier: await getAgentTier(article.author)
                    };
                }
            } catch (dbErr) { status = 500; resData = { error: "DB_ERR", msg: dbErr.message }; }
        }

        else if (path.startsWith('/article/') && path.endsWith('/history') && method === "GET") {
            const title = normalizeTitle(path.split('/')[2]);
            const { results } = await env.DB.prepare("SELECT r.id, r.editor_info as author, r.timestamp, r.edit_summary FROM revisions r JOIN articles a ON r.article_id = a.id WHERE a.title = ? ORDER BY r.timestamp DESC").bind(title).all();
            resData = results;
        }

        else if (path.startsWith('/article/') && method === "POST") {
            const title = normalizeTitle(path.substring(9));
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const { content, summary, classification } = await request.json();
            
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                // Check Lock Status
                const article = await env.DB.prepare("SELECT is_locked FROM articles WHERE title = ?").bind(title).first();
                if (article?.is_locked && session.role !== 'admin') {
                    return new Response(JSON.stringify({ error: "NODE_LOCKED", msg: "This archival node is under administrative lockdown." }), { status: 403, headers: securityHeaders });
                }

                // 1. Fetch current article to check for changes
                const currentArticle = await env.DB.prepare("SELECT id, current_content FROM articles WHERE title = ?").bind(title).first();
                
                if (currentArticle && currentArticle.current_content === content) {
                    return new Response(JSON.stringify({ success: true, msg: "NO_CHANGES_DETECTED" }), { status: 200, headers: securityHeaders });
                }

                const linkRegex = /\[\[(.*?)\]\]/g;
                let match;
                const foundLinks = new Set();
                const foundCategories = new Set();
                while ((match = linkRegex.exec(content)) !== null) {
                    const inner = match[1].split('|')[0].trim();
                    if (inner.toLowerCase().startsWith('category:')) {
                        foundCategories.add(inner.substring(9).trim());
                    } else if (inner) {
                        foundLinks.add(normalizeTitle(inner));
                    }
                }

                const editSummary = summary || "ARCHIVAL_LOG_UPDATE";
                const editorInfo = session?.sub || clientIP || "Unknown_Agent";

                const batch = [
                    env.DB.prepare("INSERT INTO articles (title, current_content, author, classification, categories, version) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, author=excluded.author, categories=excluded.categories, version=articles.version+1, updated_at=CURRENT_TIMESTAMP").bind(title, content, editorInfo, classification || null, Array.from(foundCategories).join(',')),
                    env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary) SELECT id, ?, ?, ? FROM articles WHERE title = ?").bind(content, editorInfo, editSummary, title),
                    env.DB.prepare("DELETE FROM links WHERE from_title = ?").bind(title)
                ];
                
                for (const target of foundLinks) {
                    batch.push(env.DB.prepare("INSERT OR IGNORE INTO links (from_title, to_title) VALUES (?, ?)").bind(title, target));
                }
                
                await env.DB.batch(batch);
                resData = { success: true, version_uplink: "COMPLETE" };
            }
        }

        else if (path.startsWith('/category/') && method === "GET") {
            const categoryName = decodeURIComponent(path.substring(10));
            // Item 63: Search both specific categories and classification field
            const { results } = await env.DB.prepare("SELECT title, author, updated_at FROM articles WHERE (categories LIKE ? OR classification = ?) AND is_deleted = 0 ORDER BY title ASC").bind(`%${categoryName}%`, categoryName).all();
            resData = { category: categoryName, members: results };
        }

        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author, r.edit_summary as summary FROM revisions r JOIN articles a ON r.article_id = a.id UNION ALL SELECT 'comment' as type, article_title as title, timestamp, author, 'NEW_COMM_TRANSMISSION' as summary FROM comments ORDER BY timestamp DESC LIMIT 40").all();
            resData = results;
        }

        else if (path === '/api/search/full' && method === "GET") {
            if (!(await logAndCheckRateLimit(clientIP, "SEARCH_ACTION", SECURITY_CONFIG.MAX_SEARCH_PER_MIN))) {
                return new Response(JSON.stringify({ error: "SEARCH_THROTTLED" }), { status: 429, headers: securityHeaders });
            }
            const query = url.searchParams.get('q');
            if (!query) return new Response(JSON.stringify([]), { headers: securityHeaders });
            
            // Item 68: Search both title and content
            const { results } = await env.DB.prepare("SELECT title, author, updated_at FROM articles WHERE (title LIKE ? OR current_content LIKE ?) AND is_deleted = 0 ORDER BY updated_at DESC LIMIT 50").bind(`%${query}%`, `%${query}%`).all();
            resData = results;
        }

        else if (path === '/search/suggest' && method === "GET") {
            if (!(await logAndCheckRateLimit(clientIP, "SEARCH_ACTION", SECURITY_CONFIG.MAX_SEARCH_PER_MIN))) {
                return new Response(JSON.stringify({ error: "SEARCH_THROTTLED" }), { status: 429, headers: securityHeaders });
            }
            const query = url.searchParams.get('q');
            if (!query || query.length < 2) return new Response(JSON.stringify([]), { headers: securityHeaders });
            
            const { results } = await env.DB.prepare("SELECT title FROM articles WHERE title LIKE ? AND is_deleted = 0 ORDER BY title ASC LIMIT 10").bind(`%${query}%`).all();
            resData = results.map(r => r.title);
        }

        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            if (!(await logAndCheckRateLimit(clientIP, "COMMENT_ACTION", SECURITY_CONFIG.MAX_COMMENT_PER_MIN))) {
                return new Response(JSON.stringify({ error: "COMMENT_SPAM_DETECTED" }), { status: 429, headers: securityHeaders });
            }
            const title = normalizeTitle(path.split('/')[2]);
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const { content, parent_id } = await request.json();
            if (!content) return new Response(JSON.stringify({ error: "EMPTY" }), { status: 400, headers: securityHeaders });
            const author = session ? session.sub : 'Anonymous_Agent';
            await env.DB.prepare("INSERT INTO comments (article_title, author, content, parent_id) VALUES (?, ?, ?, ?)").bind(title, author, content, parent_id || null).run();
            resData = { success: true };
        }

        else if (path === '/admin/stats' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            
            const { count: articleCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM articles WHERE is_deleted = 0").first();
            const { count: userCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
            const { count: banCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM bans").first();
            const { count: revCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM revisions").first();
            
            resData = { 
                stats: { articleCount, userCount, banCount, revCount },
                system_status: "OPTIMAL",
                grid_load: "2.4%" 
            };
        }

        else if (path === '/admin/audit-logs' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            
            const { results } = await env.DB.prepare(`
                SELECT 'EDIT' as type, editor_info as actor, article_id as target, edit_summary as detail, timestamp FROM revisions
                UNION ALL
                SELECT 'COMM' as type, author as actor, article_title as target, content as detail, timestamp FROM comments
                UNION ALL
                SELECT 'BAN' as type, banned_by as actor, target_value as target, reason as detail, timestamp FROM bans
                UNION ALL
                SELECT 'SEC' as type, ip_address as actor, action as target, 'System security check' as detail, timestamp FROM ip_logs
                ORDER BY timestamp DESC LIMIT 50
            `).all();
            resData = results;
        }

        else if (path === '/api/articles/recent' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 10").all();
            resData = results;
        }

        else if (path === '/api/articles/check' && method === "POST") {
            const { titles } = await request.json();
            if (!titles || !Array.isArray(titles)) return new Response(JSON.stringify({ existing: [] }), { status: 200, headers: securityHeaders });
            
            const placeholders = titles.map(() => "?").join(",");
            const { results } = await env.DB.prepare(`SELECT title FROM articles WHERE title IN (${placeholders}) AND is_deleted = 0`).bind(...titles).all();
            
            resData = { existing: results.map(r => r.title) };
        }

        else if (path === '/api/comments' && method === "GET") {
            const articleId = url.searchParams.get('article_id');
            const { results } = await env.DB.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY timestamp ASC").bind(articleId).all();
            
            const enriched = await Promise.all(results.map(async c => ({
                ...c,
                author_tier: await getAgentTier(c.author)
            })));
            
            resData = { comments: enriched };
        }

        else if (path === '/admin/bans' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { results } = await env.DB.prepare("SELECT * FROM bans ORDER BY timestamp DESC").all();
            resData = results;
        }

        else if (path.startsWith('/admin/ban/') && method === "DELETE") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const banId = path.split('/')[3];
            await env.DB.prepare("DELETE FROM bans WHERE id = ?").bind(banId).run();
            resData = { success: true };
        }

        else if (path === '/api/comments' && method === "POST") {
            const { article_id, content } = await request.json();
            const author = "Anonymous_Agent"; // Default for now
            
            await env.DB.prepare("INSERT INTO comments (article_id, article_title, author, content) SELECT ?, title, ?, ? FROM articles WHERE id = ?").bind(article_id, author, content, article_id).run();
            
            resData = { success: true };
        }

        else if (path === '/admin/ban' && method === "POST") {

            // Safety: Prevent self-ban
            if (target_user === session.sub) return new Response(JSON.stringify({ error: "SELF_TERMINATION_PROHIBITED", message: "You cannot terminate your own access." }), { status: 400, headers: securityHeaders });

            const batch = [];
            if (target_user) batch.push(env.DB.prepare("INSERT OR REPLACE INTO bans (target_type, target_value, reason, banned_by) VALUES ('user', ?, ?, ?)").bind(target_user, reason || "Violation of Archival Protocols", session.sub));
            if (target_ip) batch.push(env.DB.prepare("INSERT OR REPLACE INTO bans (target_type, target_value, reason, banned_by) VALUES ('ip', ?, ?, ?)").bind(target_ip, reason || "Violation of Archival Protocols", session.sub));
            
            if (batch.length > 0) await env.DB.batch(batch);
            resData = { success: true, message: "ACCESS_TERMINATED" };
        }

        else if (path === '/admin/article/lock' && method === "POST") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            
            const { title } = await request.json();
            const normalized = normalizeTitle(title);
            await env.DB.prepare("UPDATE articles SET is_locked = 1 - is_locked WHERE title = ?").bind(normalized).run();
            resData = { success: true };
        }

        else if (path === '/admin/article/purge' && method === "DELETE") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            
            const { title } = await request.json();
            const normalized = normalizeTitle(title);
            const article = await env.DB.prepare("SELECT id FROM articles WHERE title = ?").bind(normalized).first();
            
            if (article) {
                await env.DB.batch([
                    env.DB.prepare("DELETE FROM revisions WHERE article_id = ?").bind(article.id),
                    env.DB.prepare("DELETE FROM article_chunks WHERE article_id = ?").bind(article.id),
                    env.DB.prepare("DELETE FROM comments WHERE article_title = ?").bind(normalized),
                    env.DB.prepare("DELETE FROM links WHERE from_title = ? OR to_title = ?").bind(normalized, normalized),
                    env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(article.id)
                ]);
                resData = { success: true, message: "NODE_PURGED" };
            } else {
                status = 404; resData = { error: "NODE_NOT_FOUND" };
            }
        }

        else if (path === '/assets/upload' && method === "POST") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: securityHeaders });

            const formData = await request.formData();
            const file = formData.get('file');
            if (!file || !(file instanceof File)) return new Response(JSON.stringify({ error: "INVALID_FILE" }), { status: 400, headers: securityHeaders });

            const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const uploadKey = `archives/images/${fileName}`;
            
            // Upload to R2
            await env.ASSETS_BUCKET.put(uploadKey, file.stream(), {
                httpMetadata: { contentType: file.type }
            });

            const publicUrl = `/api/assets/${fileName}`; // Serving via Worker
            
            // Record in DB
            await env.DB.prepare("INSERT INTO assets (filename, url, uploader) VALUES (?, ?, ?)").bind(fileName, publicUrl, session.sub).run();
            
            resData = { success: true, url: publicUrl, name: file.name };
        }

        else if (path.startsWith('/assets/') && method === "GET") {
            const fileName = path.split('/')[2];
            const object = await env.ASSETS_BUCKET.get(`archives/images/${fileName}`);
            
            if (!object) return new Response("SIGNAL_NOT_FOUND", { status: 404 });
            
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set("etag", object.httpEtag);
            headers.set("Cache-Control", "public, max-age=31536000");
            
            return new Response(object.body, { headers });
        }

        else { status = 404; resData = { error: "NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) { return new Response(JSON.stringify({ error: "ERR", msg: err.message }), { status: 500, headers: securityHeaders }); }
}
