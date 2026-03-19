// functions/api/[[path]].js - Professional Archival Engine (v2.4.4 Robust)

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
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
    };

    if (method === "OPTIONS") return new Response(null, { headers: securityHeaders });

    // --- Robust Helpers ---
    function normalizeTitle(rawTitle) {
        try {
            const decoded = decodeURIComponent(rawTitle || "");
            // Standard normalization: spaces to underscores, keep slashes for hierarchy
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
            if (payload.exp < Math.floor(Date.now() / 1000)) return null;
            return payload;
        } catch (e) { return null; }
    }

    async function getAgentTier(username) {
        if (!username || username === 'Anonymous_Agent') return { level: "0", title: "UNVERIFIED" };
        try {
            const revRes = await env.DB.prepare("SELECT COUNT(*) as count FROM revisions WHERE editor_info = ?").bind(username).first();
            const commRes = await env.DB.prepare("SELECT COUNT(*) as count FROM comments WHERE author = ?").bind(username).first();
            const total = (revRes?.count || 0) + (commRes?.count || 0);
            if (total >= 100) return { level: "II", title: "SENIOR AGENT" };
            return { level: "I", title: "AGENT" };
        } catch (e) { return { level: "0", title: "ERROR" }; }
    }

    try {
        let resData = null;
        let status = 200;

        // 1. Fetch Article (GET)
        if (path.startsWith('/article/') && method === "GET" && !path.endsWith('/history')) {
            const identifier = path.replace('/article/', '');
            const revId = url.searchParams.get('rev');
            const isNumericId = /^\d+$/.test(identifier);
            
            let article;
            if (revId) {
                const title = normalizeTitle(identifier);
                article = await env.DB.prepare("SELECT a.title, r.content_snapshot as current_content, r.editor_info as author, r.timestamp as updated_at, a.is_locked, a.id, a.categories FROM revisions r JOIN articles a ON r.article_id = a.id WHERE (a.title = ? OR a.id = ?) AND r.id = ?").bind(title, isNumericId ? parseInt(identifier) : -1, revId).first();
            } else {
                if (isNumericId) article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
                else article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(normalizeTitle(identifier)).first();
            }

            if (!article) {
                status = 404;
                resData = { error: "RECORD_NOT_FOUND", title: identifier };
            } else {
                const { results: rawComments } = await env.DB.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY timestamp DESC").bind(article.id).all();
                
                // BOARD LOGIC: Final and Definitive Fix
                let subArticles = [];
                if (article.title.startsWith('Sector:') && !article.title.substring(7).includes('/')) {
                    const sectorPrefix = article.title + "/%";
                    const { results } = await env.DB.prepare(`
                        SELECT id, title, author, updated_at 
                        FROM articles 
                        WHERE title LIKE ? AND is_deleted = 0 
                        ORDER BY updated_at DESC LIMIT 100
                    `).bind(sectorPrefix).all();
                    subArticles = results;
                }

                const commentsWithTiers = await Promise.all(rawComments.map(async c => ({
                    ...c,
                    author_tier: await getAgentTier(c.author)
                })));

                resData = { 
                    ...article, 
                    comments: commentsWithTiers,
                    sub_articles: subArticles,
                    author_tier: await getAgentTier(article.author)
                };
            }
        }

        // 2. Search Autocomplete (GET)
        else if (path === '/search/suggest' && method === "GET") {
            const query = url.searchParams.get('q');
            if (!query || query.length < 2) resData = [];
            else {
                const { results } = await env.DB.prepare("SELECT title FROM articles WHERE title LIKE ? AND is_deleted = 0 LIMIT 10").bind(`%${query}%`).all();
                resData = results.map(r => r.title);
            }
        }

        // 3. Global Activity Log (GET)
        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author FROM revisions r JOIN articles a ON r.article_id = a.id ORDER BY r.timestamp DESC LIMIT 20").all();
            resData = results;
        }

        // 4. Sidebar Recent Articles (GET)
        else if (path === '/api/articles/recent' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT id, title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 10").all();
            resData = results;
        }

        // 5. Post Comment (POST)
        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            const title = normalizeTitle(path.split('/')[2]);
            const { content, parent_id } = await request.json();
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const author = session?.sub || "Anonymous_Agent";
            
            const article = await env.DB.prepare("SELECT id FROM articles WHERE title = ?").bind(title).first();
            if (article) {
                await env.DB.prepare("INSERT INTO comments (article_id, article_title, author, content, parent_id) VALUES (?, ?, ?, ?, ?)").bind(article.id, title, author, content, parent_id || null).run();
                resData = { success: true };
            } else {
                status = 404; resData = { error: "NODE_NOT_FOUND" };
            }
        }

        // 6. Update/Create Article (POST)
        else if (path.startsWith('/article/') && (method === "POST" || method === "PUT")) {
            const title = normalizeTitle(path.replace('/article/', ''));
            const { content, summary, classification } = await request.json();
            const session = await verifySession(request.headers.get("Authorization")?.split(' ')[1]);
            const author = session?.sub || "Anonymous_Agent";

            const batch = [
                env.DB.prepare("INSERT INTO articles (title, current_content, author, classification, categories) VALUES (?, ?, ?, ?, '') ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, author=excluded.author, updated_at=CURRENT_TIMESTAMP").bind(title, content, author, classification || null),
                env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary) SELECT id, ?, ?, ? FROM articles WHERE title = ?").bind(content, author, summary || "ARCHIVAL_UPDATE", title)
            ];
            await env.DB.batch(batch);
            resData = { success: true };
        }

        else { status = 404; resData = { error: "PATH_NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        console.error("[CRITICAL_API_EXCEPTION]:", err);
        return new Response(JSON.stringify({ 
            error: "CRITICAL_SYSTEM_ERROR", 
            message: err.message
        }), { status: 500, headers: securityHeaders });
    }
}
