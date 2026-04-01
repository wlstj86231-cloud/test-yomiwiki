// functions/sitemap.xml.js - Serves sitemap at standard /sitemap.xml path

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const baseUrl = `${url.protocol}//${url.host}`;
        const { results } = await env.DB.prepare(
            "SELECT title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC"
        ).all();

        const today = new Date().toISOString().split('T')[0];
        const latestDate = results.length > 0 && results[0].updated_at
            ? new Date(results[0].updated_at).toISOString().split('T')[0]
            : today;

        const now = Date.now();
        const articleEntries = results.map(article => {
            const encodedTitle = encodeURIComponent(article.title).replace(/%20/g, '_');
            const lastmod = article.updated_at
                ? new Date(article.updated_at).toISOString().split('T')[0]
                : today;
            const ageMs = article.updated_at ? now - new Date(article.updated_at).getTime() : Infinity;
            const changefreq = ageMs < 7 * 86400000 ? 'daily' : ageMs < 30 * 86400000 ? 'weekly' : 'monthly';
            const priority = ageMs < 7 * 86400000 ? '0.9' : '0.8';
            return `  <url>\n    <loc>${baseUrl}/w/${encodedTitle}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
        }).join('\n');

        const homepageEntry = `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${latestDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;
        const allEntries = articleEntries ? `${homepageEntry}\n${articleEntries}` : homepageEntry;

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allEntries}\n</urlset>`;
        return new Response(sitemap, {
            headers: {
                "Content-Type": "application/xml;charset=UTF-8",
                "Cache-Control": "public, max-age=3600"
            }
        });
    } catch (err) {
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
        return new Response(emptySitemap, {
            status: 200,
            headers: { "Content-Type": "application/xml;charset=UTF-8" }
        });
    }
}
