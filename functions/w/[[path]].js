// functions/w/[[path]].js - Wiki SSR Engine

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 1. Extract Title
    const titleSlug = path.substring(3); // Remove '/w/'
    if (!titleSlug) return env.ASSETS.fetch(new URL('/', request.url));
    
    const title = decodeURIComponent(titleSlug).replace(/[_\s]+/g, ' ').trim();
    const underscoreTitle = title.replace(/ /g, '_');

    try {
        // 2. Fetch Data from D1
        // Search both with space and underscore for compatibility
        const article = await env.DB.prepare("SELECT * FROM articles WHERE title = ? OR title = ?").bind(title, underscoreTitle).first();
        
        if (!article || article.is_deleted) {
            // Fallback to the main SPA shell instead of 404
            return env.ASSETS.fetch(new URL('/', request.url));
        }

        // 3. Simple Server-Side Parser (Basic markdown-ish to HTML)
        let contentHtml = article.current_content;
        if (article.is_chunked) {
            const { results } = await env.DB.prepare("SELECT content FROM article_chunks WHERE article_id = ? ORDER BY chunk_order ASC").bind(article.id).all();
            contentHtml = results.map(r => r.content).join('');
        }

        // Extremely basic text formatting for SSR (CSR main.js will re-parse properly)
        contentHtml = contentHtml.replace(/'''(.*?)'''/g, '<b>$1</b>')
                               .replace(/''(.*?)''/g, '<i>$1</i>')
                               .replace(/\n/g, '<br>');

        // 4. Fetch the static index.html as a template
        const templateResponse = await env.ASSETS.fetch(new URL('/', request.url));
        let html = await templateResponse.text();

        // 5. Injection (Match exactly with index.html tags)
        const description = article.current_content.substring(0, 160).replace(/[\[\]{}|*]/g, '').trim() + "...";
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
        html = html.replace('<title>YomiWiki | Archival Gateway [SECURE]</title>', `<title>${article.title} | YomiWiki Archival Node</title>${ogTags}`);
        
        // Replace H1 Title (Note the id in index.html)
        html = html.replace('<h1 class="article-title" id="article-title">DECRYPTING...</h1>', `<h1 class="article-title" id="article-title">${article.title}</h1>`);
        
        // Replace Meta Text
        html = html.replace('<div class="article-meta">REVISION: STABLE | AUTH: Admin</div>', `<div class="article-meta">REV: ${article.updated_at} | AUTH: ${article.author} [SSR_UPLINK]</div>`);
        
        // Replace Body Content (Match the exact structure in index.html)
        const placeholder = '<p class="loading-text">Archival records are loading. Please maintain clinical detachment.</p>';
        html = html.replace(placeholder, contentHtml);
        
        // 6. Hydration Hint for main.js
        html = html.replace('</body>', `<script>window.isSSR = true; window.ssrTitle = "${article.title.replace(/"/g, '\\"')}";</script></body>`);

        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=UTF-8" }
        });

    } catch (err) {
        console.error("SSR_ENGINE_CRASH:", err);
        // On error, just serve the plain index.html and let client-side JS handle it
        return env.ASSETS.fetch(new URL('/', request.url));
    }
}
