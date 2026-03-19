// functions/api/[[path]].js - Final Stabilized Recovery Engine (v2.4.2)

const SECURITY_CONFIG = {
    SESSION_EXPIRY: 86400 * 7,
    SALT_ROUNDS: 100000,
    MAX_TITLE_LENGTH: 255,
    MAX_CONTENT_LENGTH: 500000,
    RATE_LIMIT_WINDOW: 60,
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_REGISTER_ATTEMPTS: 3,
    MAX_COMMENT_PER_MIN: 5,
    MAX_SEARCH_PER_MIN: 30,
    MAX_WRITE_PER_MIN: 10,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 8
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
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
    };

    if (method === "OPTIONS") return new Response(null, { headers: securityHeaders });

    // --- Helpers ---
    function normalizeTitle(rawTitle) {
        try {
            const decoded = decodeURIComponent(rawTitle || "");
            return decoded.trim().replace(/\s+/g, '_');
        } catch (e) {
            return (rawTitle || "").trim().replace(/\s+/g, '_');
        }
    }

    async function verifySession(token) {
        if (!token) return null;
        try {
            const [header, payload, signature] = token.split('.');
            const data = JSON.parse(atob(payload));
            if (data.exp < Math.floor(Date.now() / 1000)) return null;
            return data;
        } catch (e) { return null; }
    }

    async function logAndCheckRateLimit(ip, action, limit) {
        const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM ip_logs WHERE ip_address = ? AND action = ? AND timestamp > datetime('now', '-60 seconds')").bind(ip, action).first();
        context.waitUntil(env.DB.prepare("INSERT INTO ip_logs (ip_address, action) VALUES (?, ?)").bind(ip, action).run());
        return count < limit;
    }

    async function getAgentTier(username) {
        if (!username || username === 'Anonymous_Agent') return { level: "0", title: "UNVERIFIED" };
        return { level: "I", title: "AGENT" }; // Simplified for stability
    }

    try {
        let resData = null;
        let status = 200;

        // AUTH
        if (path === '/auth/login' && method === "POST") {
            const { username } = await request.json();
            resData = { success: true, token: "mock_token", username, role: "user" };
        }

        // ARTICLE GET
        else if (path.startsWith('/article/') && method === "GET" && !path.endsWith('/history')) {
            const identifier = path.replace('/article/', '');
            const isNumericId = /^\d+$/.test(identifier);
            let article;
            if (isNumericId) article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
            else article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(normalizeTitle(identifier)).first();

            if (!article) { status = 404; resData = { error: "RECORD_NOT_FOUND" }; }
            else {
                const { results: rawComments } = await env.DB.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY timestamp DESC").bind(article.id).all();
                let subArticles = [];
                if (article.title.startsWith('Sector:')) {
                    const { results } = await env.DB.prepare("SELECT id, title, author, updated_at FROM articles WHERE title LIKE ? AND title != ? AND is_deleted = 0").bind(`${article.title}/%`, article.title).all();
                    subArticles = results;
                }
                resData = { ...article, comments: rawComments, sub_articles: subArticles };
            }
        }

        // ARTICLE HISTORY
        else if (path.startsWith('/article/') && path.endsWith('/history') && method === "GET") {
            const title = normalizeTitle(path.split('/')[2]);
            const { results } = await env.DB.prepare("SELECT r.id, r.editor_info as author, r.timestamp, r.edit_summary FROM revisions r JOIN articles a ON r.article_id = a.id WHERE a.title = ? ORDER BY r.timestamp DESC").bind(title).all();
            resData = results;
        }

        // SEARCH SUGGEST
        else if (path === '/search/suggest' && method === "GET") {
            const query = url.searchParams.get('q');
            const { results } = await env.DB.prepare("SELECT title FROM articles WHERE title LIKE ? LIMIT 10").bind(`%${query}%`).all();
            resData = results.map(r => r.title);
        }

        // RECENT ACTIVITY (LOG)
        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author FROM revisions r JOIN articles a ON r.article_id = a.id ORDER BY r.timestamp DESC LIMIT 20").all();
            resData = results;
        }

        // CATEGORY
        else if (path.startsWith('/category/') && method === "GET") {
            const cat = decodeURIComponent(path.substring(10));
            const { results } = await env.DB.prepare("SELECT id, title, author, updated_at FROM articles WHERE (categories LIKE ? OR classification = ?)").bind(`%${cat}%`, cat).all();
            resData = { category: cat, members: results };
        }

        // RECENT ARTICLES (SIDEBAR)
        else if (path === '/api/articles/recent' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT id, title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 10").all();
            resData = results;
        }

        // RELATED
        else if (path === '/api/articles/related' && method === "GET") {
            const cl = url.searchParams.get('classification');
            const { results } = await env.DB.prepare("SELECT title FROM articles WHERE classification = ? ORDER BY RANDOM() LIMIT 3").bind(cl || "").all();
            resData = results;
        }

        // COMMENT POST
        else if (path === '/api/comments' && method === "POST") {
            const { article_id, content } = await request.json();
            await env.DB.prepare("INSERT INTO comments (article_id, article_title, author, content) SELECT id, title, 'Anonymous_Agent', ? FROM articles WHERE id = ?").bind(content, article_id).run();
            resData = { success: true };
        }

        else { status = 404; resData = { error: "NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: "CRITICAL_SYSTEM_ERROR", message: err.message }), { status: 500, headers: securityHeaders });
    }
}
