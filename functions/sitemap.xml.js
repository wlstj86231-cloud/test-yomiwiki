// functions/sitemap.xml.js - Serves sitemap at standard /sitemap.xml path

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const activeHubs = new Set(["Main_Page", "Sector:South_Korea", "Sector:USA", "Sector:Japan"]);
        const retiredHubs = new Set(["Sector:India", "Sector:China", "Sector:Australia", "Sector:France", "Sector:North_Korea"]);
        const activeSectorPrefixes = ["Sector:South_Korea/", "Sector:USA/", "Sector:Japan/"];

        function stripContent(content = "") {
            return content
                .replace(/\{\{infobox[\s\S]*?\}\}/gi, " ")
                .replace(/<[^>]*>/g, " ")
                .replace(/\[\[File:[^\]]+\]\]/gi, " ")
                .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
                .replace(/\[\[([^\]]+)\]\]/g, "$1")
                .replace(/\[\/?CLINICAL\]/gi, " ")
                .replace(/[=#*_`~|{}[\]]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        function isIndexableArticle(article) {
            const title = article.title || "";
            if (!title || retiredHubs.has(title)) return false;
            if (title.startsWith("SubSector:") || title === "SubSector_Archive") return false;
            if (title.includes("...")) return false;
            if (/요미위키는_공포|Yomiwiki_is_a_Site|ヨミウィキは恐怖/.test(title)) return false;
            if (activeHubs.has(title)) return true;
            if (!activeSectorPrefixes.some(prefix => title.startsWith(prefix))) return false;
            return stripContent(article.current_content).length >= 500;
        }

        function escapeXml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
        }

        const baseUrl = `${url.protocol}//${url.host}`;
        const { results } = await env.DB.prepare(
            "SELECT title, updated_at, current_content FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC"
        ).all();

        const today = new Date().toISOString().split('T')[0];
        const indexableArticles = [];
        const seenTitles = new Set();
        for (const article of results) {
            if (!isIndexableArticle(article) || seenTitles.has(article.title)) continue;
            seenTitles.add(article.title);
            indexableArticles.push(article);
        }

        const latestDate = indexableArticles.length > 0 && indexableArticles[0].updated_at
            ? new Date(indexableArticles[0].updated_at).toISOString().split('T')[0]
            : today;

        const now = Date.now();
        const articleEntries = indexableArticles.map(article => {
            const encodedTitle = encodeURIComponent(article.title).replace(/%20/g, '_');
            const lastmod = article.updated_at
                ? new Date(article.updated_at).toISOString().split('T')[0]
                : today;
            const ageMs = article.updated_at ? now - new Date(article.updated_at).getTime() : Infinity;
            const changefreq = ageMs < 7 * 86400000 ? 'daily' : ageMs < 30 * 86400000 ? 'weekly' : 'monthly';
            const priority = ageMs < 7 * 86400000 ? '0.9' : '0.8';
            return `  <url>\n    <loc>${escapeXml(`${baseUrl}/w/${encodedTitle}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
        }).join('\n');

        const homepageEntry = `  <url>\n    <loc>${escapeXml(`${baseUrl}/`)}</loc>\n    <lastmod>${latestDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;
        const staticPages = [
            "about.html",
            "editorial-policy.html",
            "privacy.html",
            "terms.html",
            "disclaimer.html",
            "contact.html"
        ].map(page => `  <url>\n    <loc>${escapeXml(`${baseUrl}/${page}`)}</loc>\n    <lastmod>${latestDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`).join('\n');
        const allEntries = [homepageEntry, staticPages, articleEntries].filter(Boolean).join('\n');

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
