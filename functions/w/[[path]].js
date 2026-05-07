// functions/w/[[path]].js - Wiki SSR Engine

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 1. Extract Title
    let titleSlug = path.substring(3); // Remove '/w/'
    if (!titleSlug) return env.ASSETS.fetch(new URL('/', request.url));
    
    const decodedTitle = decodeURIComponent(titleSlug).trim();
    const underscoreTitle = decodedTitle.replace(/\s+/g, '_');
    const title = underscoreTitle.replace(/_/g, ' ');

    try {
        function escapeHTML(str) {
            return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        function stripWikiForDescription(content = "") {
            return content
                .replace(/\{\{infobox[\s\S]*?\}\}/gi, " ")
                .replace(/<[^>]*>/g, " ")
                .replace(/\[\[File:[^\]]+\]\]/gi, " ")
                .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
                .replace(/\[\[([^\]]+)\]\]/g, "$1")
                .replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, "$2")
                .replace(/\[\/?CLINICAL\]/gi, " ")
                .replace(/={2,}\s*(.*?)\s*={2,}/g, "$1. ")
                .replace(/'''(.*?)'''/g, "$1")
                .replace(/''(.*?)''/g, "$1")
                .replace(/[=#*_`~|{}[\]]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        function extractLeadDescription(content, fallbackTitle) {
            const plain = stripWikiForDescription(content);
            const fallback = `${fallbackTitle.replace(/[_/]+/g, " ")} archival record from YomiWiki.`;
            const source = plain || fallback;
            return source.length > 155 ? `${source.substring(0, 155).trim()}...` : source;
        }

        function extractOgImage(content = "") {
            const infoboxImage = content.match(/\|\s*image\s*=\s*(https?:\/\/[^\s|}]+)/i);
            if (infoboxImage) return infoboxImage[1].trim();
            const fileImage = content.match(/\[\[File:(https?:\/\/[^|\]]+)/i);
            return fileImage ? fileImage[1].trim() : "";
        }

        function getLang(articleTitle) {
            if (articleTitle.startsWith("Sector:South_Korea")) return "ko";
            if (articleTitle.startsWith("Sector:Japan")) return "ja";
            return "en";
        }

        async function notFoundResponse() {
            const notFoundAsset = await env.ASSETS.fetch(new URL('/404.html', request.url));
            let notFoundHtml = await notFoundAsset.text();
            notFoundHtml = notFoundHtml.replace('</head>', '<meta name="robots" content="noindex,follow"></head>');
            return new Response(notFoundHtml, {
                status: 404,
                headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
        }

        // 2. Fetch Data from D1
        // Search canonical underscore titles first; old space titles are a fallback only.
        const article = await env.DB.prepare(
            "SELECT * FROM articles WHERE title = ? OR title = ? ORDER BY CASE WHEN title = ? THEN 0 ELSE 1 END LIMIT 1"
        ).bind(underscoreTitle, title, underscoreTitle).first();
        
        if (!article || article.is_deleted) {
            return notFoundResponse();
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
        const displayTitle = article.title.split('/').pop().replace(/_/g, ' ');
        const description = escapeHTML(extractLeadDescription(rawContent || article.current_content || "", displayTitle));
        const canonicalUrl = `${url.origin}/w/${encodeURIComponent(article.title).replace(/%20/g, '_')}`;
        const ogImage = extractOgImage(rawContent || article.current_content || "");
        const isUtilityView = url.searchParams.has('mode') || url.searchParams.has('rev');
        const noindex = isUtilityView || article.title.startsWith('SubSector:') || article.title === 'SubSector_Archive';
        const ogTags = `
            <link rel="canonical" href="${escapeHTML(canonicalUrl)}">
            <meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}">
            <meta name="description" content="${description}">
            <meta property="og:title" content="${escapeHTML(displayTitle)} | YomiWiki Archival Node">
            <meta property="og:description" content="${description}">
            <meta property="og:type" content="article">
            <meta property="og:url" content="${escapeHTML(canonicalUrl)}">
            ${ogImage ? `<meta property="og:image" content="${escapeHTML(ogImage)}">` : ''}
            <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
            <meta name="twitter:title" content="${escapeHTML(displayTitle)}">
            <meta name="twitter:description" content="${description}">
            ${ogImage ? `<meta name="twitter:image" content="${escapeHTML(ogImage)}">` : ''}
        `;

        // Replace Title & Meta
        html = html.replace('<html lang="en">', `<html lang="${getLang(article.title)}">`);
        html = html.replace('<title>YomiWiki | Occult and Internet Lore Archive</title>', `<title>${escapeHTML(displayTitle)} | YomiWiki</title>${ogTags}`);
        
        // Replace H1 Title
        html = html.replace('<h1 class="article-title" id="article-title">DECRYPTING...</h1>', `<h1 class="article-title" id="article-title">${escapeHTML(displayTitle)}</h1>`);
        
        // Replace Meta Text
        html = html.replace('<div class="article-meta">REVISION: STABLE | AUTH: Admin</div>', `<div class="article-meta">REV: ${article.updated_at} | AUTH: ${article.author} [EDGE_HYDRATED]</div>`);
        
        // Replace Body Content (Match the exact placeholder in index.html)
        const placeholder = '<p class="loading-text">Archival records are loading...</p>';
        html = html.replace(placeholder, `<div id="ssr-content-target">${contentHtml}</div>`);
        
        // 6. Hydration Data Injection
        // Inject the full article object so main.js doesn't have to fetch it again
        const { comments_data, ...articleForHydration } = article;
        const ssrData = {
            ...articleForHydration,
            current_content: rawContent
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
