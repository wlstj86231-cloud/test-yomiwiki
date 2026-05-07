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
            let misconception = "the strongest reading is not always the most useful one";
            let evidenceLevel = "contextual";
            let editorialObservation = "records like this usually become more useful when the page preserves uncertainty instead of forcing a single conclusion";
            let coreQuestion = "what can a reader actually verify after leaving the page?";
            let comparisonPoint = "unlike a simple retelling, this record is kept with its uncertainty and editorial limits visible";
            let nextReviewPoint = "additional dates, clearer source trails, or reader corrections would make the record easier to judge";

            if (/scam|voice|customer|qr|market|offer|package|romance|safe|call/.test(lower)) {
                theme = "risk signal";
                lens = "the action requested from the reader, the channel used to create urgency, and whether a safer verification route exists";
                readerAction = "pause before acting, verify through an official channel, and separate the story from any instruction that asks for money or personal data";
                misconception = "a convincing story is often mistaken for a verified request";
                evidenceLevel = "practical caution";
                editorialObservation = "the useful part of this record is not fear itself, but the checklist it gives readers before they respond";
                coreQuestion = "what decision is the reader being pushed to make, and can it be verified without following the suspicious route?";
                comparisonPoint = "compared with ordinary rumor pages, this record focuses on the pressure pattern and safer verification path";
                nextReviewPoint = "future edits should add official reporting channels, repeated wording patterns, or confirmed platform warnings when available";
            } else if (/dream|backrooms|ghost|window|night|elevator|playground|tunnel|bridge|3am|photo|deleted|comment/.test(lower)) {
                theme = "experience report";
                lens = "the scene description, what can be independently checked, and which parts remain memory or interpretation";
                readerAction = "compare the claim with ordinary explanations first, then keep the unresolved part clearly labeled";
                misconception = "an unresolved detail can be mistaken for proof of a supernatural cause";
                evidenceLevel = "reported experience";
                editorialObservation = "the record is strongest when it keeps the witness scene intact while still leaving room for mundane explanations";
                coreQuestion = "which part of the scene is observable, and which part depends on memory, timing, or interpretation?";
                comparisonPoint = "unlike pure fiction summaries, this page preserves the reported sequence while marking the weak points";
                nextReviewPoint = "future edits should add ordinary explanations, location-neutral context, or matching reports without exposing private details";
            } else if (/community|archive|submit|publish|editorial|records|rumor|lore/.test(lower)) {
                theme = "archive method note";
                lens = "how the record was framed, what was excluded, and whether the page helps readers judge similar submissions";
                readerAction = "look for the editorial boundary: what is being documented, what is being rejected, and what would change the conclusion";
                misconception = "archive inclusion can be mistaken for endorsement";
                evidenceLevel = "method and policy";
                editorialObservation = "the most important value here is transparency: readers should see how a record enters, changes, or leaves the archive";
                coreQuestion = "does this page explain how the archive makes decisions, not just what the archive contains?";
                comparisonPoint = "compared with a notice page, this record should also help readers apply the same rule to future submissions";
                nextReviewPoint = "future edits should add clearer acceptance examples, rejection examples, and correction paths";
            }

            return { titleText, sector, theme, lens, readerAction, misconception, evidenceLevel, editorialObservation, coreQuestion, comparisonPoint, nextReviewPoint, plainLength: plain.length };
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
                        <section>
                            <h3>오해하기 쉬운 지점</h3>
                            <p>${escapeHTML(context.misconception)}. 그래서 이 문서는 결론을 서두르기보다, 어느 문장이 주장이고 어느 문장이 관찰인지 구분해서 읽도록 구성한다.</p>
                        </section>
                        <section>
                            <h3>근거 수준</h3>
                            <p>현재 근거 수준은 ${escapeHTML(context.evidenceLevel)} 단계로 본다. 공개 본문만으로 확정하기 어려운 부분은 확정 표현을 피하고, 독자가 추가 확인을 할 수 있는 방향으로 남겨 둔다.</p>
                        </section>
                        <section>
                            <h3>핵심 질문</h3>
                            <p>${escapeHTML(context.coreQuestion)} 이 질문에 답할 수 있을수록 문서는 단순한 이야기보다 검토 가능한 기록에 가까워진다.</p>
                        </section>
                        <section>
                            <h3>비슷한 사례와의 차이</h3>
                            <p>${escapeHTML(context.comparisonPoint)}. 이 차이를 드러내야 검색으로 들어온 독자도 왜 이 문서가 별도 기록으로 남았는지 이해할 수 있다.</p>
                        </section>
                        <section>
                            <h3>다음 검토 포인트</h3>
                            <p>${escapeHTML(context.nextReviewPoint)}. 보강이 들어오면 기존 문장을 덮어쓰기보다, 무엇이 바뀌었는지 독자가 따라갈 수 있게 이력과 함께 남긴다.</p>
                        </section>
                    </div>
                    <p><b>편집 관찰:</b> ${escapeHTML(context.editorialObservation)}. 이 관찰은 문서의 신뢰도를 과장하기 위한 장식이 아니라, 독자가 같은 유형의 기록을 반복해서 만났을 때 적용할 수 있는 읽기 기준이다.</p>
                    <p class="density-footer">Reviewed by ${escapeHTML(author)}. This note is added to improve reader context, source caution, and editorial transparency.</p>
                </section>
            `;
        }

        function renderBoardEditorialExpansion(article) {
            if (!isTopLevelBoardTitle(article.title)) return "";
            const sector = getSectorLabel(article.title);
            const updated = article.updated_at ? new Date(article.updated_at).toISOString().split("T")[0] : "recent review";
            return `
                <section class="editorial-density-block board-density-block" aria-label="YomiWiki sector editorial notes">
                    <div class="density-kicker">SECTOR EDITORIAL STANDARD</div>
                    <h2>섹터 편집 기준</h2>
                    <p><b>${escapeHTML(sector)}</b> 허브는 개별 괴담이나 사건을 무작위로 모으는 목록이 아니라, 지역별 기록을 같은 기준으로 비교하기 위한 출입구다. 이 섹터에 들어오는 문서는 주장, 현장 맥락, 확인 가능한 단서, 독자 주의점을 분리해 정리한다.</p>
                    <div class="density-grid">
                        <section>
                            <h3>수록 기준</h3>
                            <p>반복적으로 회자된 기록, 지역성이 뚜렷한 제보, 온라인 커뮤니티에서 맥락이 변형된 사례를 우선한다. 단순한 자극성 제목이나 출처가 전혀 없는 단정문은 공개 색인에서 제외한다.</p>
                        </section>
                        <section>
                            <h3>검수 기준</h3>
                            <p>개별 문서는 사실 확정이 아니라 편집 기록으로 취급한다. 확인 가능한 단서가 부족한 경우에는 전승, 주장, 해석을 분리하고, 독자가 오해할 수 있는 부분을 보수적으로 낮춰 쓴다.</p>
                        </section>
                        <section>
                            <h3>비공개 원칙</h3>
                            <p>개인 신상, 사적 연락처, 추적 가능한 위치, 혐오나 괴롭힘으로 이어질 수 있는 정보는 싣지 않는다. 기록의 목적은 대상을 특정하는 것이 아니라 정보가 퍼지는 방식을 보존하는 것이다.</p>
                        </section>
                        <section>
                            <h3>업데이트 방식</h3>
                            <p>${escapeHTML(updated)} 이후 새 근거, 정정 요청, 반례가 들어오면 하위 문서의 판단과 색인 노출 기준을 함께 조정한다. 오래된 문서도 독자 제보가 있으면 재검토 대상이 된다.</p>
                        </section>
                        <section>
                            <h3>독자 경험 기준</h3>
                            <p>독자가 실제로 얻어야 하는 것은 자극적인 결말이 아니라, 비슷한 기록을 만났을 때 무엇을 의심하고 무엇을 확인할지에 대한 기준이다. 섹터 허브는 그 기준을 반복적으로 노출하는 역할을 한다.</p>
                        </section>
                        <section>
                            <h3>품질 보강 방향</h3>
                            <p>하위 문서가 짧거나 맥락이 부족하면 편집자 의견, 반례, 공개 제외 사유를 추가해 보완한다. 검색 노출보다 먼저 보는 기준은 독자가 납득할 수 있는 설명 밀도다.</p>
                        </section>
                        <section>
                            <h3>섹터 운영 의도</h3>
                            <p>이 허브는 방문자가 특정 사건 하나만 소비하고 떠나는 페이지가 아니라, 같은 지역 안에서 기록들이 어떤 방식으로 반복되고 변형되는지 비교하는 기준점이다.</p>
                        </section>
                        <section>
                            <h3>하위 문서 연결 기준</h3>
                            <p>하위 문서는 제목의 자극성보다 문서 내부의 설명 밀도, 검토 가능한 단서, 편집자 주석의 존재를 기준으로 연결한다. 품질이 낮은 기록은 공개 색인에서 제외하거나 보강 후 연결한다.</p>
                        </section>
                        <section>
                            <h3>독자 참여 기준</h3>
                            <p>독자 제보는 추가 설명, 반례, 정정 근거를 중심으로 받는다. 단순한 공포 확대, 특정인 지목, 출처 없는 폭로는 섹터 품질을 낮추기 때문에 반영하지 않는다.</p>
                        </section>
                    </div>
                    <p class="density-footer">This sector note explains how YomiWiki selects, limits, and reviews records before they enter the public archive.</p>
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
        contentHtml += renderBoardEditorialExpansion(article);
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
