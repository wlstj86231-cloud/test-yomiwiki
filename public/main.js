document.addEventListener('DOMContentLoaded', () => {
    const API_ENDPOINT = '/api';

    // --- [UTILS] ---
    window.titleToSlug = (title) => (title || "").trim().replace(/ /g, '_');
    window.slugToTitle = (slug) => {
        if (!slug) return "";
        try { return decodeURIComponent(slug).replace(/_/g, ' '); } catch (e) { return slug.replace(/_/g, ' '); }
    };
    window.timeAgo = (dateStr) => {
        if (!dateStr) return "UNKNOWN_TIME";
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (seconds < 60) return "JUST_NOW";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}M_AGO`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}H_AGO`;
        return new Date(dateStr).toLocaleDateString();
    };

    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // --- [AUTH ENGINE] ---
    let currentUser = JSON.parse(localStorage.getItem('yomi_user'));

    async function securedFetch(url, options = {}) {
        const headers = options.headers || {};
        if (currentUser?.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
        headers['X-Yomi-Request'] = 'true';
        if (!(options.body instanceof FormData) && options.body) headers['Content-Type'] = 'application/json';
        return fetch(url, { ...options, headers });
    }

    function updateAuthUI() {
        const authContainer = document.getElementById('auth-controls');
        if (!authContainer) return;
        if (currentUser) {
            authContainer.innerHTML = `<span style="color:var(--accent-orange); font-family:var(--font-mono); font-size:0.75rem; margin-right:10px;">[AGENT_${escapeHTML(currentUser.username)}]</span><button onclick="window.logout()" class="auth-btn logout">[DEACTIVATE]</button>`;
        } else {
            authContainer.innerHTML = `<a href="/?mode=login" class="auth-btn">[LOGIN]</a> <a href="/?mode=register" class="auth-btn">[REGISTER]</a>`;
        }
    }

    window.logout = () => { localStorage.removeItem('yomi_user'); currentUser = null; window.navigateTo('/w/Main_Page'); };

    // --- [ROUTING] ---
    window.navigateTo = (path) => { window.history.pushState({}, "", path); init(); };
    window.onpopstate = () => init();

    // --- [SEARCH ENGINE] ---
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    if (searchInput && searchDropdown) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();
            if (query.length < 1) { searchDropdown.style.display = 'none'; return; }
            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`${API_ENDPOINT}/search/suggest?q=${encodeURIComponent(query)}`);
                    const suggestions = await res.json();
                    if (suggestions.length > 0) {
                        searchDropdown.innerHTML = suggestions.map(s => `<div class="dropdown-item" onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(s))}')">${escapeHTML(s)}</div>`).join('');
                        searchDropdown.style.display = 'block';
                    } else { searchDropdown.style.display = 'none'; }
                } catch (e) { }
            }, 1); 
        });
        document.getElementById('search-btn').onclick = () => { const q = searchInput.value.trim(); if (q) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(q))}`); };
        searchInput.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('search-btn').onclick(); };
    }

    // --- [RENDERING ENGINE] ---
    function renderCommentsHTML(title, comments) {
        if (!comments || !Array.isArray(comments)) return "";
        const sorted = [...comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const buildCommentItem = (c, indexStr, depth = 0) => {
            const deleteBtn = currentUser?.role === 'admin' ? `<button onclick="window.adminDeleteComment('${escapeHTML(title)}', '${c.id}')" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-size:0.65rem;">[PURGE]</button>` : "";
            const sub = sorted.filter(child => child.parent_id === c.id);
            return `<div class="comment-item" style="margin-left:${depth * 20}px; border-left:2px solid ${depth > 0 ? '#222' : 'var(--accent-orange)'}; padding:10px 15px; margin-bottom:2px;">
                <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:5px;">[${indexStr}] AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span> ${deleteBtn}</div>
                <div style="font-size:0.9rem; color:var(--text-main); line-height:1.4;">${escapeHTML(c.content).replace(/\n/g, '<br>')}</div>
            </div> ${sub.map((s, i) => buildCommentItem(s, `${indexStr}.${i + 1}`, depth + 1)).join('')}`;
        };
        return `<div id="discussion" style="margin-top:20px; border-top:1px solid #222; padding-top:20px;">
            <div class="comment-list">${sorted.filter(c => !c.parent_id).map((c, i) => buildCommentItem(c, `#${i + 1}`)).join('') || '[SIGNAL_QUIET]'}</div>
            <div style="margin-top:20px; background:#050505; border:1px solid #111; padding:15px;">
                <textarea id="new-comment-content" placeholder="Initiate transmission..." class="comment-input"></textarea>
                <div style="margin-top:10px; text-align:right;"><button onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle" id="transmit-btn">[TRANSMIT]</button></div>
            </div>
        </div>`;
    }

    async function renderArticle(title) {
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        const slug = window.titleToSlug(title);
        articleBody.innerHTML = '<div class="loading">[DECRYPTING...]</div>';
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(slug)}`);
            const data = await res.json();
            if (data.error) {
                if (data.error === "RECORD_NOT_FOUND") {
                    document.getElementById('article-title').textContent = `[NULL_NODE]: ${title}`;
                    articleBody.innerHTML = `<div style="border:1px solid var(--hazard-red); padding:20px; color:var(--hazard-red);">[ALERT]: Archival coordinate not found. <button onclick="window.navigateTo('?mode=edit')" class="btn-clinical-toggle">[ESTABLISH_NODE]</button></div>`;
                } else articleBody.innerHTML = `[SYSTEM_EXCEPTION]: ${data.error}`;
                return;
            }
            const isBoard = (data.title.startsWith('Sector:') || data.title.startsWith('SubSector:')) && !data.title.split(':').pop().includes('/');
            const isArchiveHub = data.title === 'SubSector_Archive' || data.is_hub === true;
            const useCyanTheme = (data.title.startsWith('SubSector:') || isArchiveHub) && !data.title.startsWith('Sector:') && data.title !== 'Main_Page';
            document.body.classList.toggle('theme-subsector', useCyanTheme);
            document.getElementById('article-title').textContent = data.title.split('/').pop();
            const isAdmin = currentUser?.role === 'admin';
            const editBtn = (data.title === 'Main_Page' ? isAdmin : (isAdmin || currentUser?.username === data.author)) ? `<a href="/w/${encodeURIComponent(window.titleToSlug(data.title))}?mode=edit" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px;">[EDIT_NODE]</a>` : "";
            const historyBtn = `<a href="/w/${encodeURIComponent(window.titleToSlug(data.title))}?mode=history" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px;">[HISTORY]</a>`;
            if (isBoard || isArchiveHub) metaText.innerHTML = isAdmin ? editBtn : "";
            else metaText.innerHTML = `REV: ${data.updated_at || "STABLE"} | AUTH: ${data.author || "Archive_Admin"} ${historyBtn} ${editBtn}`;
            let contentHtml = typeof wikiParse === 'function' ? wikiParse(data.current_content) : data.current_content;
            let boardHtml = "";
            if (isBoard || isArchiveHub) {
                const subs = data.sub_articles || [];
                boardHtml = `<table class="clinical-table" style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                    <thead><tr style="background:#111; border-bottom:2px solid #222; text-align:left;"><th style="padding:10px;">NODE</th><th style="padding:10px;">AGENT</th><th style="padding:10px; text-align:right;">TIMESTAMP</th></tr></thead>
                    <tbody>${subs.map(sub => `<tr onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(sub.title))}')" style="border-bottom:1px solid #111; cursor:pointer;">
                        <td style="padding:10px;">${sub.classification === 'NOTICE' ? '<span style="background:var(--hazard-red); color:#000; padding:1px 4px; font-size:0.6rem; margin-right:5px;">[NOTICE]</span>' : ''} ▶ ${escapeHTML(sub.title.split('/').pop())}</td>
                        <td style="padding:10px;">${escapeHTML(sub.author)}</td><td style="padding:10px; text-align:right;">${window.timeAgo(sub.updated_at)}</td>
                    </tr>`).join('') || '<tr><td colspan="3" style="padding:20px; text-align:center;">[SIGNAL_QUIET]</td></tr>'}</tbody></table>`;
                contentHtml = "";
            }
            articleBody.innerHTML = contentHtml + boardHtml + renderCommentsHTML(data.title, data.comments || []);
        } catch (e) { articleBody.innerHTML = "[Handshake failed.]"; }
        finally { document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove(); }
    }

    async function loadEditor(titleOrId) {
        const articleBody = document.querySelector('.article-body');
        document.getElementById('article-title').textContent = `EDITING: ${titleOrId}`;
        articleBody.innerHTML = `<div id="editor-container" style="display:flex; gap:30px; align-items:flex-start;">
            <div style="flex:1;">
                <div class="textarea-container" style="position:relative; background:#000; border:1px solid #222;">
                    <textarea id="editor-text" style="width:100%; height:550px; background:transparent; color:var(--text-main); padding:20px; border:none; font-family:var(--font-mono); caret-color:var(--accent-orange); outline:none;" placeholder="[LOADING_ARCHIVAL_DATA...]"></textarea>
                    <div class="editor-drop-overlay">[DROP_IMAGE_TO_UPLOAD]</div>
                </div>
                <div style="background:#0a0a0a; border:1px solid #111; padding:20px; margin-top:20px;">
                    <label style="display:block; font-size:0.7rem; color:var(--accent-orange); margin-bottom:10px;">[EDIT_SUMMARY]</label>
                    <input type="text" id="edit-summary" style="width:100%; background:#000; border:1px solid #222; color:var(--accent-cyan); padding:10px; outline:none;">
                </div>
                <div style="display:flex; gap:15px; margin-top:20px;">
                    <button onclick="window.transmitEdit('${escapeHTML(titleOrId)}')" class="btn-clinical-toggle" style="flex:2; padding:15px; font-weight:bold;">[TRANSMIT]</button>
                    <button onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(titleOrId))}')" class="btn-clinical-toggle" style="flex:1; padding:15px; color:#888;">[ABORT]</button>
                </div>
            </div>
            <div class="infobox-builder" id="editor-ib-builder">
                <div style="padding:10px; font-size:0.65rem; color:var(--accent-orange); border-bottom:1px solid #222;">[INFOBOX_CONSTRUCTOR]</div>
                <input type="text" id="ib-title" placeholder="ARCHIVAL_TITLE" class="builder-title-input">
                <div id="ib-drop-zone" class="builder-drop-zone"><img id="ib-preview" style="display:none;"><div class="builder-placeholder">[DRAG_DROP_IMAGE]</div></div>
                <input type="hidden" id="ib-image-url">
                <div class="builder-rows" id="ib-rows"><div id="ib-extra-rows"></div><button onclick="window.addInfoboxRow()" class="btn-clinical-toggle" style="width:100%; border:none; border-top:1px solid #222; font-size:0.6rem; padding:8px;">[+ ADD_FIELD]</button></div>
            </div>
        </div>`;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(titleOrId))}`);
            const data = await res.json();
            const tx = document.getElementById('editor-text');
            tx.value = data.current_content || "";
            tx.parentElement.addEventListener('dragover', (e) => { e.preventDefault(); tx.parentElement.classList.add('dragover'); });
            tx.parentElement.addEventListener('dragleave', () => tx.parentElement.classList.remove('dragover'));
            tx.parentElement.addEventListener('drop', (e) => { e.preventDefault(); tx.parentElement.classList.remove('dragover'); handleEditorDrop(e, tx); });
            const idz = document.getElementById('ib-drop-zone');
            idz.addEventListener('dragover', (e) => { e.preventDefault(); idz.classList.add('dragover'); });
            idz.addEventListener('dragleave', () => idz.classList.remove('dragover'));
            idz.addEventListener('drop', (e) => { e.preventDefault(); idz.classList.remove('dragover'); handleInfoboxDrop(e, document.getElementById('ib-preview'), document.getElementById('ib-image-url')); });
        } catch (e) { }
        finally { document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove(); }
    }

    async function handleEditorDrop(e, target) {
        const file = e.dataTransfer.files[0]; if (!file || !file.type.startsWith('image/')) return;
        const url = await uploadImage(file); if (url) { const tag = `\n[[File:${url}|width=300px|caption=IMAGE_DATA]]\n`; const start = target.selectionStart; target.value = target.value.substring(0, start) + tag + target.value.substring(target.selectionEnd); }
    }

    async function handleInfoboxDrop(e, img, urlInp) {
        const file = e.dataTransfer.files[0]; if (!file || !file.type.startsWith('image/')) return;
        const url = await uploadImage(file); if (url) { img.src = url; img.style.display = 'block'; urlInp.value = url; document.querySelector('.builder-placeholder').style.display = 'none'; }
    }

    async function uploadImage(file) {
        const fd = new FormData(); fd.append('file', file);
        try { const res = await securedFetch(`${API_ENDPOINT}/assets/upload`, { method: 'POST', body: fd }); const d = await res.json(); return d.url; } catch (e) { alert("UPLOAD_FAILED"); return null; }
    }

    window.addInfoboxRow = () => { const container = document.getElementById('ib-extra-rows'); const div = document.createElement('div'); div.className = 'builder-row'; div.innerHTML = `<input type="text" placeholder="KEY" class="builder-key"> <input type="text" placeholder="VALUE" class="builder-val">`; container.appendChild(div); };

    async function updateSidebarActivity() {
        try {
            const res = await fetch(`${API_ENDPOINT}/activity`);
            const data = await res.json();
            const list = document.getElementById('sidebar-live-activity');
            if (list) list.innerHTML = data.map(act => `<div style="margin-bottom:8px; border-bottom:1px solid #111; padding-bottom:4px;">
                <div style="font-size:0.6rem; color:var(--text-dim);">[${act.type}] ${act.actor}</div>
                <div style="font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><a href="/w/${encodeURIComponent(window.titleToSlug(act.target))}" style="color:var(--accent-cyan);">▶ ${escapeHTML(act.target.split('/').pop())}</a></div>
            </div>`).join('');
        } catch (e) { }
    }

    async function renderAuthForm(mode) {
        const articleBody = document.querySelector('.article-body');
        document.getElementById('article-title').textContent = mode === 'login' ? 'AGENT_IDENTIFICATION' : 'NEW_AGENT_REGISTRATION';
        articleBody.innerHTML = `<div style="max-width:400px; margin:40px auto; background:#0a0a0a; border:1px solid #222; padding:30px; box-shadow:0 0 20px rgba(0,0,0,0.5);">
            <div style="margin-bottom:25px; text-align:center; font-family:var(--font-mono); color:var(--accent-orange); font-size:0.85rem; letter-spacing:1px;">[${mode === 'login' ? 'ESTABLISH_UPLINK' : 'INITIATE_HANDSHAKE'}]</div>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div><label for="auth-username" style="display:block; font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim); margin-bottom:8px;">AGENT_ID</label><input type="text" id="auth-username" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:12px; font-family:var(--font-mono); outline:none; font-size:1rem;" autocomplete="off" autofocus></div>
                <div><label for="auth-password" style="display:block; font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim); margin-bottom:8px;">ACCESS_KEY</label><input type="password" id="auth-password" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:12px; font-family:var(--font-mono); outline:none; font-size:1rem;"></div>
                <div id="auth-error" style="color:var(--hazard-red); font-size:0.75rem; min-height:1.2rem; text-align:center;"></div>
                <button id="auth-submit-btn" class="btn-clinical-toggle" style="width:100%; padding:15px; font-weight:bold; margin-top:10px; font-size:1rem;">${mode === 'login' ? '[AUTHENTICATE]' : '[REGISTER_AGENT]'}</button>
                <div style="text-align:center; margin-top:20px;"><a href="/?mode=${mode === 'login' ? 'register' : 'login'}" style="color:var(--text-dim); font-size:0.7rem; text-decoration:none; border-bottom:1px solid #222;">[${mode === 'login' ? 'REQUEST_NEW_ID' : 'EXISTING_AGENT_LOGIN'}]</a></div>
            </div></div>`;
        const submitBtn = document.getElementById('auth-submit-btn'); const passwordInput = document.getElementById('auth-password'); const usernameInput = document.getElementById('auth-username'); const errorEl = document.getElementById('auth-error');
        const performAuth = async () => {
            const username = usernameInput.value.trim(); const password = passwordInput.value; if (!username || !password) { errorEl.textContent = "[ERROR]: FIELDS_INCOMPLETE"; return; }
            submitBtn.disabled = true; submitBtn.textContent = "[PROCESSING...]"; errorEl.textContent = "";
            try {
                const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
                const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Yomi-Request': 'true' }, body: JSON.stringify({ username, password }) });
                const data = await res.json(); if (res.ok && data.token) { localStorage.setItem('yomi_user', JSON.stringify(data)); currentUser = data; window.navigateTo('/w/Main_Page'); }
                else { errorEl.textContent = `[ERROR]: ${data.error || 'ACCESS_DENIED'}`; }
            } catch (e) { errorEl.textContent = "[ERROR]: CONNECTION_TERMINATED"; } finally { submitBtn.disabled = false; submitBtn.textContent = mode === 'login' ? '[AUTHENTICATE]' : '[REGISTER_AGENT]'; }
        };
        submitBtn.onclick = performAuth; passwordInput.onkeydown = (e) => { if (e.key === 'Enter') performAuth(); }; usernameInput.onkeydown = (e) => { if (e.key === 'Enter') passwordInput.focus(); };
        document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove();
    }

    async function init() {
        const path = decodeURIComponent(window.location.pathname); const urlParams = new URLSearchParams(window.location.search); const mode = urlParams.get('mode');
        let titleOrId = "Main_Page"; if (path.startsWith('/w/')) titleOrId = path.substring(3);
        if (mode === 'login' || mode === 'register') await renderAuthForm(mode);
        else if (mode === 'edit') await loadEditor(titleOrId);
        else await renderArticle(titleOrId);
        updateAuthUI(); updateSidebarActivity();
    }

    window.transmitEdit = async (title) => {
        const bodyText = document.getElementById('editor-text').value;
        const summary = document.getElementById('edit-summary').value;
        const ibTitle = document.getElementById('ib-title').value.trim(); const ibImage = document.getElementById('ib-image-url').value.trim(); const ibCaption = document.getElementById('ib-caption')?.value || ""; const ibType = document.getElementById('ib-type')?.value || "";
        let ibMarkup = "";
        if (ibTitle || ibImage) {
            ibMarkup = `{{infobox\n| title = ${ibTitle}\n| image = ${ibImage}\n| caption = ${ibCaption}\n| type = ${ibType}\n`;
            document.querySelectorAll('.infobox-builder .builder-key').forEach((k, i) => { const v = document.querySelectorAll('.infobox-builder .builder-val')[i + 2]; if (k.value.trim()) ibMarkup += `| ${k.value.trim()} = ${v.value.trim()}\n`; });
            ibMarkup += `}}\n\n`;
        }
        try { await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}`, { method: 'POST', body: JSON.stringify({ content: ibMarkup + bodyText, edit_summary: summary }) }); window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(title))}`); } catch (e) { alert("FAILED"); }
    };

    init(); setInterval(updateSidebarActivity, 60000);
});
