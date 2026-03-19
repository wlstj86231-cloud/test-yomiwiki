document.addEventListener('DOMContentLoaded', () => {
    // --- [BOOT SEQUENCE] ---
    const bootTerminal = document.getElementById('boot-terminal');
    if (bootTerminal) {
        setTimeout(() => {
            bootTerminal.classList.add('fade-out');
            setTimeout(() => { bootTerminal.style.display = 'none'; }, 400);
        }, 800);
    }

    const API_ENDPOINT = '/api';

    // --- [HELPERS] ---
    window.titleToSlug = (title) => {
        if (!title) return "";
        return title.trim().replace(/\s+/g, '_');
    };

    window.slugToTitle = (slug) => {
        if (!slug) return "";
        try {
            const decoded = decodeURIComponent(slug);
            return decoded.replace(/_/g, ' ').trim();
        } catch (e) {
            return slug.replace(/_/g, ' ').trim();
        }
    };

    function escapeHTML(str) {
        if (!str) return "";
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    window.timeAgo = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "N/A";
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // --- [STATE & AUTH] ---
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

    // --- [RENDERING ENGINE] ---
    function renderCommentsHTML(title, comments) {
        if (!comments || !Array.isArray(comments)) return "";
        const sorted = [...comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const rootComments = sorted.filter(c => !c.parent_id);
        const children = sorted.filter(c => c.parent_id);

        function buildCommentItem(c, indexStr, depth = 0) {
            const isReply = depth > 0;
            const subComments = children.filter(child => child.parent_id === c.id);
            return `
                <div class="comment-item" style="margin-left:${depth * 20}px; border-left:2px solid ${isReply ? '#222' : 'var(--accent-orange)'}; padding:10px 15px; margin-bottom:2px; background:rgba(255,255,255,0.005);">
                    <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:5px; display:flex; justify-content:space-between;">
                        <span><span style="color:var(--accent-orange); font-weight:bold;">${indexStr}</span> AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span></span>
                        <span>[${c.timestamp}]</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--text-main); line-height:1.4;">${escapeHTML(c.content).replace(/\n/g, '<br>')}</div>
                </div>
                ${subComments.map((sub, i) => buildCommentItem(sub, `${indexStr}.${i + 1}`, depth + 1)).join('')}
            `;
        }

        return `
            <div id="integrated-discussion" style="margin-top:20px; border-top:1px solid #222; padding-top:20px;">
                <div style="font-family:var(--font-mono); color:var(--accent-orange); font-weight:bold; font-size:0.85rem; margin-bottom:15px;">[NODE_DISCUSSION_LOGS]</div>
                <div class="comment-list">${rootComments.map((c, i) => buildCommentItem(c, `#${i + 1}`)).join('') || '<div style="opacity:0.3; padding:20px; text-align:center;">[SIGNAL_QUIET]</div>'}</div>
                <div style="margin-top:20px; background:#050505; border:1px solid #111; padding:15px;">
                    <textarea id="new-comment-content" placeholder="Initiate transmission..." style="width:100%; height:60px; background:#000; border:1px solid #222; color:#0f0; padding:10px; font-family:var(--font-mono); outline:none;"></textarea>
                    <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                        <button onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle" id="transmit-btn">[TRANSMIT]</button>
                    </div>
                </div>
            </div>
        `;
    }

    window.postComment = async (title) => {
        const content = document.getElementById('new-comment-content').value.trim();
        if (!content) return;
        const btn = document.getElementById('transmit-btn');
        btn.disabled = true;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}/comments`, {
                method: 'POST', body: JSON.stringify({ content })
            });
            if (res.ok) init();
        } catch (e) { alert("[ERROR]: Transmission failed."); }
        finally { btn.disabled = false; }
    };

    async function renderArticle(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        
        const urlParams = new URLSearchParams(window.location.search);
        const revId = urlParams.get('rev');
        const slug = window.titleToSlug(title);

        articleBody.innerHTML = '<div class="loading">[DECRYPTING...]</div>';

        try {
            const url = revId ? `${API_ENDPOINT}/article/${encodeURIComponent(slug)}?rev=${revId}` : `${API_ENDPOINT}/article/${encodeURIComponent(slug)}`;
            const res = await securedFetch(url);
            const data = await res.json();

            if (data.error) {
                if (data.error === "RECORD_NOT_FOUND") {
                    mainTitle.textContent = `[NULL_NODE]: ${title}`;
                    articleBody.innerHTML = `<div style="border:1px solid var(--hazard-red); padding:20px; color:var(--hazard-red);">[ALERT]: Archival coordinate not found. <br><br> <button onclick="window.navigateTo('?mode=edit')" class="btn-clinical-toggle">[ESTABLISH_NODE]</button></div>`;
                } else {
                    articleBody.innerHTML = `<div style="border:1px solid var(--hazard-red); padding:20px; color:var(--hazard-red);">[SYSTEM_EXCEPTION]: ${data.error} <br><br> ${data.message || ""}</div>`;
                }
                return;
            }

            mainTitle.textContent = data.title;
            metaText.innerHTML = `REV: ${data.updated_at || "N/A"} | AUTH: ${data.author || "SYSTEM"}`;

            const isBoard = data.title.startsWith('Sector:') && !data.title.substring(7).includes('/');
            let contentHtml = typeof wikiParse === 'function' ? wikiParse(data.current_content) : data.current_content;

            // Assemble Output
            let boardHtml = "";
            if (isBoard && !revId) {
                const subNodes = data.sub_articles || [];
                boardHtml = `
                    <div style="margin-bottom:30px; border-bottom:1px solid #222; padding-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="font-family:var(--font-mono); color:var(--accent-orange); margin:0;">[SUB_ARCHIVE_NODES]</h3>
                        <button onclick="window.establishNewNode('${escapeHTML(data.title)}')" class="btn-clinical-toggle">[NEW_NODE]</button>
                    </div>
                    <table class="clinical-table" style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:0.8rem;">
                        <thead>
                            <tr style="background:#111; border-bottom:2px solid #222; text-align:left;">
                                <th style="padding:10px; color:var(--accent-orange);">NODE</th>
                                <th style="padding:10px; color:var(--accent-orange); text-align:center;">ACTION</th>
                                <th style="padding:10px; color:var(--accent-orange);">AGENT</th>
                                <th style="padding:10px; color:var(--accent-orange); text-align:right;">TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subNodes.map(sub => `
                                <tr style="border-bottom:1px solid #111;">
                                    <td style="padding:10px;"><a href="/w/${sub.id || encodeURIComponent(window.titleToSlug(sub.title))}" style="color:var(--accent-cyan); font-weight:bold; text-decoration:none;">▶ ${escapeHTML(sub.title.split('/').pop())}</a></td>
                                    <td style="padding:10px; text-align:center;"><a href="/w/${encodeURIComponent(window.titleToSlug(sub.title))}?mode=history" class="btn-clinical-toggle" style="font-size:0.6rem; padding:2px 5px; text-decoration:none;">[HISTORY]</a></td>
                                    <td style="padding:10px; color:var(--text-dim);">${escapeHTML(sub.author)}</td>
                                    <td style="padding:10px; text-align:right; color:var(--text-dim);">${window.timeAgo(sub.updated_at)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="padding:20px; text-align:center; opacity:0.3;">[NO_SUB_NODES]</td></tr>'}
                        </tbody>
                    </table>
                `;
                contentHtml = ""; 
            }

            const commentsHtml = (isBoard && !revId) ? "" : renderCommentsHTML(data.title, data.comments || []);
            articleBody.innerHTML = contentHtml + boardHtml + commentsHtml;
            window.scrollTo(0, 0);

        } catch (e) {
            articleBody.innerHTML = `<div style="color:var(--hazard-red);">[CRITICAL_SYSTEM_ERROR]: Handshake failed.</div>`;
            console.error(e);
        }
    }

    window.establishNewNode = (sector) => {
        const name = prompt("Enter new node designation:");
        if (name) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(sector + "/" + name))}?mode=edit`);
    };

    window.toggleClinicalMode = () => {
        const body = document.body;
        if (body.classList.contains('clinical-dark')) {
            body.classList.remove('clinical-dark');
            localStorage.setItem('yomi_clinical', 'off');
        } else {
            body.classList.add('clinical-dark');
            localStorage.setItem('yomi_clinical', 'on');
        }
    };
    if (localStorage.getItem('yomi_clinical') === 'off') document.body.classList.remove('clinical-dark');

    async function updateSidebarActivity() {
        const logEl = document.getElementById('sidebar-live-activity');
        if (!logEl) return;
        try {
            const res = await fetch(`${API_ENDPOINT}/history`);
            const logs = await res.json();
            logEl.innerHTML = logs.map(l => {
                const time = l.timestamp?.split(' ')[1]?.substring(0, 5) || "";
                return `<div style="margin-bottom:8px; border-bottom:1px solid #111; padding-bottom:4px; font-size:0.7rem;">
                    <span style="color:#444;">${time}</span> 
                    <a href="/w/${encodeURIComponent(window.titleToSlug(l.title))}" style="color:#aaa; text-decoration:none;">${escapeHTML(l.title)}</a>
                </div>`;
            }).join('') || '<div style="opacity:0.3;">[OFFLINE]</div>';
        } catch (e) { logEl.textContent = "SYNC_OFFLINE"; }
    }

    async function init() {
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        let titleOrId = "Main_Page";
        if (path.startsWith('/w/')) titleOrId = window.slugToTitle(path.substring(3));

        if (mode === 'edit') {
            const mainTitle = document.getElementById('article-title');
            const articleBody = document.querySelector('.article-body');
            mainTitle.textContent = `EDITING: ${titleOrId}`;
            articleBody.innerHTML = `<textarea id="editor-text" style="width:100%; height:400px; background:#000; color:#0f0; padding:15px; border:1px solid #333;"></textarea> <br> <button onclick="window.transmitEdit('${escapeHTML(titleOrId)}')" class="btn-clinical-toggle" style="width:100%; padding:15px; margin-top:10px;">[TRANSMIT_TO_ARCHIVE]</button>`;
        } else {
            await renderArticle(titleOrId);
        }
        updateSidebarActivity();
    }

    window.transmitEdit = async (title) => {
        const content = document.getElementById('editor-text').value;
        try {
            await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}`, {
                method: 'POST', body: JSON.stringify({ content })
            });
            window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(title))}`);
        } catch (e) { alert("FAILED"); }
    };

    init();
    setInterval(updateSidebarActivity, 60000);
});
