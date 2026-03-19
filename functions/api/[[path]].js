// functions/api/[[path]].js - Ultra-Stable Resilient Engine (v2.4.7 Hybrid)

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

    // --- Core Helpers ---
    function normalizeTitle(rawTitle) {
        try {
            const decoded = decodeURIComponent(rawTitle || "");
            return decoded.trim().replace(/\s+/g, '_');
        } catch (e) {
            return (rawTitle || "").trim().replace(/\s+/g, '_');
        }
    }

    async function verifySession(token) {
        if (!token || token === "mock_token") return { sub: "Anonymous_Agent", role: "viewer" };
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (e) { return null; }
    }

    async function getAgentTier(username) {
        return { level: "I", title: "AGENT" }; // Stability first
    }

    try {
        let resData = null;
        let status = 200;

        // 1. ARTICLE FETCH (Resilient Version)
        if (path.startsWith('/article/') && method === "GET" && !path.endsWith('/history')) {
            const identifier = path.replace('/article/', '');
            const revId = url.searchParams.get('rev');
            const isNumericId = /^\d+$/.test(identifier);
            
            let article;
            if (revId) {
                article = await env.DB.prepare("SELECT a.title, r.content_snapshot as current_content, r.editor_info as author, r.timestamp as updated_at, a.id FROM revisions r JOIN articles a ON r.article_id = a.id WHERE (a.title = ? OR a.id = ?) AND r.id = ?").bind(normalizeTitle(identifier), isNumericId ? parseInt(identifier) : -1, revId).first();
            } else {
                if (isNumericId) article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
                else article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(normalizeTitle(identifier)).first();
            }

            if (!article) {
                status = 404; resData = { error: "RECORD_NOT_FOUND", title: identifier };
            } else {
                // HYBRID COMMENT LOOKUP (v2.4.7 Fix): Try article_id, fallback to article_title
                let comments = [];
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY timestamp DESC").bind(article.id).all();
                    comments = results;
                } catch (dbErr) {
                    // Fallback to title-based lookup if article_id column is missing
                    const { results } = await env.DB.prepare("SELECT * FROM comments WHERE article_title = ? ORDER BY timestamp DESC").bind(article.title).all();
                    comments = results;
                }
                
                let subArticles = [];
                if (article.title.startsWith('Sector:') && !article.title.substring(7).includes('/')) {
                    const { results } = await env.DB.prepare("SELECT id, title, author, updated_at FROM articles WHERE title LIKE ? AND title != ? AND is_deleted = 0").bind(`${article.title}/%`, article.title).all();
                    subArticles = results;
                }

                resData = { ...article, comments, sub_articles: subArticles };
            }
        }

        // 2. RECENT ACTIVITY (LOG)
        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author FROM revisions r JOIN articles a ON r.article_id = a.id ORDER BY r.timestamp DESC LIMIT 20").all();
            resData = results;
        }

        // 3. SIDEBAR RECENT
        else if (path === '/api/articles/recent' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT id, title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 10").all();
            resData = results;
        }

        // 4. POST COMMENT (Resilient)
        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            const title = normalizeTitle(path.split('/')[2]);
            const { content } = await request.json();
            const article = await env.DB.prepare("SELECT id, title FROM articles WHERE title = ?").bind(title).first();
            if (article) {
                try {
                    await env.DB.prepare("INSERT INTO comments (article_id, article_title, author, content) VALUES (?, ?, 'Anonymous_Agent', ?)").bind(article.id, article.title, content).run();
                } catch (e) {
                    // Fallback for old schema without article_id
                    await env.DB.prepare("INSERT INTO comments (article_title, author, content) VALUES (?, 'Anonymous_Agent', ?)").bind(article.title, content).run();
                }
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 5. UPDATE ARTICLE
        else if (path.startsWith('/article/') && (method === "POST" || method === "PUT")) {
            const title = normalizeTitle(path.replace('/article/', ''));
            const { content } = await request.json();
            const batch = [
                env.DB.prepare("INSERT INTO articles (title, current_content, author) VALUES (?, ?, 'Anonymous_Agent') ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, updated_at=CURRENT_TIMESTAMP").bind(title, content),
                env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info) SELECT id, ?, 'Anonymous_Agent' FROM articles WHERE title = ?").bind(content, title)
            ];
            await env.DB.batch(batch);
            resData = { success: true };
        }

        else { status = 404; resData = { error: "NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: "CRITICAL_SYSTEM_ERROR", message: err.message }), { status: 500, headers: securityHeaders });
    }
}
