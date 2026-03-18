// functions/api/[[path]].js - Professional Security, Normalization & Pagination Engine

const SECURITY_CONFIG = {
    SESSION_EXPIRY: 86400 * 7, // 1 week
    SALT_ROUNDS: 100000,
    MAX_TITLE_LENGTH: 255,
    MAX_CONTENT_LENGTH: 500000,
    RATE_LIMIT_WINDOW: 60, // seconds
    MAX_REQUESTS_PER_WINDOW: 30,
    MAX_SEARCH_PER_WINDOW: 10, // More restrictive for search
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

    // --- [Security Helpers] ---
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
        const ban = await env.DB.prepare("SELECT * FROM bans WHERE (target_type = 'ip' AND target_value = ?) OR (target_type = 'user' AND target_value = ?)").bind(ip, username || "").first();
        return ban;
    }

    async function logAndCheckRateLimit(ip, action, limit = SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
        const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM ip_logs WHERE ip_address = ? AND action = ? AND timestamp > datetime('now', '-60 seconds')").bind(ip, action).first();
        context.waitUntil(env.DB.prepare("INSERT INTO ip_logs (ip_address, action) VALUES (?, ?)").bind(ip, action).run());
        return count < limit;
    }

    async function createNotification(targetUser, type, sender, articleTitle, commentId, message) {
        if (!targetUser || targetUser === sender) return;
        await env.DB.prepare("INSERT INTO notifications (target_user, type, sender, article_title, comment_id, message) VALUES (?, ?, ?, ?, ?, ?)").bind(targetUser, type, sender, articleTitle || null, commentId || null, message || null).run();
    }

    function normalizeTitle(rawTitle) { return decodeURIComponent(rawTitle || "").replace(/[_\s]+/g, ' ').trim(); }

    async function getAgentTier(username) {
        if (!username) return { level: "I", title: "GUEST", count: 0 };
        const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM revisions WHERE editor_info = ?").bind(username).first();
        if (count >= 100) return { level: "IV", title: "OVERSEER", count, numeric: 4 };
        if (count >= 50) return { level: "III", title: "FIELD LEAD", count, numeric: 3 };
        if (count >= 10) return { level: "II", title: "SENIOR AGENT", count, numeric: 2 };
        return { level: "I", title: "JUNIOR AGENT", count, numeric: 1 };
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
        if (["POST", "DELETE", "PUT"].includes(method)) {
            if (request.headers.get("X-Yomi-Request") !== "true") return new Response(JSON.stringify({ error: "CSRF_ERROR" }), { status: 403, headers: securityHeaders });
            if (!(await logAndCheckRateLimit(clientIP, "WRITE_ACTION"))) return new Response(JSON.stringify({ error: "RATE_LIMIT" }), { status: 429, headers: securityHeaders });

            const sessionForBan = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const ban = await checkBan(clientIP, sessionForBan?.sub);
            if (ban) return new Response(JSON.stringify({ error: "ACCESS_REVOKED", reason: ban.reason }), { status: 403, headers: securityHeaders });
        }

        let resData, status = 200;

        if (path === '/auth/register' && method === "POST") {
            const { username, password, email } = await request.json();
            if (!username || username.length < SECURITY_CONFIG.MIN_USERNAME_LENGTH || username.length > SECURITY_CONFIG.MAX_USERNAME_LENGTH) 
                return new Response(JSON.stringify({ error: "INVALID_USERNAME_LENGTH" }), { status: 400, headers: securityHeaders });
            if (!/^[a-zA-Z0-9_\-]+$/.test(username)) 
                return new Response(JSON.stringify({ error: "INVALID_USERNAME_FORMAT" }), { status: 400, headers: securityHeaders });
            if (RESERVED_USERNAMES.includes(username.toLowerCase())) 
                return new Response(JSON.stringify({ error: "RESERVED_USERNAME" }), { status: 400, headers: securityHeaders });
            if (!password || password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) 
                return new Response(JSON.stringify({ error: "INVALID_PASSWORD_LENGTH" }), { status: 400, headers: securityHeaders });

            const salt = crypto.randomUUID();
            const hash = await hashPassword(password, salt);
            try {
                await env.DB.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)").bind(username, email || null, `${salt}:${hash}`).run();
                resData = { success: true };
            } catch (e) { 
                if (e.message.includes("users.username")) resData = { error: "USERNAME_TAKEN" };
                else if (e.message.includes("users.email")) resData = { error: "EMAIL_TAKEN" };
                else resData = { error: "REGISTRATION_FAILED" };
                status = 409; 
            }
        }

        else if (path === '/auth/login' && method === "POST") {
            const { username, password } = await request.json();
            const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
            if (!user || (await hashPassword(password, user.password_hash.split(':')[0])) !== user.password_hash.split(':')[1]) {
                resData = { error: "AUTH_FAILED" }; status = 401;
            } else {
                resData = { success: true, token: await createSession(user.username, user.role), username: user.username, role: user.role };
            }
        }

        else if (path === '/auth/me' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (session) resData = { authenticated: true, user: session.sub, role: session.role, tier: await getAgentTier(session.sub) };
            else resData = { authenticated: false };
        }

        else if (path.startsWith('/article/') && method === "GET") {
            try {
                const title = normalizeTitle(path.substring(9));
                const query = `
                    SELECT a.*, 
                    (SELECT COUNT(*) FROM revisions WHERE editor_info = a.author) as author_contribution_count
                    FROM articles a 
                    WHERE a.title = ? OR a.title = ?
                `;
                const article = await env.DB.prepare(query).bind(title, title.replace(/ /g, '_')).first();
                
                if (!article) { status = 404; resData = { error: "RECORD_NOT_FOUND" }; }
                else {
                    let fullContent = article.current_content;
                    if (article.is_chunked) {
                        const { results } = await env.DB.prepare("SELECT content FROM article_chunks WHERE article_id = ? ORDER BY chunk_order ASC").bind(article.id).all();
                        fullContent = results.map(r => r.content).join('');
                    }
                    const count = article.author_contribution_count || 0;
                    const authorTier = {
                        count,
                        level: count >= 100 ? "IV" : count >= 50 ? "III" : count >= 10 ? "II" : "I",
                        title: count >= 100 ? "OVERSEER" : count >= 50 ? "FIELD LEAD" : count >= 10 ? "SENIOR AGENT" : "JUNIOR AGENT"
                    };
                    const { results: backlinks } = await env.DB.prepare("SELECT from_title FROM links WHERE to_title = ? LIMIT 50").bind(article.title).all();
                    resData = { ...article, current_content: fullContent, author_tier: authorTier, backlinks: backlinks.map(b => b.from_title) };
                }
            } catch (dbErr) { status = 500; resData = { error: "DB_ERR", msg: dbErr.message }; }
        }

        else if (path.startsWith('/article/') && method === "POST") {
            const title = normalizeTitle(path.substring(9));
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const { content, summary, classification } = await request.json();
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                const article = await env.DB.prepare("SELECT author, classification, is_locked FROM articles WHERE title = ?").bind(title).first();
                if (article && article.is_locked && session.role !== 'admin') return new Response(JSON.stringify({ error: "LOCKED" }), { status: 403, headers: securityHeaders });
                
                const linkRegex = /\[\[(.*?)\]\]/g;
                let match;
                const foundLinks = new Set();
                const foundCategories = new Set();
                while ((match = linkRegex.exec(content)) !== null) {
                    const inner = match[1].split('|')[0].trim();
                    if (inner.toLowerCase().startsWith('category:')) foundCategories.add(inner.substring(9).trim());
                    else if (inner) foundLinks.add(normalizeTitle(inner));
                }
                const categoriesStr = Array.from(foundCategories).join(',');

                const batch = [
                    env.DB.prepare("INSERT INTO articles (title, current_content, author, classification, categories, version) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, author=excluded.author, classification=COALESCE(excluded.classification, articles.classification), categories=excluded.categories, version=articles.version+1, updated_at=CURRENT_TIMESTAMP").bind(title, content, session.sub, classification || null, categoriesStr),
                    env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary) SELECT id, ?, ?, ? FROM articles WHERE title = ?").bind(content, session.sub, summary || "", title),
                    env.DB.prepare("DELETE FROM editing_sessions WHERE article_title = ? AND username = ?").bind(title, session.sub),
                    env.DB.prepare("DELETE FROM links WHERE from_title = ?").bind(title)
                ];
                for (const target of foundLinks) batch.push(env.DB.prepare("INSERT OR IGNORE INTO links (from_title, to_title) VALUES (?, ?)").bind(title, target));
                await env.DB.batch(batch);
                resData = { success: true };
            }
        }

        else if (path === '/history' && method === "GET") {
            // Unified Activity Log: Edits + Comments
            const query = `
                SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author, r.edit_summary as summary
                FROM revisions r 
                JOIN articles a ON r.article_id = a.id 
                UNION ALL 
                SELECT 'comment' as type, article_title as title, timestamp, author, content as summary
                FROM comments 
                ORDER BY timestamp DESC LIMIT 40
            `;
            const { results } = await env.DB.prepare(query).all();
            resData = results;
        }

        else if (path.startsWith('/article/') && path.endsWith('/comments')) {
            const title = normalizeTitle(path.split('/')[2]);
            if (method === "GET") resData = (await env.DB.prepare("SELECT * FROM comments WHERE article_title = ? ORDER BY timestamp DESC").bind(title).all()).results;
            else {
                const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
                const { content } = await request.json();
                const author = session ? session.sub : 'Anonymous_Agent';
                await env.DB.prepare("INSERT INTO comments (article_title, author, content) VALUES (?, ?, ?)").bind(title, author, content).run();
                resData = { success: true };
            }
        }

        else if (path.startsWith('/article/') && path.includes('/comments/')) {
            const parts = path.split('/');
            const commentId = parts[parts.indexOf('comments') + 1];
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (method === "DELETE" && session) {
                const comment = await env.DB.prepare("SELECT author FROM comments WHERE id = ?").bind(commentId).first();
                if (comment && (comment.author === session.sub || session.role === 'admin')) {
                    await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(commentId).run();
                    resData = { success: true };
                } else { status = 403; resData = { error: "FORBIDDEN" }; }
            }
        }

        else if (path === '/search' && method === "GET") {
            const query = url.searchParams.get("q");
            const { results } = await env.DB.prepare("SELECT title FROM articles WHERE title LIKE ? AND is_deleted = 0 LIMIT 10").bind(`${query}%`).all();
            resData = results.map(r => r.title);
        }

        else if (path === '/notifications' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                const { results } = await env.DB.prepare("SELECT * FROM notifications WHERE target_user = ? ORDER BY timestamp DESC LIMIT 50").bind(session.sub).all();
                const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM notifications WHERE target_user = ? AND is_read = 0").bind(session.sub).first();
                resData = { notifications: results, unread_count: count };
            }
        }

        else { status = 404; resData = { error: "NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) { return new Response(JSON.stringify({ error: "ERR", msg: err.message }), { status: 500, headers: securityHeaders }); }
}
