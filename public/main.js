document.addEventListener('DOMContentLoaded', () => {
    // --- [2. Boot Terminal Animation] ---
    const bootTerminal = document.getElementById('boot-terminal');
    if (bootTerminal) {
        setTimeout(() => {
            bootTerminal.classList.add('fade-out');
            setTimeout(() => { bootTerminal.style.display = 'none'; }, 400);
        }, 800);
    }

    const API_ENDPOINT = '/api';

    // --- [Auth & State] ---
    let currentUser = JSON.parse(localStorage.getItem('yomi_user')) || null;

    const securedFetch = async (url, options = {}) => {
        const headers = { 'X-Yomi-Request': 'true', 'Content-Type': 'application/json', ...options.headers };
        if (currentUser?.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
        return await fetch(url, { ...options, headers });
    };

    window.navigateTo = (url, push = true) => {
        if (push) history.pushState(null, "", url);
        init();
    };
    window.onpopstate = () => init();

    function handleInternalLinks() {
        document.body.onclick = (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin) && !link.target && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                if (link.getAttribute('href')?.startsWith('#')) return;
                const url = new URL(link.href);
                if (!url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
                    e.preventDefault();
                    window.navigateTo(link.href);
                }
            }
        };
    }

    function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

    // --- [Unified Comment Rendering] ---
    function renderCommentsHTML(title, comments) {
        let html = `<div id="integrated-discussion" class="integrated-discussion">
            <div class="discussion-header">[COMM_CHANNEL_LOG]</div>
            <div class="comment-list">
                ${comments.map(c => `
                    <div class="comment-item">
                        <div class="comment-meta">AGENT: ${escapeHTML(c.author)} | ${c.timestamp}</div>
                        <div class="comment-body">${escapeHTML(c.content)}</div>
                    </div>
                `).join('') || '<div style="opacity:0.3; font-style:italic; padding:20px;">No active transmissions.</div>'}
            </div>
            <div class="comment-form">
                <textarea id="new-comment-content" placeholder="Enter transmission..."></textarea>
                <button onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle">[TRANSMIT]</button>
            </div>
        </div>`;
        return html;
    }

    window.postComment = async (title) => {
        const content = document.getElementById('new-comment-content').value;
        if (!content) return;
        const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments`, {
            method: 'POST', body: JSON.stringify({ content })
        });
        if (res.ok) {
            // Refresh the whole article to show the new comment in place
            init(); 
            updateSidebarActivity();
        }
    };

    // --- [Core Wiki Engine] ---
    async function renderArticle(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`);
            const data = await res.json();
            
            if (data.error === "RECORD_NOT_FOUND") {
                mainTitle.textContent = "RECORD_NOT_FOUND";
                articleBody.innerHTML = `<div class="not-found-container"><h3>SIGNAL_LOST</h3><button onclick="window.navigateTo('?mode=edit')" class="btn-clinical-toggle">[ESTABLISH_NEW_NODE]</button></div>`;
                return;
            }

            mainTitle.textContent = data.title;
            metaText.innerHTML = `REV: ${data.updated_at} | AUTH: ${data.author} [SECURE_NODE]`;
            
            let contentHtml = wikiParse(data.current_content);
            
            // Backlinks & Categories
            let footer = '<div class="article-footer">';
            if (data.categories) footer += `<div><strong>[CATEGORIES]:</strong> ${data.categories.split(',').map(c => `<a href="/w/Category:${encodeURIComponent(c.trim())}">[${escapeHTML(c.trim())}]</a>`).join(' ')}</div>`;
            if (data.backlinks?.length > 0) footer += `<div><strong>[LINKED_NODES]:</strong> ${data.backlinks.map(b => `<a href="/w/${encodeURIComponent(b)}">[[${escapeHTML(b)}]]</a>`).join(' ')}</div>`;
            footer += '</div>';

            // ATTACH COMMENTS DIRECTLY
            const commentsHtml = renderCommentsHTML(data.title, data.comments || []);
            
            articleBody.innerHTML = contentHtml + footer + commentsHtml;

        } catch (e) { articleBody.innerHTML = "CRITICAL_SYSTEM_ERROR"; }
    }

    // --- [Live Sidebar Activity Log] ---
    async function updateSidebarActivity() {
        const sidebarLog = document.getElementById('sidebar-live-activity');
        if (!sidebarLog) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/history`);
            const logs = await res.json();
            sidebarLog.innerHTML = logs.map(l => {
                const time = l.timestamp.split(' ')[1]?.substring(0, 5) || "";
                const tag = l.type === 'edit' ? '<span class="tag-edit">[DATA]</span>' : '<span class="tag-comment">[DISC]</span>';
                return `<div style="margin-bottom:8px; line-height:1.2; border-bottom:1px solid #151515; padding-bottom:4px;">
                    <span style="color:#444;">${time}</span> ${tag} 
                    <a href="/w/${encodeURIComponent(l.title.replace(/ /g, '_'))}" style="color:#aaa; text-decoration:none;">${escapeHTML(l.title)}</a>
                </div>`;
            }).join('');
        } catch (e) { sidebarLog.textContent = "SYNC_OFFLINE"; }
    }

    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        let title = path.startsWith('/w/') ? decodeURIComponent(path.substring(3)).replace(/[_\s]+/g, ' ').trim() : 'Main_Page';
        
        handleInternalLinks();
        await renderArticle(title);
        updateSidebarActivity();
    }

    init();
    setInterval(updateSidebarActivity, 30000);
});
