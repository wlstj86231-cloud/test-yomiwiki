/**
 * ArticleView Component (Item 43)
 * This component handles extraction, fetching, rendering, and link validation.
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

    renderTitle: function(title, classification) {
        document.title = `${title} | YomiWiki Archival Node`;
        const titleEl = document.getElementById('article-title');
        if (titleEl) {
            // Item 61: Add classification bar at the very top
            let classBar = document.getElementById('article-classification-bar');
            if (!classBar) {
                classBar = document.createElement('div');
                classBar.id = 'article-classification-bar';
                classBar.style.background = 'rgba(255,153,0,0.03)';
                classBar.style.border = '1px solid #222';
                classBar.style.borderLeft = '4px solid var(--accent-orange)';
                classBar.style.padding = '8px 15px';
                classBar.style.marginBottom = '20px';
                classBar.style.fontFamily = 'var(--font-mono)';
                classBar.style.fontSize = '0.85rem';
                titleEl.parentNode.insertBefore(classBar, titleEl.parentNode.firstChild);
            }
            classBar.innerHTML = `<span style="color:var(--text-dim);">[CLASSIFICATION]:</span> <a href="/w/Category:${encodeURIComponent(classification || 'UNCLASSIFIED')}" style="color:var(--accent-orange); font-weight:bold; text-decoration:none;">${classification || 'UNCLASSIFIED'}</a>`;

            // Item 48: Add 'HISTORY' button in a metadata sub-header
...
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

    renderContent: async function(content) {
        const bodyEl = document.querySelector('.article-body');
        if (bodyEl) {
            // Assume wikiParse sets window.lastFootnotes
            bodyEl.innerHTML = typeof wikiParse === 'function' ? wikiParse(content) : content;
            
            let tocBox = document.getElementById('wiki-toc-placeholder');
            if (!tocBox) {
                tocBox = document.createElement('div');
                tocBox.id = 'wiki-toc-placeholder';
                tocBox.className = 'wiki-toc';
                bodyEl.insertBefore(tocBox, bodyEl.firstChild);
            }

            // Item 53: Render Footnotes at the bottom
            const footnotes = window.lastFootnotes || [];
            if (footnotes.length > 0) {
                const fnArea = document.createElement('div');
                fnArea.id = 'article-footnotes';
                fnArea.style.marginTop = '40px';
                fnArea.style.borderTop = '1px solid #222';
                fnArea.style.paddingTop = '20px';
                fnArea.innerHTML = `
                    <div style="font-family:var(--font-mono); font-size:0.80rem; color:var(--text-dim); margin-bottom:15px; text-transform:uppercase;">[SUPPLEMENTARY_DATA_CHUNKS]</div>
                    <ul style="list-style:none; padding:0; margin:0; font-size:0.85rem; color:var(--text-dim); font-family:var(--font-mono);">
                        ${footnotes.map((fn, i) => `
                            <li id="fn-${i + 1}" style="margin-bottom:8px; display:flex; gap:10px;">
                                <span style="color:var(--accent-cyan); min-width:25px;">[${i + 1}]</span>
                                <span>${escapeHTML(fn)}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
                bodyEl.appendChild(fnArea);
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

            // Item 43: Validate links after rendering
            await this.validateLinks();
        }
    },

    /**
     * Item 43: Checks if linked articles exist and marks missing ones as 'not-found' (red links).
     */
    validateLinks: async function() {
        const links = document.querySelectorAll('.wiki-link');
        if (links.length === 0) return;

        const titles = Array.from(links).map(l => l.getAttribute('data-title'));
        try {
            const res = await fetch('/api/articles/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Yomi-Request': 'true' },
                body: JSON.stringify({ titles })
            });
            const data = await res.json();
            const existingTitles = new Set(data.existing || []);

            links.forEach(link => {
                const title = link.getAttribute('data-title');
                if (!existingTitles.has(title)) {
                    link.classList.add('not-found');
                }
            });
        } catch (e) {
            console.error("[SYSTEM]: Link validation failed.", e);
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
            if (level === 1) { h2Count++; h3Count = 0; numberStr = `${h2Count}.`; }
            else { h3Count++; numberStr = `${h2Count}.${h3Count}.`; }
            return { text: el.innerText.trim(), level, id: el.id, number: numberStr };
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
                        <span onclick="window.ArticleView.scrollToSection('${item.id}')" style="color:var(--accent-cyan); font-family:var(--font-mono); cursor:pointer; text-decoration:underline;">
                            <span style="color:var(--accent-orange); margin-right:8px;">${item.number}</span> ${escapeHTML(item.text)}
                        </span>
                    </li>
                `).join('')}
            </ul>
        `;
    },

    scrollToSection: function(id) {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
