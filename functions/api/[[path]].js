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
        await env.DB.prepare("INSERT INTO ip_logs (ip_address, action) VALUES (?, ?)").bind(ip, action).run();
        const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM ip_logs WHERE ip_address = ? AND action = ? AND timestamp > datetime('now', '-60 seconds')").bind(ip, action).first();
        return count <= limit;
    }

    async function executeWithRetry(operation) {
        if (Array.isArray(operation)) return await env.DB.batch(operation);
        return operation.run ? await operation.run() : await operation.all();
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
            
            // 92. Server-side Validation
            if (!username || username.length < SECURITY_CONFIG.MIN_USERNAME_LENGTH || username.length > SECURITY_CONFIG.MAX_USERNAME_LENGTH) 
                return new Response(JSON.stringify({ error: "INVALID_USERNAME_LENGTH" }), { status: 400, headers: securityHeaders });
            if (!/^[a-zA-Z0-9_\-]+$/.test(username)) 
                return new Response(JSON.stringify({ error: "INVALID_USERNAME_FORMAT" }), { status: 400, headers: securityHeaders });
            if (RESERVED_USERNAMES.includes(username.toLowerCase())) 
                return new Response(JSON.stringify({ error: "RESERVED_USERNAME" }), { status: 400, headers: securityHeaders });
            if (!password || password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) 
                return new Response(JSON.stringify({ error: "INVALID_PASSWORD_LENGTH" }), { status: 400, headers: securityHeaders });
            
            // Basic Email Validation if provided
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                return new Response(JSON.stringify({ error: "INVALID_EMAIL_FORMAT" }), { status: 400, headers: securityHeaders });

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

        else if (path.startsWith('/user/') && method === "GET") {
            const username = decodeURIComponent(path.substring(6));
            const tier = await getAgentTier(username);
            const { results } = await env.DB.prepare("SELECT a.title, r.timestamp, r.edit_summary FROM revisions r JOIN articles a ON r.article_id = a.id WHERE r.editor_info = ? ORDER BY r.timestamp DESC LIMIT 20").bind(username).all();
            resData = { contributions: results, tier };
        }

        else if (path.startsWith('/article/') && method === "GET") {
            try {
                const title = normalizeTitle(path.substring(9));
                if (!env.DB) throw new Error("DATABASE_BINDING_MISSING");
                
                // 37 & 38. Consistent normalization: Search both with space and underscore
                const article = await env.DB.prepare("SELECT * FROM articles WHERE title = ? OR title = ?").bind(title, title.replace(/ /g, '_')).first();
                
                if (!article) { 
                    status = 404; 
                    resData = { error: "RECORD_NOT_FOUND", requested_title: title }; 
                }
                else {
                    const authorTier = await getAgentTier(article.author);
                    resData = { ...article, author_tier: authorTier };
                }
            } catch (dbErr) {
                status = 500;
                resData = { 
                    error: "BACKEND_CRASH", 
                    msg: dbErr.message, 
                    stack: dbErr.stack,
                    context: "ARTICLE_GET_ROUTE"
                };
            }
        }

        else if (path.startsWith('/article/') && method === "POST") {
            const title = normalizeTitle(path.substring(9));
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const { content, summary, classification } = await request.json();
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                const article = await env.DB.prepare("SELECT author, classification, is_locked FROM articles WHERE title = ?").bind(title).first();
                if (article && article.is_locked && session.role !== 'admin') {
                    return new Response(JSON.stringify({ error: "LOCKED" }), { status: 403, headers: securityHeaders });
                }
                const userTier = await getAgentTier(session.sub);
                const requiredLevel = getClassificationLevel(article ? article.classification : classification);
                if (userTier.numeric < requiredLevel) {
                    status = 403;
                    resData = { error: "INSUFFICIENT_CLEARANCE", required: requiredLevel, current: userTier.numeric };
                } else {
                    await executeWithRetry([
                        env.DB.prepare("INSERT INTO articles (title, current_content, author, classification, version) VALUES (?, ?, ?, ?, 1) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, author=excluded.author, classification=COALESCE(excluded.classification, articles.classification), version=articles.version+1, updated_at=CURRENT_TIMESTAMP").bind(title, content, session.sub, classification || null),
                        env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary) SELECT id, ?, ?, ? FROM articles WHERE title = ?").bind(content, session.sub, summary || "", title),
                        env.DB.prepare("DELETE FROM editing_sessions WHERE article_title = ? AND username = ?").bind(title, session.sub)
                    ]);
                    if (article && article.author !== session.sub) await createNotification(article.author, 'edit', session.sub, title, null, `Your article "${title}" has been updated.`);
                    resData = { success: true };
                }
            }
        }

        else if (path.startsWith('/article/') && path.includes('/heartbeat') && method === "POST") {
            const parts = path.split('/');
            const title = normalizeTitle(parts[2]);
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                await env.DB.prepare("INSERT INTO editing_sessions (article_title, username, last_heartbeat) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(article_title, username) DO UPDATE SET last_heartbeat=CURRENT_TIMESTAMP").bind(title, session.sub).run();
                const { results } = await env.DB.prepare("SELECT username FROM editing_sessions WHERE article_title = ? AND username != ? AND last_heartbeat > datetime('now', '-30 seconds')").bind(title, session.sub).all();
                resData = { editors: results.map(r => r.username) };
            }
        }

        else if (path === '/search' && method === "GET") {
            if (!(await logAndCheckRateLimit(clientIP, "SEARCH", SECURITY_CONFIG.MAX_SEARCH_PER_WINDOW))) return new Response(JSON.stringify({ error: "RATE_LIMIT" }), { status: 429, headers: securityHeaders });
            const query = url.searchParams.get("q");
            if (!query) resData = [];
            else {
                const { results } = await env.DB.prepare("SELECT title FROM articles WHERE title LIKE ? AND is_deleted = 0 ORDER BY title ASC LIMIT 10").bind(`${query}%`).all();
                resData = results.map(r => r.title);
            }
        }

        else if (path === '/history' && method === "GET") {
            resData = (await env.DB.prepare("SELECT r.id, a.title, r.timestamp, r.editor_info, r.edit_summary FROM revisions r JOIN articles a ON r.article_id = a.id ORDER BY r.timestamp DESC LIMIT 20").all()).results;
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

        else if (path === '/notifications/read' && method === "POST") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                const { id } = await request.json();
                if (id) await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND target_user = ?").bind(id, session.sub).run();
                else await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE target_user = ?").bind(session.sub).run();
                resData = { success: true };
            }
        }

        else if (path === '/report' && method === "POST") {
            const { target_type, target_id, reason } = await request.json();
            await env.DB.prepare("INSERT INTO reports (target_type, target_id, reason, reporter_ip) VALUES (?, ?, ?, ?)").bind(target_type, target_id, reason, clientIP).run();
            resData = { success: true };
        }

        else if (path === '/admin/reports' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session || session.role !== 'admin') { status = 403; resData = { error: "ADMIN_ONLY" }; }
            else resData = (await env.DB.prepare("SELECT * FROM reports ORDER BY timestamp DESC").all()).results;
        }

        else if (path === '/admin/locked' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session || session.role !== 'admin') { status = 403; resData = { error: "ADMIN_ONLY" }; }
            else resData = (await env.DB.prepare("SELECT title FROM articles WHERE is_locked = 1").all()).results;
        }

        else if (path.startsWith('/article/') && path.endsWith('/lock') && method === "PUT") {
            const title = normalizeTitle(path.split('/')[2]);
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session || session.role !== 'admin') { status = 403; resData = { error: "ADMIN_ONLY" }; }
            else {
                const { locked } = await request.json();
                await env.DB.prepare("UPDATE articles SET is_locked = ? WHERE title = ?").bind(locked ? 1 : 0, title).run();
                resData = { success: true };
            }
        }

        else if (path === '/admin/bans' && method === "GET") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session || session.role !== 'admin') { status = 403; resData = { error: "ADMIN_ONLY" }; }
            else resData = (await env.DB.prepare("SELECT * FROM bans ORDER BY timestamp DESC").all()).results;
        }

        else if (path === '/admin/bans' && method === "POST") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session || session.role !== 'admin') { status = 403; resData = { error: "ADMIN_ONLY" }; }
            else {
                const { target_type, target_value, reason } = await request.json();
                await env.DB.prepare("INSERT INTO bans (target_type, target_value, reason, banned_by) VALUES (?, ?, ?, ?) ON CONFLICT(target_type, target_value) DO UPDATE SET reason=excluded.reason, banned_by=excluded.banned_by, timestamp=CURRENT_TIMESTAMP").bind(target_type, target_value, reason || "", session.sub).run();
                resData = { success: true };
            }
        }

        else if (path === '/admin/bans' && method === "DELETE") {
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session || session.role !== 'admin') { status = 403; resData = { error: "ADMIN_ONLY" }; }
            else {
                const { id } = await request.json();
                await env.DB.prepare("DELETE FROM bans WHERE id = ?").bind(id).run();
                resData = { success: true };
            }
        }

        else if (path.startsWith('/article/') && path.includes('/comments/')) {
            const parts = path.split('/');
            const commentId = parts[parts.indexOf('comments') + 1];
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            if (!session) { status = 401; resData = { error: "UNAUTH" }; }
            else {
                const comment = await env.DB.prepare("SELECT author FROM comments WHERE id = ?").bind(commentId).first();
                if (!comment) { status = 404; resData = { error: "NOT_FOUND" }; }
                else if (comment.author !== session.sub && session.role !== 'admin') { status = 403; resData = { error: "FORBIDDEN" }; }
                else if (method === "PUT") {
                    const { content } = await request.json();
                    await env.DB.prepare("UPDATE comments SET content = ? WHERE id = ?").bind(content, commentId).run();
                    resData = { success: true };
                } else if (method === "DELETE") {
                    await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(commentId).run();
                    resData = { success: true };
                }
            }
        }

        else if (path.startsWith('/article/') && path.endsWith('/comments')) {
            const title = normalizeTitle(path.split('/')[2]);
            if (method === "GET") resData = (await env.DB.prepare("SELECT * FROM comments WHERE article_title = ? ORDER BY timestamp ASC").bind(title).all()).results;
            else {
                const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
                const { content, parent_id } = await request.json();
                const author = session ? session.sub : 'Anonymous';
                const result = await env.DB.prepare("INSERT INTO comments (article_title, author, content, parent_id) VALUES (?, ?, ?, ?)").bind(title, author, content, parent_id || null).run();
                if (parent_id) {
                    const parent = await env.DB.prepare("SELECT author FROM comments WHERE id = ?").bind(parent_id).first();
                    if (parent && parent.author !== author) await createNotification(parent.author, 'reply', author, title, null, `New reply to your comment on "${title}".`);
                } else {
                    const article = await env.DB.prepare("SELECT author FROM articles WHERE title = ?").bind(title).first();
                    if (article && article.author !== author) await createNotification(article.author, 'comment', author, title, null, `New comment on your article "${title}".`);
                }
                resData = { success: true };
            }
        }

        else { status = 404; resData = { error: "NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: "ERR", msg: err.message }), { status: 500, headers: securityHeaders });
    }
}
