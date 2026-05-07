// functions/archive.js - Public crawlable article index

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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

    function getSector(title = "") {
        if (title.startsWith("Sector:South_Korea")) return "South Korea";
        if (title.startsWith("Sector:USA")) return "USA";
        if (title.startsWith("Sector:Japan")) return "Japan";
        return "Core";
    }

    function displayTitle(title = "") {
        return title.split("/").pop().replace(/_/g, " ");
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

    try {
        const { results } = await env.DB.prepare(
            "SELECT title, updated_at, current_content FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC"
        ).all();

        const seen = new Set();
        const articles = [];
        for (const article of results) {
            if (!isIndexableArticle(article) || seen.has(article.title)) continue;
            seen.add(article.title);
            const plain = stripContent(article.current_content || "");
            articles.push({
                ...article,
                sector: getSector(article.title),
                display: displayTitle(article.title),
                excerpt: plain.length > 180 ? `${plain.slice(0, 180).trim()}...` : plain
            });
        }

        const grouped = articles.reduce((acc, article) => {
            acc[article.sector] ||= [];
            acc[article.sector].push(article);
            return acc;
        }, {});

        const groupsHtml = Object.entries(grouped).map(([sector, items]) => `
            <section class="archive-group">
                <h2>${escapeHTML(sector)} <span>${items.length} records</span></h2>
                <div class="archive-list">
                    ${items.map(article => {
                        const href = `/w/${encodeURIComponent(article.title).replace(/%20/g, "_")}`;
                        const date = article.updated_at ? new Date(article.updated_at).toISOString().split("T")[0] : "";
                        return `<article class="archive-item">
                            <a href="${escapeHTML(href)}">${escapeHTML(article.display)}</a>
                            <time>${escapeHTML(date)}</time>
                            <p>${escapeHTML(article.excerpt || "Editorial archive record with claim, context, reliability notes, and interpretation.")}</p>
                        </article>`;
                    }).join("")}
                </div>
            </section>
        `).join("");

        const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archive Index | YomiWiki</title>
    <meta name="description" content="Browse YomiWiki's public archive of occult records, internet lore, regional rumors, and unusual experiences.">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapeHTML(`${url.origin}/archive`)}">
    <link rel="stylesheet" href="/style.css?v=2.5.6">
    <script type="application/ld+json">
    ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "YomiWiki Archive Index",
        "url": `${url.origin}/archive`,
        "description": "Public index of YomiWiki archival records.",
        "isPartOf": {
            "@type": "WebSite",
            "name": "YomiWiki",
            "url": `${url.origin}/`
        }
    }).replace(/</g, "\\u003c")}
    </script>
</head>
<body class="clinical-dark">
    <main class="policy-page archive-page">
        <p><a href="/w/Main_Page">YomiWiki</a></p>
        <h1>Archive Index</h1>
        <p>This page lists public, indexable YomiWiki records. Utility views, deleted records, retired sectors, and short test pages are intentionally excluded.</p>
        <p class="archive-count">${articles.length} public records are currently available for readers and search engines.</p>
        ${groupsHtml || "<p>No public records are available yet.</p>"}
    </main>
</body>
</html>`;

        return new Response(html, {
            headers: {
                "Content-Type": "text/html;charset=UTF-8",
                "Cache-Control": "public, max-age=1800"
            }
        });
    } catch (err) {
        return new Response("Archive index is temporarily unavailable.", {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=UTF-8" }
        });
    }
}
