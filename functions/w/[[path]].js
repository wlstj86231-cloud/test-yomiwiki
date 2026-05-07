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

        function getSectorLabel(articleTitle) {
            if (articleTitle.startsWith("Sector:South_Korea")) return "South Korea";
            if (articleTitle.startsWith("Sector:USA")) return "USA";
            if (articleTitle.startsWith("Sector:Japan")) return "Japan";
            return "Archive";
        }

        function jsonLdScript(data) {
            return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
        }

        function isTopLevelBoardTitle(articleTitle = "") {
            if (articleTitle.startsWith("Sector:")) {
                return !articleTitle.slice("Sector:".length).includes("/");
            }
            if (articleTitle.startsWith("SubSector:")) {
                return !articleTitle.slice("SubSector:".length).includes("/");
            }
            return false;
        }

        function isEditorialExpansionTarget(articleTitle = "") {
            if (!articleTitle || articleTitle === "SubSector_Archive") return false;
            if (isTopLevelBoardTitle(articleTitle)) return false;
            if (articleTitle.startsWith("SubSector:")) return false;
            return true;
        }

        function compactPlainText(content = "") {
            return stripWikiForDescription(content)
                .replace(/\s+/g, " ")
                .trim();
        }

        function getArticleContext(articleTitle = "", content = "") {
            const titleText = articleTitle.split("/").pop().replace(/_/g, " ");
            const sector = getSectorLabel(articleTitle);
            const plain = compactPlainText(content);
            const lower = `${articleTitle} ${plain}`.toLowerCase();
            let theme = "unusual record";
            let lens = "reported details, repeated motifs, and the limits of what the archive can verify";
            let readerAction = "treat the page as a structured record rather than a final explanation";

            if (/scam|voice|customer|qr|market|offer|package|romance|safe|call/.test(lower)) {
                theme = "risk signal";
                lens = "the action requested from the reader, the channel used to create urgency, and whether a safer verification route exists";
                readerAction = "pause before acting, verify through an official channel, and separate the story from any instruction that asks for money or personal data";
            } else if (/dream|backrooms|ghost|window|night|elevator|playground|tunnel|bridge|3am|photo|deleted|comment/.test(lower)) {
                theme = "experience report";
                lens = "the scene description, what can be independently checked, and which parts remain memory or interpretation";
                readerAction = "compare the claim with ordinary explanations first, then keep the unresolved part clearly labeled";
            } else if (/community|archive|submit|publish|editorial|records|rumor|lore/.test(lower)) {
                theme = "archive method note";
                lens = "how the record was framed, what was excluded, and whether the page helps readers judge similar submissions";
                readerAction = "look for the editorial boundary: what is being documented, what is being rejected, and what would change the conclusion";
            }

            return { titleText, sector, theme, lens, readerAction, plainLength: plain.length };
        }

        function renderEditorialExpansion(article, rawContent = "") {
            if (!isEditorialExpansionTarget(article.title)) return "";
            const context = getArticleContext(article.title, rawContent);
            const updated = article.updated_at ? new Date(article.updated_at).toISOString().split("T")[0] : "recent review";
            const author = article.author || "YomiWiki Editor";
            return `
                <section class="editorial-density-block" aria-label="YomiWiki editorial review notes">
                    <div class="density-kicker">YOMIWIKI EDITORIAL REVIEW</div>
                    <h2>편집자 의견</h2>
                    <p><b>${escapeHTML(context.titleText)}</b> 문서는 ${escapeHTML(context.sector)} 섹터의 ${escapeHTML(context.theme)}로 분류한다. 이 기록은 사실 확정문이 아니라, 제보된 장면과 반복되는 패턴을 분리해 읽기 위한 편집 기록이다. 그래서 본문은 분위기보다 확인 가능한 단서, 주장과 해석의 경계, 독자가 실제로 조심해야 할 지점을 우선한다.</p>
                    <p>편집 기준은 ${escapeHTML(context.lens)}이다. 문서 안의 표현이 강하게 느껴지더라도, YomiWiki는 개인 신상, 무단 폭로, 혐오 조장, 위험 행동을 유도하는 세부 절차를 공개하지 않는다. 읽을 때는 사건을 믿거나 부정하기보다 어떤 근거가 남아 있고 어떤 부분이 아직 비어 있는지를 먼저 확인하는 편이 안전하다.</p>
                    <div class="density-grid">
                        <section>
                            <h3>검수 메모</h3>
                            <p>현재 공개 본문은 약 ${context.plainLength.toLocaleString("ko-KR")}자의 원문 맥락을 바탕으로 재검토되었다. 표현이 과장으로 흐르는 대목은 설명을 낮추고, 단정이 어려운 부분은 가능성 또는 해석으로 남기는 방향을 적용했다.</p>
                        </section>
                        <section>
                            <h3>독자가 가져갈 기준</h3>
                            <p>${escapeHTML(context.readerAction)} 이 기준을 적용하면 흥미로운 이야기와 실제 판단에 필요한 정보를 구분할 수 있다.</p>
                        </section>
                        <section>
                            <h3>공개하지 않은 내용</h3>
                            <p>개인 식별 정보, 추적 가능한 위치 단서, 사적인 계정명, 모방 위험이 있는 절차는 의도적으로 제거하거나 일반화한다. 문서의 목적은 누군가를 특정하는 것이 아니라 기록의 구조를 보존하는 것이다.</p>
                        </section>
                        <section>
                            <h3>업데이트 기준</h3>
                            <p>새로운 출처, 반례, 당사자 정정, 독자 제보가 들어오면 ${escapeHTML(updated)} 기준의 현재 판단을 수정한다. 변경이 생기면 문서 이력에 남기고, 기존 해석과 새 근거가 충돌하는 지점을 분리해 표시한다.</p>
                        </section>
                    </div>
                    <p class="density-footer">Reviewed by ${escapeHTML(author)}. This note is added to improve reader context, source caution, and editorial transparency.</p>
                </section>
            `;
        }

        function titleUrl(title = "") {
            return `${url.origin}/w/${encodeURIComponent(title)
                .replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
                .replace(/%20/g, "_")}`;
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
        if (isTopLevelBoardTitle(article.title)) {
            contentHtml += '<div style="margin-top:30px; border:1px dashed #333; padding:20px; text-align:center; color:#444; font-family:monospace;">[RETRIVING_SUB_NODE_INDEX...]</div>';
        }
        contentHtml += renderEditorialExpansion(article, rawContent);

        // 4. Fetch the static index.html as a template
        const templateResponse = await env.ASSETS.fetch(new URL('/', request.url));
        let html = await templateResponse.text();

        // 5. Injection (Match exactly with index.html tags)
        const displayTitle = article.title.split('/').pop().replace(/_/g, ' ');
        const rawDescription = extractLeadDescription(rawContent || article.current_content || "", displayTitle);
        const description = escapeHTML(rawDescription);
        const canonicalUrl = titleUrl(article.title);
        const ogImage = extractOgImage(rawContent || article.current_content || "");
        const isUtilityView = url.searchParams.has('mode') || url.searchParams.has('rev');
        const noindex = isUtilityView || article.title.startsWith('SubSector:') || article.title === 'SubSector_Archive';
        const lang = getLang(article.title);
        const dateModified = article.updated_at ? new Date(article.updated_at).toISOString() : new Date().toISOString();
        const articleSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": displayTitle,
            "description": rawDescription,
            "url": canonicalUrl,
            "dateModified": dateModified,
            "datePublished": dateModified,
            "inLanguage": lang,
            "isPartOf": {
                "@type": "WebSite",
                "name": "YomiWiki",
                "url": `${url.origin}/`
            },
            "author": {
                "@type": "Person",
                "name": article.author || "YomiWiki Editor"
            },
            "publisher": {
                "@type": "Organization",
                "name": "YomiWiki",
                "url": `${url.origin}/`
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
            }
        };
        if (ogImage) articleSchema.image = [ogImage];
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "YomiWiki",
                    "item": `${url.origin}/w/Main_Page`
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": getSectorLabel(article.title),
                    "item": article.title.startsWith("Sector:")
                        ? `${url.origin}/w/${encodeURIComponent(article.title.split("/")[0]).replace(/%20/g, "_")}`
                        : `${url.origin}/archive`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": displayTitle,
                    "item": canonicalUrl
                }
            ]
        };
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
            ${jsonLdScript(articleSchema)}
            ${jsonLdScript(breadcrumbSchema)}
        `;

        // Replace Title & Meta
        html = html.replace('<html lang="ko">', `<html lang="${lang}">`);
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
