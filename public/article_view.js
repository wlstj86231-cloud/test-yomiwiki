/**
 * ArticleView Component (Item 19)
 * This component handles the extraction of article IDs, fetching data, and rendering title/content.
 */

window.ArticleView = {
    /**
     * Extracts the numeric article ID from the current URL path (/w/ID).
     */
    getArticleIdFromUrl: function() {
        const path = window.location.pathname;
        if (path.startsWith('/w/')) {
            const idPart = path.substring(3);
            const id = parseInt(idPart, 10);
            return isNaN(id) ? null : id;
        }
        return null;
    },

    /**
     * Fetches a single article's data from the API using its ID.
     */
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

    /**
     * Renders the article title to the DOM and ensures the ad placeholder is present.
     */
    renderTitle: function(title) {
        // Item 33: Update the <title> tag for SEO and user experience
        document.title = `${title} | YomiWiki Archival Node`;

        const titleEl = document.getElementById('article-title');
        if (titleEl) {
            titleEl.textContent = title;
            
            // Item 31: Add ad placeholder after the title if it doesn't exist
            let adBox = document.getElementById('ad-top-placeholder');
            if (!adBox) {
                adBox = document.createElement('div');
                adBox.id = 'ad-top-placeholder';
                adBox.className = 'ad-placeholder';
                adBox.style.margin = '20px 0';
                adBox.style.minHeight = '100px';
                adBox.style.textAlign = 'center';
                // adBox.innerHTML = '<!-- ADSENSE_CODE_TOP -->';
                titleEl.parentNode.insertBefore(adBox, titleEl.nextSibling);
            }
        }
    },

    /**
     * Renders the article body content to the DOM and adds the bottom ad placeholder.
     */
    renderContent: function(content) {
        const bodyEl = document.querySelector('.article-body');
        if (bodyEl) {
            bodyEl.innerHTML = typeof wikiParse === 'function' ? wikiParse(content) : content;

            // Item 32: Add ad placeholder at the end of the body
            let adBox = document.getElementById('ad-bottom-placeholder');
            if (!adBox) {
                adBox = document.createElement('div');
                adBox.id = 'ad-bottom-placeholder';
                adBox.className = 'ad-placeholder';
                adBox.style.margin = '40px 0 20px 0';
                adBox.style.minHeight = '100px';
                adBox.style.textAlign = 'center';
                // adBox.innerHTML = '<!-- ADSENSE_CODE_BOTTOM -->';
                bodyEl.appendChild(adBox);
            }
        }
    },

    /**
     * Extracts all header elements (h2, h3) from the article body.
     * @returns {NodeList} List of heading elements.
     */
    getHeadings: function() {
        const bodyEl = document.querySelector('.article-body');
        if (!bodyEl) return [];
        return bodyEl.querySelectorAll('h2, h3');
    }
};
