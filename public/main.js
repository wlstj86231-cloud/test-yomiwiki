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
    const LANG = navigator.language.startsWith('ko') ? 'ko' : 'en';

    // --- [Auth & State] ---
    let currentUser = JSON.parse(localStorage.getItem('yomi_user')) || null;

    const securedFetch = async (url, options = {}) => {
        const headers = { ...options.headers, 'X-Yomi-Request': 'true', 'Content-Type': 'application/json' };
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

    // --- [Integrated Discussion System] ---
    async function renderComments(title, container) {
        container.innerHTML = `<div class="discussion-header">[COMM_CHANNEL_LOG]</div><div id="comment-list">Loading...</div>
        <div class="comment-form">
            <textarea id="new-comment-content" placeholder="Enter transmission..."></textarea>
            <button onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle">[TRANSMIT]</button>
        </div>`;
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments`);
            const comments = await res.json();
            const listDiv = document.getElementById('comment-list');
            listDiv.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <div class="comment-meta">AGENT: ${escapeHTML(c.author)} | ${c.timestamp}</div>
                    <div class="comment-body">${escapeHTML(c.content)}</div>
                </div>
            `).join('') || '<div style="opacity:0.3; font-style:italic; padding:20px;">No active transmissions.</div>';
        } catch (e) { document.getElementById('comment-list').textContent = "UPLINK_ERROR"; }
    }

    window.postComment = async (title) => {
        const content = document.getElementById('new-comment-content').value;
        if (!content) return;
        const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments`, {
            method: 'POST', body: JSON.stringify({ content })
        });
        if (res.ok) {
            document.getElementById('new-comment-content').value = '';
            renderComments(title, document.getElementById('integrated-discussion'));
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
            let html = wikiParse(data.current_content);
            
            let footer = '<div class="article-footer">';
            if (data.categories) footer += `<div><strong>[CATEGORIES]:</strong> ${data.categories.split(',').map(c => `<a href="/w/Category:${encodeURIComponent(c.trim())}">[${escapeHTML(c.trim())}]</a>`).join(' ')}</div>`;
            footer += '</div>';

            // --- [INTEGRATE DISCUSSION] ---
            footer += `<div id="integrated-discussion" class="integrated-discussion"></div>`;
            
            articleBody.innerHTML = html + footer;
            renderComments(data.title, document.getElementById('integrated-discussion'));

        } catch (e) { articleBody.innerHTML = "CRITICAL_SYSTEM_ERROR"; }
    }

    async function loadRecentChanges() {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = "SYSTEM_ACTIVITY_LOG";
        articleBody.innerHTML = `<div id="activity-log" class="activity-log">Establishing link...</div>`;
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/history`);
            const logs = await res.json();
            const logDiv = document.getElementById('activity-log');
            logDiv.innerHTML = logs.map(l => {
                const actionTag = l.type === 'edit' ? '<span class="tag-edit">[NEW_DATA]</span>' : '<span class="tag-comment">[DISCUSSING]</span>';
                return `<div class="log-entry">
                    <span class="log-time">[${l.timestamp.split(' ')[1] || ""}]</span> 
                    ${actionTag} in 
                    <a href="/w/${encodeURIComponent(l.title.replace(/ /g, '_'))}" class="log-node">${escapeHTML(l.title)}</a> 
                    by <span class="log-agent">Agent_${escapeHTML(l.author)}</span>
                </div>`;
            }).join('');
        } catch (e) { articleBody.innerHTML = "LOG_UPLINK_FAILED"; }
    }

    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        let title = path.startsWith('/w/') ? decodeURIComponent(path.substring(3)).replace(/[_\s]+/g, ' ').trim() : 'Main_Page';
        const mode = urlParams.get('mode');

        handleInternalLinks();
        if (mode === 'recent') await loadRecentChanges();
        else await renderArticle(title);
    }

    init();
});
