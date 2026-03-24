document.addEventListener('DOMContentLoaded', () => {
    // --- [BOOT SEQUENCE] ---
    const bootTerminal = document.getElementById('boot-terminal');
    if (bootTerminal) {
        if (sessionStorage.getItem('yomi_booted')) {
            bootTerminal.style.display = 'none';
        } else {
            setTimeout(() => {
                bootTerminal.classList.add('fade-out');
                setTimeout(() => { 
                    bootTerminal.style.display = 'none'; 
                    sessionStorage.setItem('yomi_booted', 'true');
                }, 200);
            }, 300);
        }
    }

    const API_ENDPOINT = '/api';

    // --- [UTILS] ---
    window.titleToSlug = (title) => (title || "").trim();
    window.slugToTitle = (slug) => decodeURIComponent(slug || "");
    window.timeAgo = (dateStr) => {
        if (!dateStr) return "UNKNOWN_TIME";
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return "JUST_NOW";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}M_AGO`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}H_AGO`;
        return date.toLocaleDateString();
    };

    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // --- [AUTH ENGINE] ---
    let currentUser = JSON.parse(localStorage.getItem('yomi_user'));

    async function securedFetch(url, options = {}) {
        const headers = options.headers || {};
        if (currentUser?.token) {
            headers['Authorization'] = `Bearer ${currentUser.token}`;
        }
        headers['X-Yomi-Request'] = 'true';
        if (options.body instanceof FormData) {
        } else if (options.body) {
            headers['Content-Type'] = 'application/json';
        }
        return fetch(url, { ...options, headers });
    }

    function updateAuthUI() {
        const authContainer = document.getElementById('auth-controls');
        if (!authContainer) return;
        if (currentUser) {
            authContainer.innerHTML = `
                <span style="color:var(--accent-orange); font-family:var(--font-mono); font-size:0.75rem; margin-right:10px;">[AGENT_${escapeHTML(currentUser.username)}]</span>
                ${currentUser.role === 'admin' ? '<a href="/admin" class="auth-btn" style="border-color:var(--accent-orange); color:var(--accent-orange); margin-right:5px;">[ADMIN_CENTER]</a>' : ''}
                <button onclick="window.logout()" class="auth-btn logout">[DEACTIVATE]</button>
            `;
        } else {
            authContainer.innerHTML = `
                <a href="/?mode=login" class="auth-btn">[LOGIN]</a>
                <a href="/?mode=register" class="auth-btn">[REGISTER]</a>
            `;
        }
    }

    window.logout = () => {
        localStorage.removeItem('yomi_user');
        currentUser = null;
        window.navigateTo('/w/Main_Page');
    };

    // --- [ROUTING] ---
    window.navigateTo = (path) => {
        window.history.pushState({}, "", path);
        init();
    };
    window.onpopstate = () => init();

    // --- [SEARCH ENGINE] ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchDropdown = document.getElementById('search-dropdown');

    if (searchInput && searchBtn && searchDropdown) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();
            if (query.length < 1) {
                searchDropdown.style.display = 'none';
                return;
            }
            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`${API_ENDPOINT}/search/suggest?q=${encodeURIComponent(query)}`);
                    const suggestions = await res.json();
                    if (suggestions.length > 0) {
                        searchDropdown.innerHTML = suggestions.map(s => `
                            <div class="dropdown-item" onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(s))}')">${escapeHTML(s)}</div>
                        `).join('');
                        searchDropdown.style.display = 'block';
                    } else {
                        searchDropdown.style.display = 'none';
                    }
                } catch (e) { console.error("SEARCH_ERROR", e); }
            }, 1); 
        });

        searchBtn.onclick = () => {
            const query = searchInput.value.trim();
            if (query) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(query))}`);
        };

        searchInput.onkeydown = (e) => {
            if (e.key === 'Enter') searchBtn.onclick();
        };

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }

    // --- [RENDERING ENGINE] ---
    function renderCommentsHTML(title, comments) {
        if (!comments || !Array.isArray(comments)) return "";
        const sorted = [...comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const rootComments = sorted.filter(c => !c.parent_id);
        const children = sorted.filter(c => c.parent_id);

        function buildCommentItem(c, indexStr, depth = 0) {
            const isReply = depth > 0;
            const subComments = children.filter(child => child.parent_id === c.id);
            const deleteBtn = currentUser?.role === 'admin' ? `<button onclick="window.adminDeleteComment('${escapeHTML(title)}', '${c.id}')" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-family:var(--font-mono); font-size:0.65rem;">[PURGE]</button>` : "";
            
            return `
                <div class="comment-item" style="margin-left:${depth * 20}px; border-left:2px solid ${isReply ? '#222' : 'var(--accent-orange)'}; padding:10px 15px; margin-bottom:2px; background:rgba(255,255,255,0.005);">
                    <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:5px; display:flex; justify-content:space-between;">
                        <span><span style="color:var(--accent-orange); font-weight:bold;">${indexStr}</span> AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span></span>
                        <span>${deleteBtn} [${c.timestamp}]</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--text-main); line-height:1.4;">${escapeHTML(c.content).replace(/\n/g, '<br>')}</div>
                </div>
                ${subComments.map((sub, i) => buildCommentItem(sub, `${indexStr}.${i + 1}`, depth + 1)).join('')}
            `;
        }

        return `
            <div id="integrated-discussion" style="margin-top:20px; border-top:1px solid #222; padding-top:20px;">
                <div class="comment-list">${rootComments.map((c, i) => buildCommentItem(c, `#${i + 1}`)).join('') || '<div style="opacity:0.3; padding:20px; text-align:center;">[SIGNAL_QUIET]</div>'}</div>
                <div style="margin-top:20px; background:#050505; border:1px solid #111; padding:15px;">
                    <textarea id="new-comment-content" placeholder="Initiate transmission..." class="comment-input"></textarea>
                    <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                        <button onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle" id="transmit-btn">[TRANSMIT]</button>
                    </div>
                </div>
            </div>
        `;
    }

    async function renderArticle(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        const urlParams = new URLSearchParams(window.location.search);
        const revId = urlParams.get('rev');
        const slug = window.titleToSlug(title);

        const isInitialHydration = articleBody.children.length > 0 && !articleBody.querySelector('.loading-text');
        if (!isInitialHydration) {
            articleBody.innerHTML = '<div class="loading">[DECRYPTING...]</div>';
        }

        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(slug)}${revId ? `?rev=${revId}` : ''}`);
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

            const isSubSector = data.title.startsWith('SubSector:');
            const isBoard = (data.title.startsWith('Sector:') || isSubSector) && !data.title.split(':').pop().includes('/');
            const isHub = data.is_hub === true;

            if (isSubSector || isHub) document.body.classList.add('theme-subsector');
            else document.body.classList.remove('theme-subsector');
            
            const displayTitle = (data.title || title).split('/').pop();
            mainTitle.textContent = displayTitle;
            
            const isOfficial = !data.title.startsWith('SubSector:');
            const isAdmin = currentUser?.role === 'admin';
            const purgeBtn = (isAdmin && !isBoard && !isHub) ? `<button onclick="window.adminPurgeCurrentNode('${escapeHTML(data.title)}')" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-family:var(--font-mono); font-size:0.65rem; margin-left:10px;">[PURGE_NODE]</button>` : "";
            const historyBtn = (isOfficial && !isHub) ? `<a href="/w/${encodeURIComponent(window.titleToSlug(data.title))}?mode=history" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px; text-decoration:none; padding:2px 6px;">[HISTORY]</a>` : "";

            const isMainPage = data.title === 'Main_Page' || window.location.pathname === '/' || window.location.pathname === '/w/Main_Page';
            const isAuthor = currentUser?.username && data.author && (currentUser.username === data.author);
            const canEdit = isMainPage ? isAdmin : (isAdmin || isAuthor);
            const editBtn = canEdit ? `<a href="/w/${encodeURIComponent(window.titleToSlug(data.title))}?mode=edit" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px; text-decoration:none; padding:2px 6px;">[EDIT_NODE]</a>` : "";

            if (isBoard || isHub) metaText.innerHTML = isAdmin ? editBtn : "";
            else if (isMainPage) metaText.innerHTML = editBtn;
            else metaText.innerHTML = `REV: ${data.updated_at || "STABLE"} | AUTH: ${data.author || "Archive_Admin"} ${historyBtn} ${editBtn} ${purgeBtn}`;

            let contentHtml = typeof wikiParse === 'function' ? wikiParse(data.current_content) : data.current_content;

            let boardHtml = "";
            if (isHub && !revId) {
                const subNodes = data.sub_articles || [];
                boardHtml = `
                    <div style="margin-top:20px; border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:20px;">
                        <h3 style="font-family:var(--font-mono); color:var(--accent-cyan); margin:0;">[ACTIVE_SUB_SECTOR_HUB]</h3>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${subNodes.map(sub => `
                            <div class="channel-card" onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(sub.title))}')" style="cursor:pointer;">
                                <div style="display:flex; align-items:center;">
                                    <span class="channel-badge">CHANNEL</span>
                                    <span style="color:var(--accent-cyan); font-weight:900; font-size:1.1rem;"># ${escapeHTML(sub.title.split(':').pop())}</span>
                                </div>
                                <div style="text-align:right; font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim);">AGENT: ${escapeHTML(sub.author)} | ${window.timeAgo(sub.updated_at)}</div>
                            </div>
                        `).join('') || '<div style="opacity:0.3; padding:40px; text-align:center;">[NO_ACTIVE_CHANNELS_DETECTED]</div>'}
                    </div>`;
            } else if (isBoard && !revId) {
                const subNodes = data.sub_articles || [];
                const themeColor = isSubSector ? 'var(--accent-cyan)' : 'var(--accent-orange)';
                const adminNoticeBtn = (isAdmin) ? `<button onclick="window.establishNewNode('${escapeHTML(data.title)}', true)" class="btn-clinical-toggle" style="border-color:var(--hazard-red); color:var(--hazard-red); margin-left:10px;">[POST_NOTICE]</button>` : "";
                const createBtn = `<button onclick="window.establishNewNode('${escapeHTML(data.title)}')" class="btn-clinical-toggle">${isSubSector ? '[+ NEW_POST]' : '[NEW_NODE]'}</button>`;

                boardHtml = `
                    <div style="margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:15px; display:flex; justify-content:flex-end; align-items:center;">
                        <div>${createBtn} ${adminNoticeBtn}</div>
                    </div>
                    <table class="clinical-table" style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:0.8rem;">
                        <thead>
                            <tr style="background:#111; border-bottom:2px solid #222; text-align:left;">
                                <th style="padding:10px; color:${themeColor};">NODE</th>
                                <th style="padding:10px; color:${themeColor}; text-align:center;">ACTION</th>
                                <th style="padding:10px; color:${themeColor};">AGENT</th>
                                <th style="padding:10px; color:${themeColor}; text-align:right;">TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subNodes.map(sub => `
                                <tr onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(sub.title))}')" style="border-bottom:1px solid #111; cursor:pointer;" class="node-row">
                                    <td style="padding:10px;"><span style="color:var(--accent-cyan); font-weight:bold;">▶ ${escapeHTML(sub.title.split('/').pop())}</span></td>
                                    <td style="padding:10px; text-align:center;">
                                        <button onclick="event.stopPropagation(); window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(sub.title))}?mode=history')" class="btn-clinical-toggle" style="font-size:0.6rem; padding:2px 5px;">[HISTORY]</button>
                                    </td>
                                    <td style="padding:10px; color:var(--text-dim);">${escapeHTML(sub.author)}</td>
                                    <td style="padding:10px; text-align:right; color:var(--text-dim);">${window.timeAgo(sub.updated_at)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="padding:20px; text-align:center; opacity:0.3;">[NO_ACTIVE_CHANNELS]</td></tr>'}
                        </tbody>
                    </table>`;
                contentHtml = ""; 
            }

            const commentsHtml = (isBoard && !revId) ? "" : renderCommentsHTML(data.title, data.comments || []);
            articleBody.innerHTML = contentHtml + boardHtml + commentsHtml;

        } catch (e) {
            articleBody.innerHTML = `<div style="color:var(--hazard-red);">[CRITICAL_SYSTEM_ERROR]: Handshake failed.</div>`;
            console.error(e);
        }
    }

    async function loadRevisionHistory(title) {
        const articleBody = document.querySelector('.article-body');
        articleBody.innerHTML = '<div class="loading">[RECOV_HISTORY_STREAM...]</div>';
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}/history`);
            const data = await res.json();
            const revisions = data.revisions || [];
            articleBody.innerHTML = `
                <div style="margin-bottom:20px;"><button onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(title))}')" class="btn-clinical-toggle">[BACK_TO_CURRENT_NODE]</button></div>
                <table class="clinical-table" style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:0.8rem;">
                    <thead><tr style="background:#111; border-bottom:2px solid #222; text-align:left;"><th>REV_ID</th><th>AGENT</th><th>SUMMARY</th><th style="text-align:right;">TIMESTAMP</th></tr></thead>
                    <tbody>${revisions.map(rev => `<tr style="border-bottom:1px solid #111;"><td style="padding:10px;"><a href="/w/${encodeURIComponent(window.titleToSlug(title))}?rev=${rev.id}" style="color:var(--accent-cyan);">#${rev.id}</a></td><td>${escapeHTML(rev.author)}</td><td>${escapeHTML(rev.edit_summary || "")}</td><td style="text-align:right;">${rev.timestamp}</td></tr>`).join('')}</tbody>
                </table>`;
        } catch (e) { articleBody.innerHTML = "FAILED_TO_LOAD_HISTORY"; }
    }

    async function loadEditor(titleOrId) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        
        mainTitle.textContent = `EDITING_NODE: ${titleOrId}`;
        metaText.textContent = "INITIALIZING_BUFFER...";
        articleBody.innerHTML = `
            <div id="editor-container" style="display:flex; flex-direction:column; gap:20px;">
                <div style="display:flex; gap:30px; align-items:flex-start;">
                    <div style="flex:1;">
                        <div class="textarea-container" style="position:relative; background:#000; border:1px solid #222;">
                            <textarea id="editor-text" style="width:100%; height:550px; background:transparent; color:var(--text-main); padding:20px; border:none; font-family:var(--font-mono); resize:vertical; outline:none; line-height:1.6; caret-color:var(--accent-orange); opacity:0.5;" placeholder="[LOADING_ARCHIVAL_DATA...]"></textarea>
                            <div class="editor-drop-overlay">[DRAG_DROP_IMAGE_TO_ENCRYPT]</div>
                        </div>
                        <style>
                            #editor-text:focus { box-shadow: inset 0 0 10px rgba(255, 153, 0, 0.05); }
                            .textarea-container:focus-within { border-color: var(--accent-orange-dim) !important; }
                        </style>
                        <div style="margin-top:20px; background:#0a0a0a; border:1px solid #111; padding:20px;">
                            <label style="display:block; font-family:var(--font-mono); color:var(--accent-orange); font-size:0.7rem; margin-bottom:10px;">[EDIT_SUMMARY]</label>
                            <input type="text" id="edit-summary" placeholder="Briefly describe your changes..." style="width:100%; background:#000; border:1px solid #222; color:var(--accent-cyan); padding:10px; font-family:var(--font-mono); outline:none;">
                        </div>
                        <div style="margin-top:20px; display:flex; gap:15px;">
                            <button onclick="window.transmitEdit('${escapeHTML(titleOrId)}')" class="btn-clinical-toggle" id="btn-save" style="flex:2; padding:15px; font-weight:bold;">[TRANSMIT_TO_ARCHIVE]</button>
                            <button onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(titleOrId))}')" class="btn-clinical-toggle" style="flex:1; padding:15px; border-color:#444; color:#888;">[ABORT_MISSION]</button>
                        </div>
                    </div>
                    <div class="infobox-builder" id="editor-ib-builder">
                        <div style="padding:10px; font-family:var(--font-mono); font-size:0.65rem; color:var(--accent-orange); border-bottom:1px solid #222;">[VISUAL_INFOBOX_CONSTRUCTOR]</div>
                        <input type="text" id="ib-title" placeholder="ARCHIVAL_TITLE" class="builder-title-input">
                        <div id="ib-drop-zone" class="builder-drop-zone">
                            <img id="ib-preview" style="display:none;">
                            <div class="builder-placeholder">[DRAG_DROP_PRIMARY_IMAGE]</div>
                        </div>
                        <input type="hidden" id="ib-image-url">
                        <div class="builder-rows" id="ib-rows">
                            <div class="builder-row"><input type="text" placeholder="IMAGE_CAPTION" id="ib-caption" class="builder-val" style="width:100%;"></div>
                            <div class="builder-row"><input type="text" placeholder="ENTITY_TYPE" id="ib-type" class="builder-val" style="width:100%;"></div>
                            <div id="ib-extra-rows"></div>
                            <button onclick="window.addInfoboxRow()" class="btn-clinical-toggle" style="width:100%; border:none; border-top:1px solid #222; font-size:0.6rem; padding:8px;">[+ ADD_METADATA_FIELD]</button>
                        </div>
                    </div>
                </div>
            </div>`;

        const tx = document.getElementById('editor-text');
        try {
            const slug = window.titleToSlug(titleOrId);
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(slug)}`);
            const data = await res.json();
            let currentContent = "";
            if (data.error && data.error !== "RECORD_NOT_FOUND") { tx.value = `[ACCESS_DENIED]: ${data.error}`; return; }
            if (data.error === "RECORD_NOT_FOUND") {
                currentContent = "[NEW_ARCHIVE_DATA_NODE]\n\nInitiate archival records here...";
                metaText.textContent = "NEW_NODE_DETECTION";
            } else if (data.current_content) {
                currentContent = data.current_content;
                metaText.textContent = "CLEARANCE_GRANTED";
                const infoMatch = currentContent.match(/\{\{infobox([\s\S]*?)\}\}/i);
                if (infoMatch) {
                    const body = infoMatch[1];
                    currentContent = currentContent.replace(infoMatch[0], "").trim();
                    body.split('|').forEach(row => {
                        if (row.includes('=')) {
                            const parts = row.split('=');
                            const key = parts[0].trim().toLowerCase();
                            const val = parts.slice(1).join('=').trim();
                            if (key === 'title') document.getElementById('ib-title').value = val;
                            else if (key === 'image') { 
                                const img = document.getElementById('ib-preview');
                                const urlInp = document.getElementById('ib-image-url');
                                img.src = val; img.style.display = 'block'; urlInp.value = val;
                                document.querySelector('.builder-placeholder').style.display = 'none';
                            }
                            else if (key === 'caption') document.getElementById('ib-caption').value = val;
                            else if (key === 'type') document.getElementById('ib-type').value = val;
                            else {
                                const container = document.getElementById('ib-extra-rows');
                                const div = document.createElement('div');
                                div.className = 'builder-row';
                                div.innerHTML = `<input type="text" placeholder="KEY" class="builder-key ib-extra-key" value="${escapeHTML(parts[0].trim())}"> <input type="text" placeholder="VALUE" class="builder-val ib-extra-val" value="${escapeHTML(val)}">`;
                                container.appendChild(div);
                            }
                        }
                    });
                }
            }
            tx.value = currentContent; tx.style.opacity = "1";
            const cnt = tx.parentElement;
            cnt.addEventListener('dragover', (e) => { e.preventDefault(); cnt.classList.add('dragover'); });
            cnt.addEventListener('dragleave', () => cnt.classList.remove('dragover'));
            cnt.addEventListener('drop', (e) => { cnt.classList.remove('dragover'); handleEditorDrop(e, tx); });
            const idz = document.getElementById('ib-drop-zone');
            idz.addEventListener('dragover', (e) => { e.preventDefault(); idz.classList.add('dragover'); });
            idz.addEventListener('dragleave', () => idz.classList.remove('dragover'));
            idz.addEventListener('drop', (e) => { idz.classList.remove('dragover'); handleInfoboxDrop(e, document.getElementById('ib-preview'), document.getElementById('ib-image-url')); });
        } catch (e) { tx.value = `[SYSTEM_EXCEPTION]: ${e.message}`; }
    }

    async function handleEditorDrop(e, targetTextarea) {
        e.preventDefault(); e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const url = await uploadImage(file);
                    if (url) {
                        const insertion = `\n[[File:${url}|width=300px|caption=IMAGE_DATA]]\n`;
                        const start = targetTextarea.selectionStart;
                        targetTextarea.value = targetTextarea.value.substring(0, start) + insertion + targetTextarea.value.substring(targetTextarea.selectionEnd);
                    }
                }
            }
        }
    }

    async function handleInfoboxDrop(e, imgEl, urlInput) {
        e.preventDefault(); e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && files[0].type.startsWith('image/')) {
            const url = await uploadImage(files[0]);
            if (url) {
                imgEl.src = url; imgEl.style.display = 'block'; urlInput.value = url;
                imgEl.parentElement.querySelector('.builder-placeholder').style.display = 'none';
            }
        }
    }

    async function uploadImage(file) {
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await securedFetch(`${API_ENDPOINT}/assets/upload`, { method: 'POST', body: formData });
            const data = await res.json(); return data.url;
        } catch (e) { alert("UPLOAD_FAILED"); return null; }
    }

    window.addInfoboxRow = () => {
        const container = document.getElementById('ib-extra-rows');
        const div = document.createElement('div');
        div.className = 'builder-row';
        div.innerHTML = `<input type="text" placeholder="KEY" class="builder-key ib-extra-key"> <input type="text" placeholder="VALUE" class="builder-val ib-extra-val">`;
        container.appendChild(div);
    };

    window.postComment = async (title) => {
        const content = document.getElementById('new-comment-content').value.trim();
        if (!content) return;
        const btn = document.getElementById('transmit-btn'); btn.disabled = true;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
            if (res.ok) init();
        } catch (e) { alert("FAILED"); }
        finally { btn.disabled = false; }
    };

    window.adminPurgeCurrentNode = async (title, stayOnPage = false) => {
        if (!confirm(`PURGE node "${title}"?`)) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/article/purge`, { method: 'DELETE', body: JSON.stringify({ title }) });
            if (res.ok) { if (stayOnPage) init(); else window.navigateTo('/w/Main_Page'); }
        } catch (e) { alert("FAILED"); }
    };

    window.adminDeleteComment = async (title, commentId) => {
        if (!confirm("PURGE comment?")) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) init();
        } catch (e) { alert("FAILED"); }
    };

    window.establishNewNode = (sector, isNotice = false) => {
        const name = prompt(isNotice ? "Enter NOTICE Title:" : "Enter Node Title:");
        if (name) {
            const mode = isNotice ? "edit&type=notice" : "edit";
            window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(sector + "/" + name))}?mode=${mode}`);
        }
    };

    window.establishNewSector = () => {
        const name = prompt("Enter new SUB-SECTOR name:");
        if (name) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug("SubSector:" + name))}`);
    };

    window.transmitEdit = async (title) => {
        const bodyText = document.getElementById('editor-text').value;
        const summary = document.getElementById('edit-summary')?.value || "";
        const ibTitle = document.getElementById('ib-title').value.trim();
        const ibImage = document.getElementById('ib-image-url').value.trim();
        const ibCaption = document.getElementById('ib-caption').value.trim();
        const ibType = document.getElementById('ib-type').value.trim();
        const urlParams = new URLSearchParams(window.location.search);
        const classification = urlParams.get('type') === 'notice' ? 'NOTICE' : 'GENERAL';
        let ibMarkup = "";
        if (ibTitle || ibImage) {
            ibMarkup = `{{infobox\n| title = ${ibTitle}\n| image = ${ibImage}\n| caption = ${ibCaption}\n| type = ${ibType}\n`;
            document.querySelectorAll('.ib-extra-key').forEach((k, i) => {
                const v = document.querySelectorAll('.ib-extra-val')[i];
                if (k.value.trim()) ibMarkup += `| ${k.value.trim()} = ${v.value.trim()}\n`;
            });
            ibMarkup += `}}\n\n`;
        }
        try {
            await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}`, {
                method: 'POST', body: JSON.stringify({ content: ibMarkup + bodyText, classification, edit_summary: summary })
            });
            window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(title))}`);
        } catch (e) { alert("FAILED"); }
    };

    async function renderAuthForm(mode) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        mainTitle.textContent = mode === 'login' ? 'AGENT_IDENTIFICATION' : 'NEW_AGENT_REGISTRATION';
        metaText.textContent = ""; 
        articleBody.innerHTML = `
            <div style="max-width:400px; margin:40px auto; background:#0a0a0a; border:1px solid #222; padding:30px; box-shadow:0 0 20px rgba(0,0,0,0.5);">
                <div style="margin-bottom:20px; text-align:center; font-family:var(--font-mono); color:var(--accent-orange); font-size:0.8rem;">[${mode === 'login' ? 'ESTABLISH_UPLINK' : 'INITIATE_HANDSHAKE'}]</div>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div><label style="display:block; font-family:var(--font-mono); font-size:0.65rem; color:var(--text-dim); margin-bottom:5px;">AGENT_ID</label><input type="text" id="auth-username" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:10px; font-family:var(--font-mono); outline:none;" autocomplete="off"></div>
                    <div><label style="display:block; font-family:var(--font-mono); font-size:0.65rem; color:var(--text-dim); margin-bottom:5px;">ACCESS_KEY</label><input type="password" id="auth-password" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:10px; font-family:var(--font-mono); outline:none;"></div>
                    <div id="auth-error" style="color:var(--hazard-red); font-size:0.7rem; font-family:var(--font-mono); min-height:1rem;"></div>
                    <button id="auth-submit-btn" class="btn-clinical-toggle" style="width:100%; padding:12px; font-weight:bold; margin-top:10px;">${mode === 'login' ? '[AUTHENTICATE]' : '[REGISTER_AGENT]'}</button>
                    <div style="text-align:center; margin-top:15px;"><a href="/?mode=${mode === 'login' ? 'register' : 'login'}" style="color:var(--text-dim); font-size:0.65rem; text-decoration:none; font-family:var(--font-mono);">[${mode === 'login' ? 'REQUEST_NEW_ID' : 'EXISTING_AGENT_LOGIN'}]</a></div>
                </div>
            </div>`;
        document.getElementById('auth-submit-btn').onclick = async () => {
            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value;
            const errorEl = document.getElementById('auth-error');
            if (!username || !password) { errorEl.textContent = "[ERROR]: FIELDS_INCOMPLETE"; return; }
            const btn = document.getElementById('auth-submit-btn'); btn.disabled = true; btn.textContent = "[PROCESSING...]"; errorEl.textContent = "";
            try {
                const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
                const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Yomi-Request': 'true' }, body: JSON.stringify({ username, password }) });
                const data = await res.json();
                if (res.ok && data.token) { localStorage.setItem('yomi_user', JSON.stringify(data)); currentUser = data; window.navigateTo('/w/Main_Page'); }
                else { errorEl.textContent = `[ERROR]: ${data.error || 'ACCESS_DENIED'}`; }
            } catch (e) { errorEl.textContent = "[ERROR]: CONNECTION_TERMINATED"; }
            finally { btn.disabled = false; btn.textContent = mode === 'login' ? '[AUTHENTICATE]' : '[REGISTER_AGENT]'; }
        };
    }

    async function updateSidebarActivity() {
        try {
            const res = await fetch(`${API_ENDPOINT}/activity`);
            const data = await res.json();
            const list = document.getElementById('activity-list');
            if (!list) return;
            list.innerHTML = data.map(act => `
                <div class="activity-item">
                    <div style="font-size:0.6rem; color:var(--text-dim); font-family:var(--font-mono);">[${act.type}] ${act.actor}</div>
                    <div style="font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        <a href="/w/${encodeURIComponent(window.titleToSlug(act.target))}" style="color:var(--accent-cyan); text-decoration:none;">▶ ${escapeHTML(act.target.split('/').pop())}</a>
                    </div>
                    <div style="font-size:0.6rem; color:#444; text-align:right;">${act.timestamp}</div>
                </div>
            `).join('');
        } catch (e) { }
    }

    async function loadAdminDashboard() {
        const articleBody = document.querySelector('.article-body');
        articleBody.innerHTML = '<div class="loading">[INITIALIZING_ADMIN_OVERRIDE...]</div>';
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/stats`);
            const data = await res.json();
            articleBody.innerHTML = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-family:var(--font-mono);">
                    <div style="border:1px solid #222; padding:20px; background:#050505;"><h4 style="color:var(--accent-orange); margin-top:0;">[DATABASE_METRICS]</h4><div style="font-size:1.2rem;">NODES: ${data.articleCount}</div><div style="font-size:1.2rem;">AGENTS: ${data.userCount}</div></div>
                    <div style="border:1px solid #222; padding:20px; background:#050505;"><h4 style="color:var(--accent-orange); margin-top:0;">[SYSTEM_ACTION]</h4><button onclick="window.establishNewSector()" class="btn-clinical-toggle" style="width:100%; margin-bottom:10px;">[CREATE_SUB_SECTOR]</button></div>
                </div>`;
        } catch (e) { articleBody.innerHTML = "ADMIN_ACCESS_FAILED"; }
    }

    async function init() {
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        if (path === '/admin') { await loadAdminDashboard(); updateAuthUI(); updateSidebarActivity(); return; }
        let titleOrId = "Main_Page";
        if (path.startsWith('/w/')) { titleOrId = window.slugToTitle(path.substring(3)); }
        currentRenderedTitle = titleOrId;
        if (mode === 'login' || mode === 'register') await renderAuthForm(mode);
        else if (mode === 'edit') await loadEditor(titleOrId);
        else if (mode === 'history') await loadRevisionHistory(titleOrId);
        else await renderArticle(titleOrId);
        updateAuthUI(); updateSidebarActivity();
    }

    let currentRenderedTitle = "";
    init();
    setInterval(updateSidebarActivity, 60000);
});
