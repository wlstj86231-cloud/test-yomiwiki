// functions/feed.xml.js - RSS feed for public YomiWiki records

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    function escapeXml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

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
        const activeHubs = new Set(["Main_Page", "Sector:South_Korea", "Sector:USA", "Sector:Japan"]);
        const retiredHubs = new Set(["Sector:India", "Sector:China", "Sector:Australia", "Sector:France", "Sector:North_Korea"]);
        const activeSectorPrefixes = ["Sector:South_Korea/", "Sector:USA/", "Sector:Japan/"];
        if (!title || retiredHubs.has(title)) return false;
        if (title.startsWith("SubSector:") || title === "SubSector_Archive") return false;
        if (title.includes("...")) return false;
        if (activeHubs.has(title)) return true;
        if (!activeSectorPrefixes.some(prefix => title.startsWith(prefix))) return false;
        return stripContent(article.current_content).length >= 500;
    }

    function displayTitle(title = "") {
        return title.split("/").pop().replace(/_/g, " ");
    }

    try {
        const baseUrl = `${url.protocol}//${url.host}`;
        const { results } = await env.DB.prepare(
            "SELECT title, updated_at, current_content FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 80"
        ).all();

        const seen = new Set();
        const items = [];
        for (const article of results) {
            if (!isIndexableArticle(article) || seen.has(article.title)) continue;
            seen.add(article.title);
            const plain = stripContent(article.current_content || "");
            const link = `${baseUrl}/w/${encodeURIComponent(article.title).replace(/%20/g, "_")}`;
            const pubDate = article.updated_at ? new Date(article.updated_at).toUTCString() : new Date().toUTCString();
            items.push(`<item>
                <title>${escapeXml(displayTitle(article.title))}</title>
                <link>${escapeXml(link)}</link>
                <guid isPermaLink="true">${escapeXml(link)}</guid>
                <pubDate>${escapeXml(pubDate)}</pubDate>
                <description>${escapeXml(plain.length > 260 ? `${plain.slice(0, 260).trim()}...` : plain)}</description>
            </item>`);
            if (items.length >= 30) break;
        }

        const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>YomiWiki Public Records</title>
        <link>${escapeXml(baseUrl)}</link>
        <description>Recent public YomiWiki records with claims, context, reliability notes, and editorial interpretation.</description>
        <language>ko</language>
        <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>
        ${items.join("\n")}
    </channel>
</rss>`;

        return new Response(feed, {
            headers: {
                "Content-Type": "application/rss+xml;charset=UTF-8",
                "Cache-Control": "public, max-age=1800"
            }
        });
    } catch (err) {
        return new Response("RSS feed is temporarily unavailable.", {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=UTF-8" }
        });
    }
}
