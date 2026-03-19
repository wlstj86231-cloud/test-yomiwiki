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
        return { level: "I", title: "AGENT" };
    }

    try {
        let resData = null;
        let status = 200;

        // 1. ARTICLE FETCH
        if (path.startsWith('/article/') && method === "GET" && !path.endsWith('/history') && !path.endsWith('/comments')) {
            const identifier = path.replace('/article/', '');
            const revId = url.searchParams.get('rev');
            const isNumericId = /^\d+$/.test(identifier);
            
            let article;
            if (revId) {
                const title = normalizeTitle(identifier);
                article = await env.DB.prepare("SELECT a.title, r.content_snapshot as current_content, r.editor_info as author, r.timestamp as updated_at, a.id FROM revisions r JOIN articles a ON r.article_id = a.id WHERE (a.title = ? OR a.id = ?) AND r.id = ?").bind(title, isNumericId ? parseInt(identifier) : -1, revId).first();
            } else {
                if (isNumericId) article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
                else article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(normalizeTitle(identifier)).first();
            }

            if (!article) {
                status = 404; resData = { error: "RECORD_NOT_FOUND", title: identifier };
            } else {
                let comments = [];
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY timestamp DESC").bind(article.id).all();
                    comments = results;
                } catch (e) {
                    const { results } = await env.DB.prepare("SELECT * FROM comments WHERE article_title = ? ORDER BY timestamp DESC").bind(article.title).all();
                    comments = results;
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

        // 5. POST COMMENT (Fixed Title Extraction for Slashes)
        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            // Correct way to extract title with slashes
            const titlePart = path.replace('/article/', '').replace('/comments', '');
            const title = normalizeTitle(titlePart);
            const { content, parent_id } = await request.json();
            
            const article = await env.DB.prepare("SELECT id, title FROM articles WHERE title = ?").bind(title).first();
            if (article) {
                try {
                    await env.DB.prepare("INSERT INTO comments (article_id, article_title, author, content, parent_id) VALUES (?, ?, 'Anonymous_Agent', ?, ?)").bind(article.id, article.title, content, parent_id || null).run();
                } catch (e) {
                    await env.DB.prepare("INSERT INTO comments (article_title, author, content, parent_id) VALUES (?, 'Anonymous_Agent', ?, ?)").bind(article.title, content, parent_id || null).run();
                }
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 6. UPDATE ARTICLE
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

        else { status = 404; resData = { error: "PATH_NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: "CRITICAL_SYSTEM_ERROR", message: err.message }), { status: 500, headers: securityHeaders });
    }
}
