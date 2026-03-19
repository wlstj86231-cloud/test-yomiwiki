/**
 * ArticleView Component (Item 37)
 * This component handles extraction, fetching, and rendering of article content and TOC.
 */

window.ArticleView = {
    getArticleIdFromUrl: function() {
        const path = window.location.pathname;
        if (path.startsWith('/w/')) {
            const idPart = path.substring(3);
            const id = parseInt(idPart, 10);
            return isNaN(id) ? null : id;
        }
        return null;
    },

    fetchArticleById: async function(id) {
        try {
            const res = await fetch(`/api/article/${id}`, {
                headers: { 'X-Yomi-Request': 'true' }
            });
            const data = await res.json();
            if (data.error) return null;
            return data;
        } catch (e) {
            console.error("[CRITICAL]: Failed to retrieve archival node by ID.", e);
            return null;
        }
    },

    renderTitle: function(title) {
        document.title = `${title} | YomiWiki Archival Node`;
        const titleEl = document.getElementById('article-title');
        if (titleEl) {
            titleEl.textContent = title;
            let adBox = document.getElementById('ad-top-placeholder');
            if (!adBox) {
                adBox = document.createElement('div');
                adBox.id = 'ad-top-placeholder';
                adBox.className = 'ad-placeholder';
                adBox.style.margin = '20px 0';
                adBox.style.minHeight = '100px';
                adBox.style.textAlign = 'center';
                titleEl.parentNode.insertBefore(adBox, titleEl.nextSibling);
            }
        }
    },

    renderContent: function(content) {
        const bodyEl = document.querySelector('.article-body');
        if (bodyEl) {
            bodyEl.innerHTML = typeof wikiParse === 'function' ? wikiParse(content) : content;
            let tocBox = document.getElementById('wiki-toc-placeholder');
            if (!tocBox) {
                tocBox = document.createElement('div');
                tocBox.id = 'wiki-toc-placeholder';
                tocBox.className = 'wiki-toc';
                bodyEl.insertBefore(tocBox, bodyEl.firstChild);
            }
            let adBox = document.getElementById('ad-bottom-placeholder');
            if (!adBox) {
                adBox = document.createElement('div');
                adBox.id = 'ad-bottom-placeholder';
                adBox.className = 'ad-placeholder';
                adBox.style.margin = '40px 0 20px 0';
                adBox.style.minHeight = '100px';
                adBox.style.textAlign = 'center';
                bodyEl.appendChild(adBox);
            }
        }
    },

    getHeadings: function() {
        const bodyEl = document.querySelector('.article-body');
        if (!bodyEl) return [];
        return bodyEl.querySelectorAll('h2, h3');
    },

    generateTocData: function() {
        const headings = this.getHeadings();
        let h2Count = 0;
        let h3Count = 0;

        return Array.from(headings).map((el, index) => {
            if (!el.id) el.id = `section-${index + 1}`;
            
            const level = el.tagName.toLowerCase() === 'h2' ? 1 : 2;
            let numberStr = "";

            if (level === 1) {
                h2Count++;
                h3Count = 0;
                numberStr = `${h2Count}.`;
            } else {
                h3Count++;
                numberStr = `${h2Count}.${h3Count}.`;
            }

            return {
                text: el.innerText.trim(),
                level: level,
                id: el.id,
                number: numberStr
            };
        });
    },

    renderToc: function(tocData) {
        const tocBox = document.getElementById('wiki-toc-placeholder');
        if (!tocBox || tocData.length === 0) {
            if (tocBox) tocBox.style.display = 'none';
            return;
        }
        tocBox.style.display = 'block';
        tocBox.innerHTML = `
            <div class="toc-title" style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-orange); border-bottom:1px solid #222; padding-bottom:5px; margin-bottom:10px;">
                [ARCHIVAL_STRUCTURE_MAP]
            </div>
            <ul class="toc-list" style="list-style:none; padding:0; margin:0;">
                ${tocData.map(item => `
                    <li class="toc-item level-${item.level}" style="margin-bottom:5px; padding-left:${(item.level - 1) * 15}px;">
                        <span style="color:var(--accent-cyan); font-family:var(--font-mono); cursor:pointer;">
                            <span style="color:var(--accent-orange); margin-right:8px;">${item.number}</span> ${escapeHTML(item.text)}
                        </span>
                    </li>
                `).join('')}
            </ul>
        `;
    }
};
