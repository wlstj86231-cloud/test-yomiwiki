// functions/w/[[path]].js - Wiki SSR Engine

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 1. Extract Title
    const titleSlug = path.substring(3); // Remove '/w/'
    const title = decodeURIComponent(titleSlug).replace(/[_\s]+/g, ' ').trim();

    try {
        // 2. Fetch Data from D1
        const article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(title).first();
        
        if (!article || article.is_deleted) {
            // Fallback to regular shell or 404
            return env.ASSETS.fetch(request);
        }

        // 3. Simple Server-Side Parser (Shared logic simulation)
        // Note: For a production app, we'd use a shared library.
        let contentHtml = article.current_content;
        
        // Handle chunks if present
        if (article.is_chunked) {
            const { results } = await env.DB.prepare("SELECT content FROM article_chunks WHERE article_id = ? ORDER BY chunk_order ASC").bind(article.id).all();
            contentHtml = results.map(r => r.content).join('');
        }

        // Extremely basic text formatting for SSR (CSR will re-parse properly)
        contentHtml = contentHtml.replace(/'''(.*?)'''/g, '<b>$1</b>')
                               .replace(/''(.*?)''/g, '<i>$1</i>')
                               .replace(/\n/g, '<br>');

        // 4. Fetch the static template
        const templateResponse = await env.ASSETS.fetch(new URL('/', request.url));
        let html = await templateResponse.text();

        // 5. Injection
        const description = article.current_content.substring(0, 160).replace(/[\[\]{}|*]/g, '').trim() + "...";
        const ogTags = `
            <meta name="description" content="${description}">
            <meta property="og:title" content="${title} | YomiWiki Archival Node">
            <meta property="og:description" content="${description}">
            <meta property="og:type" content="article">
            <meta name="twitter:card" content="summary">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
        `;

        html = html.replace('<title>YomiWiki | Archival Gateway [SECURE]</title>', `<title>${title} | YomiWiki Archival Node</title>${ogTags}`);
        html = html.replace('<h1 class="article-title">DECRYPTING...</h1>', `<h1 class="article-title">${title}</h1>`);
        html = html.replace('<div class="article-meta">REVISION: STABLE | AUTH: Admin</div>', `<div class="article-meta">REVISION: ${article.updated_at} | AUTH: ${article.author} [SSR_VERIFIED]</div>`);
        html = html.replace('<div class="article-body">\n                    <p>Archival records are loading. Please maintain clinical detachment.</p>\n                </div>', `<div class="article-body">${contentHtml}</div>`);
        
        // 6. Hydration Hint
        html = html.replace('</body>', `<script>window.isSSR = true; window.ssrTitle = "${title.replace(/"/g, '\\"')}";</script></body>`);

        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=UTF-8" }
        });

    } catch (err) {
        console.error("SSR ERROR:", err);
        return env.ASSETS.fetch(request);
    }
}
