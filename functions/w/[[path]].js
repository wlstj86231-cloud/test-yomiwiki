// functions/w/[[path]].js - Wiki SSR Engine

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 1. Extract Title
    let titleSlug = path.substring(3); // Remove '/w/'
    if (!titleSlug) return env.ASSETS.fetch(new URL('/', request.url));
    
    // Handle Namu-style /comments path
    if (titleSlug.endsWith('/comments')) {
        titleSlug = titleSlug.substring(0, titleSlug.length - 9);
    }
    
    const title = decodeURIComponent(titleSlug).replace(/[_\s]+/g, ' ').trim();
    const underscoreTitle = title.replace(/ /g, '_');

    try {
        function escapeHTML(str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        // 2. Fetch Data from D1
        // Search both with space and underscore for compatibility
        const article = await env.DB.prepare("SELECT * FROM articles WHERE title = ? OR title = ?").bind(title, underscoreTitle).first();
        
        if (!article || article.is_deleted) {
            // Fallback to the main SPA shell instead of 404
            return env.ASSETS.fetch(new URL('/', request.url));
        }

        // 3. Simple Server-Side Parser (Basic markdown-ish to HTML)
        let rawContent = article.current_content;
        if (article.is_chunked) {
            const { results } = await env.DB.prepare("SELECT content FROM article_chunks WHERE article_id = ? ORDER BY chunk_order ASC").bind(article.id).all();
            rawContent = results.map(r => r.content).join('');
        }

        // SSR Render: Advanced basic parsing
        let contentHtml = rawContent
            .replace(/={2,}\s*(.*?)\s*={2,}/g, '<h2 style="color:#ff9900; border-bottom:1px solid #222; padding-bottom:5px;">$1</h2>')
            .replace(/\[{2}(?:[^|\]]*\|)?([^\]]+)\]{2}/g, '<span style="color:#5bc0de;">$1</span>')
            .replace(/'''(.*?)'''/g, '<b>$1</b>')
            .replace(/''(.*?)''/g, '<i>$1</i>')
            .replace(/\[CLINICAL\]|\[\/CLINICAL\]/gi, '')
            .replace(/\{\{infobox[\s\S]*?\}\}/gi, '<div style="border:1px solid #444; padding:10px; margin-bottom:10px; font-size:0.8rem; color:#888;">[ARCHIVAL_INFOBOX_ENCRYPTED]</div>')
            .replace(/\n/g, '<br>');

        // Add board placeholder if it's a sector
        if (article.title.startsWith('Sector:') || article.title.startsWith('SubSector:')) {
            contentHtml += '<div style="margin-top:30px; border:1px dashed #333; padding:20px; text-align:center; color:#444; font-family:monospace;">[RETRIVING_SUB_NODE_INDEX...]</div>';
        }

        // 4. Fetch the static index.html as a template
        const templateResponse = await env.ASSETS.fetch(new URL('/', request.url));
        let html = await templateResponse.text();

        // 5. Injection (Match exactly with index.html tags)
        // Strip HTML tags and wiki markup for a clean description
        const plainContent = (article.current_content || "")
            .replace(/<[^>]*>/g, '') // Strip HTML tags
            .replace(/[\[\]{}|*]/g, '') // Strip wiki symbols
            .substring(0, 160)
            .trim();
        const description = `${escapeHTML(plainContent)}... [AUTHORIZED_CLEARANCE_REQUIRED]`;
        const ogTags = `
            <meta name="description" content="${description}">
            <meta property="og:title" content="${article.title} | YomiWiki Archival Node">
            <meta property="og:description" content="${description}">
            <meta property="og:type" content="article">
            <meta name="twitter:card" content="summary">
            <meta name="twitter:title" content="${article.title}">
            <meta name="twitter:description" content="${description}">
        `;

        // Replace Title & Meta
        html = html.replace('<title>YomiWiki | Archival Gateway [SECURE]</title>', `<title>${article.title} | YomiWiki</title>${ogTags}`);
        
        // Replace H1 Title
        html = html.replace('<h1 class="article-title" id="article-title">DECRYPTING...</h1>', `<h1 class="article-title" id="article-title">${article.title}</h1>`);
        
        // Replace Meta Text
        html = html.replace('<div class="article-meta">REVISION: STABLE | AUTH: Admin</div>', `<div class="article-meta">REV: ${article.updated_at} | AUTH: ${article.author} [EDGE_HYDRATED]</div>`);
        
        // Replace Body Content (Match the exact placeholder in index.html)
        const placeholder = '<p class="loading-text">Archival records are loading...</p>';
        html = html.replace(placeholder, `<div id="ssr-content-target">${contentHtml}</div>`);
        
        // 6. Hydration Data Injection
        // Inject the full article object so main.js doesn't have to fetch it again
        const ssrData = {
            ...article,
            current_content: contentHtml // Note: already potentially chunk-joined
        };
        html = html.replace('</body>', `<script id="ssr-data" type="application/json">${JSON.stringify(ssrData).replace(/</g, '\\u003c')}</script></body>`);

        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=UTF-8" }
        });

    } catch (err) {
        console.error("SSR_ENGINE_CRASH:", err);
        // On error, just serve the plain index.html and let client-side JS handle it
        return env.ASSETS.fetch(new URL('/', request.url));
    }
}
