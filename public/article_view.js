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
     * Renders the article body content to the DOM.
     */
    renderContent: function(content) {
        const bodyEl = document.querySelector('.article-body');
        if (bodyEl) {
            // Assume wikiParse is globally available from parser.js
            bodyEl.innerHTML = typeof wikiParse === 'function' ? wikiParse(content) : content;
        }
    }
};
