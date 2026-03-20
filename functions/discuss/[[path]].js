// functions/discuss/[[path]].js - Discussion Page SSR Engine

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 1. Extract Title from /discuss/ path
    let titleSlug = path.substring(9); // Remove '/discuss/'
    if (!titleSlug) return env.ASSETS.fetch(new URL('/', request.url));
    
    const title = decodeURIComponent(titleSlug).replace(/[_\s]+/g, ' ').trim();
    const underscoreTitle = title.replace(/ /g, '_');

    try {
        function escapeHTML(str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        // 2. Fetch Data from D1
        const article = await env.DB.prepare("SELECT * FROM articles WHERE title = ? OR title = ?").bind(title, underscoreTitle).first();
        
        if (!article || article.is_deleted) {
            return env.ASSETS.fetch(new URL('/', request.url));
        }

        // 3. SSR for Discussion Page: We show a placeholder as discussion is client-side heavy
        const templateResponse = await env.ASSETS.fetch(new URL('/', request.url));
        let html = await templateResponse.text();

        const description = `Discussion for ${article.title}. View and participate in archival transmissions.`;

        // 4. Injection
        html = html.replace('<h1 id="article-title">YomiWiki_Core_Node</h1>', `<h1 id="article-title">DISCUSSION: ${article.title}</h1>`)
                   .replace('<div class="article-meta">STABLE_SIGNAL</div>', `<div class="article-meta">COMM_STREAM_OPEN</div>`)
                   .replace('<div class="article-body">', `<div class="article-body"><div class="loading">[INITIALIZING_COMM_STREAM...]</div>`)
                   .replace(/<title>.*?<\/title>/, `<title>Discussion: ${article.title} | YomiWiki</title>`)
                   .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`);

        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=UTF-8" }
        });

    } catch (err) {
        return env.ASSETS.fetch(new URL('/', request.url));
    }
}
