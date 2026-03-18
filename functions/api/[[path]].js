// functions/api/[[path]].js - Professional Security, Normalization & Pagination Engine

const SECURITY_CONFIG = {
    SESSION_EXPIRY: 86400 * 7, // 1 week
    SALT_ROUNDS: 100000,
    MAX_TITLE_LENGTH: 255,
    MAX_CONTENT_LENGTH: 500000,
    RATE_LIMIT_WINDOW: 60, // seconds
    MAX_REQUESTS_PER_WINDOW: 30,
    MAX_SEARCH_PER_WINDOW: 10,
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
        console.log(`[API_REQUEST]: ${method} ${path}`);
        if (["POST", "DELETE", "PUT"].includes(method)) {
            if (!(await logAndCheckRateLimit(clientIP, "WRITE_ACTION"))) return new Response(JSON.stringify({ error: "RATE_LIMIT" }), { status: 429, headers: securityHeaders });
            const sessionForBan = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const ban = await checkBan(clientIP, sessionForBan?.sub);
            if (ban) return new Response(JSON.stringify({ error: "ACCESS_REVOKED", reason: ban.reason }), { status: 403, headers: securityHeaders });
        }

        let resData, status = 200;

        if (path === '/auth/register' && method === "POST") {
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
            const { username, password } = await request.json();
            const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
            if (!user || (await hashPassword(password, user.password_hash.split(':')[0])) !== user.password_hash.split(':')[1]) {
                resData = { error: "AUTH_FAILED" }; status = 401;
            } else {
                resData = { success: true, token: await createSession(user.username, user.role), username: user.username, role: user.role };
            }
        }

        else if (path.startsWith('/article/') && method === "GET") {
            try {
                const title = normalizeTitle(path.substring(9));
                const query = `
                    SELECT a.*, 
                    (SELECT COUNT(*) FROM revisions WHERE editor_info = a.author) as author_contribution_count
                    FROM articles a WHERE a.title = ? OR a.title = ?
                `;
                const article = await env.DB.prepare(query).bind(title, title.replace(/ /g, '_')).first();
                
                if (!article) { status = 404; resData = { error: "RECORD_NOT_FOUND" }; }
                else {
                    let fullContent = article.current_content;
                    if (article.is_chunked) {
                        const { results } = await env.DB.prepare("SELECT content FROM article_chunks WHERE article_id = ? ORDER BY chunk_order ASC").bind(article.id).all();
                        fullContent = results.map(r => r.content).join('');
                    }
                    
                    // --- [Step 4-3. UNIFY DATA: Get Backlinks & Comments in ONE response] ---
                    const { results: backlinks } = await env.DB.prepare("SELECT from_title FROM links WHERE to_title = ? LIMIT 50").bind(article.title).all();
                    const { results: comments } = await env.DB.prepare("SELECT * FROM comments WHERE article_title = ? ORDER BY timestamp DESC").bind(article.title).all();

                    const count = article.author_contribution_count || 0;
                    resData = { 
                        ...article, 
                        current_content: fullContent, 
                        backlinks: backlinks.map(b => b.from_title),
                        comments: comments, // Integrated comments!
                        author_tier: {
                            count,
                            level: count >= 100 ? "IV" : count >= 50 ? "III" : count >= 10 ? "II" : "I"
                        }
                    };
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
                const linkRegex = /\[\[(.*?)\]\]/g;
                let match;
                const foundLinks = new Set();
                const foundCategories = new Set();
                while ((match = linkRegex.exec(content)) !== null) {
                    const inner = match[1].split('|')[0].trim();
                    if (inner.toLowerCase().startsWith('category:')) foundCategories.add(inner.substring(9).trim());
                    else if (inner) foundLinks.add(normalizeTitle(inner));
                }
                const batch = [
                    env.DB.prepare("INSERT INTO articles (title, current_content, author, classification, categories, version) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, author=excluded.author, categories=excluded.categories, version=articles.version+1, updated_at=CURRENT_TIMESTAMP").bind(title, content, session.sub, classification || null, Array.from(foundCategories).join(',')),
                    env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary) SELECT id, ?, ?, ? FROM articles WHERE title = ?").bind(content, session.sub, summary || "", title),
                    env.DB.prepare("DELETE FROM links WHERE from_title = ?").bind(title)
                ];
                for (const target of foundLinks) batch.push(env.DB.prepare("INSERT OR IGNORE INTO links (from_title, to_title) VALUES (?, ?)").bind(title, target));
                await env.DB.batch(batch);
                resData = { success: true };
            }
        }

        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author, r.edit_summary as summary FROM revisions r JOIN articles a ON r.article_id = a.id UNION ALL SELECT 'comment' as type, article_title as title, timestamp, author, content as summary FROM comments ORDER BY timestamp DESC LIMIT 40").all();
            resData = results;
        }

        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            const title = normalizeTitle(path.split('/')[2]);
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const { content } = await request.json();
            if (!content) return new Response(JSON.stringify({ error: "EMPTY" }), { status: 400, headers: securityHeaders });
            const author = session ? session.sub : 'Anonymous_Agent';
            await env.DB.prepare("INSERT INTO comments (article_title, author, content) VALUES (?, ?, ?)").bind(title, author, content).run();
            resData = { success: true };
        }

        else { status = 404; resData = { error: "NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) { return new Response(JSON.stringify({ error: "ERR", msg: err.message }), { status: 500, headers: securityHeaders }); }
}
