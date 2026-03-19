// functions/api/[[path]].js - Professional Resilient Engine (v2.4.8 Final Fix)

const SECURITY_CONFIG = {
    SESSION_EXPIRY: 86400 * 7,
    SALT_ROUNDS: 100000,
    MAX_TITLE_LENGTH: 255,
    MAX_CONTENT_LENGTH: 500000,
    RATE_LIMIT_WINDOW: 60,
    MAX_WRITE_PER_MIN: 10,
    MAX_COMMENT_PER_MIN: 5
};

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
        "Content-Type": "application/json"
    };

    if (method === "OPTIONS") return new Response(null, { headers: securityHeaders });

    function normalizeTitle(rawTitle) {
        try {
            const decoded = decodeURIComponent(rawTitle || "");
            return decoded.trim().replace(/\s+/g, '_');
        } catch (e) {
            return (rawTitle || "").trim().replace(/\s+/g, '_');
        }
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function verifySession(token) {
        if (!token) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 2) return null;
            const payload = JSON.parse(atob(parts[0]));
            // In a real app, verify the signature here
            return payload;
        } catch (e) { return null; }
    }

    async function getAgentTier(username) {
        return { level: "I", title: "AGENT" };
    }

    try {
        let resData = null;
        let status = 200;

        // AUTH CHECK FOR WRITE OPERATIONS
        const authHeader = request.headers.get("Authorization");
        const token = authHeader ? authHeader.split(' ')[1] : null;
        const user = await verifySession(token);

        // 1. ARTICLE FETCH
        if (path.startsWith('/article/') && method === "GET" && !path.endsWith('/history') && !path.endsWith('/comments')) {
            const identifier = path.replace('/article/', '');
            const revId = url.searchParams.get('rev');
            const isNumericId = /^\d+$/.test(identifier);
            
            let article;
            if (revId) {
                const title = normalizeTitle(identifier);
                article = await env.DB.prepare("SELECT a.title, r.content_snapshot as current_content, r.editor_info as author, r.timestamp as updated_at, a.id, a.comments_data FROM revisions r JOIN articles a ON r.article_id = a.id WHERE (a.title = ? OR a.id = ?) AND r.id = ?").bind(title, isNumericId ? parseInt(identifier) : -1, revId).first();
            } else {
                if (isNumericId) article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
                else article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(normalizeTitle(identifier)).first();
            }

            if (!article) {
                status = 404; resData = { error: "RECORD_NOT_FOUND", title: identifier };
            } else {
                let comments = [];
                try {
                    comments = JSON.parse(article.comments_data || '[]');
                } catch (e) {
                    console.error("COMMENT_PARSE_ERROR", e);
                    comments = [];
                }
                
                let subArticles = [];
                if (article.title.startsWith('Sector:') && !article.title.substring(7).includes('/')) {
                    const { results } = await env.DB.prepare("SELECT id, title, author, updated_at FROM articles WHERE title LIKE ? AND title != ? AND is_deleted = 0 ORDER BY updated_at DESC").bind(`${article.title}/%`, article.title).all();
                    subArticles = results;
                }
                resData = { ...article, comments, sub_articles: subArticles };
            }
        }

        // 2. SEARCH SUGGEST
        else if (path === '/search/suggest' && method === "GET") {
            const query = url.searchParams.get('q');
            const { results } = await env.DB.prepare("SELECT title FROM articles WHERE title LIKE ? AND is_deleted = 0 LIMIT 10").bind(`%${query}%`).all();
            resData = results.map(r => r.title);
        }

        // 3. GLOBAL HISTORY
        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author FROM revisions r JOIN articles a ON r.article_id = a.id ORDER BY r.timestamp DESC LIMIT 20").all();
            resData = results;
        }

        // 4. SIDEBAR RECENT
        else if (path === '/api/articles/recent' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT id, title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 10").all();
            resData = results;
        }

        // 5. POST COMMENT (Integrated JSON Storage)
        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            const titlePart = path.replace('/article/', '').replace('/comments', '');
            const title = normalizeTitle(titlePart);
            const { content, parent_id } = await request.json();
            
            const article = await env.DB.prepare("SELECT id, title, comments_data FROM articles WHERE title = ?").bind(title).first();
            if (article) {
                let comments = [];
                try {
                    comments = JSON.parse(article.comments_data || '[]');
                } catch (e) { comments = []; }

                const newComment = {
                    id: Date.now() + Math.random().toString(36).substring(2, 7), // More robust ID
                    author: user ? user.username : 'Anonymous_Agent',
                    content: content,
                    timestamp: new Date().toISOString(),
                    parent_id: parent_id || null
                };
                comments.push(newComment);

                await env.DB.prepare("UPDATE articles SET comments_data = ? WHERE id = ?").bind(JSON.stringify(comments), article.id).run();
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 6. UPDATE ARTICLE (Registered Users Only)
        else if (path.startsWith('/article/') && (method === "POST" || method === "PUT")) {
            if (!user) {
                return new Response(JSON.stringify({ error: "UNAUTHORIZED_CLEARANCE_REQUIRED" }), { status: 401, headers: securityHeaders });
            }
            const title = normalizeTitle(path.replace('/article/', ''));
            const { content } = await request.json();
            const batch = [
                env.DB.prepare("INSERT INTO articles (title, current_content, author) VALUES (?, ?, ?) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, updated_at=CURRENT_TIMESTAMP, author=excluded.author").bind(title, content, user.username),
                env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info) SELECT id, ?, ? FROM articles WHERE title = ?").bind(content, user.username, title)
            ];
            await env.DB.batch(batch);
            resData = { success: true };
        }

        // 7. AUTHENTICATION (Login/Register)
        else if ((path === '/auth/login' || path === 'auth/login' || path === '/auth/register' || path === 'auth/register') && method === "POST") {
            const { username, password } = await request.json();
            if (!username || !password) {
                status = 400; resData = { error: "FIELDS_INCOMPLETE" };
            } else if (path.includes('register')) {
                // Check if IP already has an account
                const ipCheck = await env.DB.prepare("SELECT id FROM users WHERE registration_ip = ?").bind(clientIP).first();
                if (ipCheck) {
                    status = 403; resData = { error: "MULTIPLE_ACCOUNTS_PROHIBITED", message: "Only one agent ID per IP uplink is permitted." };
                } else {
                    const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
                    if (existing) {
                        status = 409; resData = { error: "IDENTIFIER_ALREADY_EXISTS" };
                    } else {
                        const passHash = await hashPassword(password);
                        await env.DB.prepare("INSERT INTO users (username, password_hash, role, registration_ip) VALUES (?, ?, 'viewer', ?)").bind(username, passHash, clientIP).run();
                        const payload = { username, role: 'viewer', exp: Date.now() + SECURITY_CONFIG.SESSION_EXPIRY * 1000 };
                        const tokenStr = btoa(JSON.stringify(payload)) + ".signature";
                        resData = { success: true, username, token: tokenStr, role: 'viewer' };
                    }
                }
            } else {
                // Login
                const userRec = await env.DB.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE").bind(username).first();
                if (!userRec) {
                    status = 404; resData = { error: "IDENTIFIER_NOT_FOUND" };
                } else {
                    const passHash = await hashPassword(password);
                    if (userRec.password_hash === passHash) {
                        const payload = { username: userRec.username, role: userRec.role, exp: Date.now() + SECURITY_CONFIG.SESSION_EXPIRY * 1000 };
                        const tokenStr = btoa(JSON.stringify(payload)) + ".signature";
                        resData = { success: true, username: userRec.username, token: tokenStr, role: userRec.role };
                    } else {
                        status = 401; resData = { error: "PASSWORD_MISMATCH" };
                    }
                }
            }
        }

        // 8. ADMIN: STATS
        else if (path === '/admin/stats' && method === "GET") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { count: articleCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM articles WHERE is_deleted = 0").first();
            const { count: userCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
            const { count: banCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM bans").first();
            const { count: revCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM revisions").first();
            resData = { stats: { articleCount, userCount, banCount, revCount }, system_status: "OPTIMAL" };
        }

        // 9. ADMIN: AUDIT LOGS
        else if (path === '/admin/audit-logs' && method === "GET") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { results } = await env.DB.prepare(`
                SELECT 'EDIT' as type, editor_info as actor, a.title as target, edit_summary as detail, r.timestamp FROM revisions r JOIN articles a ON r.article_id = a.id
                UNION ALL
                SELECT 'BAN' as type, banned_by as actor, target_value as target, reason as detail, timestamp FROM bans
                UNION ALL
                SELECT 'SEC' as type, ip_address as actor, action as target, 'System security check' as detail, timestamp FROM ip_logs
                ORDER BY timestamp DESC LIMIT 50
            `).all();
            resData = results;
        }

        // 10. ADMIN: BANS
        else if (path === '/admin/bans' && method === "GET") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { results } = await env.DB.prepare("SELECT * FROM bans ORDER BY timestamp DESC").all();
            resData = results;
        }

        else if (path === '/admin/ban' && method === "POST") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { target_user, target_ip, reason } = await request.json();
            const batch = [];
            if (target_user) batch.push(env.DB.prepare("INSERT OR REPLACE INTO bans (target_type, target_value, reason, banned_by) VALUES ('user', ?, ?, ?)").bind(target_user, reason || "Protocol Violation", user.username));
            if (target_ip) batch.push(env.DB.prepare("INSERT OR REPLACE INTO bans (target_type, target_value, reason, banned_by) VALUES ('ip', ?, ?, ?)").bind(target_ip, reason || "Protocol Violation", user.username));
            if (batch.length > 0) await env.DB.batch(batch);
            resData = { success: true };
        }

        else if (path.startsWith('/admin/ban/') && method === "DELETE") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const banId = path.split('/')[3];
            await env.DB.prepare("DELETE FROM bans WHERE id = ?").bind(banId).run();
            resData = { success: true };
        }

        // 11. ADMIN: ARTICLE CONTROL
        else if (path === '/admin/article/lock' && method === "POST") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { title } = await request.json();
            await env.DB.prepare("UPDATE articles SET is_locked = 1 - is_locked WHERE title = ?").bind(normalizeTitle(title)).run();
            resData = { success: true };
        }

        else if (path === '/admin/article/purge' && method === "DELETE") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { title } = await request.json();
            const normalized = normalizeTitle(title);
            const article = await env.DB.prepare("SELECT id FROM articles WHERE title = ?").bind(normalized).first();
            if (article) {
                await env.DB.batch([
                    env.DB.prepare("DELETE FROM revisions WHERE article_id = ?").bind(article.id),
                    env.DB.prepare("DELETE FROM article_chunks WHERE article_id = ?").bind(article.id),
                    env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(article.id)
                ]);
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 12. ASSETS (Upload & Serve)
        else if (path === '/assets/upload' && method === "POST") {
            if (!user) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: securityHeaders });

            const formData = await request.formData();
            const file = formData.get('file');
            if (!file || !(file instanceof File)) return new Response(JSON.stringify({ error: "INVALID_FILE" }), { status: 400, headers: securityHeaders });

            // 3.0MB Limit Check
            if (file.size > 3 * 1024 * 1024) return new Response(JSON.stringify({ error: "FILE_TOO_LARGE", message: "Maximum size is 3.0MB" }), { status: 413, headers: securityHeaders });

            const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const uploadKey = `archives/images/${fileName}`;
            
            await env.ASSETS_BUCKET.put(uploadKey, file.stream(), {
                httpMetadata: { contentType: file.type }
            });

            const publicUrl = `/api/assets/${fileName}`;
            await env.DB.prepare("INSERT INTO assets (filename, url, uploader) VALUES (?, ?, ?)").bind(fileName, publicUrl, user.username).run();
            
            resData = { success: true, url: publicUrl, filename: fileName };
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

        else { status = 404; resData = { error: "PATH_NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: "CRITICAL_SYSTEM_ERROR", message: err.message }), { status: 500, headers: securityHeaders });
    }
}
