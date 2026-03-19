/**
 * ArticleView Component (Item 16)
 * This component handles the extraction of article IDs from the URL.
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
    }
};
