/**
 * ArticleView Component (Item 17)
 * This component handles the extraction of article IDs from the URL and fetching data.
 */

window.ArticleView = {
    /**
     * Extracts the numeric article ID from the current URL path (/w/ID).
     * @returns {number|null} The article ID or null if not numeric.
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
     * @param {number} id - The numeric article ID.
     * @returns {Promise<Object|null>} The article data or null if error.
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
    }
};
