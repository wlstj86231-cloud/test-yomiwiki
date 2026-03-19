/**
 * CommentView Component (Item 23)
 * This file handles the rendering and logic for article-specific discussions.
 */

window.CommentView = {
    currentArticleId: null,

    /**
     * Initializes the comment view for a specific article.
     * @param {number} articleId - The numeric ID of the current article.
     */
    init: async function(articleId) {
        this.currentArticleId = articleId;
        console.log(`[SYSTEM]: Comment interface linked to archival node ID: ${this.currentArticleId}`);
        
        const comments = await this.fetchComments(this.currentArticleId);
        // Display logic will follow in subsequent steps.
    },

    /**
     * Fetches comments for a specific article from the API.
     * @param {number} articleId - The article ID.
     * @returns {Promise<Array>} List of comments.
     */
    fetchComments: async function(articleId) {
        try {
            const res = await fetch(`/api/comments?article_id=${articleId}`, {
                headers: { 'X-Yomi-Request': 'true' }
            });
            const data = await res.json();
            return data.comments || [];
        } catch (e) {
            console.error("[CRITICAL]: Failed to retrieve discussion stream.", e);
            return [];
        }
    }
};
