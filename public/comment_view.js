/**
 * CommentView Component (Item 23)
 * This file handles the rendering and logic for article-specific discussions.
 */

window.CommentView = {
    currentArticleId: null,

    /**
     * Initializes the comment view for a specific article.
     */
    init: async function(articleId) {
        this.currentArticleId = articleId;
        const comments = await this.fetchComments(this.currentArticleId);
        this.renderComments(comments);
    },

    /**
     * Renders the comments to the DOM.
     * @param {Array} comments - List of comments to display.
     */
    renderComments: function(comments) {
        const articleBody = document.querySelector('.article-body');
        if (!articleBody) return;

        // Remove existing discussion if any to avoid duplicates on re-render
        const existing = document.getElementById('integrated-discussion');
        if (existing) existing.remove();

        const discussionArea = document.createElement('div');
        discussionArea.id = 'integrated-discussion';
        discussionArea.className = 'integrated-discussion';
        discussionArea.style.marginTop = '20px';

        discussionArea.innerHTML = `
            <div class="discussion-header" style="background:#151515; padding:8px 15px; border:1px solid #222; border-left:4px solid var(--accent-orange); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-family:var(--font-mono); color:var(--accent-orange); font-weight:bold; font-size:0.90rem; letter-spacing:1px;">
                    [NODE_DISCUSSION_STREAM]
                </span>
                <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim);">
                    LOGGED_ENTRIES: ${comments.length}
                </span>
            </div>
            <div class="comment-list" style="display:flex; flex-direction:column; gap:2px;">
                ${comments.map((c, i) => `
                    <div class="comment-item" style="background:rgba(255,255,255,0.005); border-left:2px solid var(--accent-orange); padding:12px 18px; margin-bottom:2px; border-bottom:1px solid rgba(255,255,255,0.02);">
                        <div class="comment-meta" style="font-family:var(--font-mono); font-size:0.80rem; color:var(--text-dim); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                            <span>
                                <span style="color:var(--accent-orange); font-weight:bold; margin-right:10px;">#${i + 1}</span>
                                AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span>
                            </span>
                            <span style="opacity:0.6;">[${c.timestamp}]</span>
                        </div>
                        <div class="comment-body" style="font-size:0.92rem; line-height:1.5; color:var(--text-main);">
                            ${escapeHTML(c.content).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `).join('') || `
                    <div style="text-align:center; padding:40px; border:1px dashed #151515; color:var(--text-dim); font-family:var(--font-mono); font-size:0.90rem;">
                        [SIGNAL_QUIET]: No archival discussions detected.
                    </div>
                `}
            <div id="comment-form-container" class="comment-form" style="margin-top:20px; background:#050505; border:1px solid #111; padding:15px;">
                <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:6px; text-transform:uppercase;">[INITIATE_TRANSMISSION]</div>
                <textarea id="new-comment-content" placeholder="Enter transmission data..." style="width:100%; height:60px; background:#000; border:1px solid #222; color:#0f0; padding:12px; font-family:var(--font-mono); font-size:0.95rem; outline:none; transition:border-color 0.3s;" onfocus="this.style.borderColor='var(--accent-orange)'" onblur="this.style.borderColor='#222'"></textarea>
            </div>
        `;

        articleBody.appendChild(discussionArea);
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
