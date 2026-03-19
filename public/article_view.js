/**
 * ArticleView Component (Item 18)
 * This component handles the extraction of article IDs, fetching data, and rendering.
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
     * Renders the article title to the DOM.
     */
    renderTitle: function(title) {
        const titleEl = document.getElementById('article-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }
};
