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
                const hrefAttr = link.getAttribute('href');
                if (hrefAttr?.startsWith('#')) {
                    e.preventDefault();
                    const targetId = hrefAttr.substring(1).toLowerCase();
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                        history.pushState(null, "", hrefAttr);
                    }
                    return;
                }
                const url = new URL(link.href);
                if (!url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
                    e.preventDefault();
                    window.navigateTo(link.href);
                }
            }
        };
    }

    function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

    // --- [Unified Comment Rendering: Phase 3-4 & 3-2 Precision] ---
    function renderCommentsHTML(title, comments) {
        const commentCount = comments.length;
        
        // Sort by timestamp to ensure consistent indexing
        const sorted = [...comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const rootComments = sorted.filter(c => !c.parent_id);
        const children = sorted.filter(c => c.parent_id);

        function buildCommentItem(c, indexStr, depth = 0) {
            const isReply = depth > 0;
            const subComments = children.filter(child => child.parent_id === c.id);
            
            return `
                <div class="comment-item" style="margin-left:${depth * 25}px; background:rgba(255,255,255,${isReply ? '0' : '0.01'}); border-left:2px solid ${isReply ? '#333' : 'var(--accent-orange)'}; padding:15px 20px; position:relative; margin-bottom:5px;">
                    <div class="comment-meta" style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>
                            <span style="color:var(--accent-orange); font-weight:bold; margin-right:10px;">${indexStr}</span>
                            AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span>
                            ${c.author_tier ? `<span style="margin-left:8px; padding:1px 4px; background:rgba(255,153,0,0.1); border:1px solid rgba(255,153,0,0.3); color:var(--accent-orange); font-size:0.6rem; border-radius:2px;">LV.${c.author_tier.level} ${c.author_tier.title}</span>` : ''}
                        </span>
                        <span>[${c.timestamp}]</span>
                    </div>
                    <div class="comment-body" style="font-size:0.9rem; line-height:1.6; color:var(--text-main); margin-bottom:10px;">
                        ${escapeHTML(c.content).replace(/\n/g, '<br>')}
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        ${currentUser?.role === 'admin' ? `<button onclick="window.terminateAccess('${escapeHTML(c.author)}')" class="btn-clinical-toggle" style="font-size:0.55rem; padding:2px 6px; color:var(--hazard-red); border-color:var(--hazard-red); opacity:0.8;">[TERMINATE_ACCESS]</button>` : ''}
                        <button onclick="window.prepareReply(${c.id}, '${escapeHTML(c.author)}')" class="btn-clinical-toggle" style="font-size:0.55rem; padding:2px 6px; opacity:0.7;">[REPLY]</button>
                    </div>
                </div>
                ${subComments.map((sub, i) => buildCommentItem(sub, `${indexStr}.${i + 1}`, depth + 1)).join('')}
            `;
        }

        let html = `
        <div id="integrated-discussion" class="integrated-discussion" style="margin-top:100px; border-top:1px solid #222; padding-top:40px;">
            <div class="discussion-header" style="background:#111; padding:10px 15px; border:1px solid #222; border-left:4px solid var(--accent-orange); margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-family:var(--font-mono); color:var(--accent-orange); font-weight:bold; font-size:0.85rem; letter-spacing:1px;">
                    [NODE_DISCUSSION_STREAM: ${escapeHTML(title)}]
                </span>
                <span style="font-family:var(--font-mono); font-size:0.65rem; color:var(--text-dim);">
                    LOGGED_ENTRIES: ${commentCount}
                </span>
            </div>
            <div class="comment-list" style="display:flex; flex-direction:column; gap:5px;">
                ${rootComments.map((c, i) => buildCommentItem(c, `#${i + 1}`)).join('') || `
                    <div style="text-align:center; padding:50px; border:1px dashed #151515; color:var(--text-dim); font-family:var(--font-mono); font-size:0.8rem;">
                        [SIGNAL_QUIET]: No archival discussions detected at this coordinate.
                    </div>
                `}
            </div>
            <div id="comment-form-container" class="comment-form" style="margin-top:30px; background:#000; border:1px solid #222; padding:20px;">
                <div id="reply-indicator" style="display:none; font-family:var(--font-mono); font-size:0.65rem; color:var(--accent-cyan); margin-bottom:12px; background:rgba(91,192,222,0.05); padding:8px; border-left:2px solid var(--accent-cyan);">
                    REPLYING_TO_AGENT: <span id="reply-target-agent" style="font-weight:bold;"></span> 
                    <span onclick="window.cancelReply()" style="float:right; cursor:pointer; color:var(--hazard-red); text-decoration:underline;">[ABORT_REPLY]</span>
                </div>
                <div style="font-family:var(--font-mono); font-size:0.65rem; color:var(--text-dim); margin-bottom:8px; text-transform:uppercase;">[INITIATE_TRANSMISSION]</div>
                <textarea id="new-comment-content" data-parent-id="" placeholder="Enter transmission data..." style="width:100%; height:80px; background:#050505; border:1px solid #222; color:#0f0; padding:15px; font-family:var(--font-mono); font-size:0.85rem; outline:none; transition:border-color 0.3s;" onfocus="this.style.borderColor='var(--accent-orange)'" onblur="this.style.borderColor='#222'"></textarea>
                <div style="margin-top:12px; display:flex; justify-content:flex-end;">
                    <button id="transmit-btn" onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle" style="padding:10px 20px; font-size:0.7rem;">[TRANSMIT_TO_NODE]</button>
                </div>
            </div>
        </div>`;
        return html;
    }

    window.terminateAccess = async (targetUser) => {
        if (!confirm(`[SYSTEM_WARNING]: Are you sure you want to terminate access for AGENT_${targetUser}? This action is irreversible without OVERSEER intervention.`)) return;
        
        const reason = prompt("Enter ARCHIVAL_PROTOCOL_VIOLATION details:", "Repeated violation of clinical neutrality.");
        if (reason === null) return;

        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/ban`, {
                method: 'POST',
                body: JSON.stringify({ target_user: targetUser, reason })
            });
            const data = await res.json();
            if (data.success) {
                alert(`[TERMINATION_COMPLETE]: AGENT_${targetUser} has been purged from the active archival grid.`);
                init();
            } else {
                alert(`[ERROR]: ${data.error || "TERMINATION_FAILED"}`);
            }
        } catch (e) {
            alert("[CRITICAL_FAILURE]: Admin signal lost.");
        }
    };

    window.prepareReply = (parentId, author) => {
        const textarea = document.getElementById('new-comment-content');
        const indicator = document.getElementById('reply-indicator');
        const targetText = document.getElementById('reply-target-agent');
        
        textarea.dataset.parentId = parentId;
        targetText.textContent = `AGENT_${author}`;
        indicator.style.display = 'block';
        
        document.getElementById('comment-form-container').scrollIntoView({ behavior: 'smooth' });
        textarea.focus();
    };

    window.cancelReply = () => {
        const textarea = document.getElementById('new-comment-content');
        const indicator = document.getElementById('reply-indicator');
        textarea.dataset.parentId = "";
        indicator.style.display = 'none';
    };

    window.postComment = async (title) => {
        const contentEl = document.getElementById('new-comment-content');
        const btn = document.getElementById('transmit-btn');
        const content = contentEl.value;
        const parentId = contentEl.dataset.parentId;
        if (!content) return;

        const originalBtnText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "[TRANSMITTING...]";

        const normalizedTitle = title.replace(/[_\s]+/g, '_');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(normalizedTitle)}/comments`, {
                method: 'POST', body: JSON.stringify({ content, parent_id: parentId ? parseInt(parentId) : null })
            });
            
            if (res.ok) { 
                contentEl.value = '';
                window.cancelReply();
                // Partial Update: Only fetch and re-render comments
                const articleRes = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(normalizedTitle)}`);
                const articleData = await articleRes.json();
                
                const discussionEl = document.getElementById('integrated-discussion');
                if (discussionEl && articleData.comments) {
                    discussionEl.outerHTML = renderCommentsHTML(articleData.title, articleData.comments);
                }
                updateSidebarActivity(); 
            }
        } catch (e) {
            console.error("TRANSMISSION_FAILED", e);
            alert("[CRITICAL_ERROR]: Transmission failed. Signal lost.");
        } finally {
            btn.disabled = false;
            btn.textContent = originalBtnText;
        }
    };

    // --- [EDITOR HELPERS] ---
    window.uploadEditorImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const statusEl = document.getElementById('upload-status');
        const textarea = document.getElementById('editor-textarea');
        
        statusEl.textContent = "[UPLOADING_SIGNAL...]";
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await securedFetch(`${API_ENDPOINT}/assets/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'X-Yomi-Request': 'true' } // Note: securedFetch handles other headers
            });
            const data = await res.json();
            
            if (data.success) {
                statusEl.textContent = "[SIGNAL_CAPTURED]";
                const tag = `[[File:${data.url}|caption=${data.name}]]`;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + tag + textarea.value.substring(end);
                setTimeout(() => { statusEl.textContent = ""; }, 3000);
            } else {
                statusEl.textContent = "[UPLOAD_FAILED]";
            }
        } catch (err) {
            statusEl.textContent = "[CONNECTION_LOST]";
        }
    };

    window.insertEditorTag = (tagType) => {
        const textarea = document.getElementById('editor-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        let insertion = "";
        
        if (tagType === 'image') insertion = "[[File:URL_HERE|caption=ARCHIVAL_IMAGE_DESCRIPTION]]";
        else if (tagType === 'footnote') insertion = "[* ARCHIVAL_FOOTNOTE_DATA]";
        
        textarea.value = text.substring(0, start) + insertion + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + 7, start + 15); 
    };

    async function loadEditor(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = `EDITING: ${title}`;
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`);
            const data = await res.json();
            const originalContent = data.current_content || "";
            
            // Draft Logic
            const draftKey = `yomi_draft_${title.replace(/[_\s]+/g, '_')}`;
            const savedDraft = localStorage.getItem(draftKey);
            let content = originalContent;

            if (savedDraft && savedDraft !== originalContent) {
                if (confirm("[SYSTEM_NOTICE]: A saved draft was found for this node. Load it?")) {
                    content = savedDraft;
                }
            }

            articleBody.innerHTML = `
                <div class="editor-toolbar" style="margin-bottom:10px; display:flex; gap:5px; align-items:center;">
                    <button onclick="window.insertEditorTag('image')" class="btn-clinical-toggle" style="font-size:0.6rem;">[+IMG_TAG]</button>
                    <button onclick="document.getElementById('image-upload-input').click()" class="btn-clinical-toggle" style="font-size:0.6rem; color:var(--accent-cyan); border-color:var(--accent-cyan);">[+UPLOAD_IMG]</button>
                    <button onclick="window.insertEditorTag('footnote')" class="btn-clinical-toggle" style="font-size:0.6rem;">[+FOOTNOTE]</button>
                    <input type="file" id="image-upload-input" style="display:none" accept="image/*" onchange="window.uploadEditorImage(event)">
                    <span id="upload-status" style="font-family:var(--font-mono); font-size:0.6rem; color:var(--accent-orange); margin-left:10px;"></span>
                </div>
                <textarea id="editor-textarea" style="width:100%; height:500px; background:#000; color:#0f0; font-family:var(--font-mono); padding:15px; border:1px solid #333;">${escapeHTML(content)}</textarea>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button onclick="window.submitEdit('${escapeHTML(title)}')" class="btn-clinical-toggle" style="flex:1; padding:15px;">[TRANSMIT_TO_ARCHIVE]</button>
                    <button onclick="window.navigateTo('/w/${encodeURIComponent(title.replace(/ /g, '_'))}')" class="btn-clinical-toggle" style="padding:15px;">[ABORT]</button>
                </div>
            `;

            const textarea = document.getElementById('editor-textarea');
            textarea.addEventListener('input', () => {
                localStorage.setItem(draftKey, textarea.value);
            });

        } catch (e) { articleBody.innerHTML = "EDITOR_LOAD_FAILED"; }
    }

    window.submitEdit = async (title) => {
        const content = document.getElementById('editor-textarea').value;
        const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`, {
            method: 'POST', body: JSON.stringify({ content })
        });
        if (res.ok) {
            localStorage.removeItem(`yomi_draft_${title.replace(/[_\s]+/g, '_')}`);
            window.navigateTo(`/w/${encodeURIComponent(title.replace(/ /g, '_'))}`);
        }
    };

    // --- [Core Wiki Engine] ---
    window.toggleTOC = () => {
        const list = document.getElementById('toc-list');
        const btn = document.querySelector('.toc-toggle');
        if (list.style.display === 'none') {
            list.style.display = 'block';
            btn.textContent = '[hide]';
        } else {
            list.style.display = 'none';
            btn.textContent = '[show]';
        }
    };

    window.establishNewNode = (sectorTitle) => {
        const postName = prompt("Enter the name of the new archival transmission:");
        if (!postName) return;
        const fullTitle = `${sectorTitle}/${postName.replace(/[_\s]+/g, '_')}`;
        window.navigateTo(`/w/${encodeURIComponent(fullTitle)}?mode=edit`);
    };

    async function loadHistory(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = `HISTORY: ${title}`;
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/history`);
            const logs = await res.json();
            
            articleBody.innerHTML = `
                <div class="history-container">
                    <p style="color:var(--text-dim); font-size:0.8rem; margin-bottom:20px;">[ARCHIVAL_LOG_FOUND: ${logs.length} ENTRIES]</p>
                    <div class="node-list" style="display:flex; flex-direction:column; gap:10px;">
                        ${logs.map(log => `
                            <div class="node-item" style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); padding:15px; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-orange);">REV_${log.id}</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                                        AGENT: ${escapeHTML(log.author)} | ${log.timestamp}
                                    </div>
                                    <div style="font-size:0.85rem; margin-top:8px; color:var(--text-main); font-style:italic;">
                                        ${escapeHTML(log.edit_summary || "NO_SUMMARY_PROVIDED")}
                                    </div>
                                </div>
                                <div>
                                    <a href="/w/${encodeURIComponent(title.replace(/ /g, '_'))}?rev=${log.id}" class="btn-clinical-toggle" style="text-decoration:none; display:inline-block;">[VIEW]</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:30px;">
                        <button onclick="window.navigateTo('/w/${encodeURIComponent(title.replace(/ /g, '_'))}')" class="btn-clinical-toggle">[BACK_TO_LIVE_NODE]</button>
                    </div>
                </div>
            `;
        } catch (e) { articleBody.innerHTML = "HISTORY_LOAD_FAILED"; }
    }

    async function renderArticle(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        
        const urlParams = new URLSearchParams(window.location.search);
        const revId = urlParams.get('rev');

        // --- [EDGE HYDRATION: Phase 5-4 FIX] ---
        let data = null;
        const ssrDataEl = document.getElementById('ssr-data');
        if (ssrDataEl && !revId) {
            try {
                const ssrData = JSON.parse(ssrDataEl.textContent);
                const normalizedRequested = title.replace(/[_\s]+/g, '_').toLowerCase();
                const normalizedSSR = ssrData.title.replace(/[_\s]+/g, '_').toLowerCase();
                
                if (normalizedRequested === normalizedSSR) {
                    data = ssrData;
                    ssrDataEl.remove(); // Use once and discard
                }
            } catch (e) { console.error("HYDRATION_FAILED", e); }
        }

        try {
            if (!data) {
                const url = revId 
                    ? `${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}?rev=${revId}`
                    : `${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`;
                
                const res = await securedFetch(url);
                data = await res.json();
            }
            
            if (data.error === "RECORD_NOT_FOUND") {
                mainTitle.textContent = title;
                articleBody.innerHTML = `
                    <div class="not-found-container" style="padding:40px; border:1px solid var(--accent-orange); background:rgba(255,153,0,0.02); margin-top:20px;">
                        <h3 style="color:var(--accent-orange); font-family:var(--font-mono); margin-top:0;">[SIGNAL_LOST_404]</h3>
                        <p style="color:var(--text-main); font-size:0.95rem;">The archival record for <strong>"${escapeHTML(title)}"</strong> is currently vacant in our database.</p>
                        <p style="color:var(--text-dim); font-size:0.85rem; margin-bottom:25px;">[SYSTEM_QUERY]: Would you like to establish a new archival node at this coordinate?</p>
                        <div style="display:flex; gap:10px;">
                            <button onclick="window.navigateTo('?mode=edit')" class="btn-clinical-toggle" style="padding:12px 25px;">[ESTABLISH_NEW_NODE]</button>
                            <button onclick="window.history.back()" class="btn-clinical-toggle" style="padding:12px 25px; opacity:0.6;">[ABORT_MISSION]</button>
                        </div>
                    </div>
                `;
                return;
            }

            mainTitle.textContent = revId ? `REV_${revId}: ${data.title}` : data.title;
            
            // NAMU_STYLE: Hide meta from top for cleaner look
            metaText.innerHTML = ""; 
            
            // Identify if this is a Board (Sector root) or a Post
            const isBoard = data.title.startsWith('Sector:') && !data.title.includes('/');
            let contentHtml = wikiParse(data.current_content);

            if (revId) {
                contentHtml = `<div class="revision-warning" style="background:rgba(255,153,0,0.1); border:1px solid var(--accent-orange); padding:15px; margin-bottom:25px; color:var(--accent-orange); font-family:var(--font-mono); font-size:0.85rem;">
                    [WARNING]: YOU ARE VIEWING A HISTORICAL SNAPSHOT (ID: ${revId}). 
                    <a href="/w/${encodeURIComponent(title.replace(/ /g, '_'))}" style="color:#fff; text-decoration:underline; margin-left:10px;">[RETURN_TO_LIVE_NODE]</a>
                </div>` + contentHtml;
            }

            // 1. BOARD VIEW (Post List)
            let boardHtml = "";
            if (isBoard && !revId) {
                boardHtml = `<div class="sector-board" style="margin-bottom:40px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:15px;">
                        <h3 style="font-family:var(--font-mono); color:var(--accent-orange); margin:0;">[SUB_ARCHIVE_NODES]</h3>
                        <button onclick="window.establishNewNode('${escapeHTML(data.title)}')" class="btn-clinical-toggle">[ESTABLISH_NEW_NODE]</button>
                    </div>
                    <div class="node-list" style="display:flex; flex-direction:column; gap:10px;">
                        ${data.sub_articles && data.sub_articles.length > 0 ? data.sub_articles.map(sub => `
                            <div class="node-item" style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
                                <a href="/w/${encodeURIComponent(sub.title.replace(/ /g, '_'))}" style="font-weight:bold; color:var(--accent-cyan); font-family:var(--font-mono); text-decoration:none;">▶ ${escapeHTML(sub.title.split('/').pop())}</a>
                                <div style="font-size:0.7rem; color:var(--text-dim); font-family:var(--font-mono);">AGENT: ${sub.author} | ${sub.updated_at}</div>
                            </div>
                        `).join('') : '<div style="opacity:0.3; font-style:italic; padding:20px;">No transmissions detected. [AWAITING_DATA]</div>'}
                    </div>
                </div>`;
                
                // Hide board content behind a toggle
                contentHtml = `<details style="margin-bottom:30px; border:1px solid #222; padding:10px;"><summary style="cursor:pointer; font-size:0.8rem; font-family:var(--font-mono); color:var(--text-dim);">[VIEW_SECTOR_PROTOCOL]</summary><div style="padding-top:15px;">${contentHtml}</div></details>`;
            }

            // 2. FOOTER (Metadata, Categories, Backlinks)
            let footer = `<div class="article-footer" style="margin-top:60px; border-top:1px solid var(--border-color); padding-top:20px; font-size:0.85rem;">`;
            
            if (data.is_locked) {
                contentHtml = `<div class="lock-warning" style="background:rgba(255,153,0,0.1); border:1px solid var(--accent-orange); padding:15px; margin-bottom:25px; color:var(--accent-orange); font-family:var(--font-mono); font-size:0.85rem;">
                    [LOCKED_NODE]: THIS ARCHIVAL RECORD IS UNDER ADMINISTRATIVE LOCKDOWN. MODIFICATIONS RESTRICTED TO OVERSEERS.
                </div>` + contentHtml;
            }

            footer += `
                <div style="color:var(--text-dim); margin-bottom:15px; font-family:var(--font-mono);">
                    REV: ${data.updated_at} | AUTH: ${data.author} 
                    ${data.author_tier ? `<span style="color:var(--accent-orange); margin-left:5px;">[LV.${data.author_tier.level} ${data.author_tier.title}]</span>` : ''} 
                    [SECURE_NODE] | 
                    ${data.is_locked && currentUser?.role !== 'admin' ? '<span style="opacity:0.5;">[EDIT_LOCKED]</span>' : `<a href="?mode=edit" style="color:var(--accent-orange);">[EDIT]</a>`} | 
                    <a href="?mode=history" style="color:var(--accent-orange);">[HISTORY]</a>
                </div>`;
            if (data.categories) footer += `<div style="margin-bottom:10px;"><strong>[CATEGORIES]:</strong> ${data.categories.split(',').map(c => `<a href="/w/Category:${encodeURIComponent(c.trim())}" style="color:var(--accent-orange); margin-right:8px;">[${escapeHTML(c.trim())}]</a>`).join(' ')}</div>`;
            if (data.backlinks?.length > 0) footer += `<div><strong>[LINKED_NODES]:</strong> ${data.backlinks.map(b => `<a href="/w/${encodeURIComponent(b)}" style="color:var(--accent-cyan); margin-right:8px;">[[${escapeHTML(b)}]]</a>`).join(' ')}</div>`;
            footer += '</div>';

            const commentsHtml = renderCommentsHTML(data.title, data.comments || []);
            
            // Assemble: Content -> Footer -> Comments
            if (isBoard && !revId) {
                articleBody.innerHTML = boardHtml + contentHtml + footer + commentsHtml;
            } else {
                articleBody.innerHTML = contentHtml + footer + commentsHtml;
            }

            // --- [SCROLL ANCHORING: Phase 2 FIX] ---
            if (window.location.hash) {
                const targetId = window.location.hash.substring(1).toLowerCase();
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    setTimeout(() => {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            } else {
                window.scrollTo(0, 0);
            }

        } catch (e) { articleBody.innerHTML = "CRITICAL_SYSTEM_ERROR"; console.error(e); }
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

    async function loadAdminDashboard() {
        if (currentUser?.role !== 'admin') {
            window.navigateTo('/');
            return;
        }

        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = "OVERSEER_COMMAND_CENTER";
        
        try {
            const statsRes = await securedFetch(`${API_ENDPOINT}/admin/stats`);
            const statsData = await statsRes.json();
            
            const bansRes = await securedFetch(`${API_ENDPOINT}/admin/bans`);
            const bansData = await bansRes.json();
            
            if (statsData.error) throw new Error(statsData.error);

            articleBody.innerHTML = `
                <div class="admin-dashboard" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:30px;">
                    <div class="stat-card" style="background:#111; border:1px solid var(--accent-orange); padding:25px; text-align:center; box-shadow:var(--shadow-glow);">
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">TOTAL_ARTICLES</div>
                        <div style="font-size:2rem; color:var(--accent-orange); font-family:var(--font-mono); font-weight:900;">${statsData.stats.articleCount}</div>
                    </div>
                    <div class="stat-card" style="background:#111; border:1px solid var(--accent-cyan); padding:25px; text-align:center;">
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">VERIFIED_AGENTS</div>
                        <div style="font-size:2rem; color:var(--accent-cyan); font-family:var(--font-mono); font-weight:900;">${statsData.stats.userCount}</div>
                    </div>
                    <div class="stat-card" style="background:#111; border:1px solid var(--hazard-red); padding:25px; text-align:center;">
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">BANNED_SIGNALS</div>
                        <div style="font-size:2rem; color:var(--hazard-red); font-family:var(--font-mono); font-weight:900;">${statsData.stats.banCount}</div>
                    </div>
                    <div class="stat-card" style="background:#111; border:1px solid #444; padding:25px; text-align:center;">
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">TOTAL_REVISIONS</div>
                        <div style="font-size:2rem; color:#fff; font-family:var(--font-mono); font-weight:900;">${statsData.stats.revCount}</div>
                    </div>
                </div>
                
                <div id="blacklist-management" style="margin-top:50px; border:1px solid var(--hazard-red); background:#050000; padding:30px;">
                    <h3 style="color:var(--hazard-red); font-family:var(--font-mono); margin-top:0;">[ACTIVE_BLACKLIST_PROTOCOLS]</h3>
                    <div class="ban-list" style="margin-top:20px; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; font-family:var(--font-mono);">
                            <thead>
                                <tr style="border-bottom:1px solid #333; text-align:left; color:var(--text-dim);">
                                    <th style="padding:10px;">TYPE</th>
                                    <th style="padding:10px;">TARGET_VALUE</th>
                                    <th style="padding:10px;">REASON</th>
                                    <th style="padding:10px;">TIMESTAMP</th>
                                    <th style="padding:10px;">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bansData.map(b => `
                                    <tr style="border-bottom:1px solid #151515;">
                                        <td style="padding:10px; color:${b.target_type === 'ip' ? 'var(--accent-cyan)' : 'var(--accent-orange)'};">[${b.target_type.toUpperCase()}]</td>
                                        <td style="padding:10px;">${escapeHTML(b.target_value)}</td>
                                        <td style="padding:10px; color:var(--text-muted); font-style:italic;">${escapeHTML(b.reason)}</td>
                                        <td style="padding:10px; font-size:0.7rem;">${b.timestamp}</td>
                                        <td style="padding:10px;">
                                            <button onclick="window.revokeBan(${b.id})" class="btn-clinical-toggle" style="font-size:0.6rem; padding:4px 8px; border-color:var(--accent-cyan); color:var(--accent-cyan);">[REVOKE_SIGNAL]</button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5" style="padding:20px; text-align:center; opacity:0.3;">NO_ACTIVE_RESTRICTIONS_DETECTED</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div id="node-management" style="margin-top:50px; border:1px solid var(--accent-cyan); background:#000505; padding:30px;">
                    <h3 style="color:var(--accent-cyan); font-family:var(--font-mono); margin-top:0;">[NODE_ADMIN_OVERRIDE]</h3>
                    <div style="margin-top:20px; display:flex; gap:10px;">
                        <input type="text" id="admin-node-title" placeholder="ENTER_TARGET_NODE_TITLE..." style="flex:1; background:#000; border:1px solid #333; color:#0f0; padding:10px; font-family:var(--font-mono);">
                        <button onclick="window.adminLockNode()" class="btn-clinical-toggle" style="border-color:var(--accent-orange); color:var(--accent-orange);">[TOGGLE_LOCK]</button>
                        <button onclick="window.adminPurgeNode()" class="btn-clinical-toggle" style="border-color:var(--hazard-red); color:var(--hazard-red);">[PURGE_NODE]</button>
                    </div>
                    <div style="font-size:0.65rem; color:var(--text-dim); margin-top:10px; font-family:var(--font-mono);">
                        [CAUTION]: PURGE_NODE IS IRREVERSIBLE. ALL REVISIONS AND COMMENTS WILL BE ERASED.
                    </div>
                </div>

                <div style="margin-top:50px; border:1px solid #222; background:#050505; padding:30px;">
                    <h3 style="color:var(--accent-orange); font-family:var(--font-mono); margin-top:0;">[SYSTEM_CONTROL_PANEL]</h3>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:20px;">
                        <button onclick="alert('Audit logs pending...')" class="btn-clinical-toggle">[ACCESS_LOGS]</button>
                        <button onclick="document.getElementById('blacklist-management').scrollIntoView({behavior:'smooth'})" class="btn-clinical-toggle">[MANAGE_BLACKLIST]</button>
                        <button onclick="document.getElementById('node-management').scrollIntoView({behavior:'smooth'})" class="btn-clinical-toggle">[NODE_OVERRIDE]</button>
                    </div>
                </div>
                
                <div style="margin-top:30px; font-family:var(--font-mono); font-size:0.65rem; color:#333; text-align:right;">
                    AUTH_SESSION: ${Math.random().toString(36).substring(2, 15).toUpperCase()} | GRID_STATUS: ${statsData.system_status}
                </div>
            `;
        } catch (e) {
            articleBody.innerHTML = `<div style="color:var(--hazard-red); border:1px solid var(--hazard-red); padding:30px;">[CRITICAL_AUTH_ERROR]: Handshake failed. Signal origin unverified.</div>`;
        }
    }

    window.revokeBan = async (banId) => {
        if (!confirm("[SYSTEM_CONFIRMATION]: Do you want to restore access for this signal?")) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/ban/${banId}`, { method: 'DELETE' });
            if (res.ok) {
                alert("[SIGNAL_RESTORED]: Access restriction has been lifted.");
                loadAdminDashboard();
            }
        } catch (e) { alert("[ERROR]: Failed to reach central command."); }
    };

    // --- [Search Autocomplete Logic: Phase 4-4] ---
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchDropdown.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`${API_ENDPOINT}/search/suggest?q=${encodeURIComponent(query)}`);
                    const suggestions = await res.json();
                    
                    if (suggestions.length > 0) {
                        searchDropdown.innerHTML = suggestions.map(title => `
                            <div class="search-item" onclick="window.navigateTo('/w/${encodeURIComponent(title.replace(/ /g, '_'))}'); document.getElementById('search-input').value=''; document.getElementById('search-dropdown').style.display='none';">
                                <span style="color:var(--accent-orange); margin-right:8px;">▶</span> ${escapeHTML(title)}
                            </div>
                        `).join('');
                        searchDropdown.style.display = 'block';
                    } else {
                        searchDropdown.style.display = 'none';
                    }
                } catch (err) { console.error("SEARCH_FETCH_FAILED", err); }
            }, 300);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });

        // Handle Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.navigateTo(`/w/${encodeURIComponent(searchInput.value.trim().replace(/ /g, '_'))}`);
                searchInput.value = '';
                searchDropdown.style.display = 'none';
            }
        });
    }

    async function renderCategoryPage(categoryName) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = `CATEGORY: ${categoryName}`;
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/category/${encodeURIComponent(categoryName)}`);
            const data = await res.json();
            
            articleBody.innerHTML = `
                <div class="category-info" style="background:rgba(255,153,0,0.02); border:1px solid #222; padding:20px; margin-bottom:30px; font-size:0.9rem; color:var(--text-dim);">
                    [SYSTEM_NOTICE]: Displaying all archival nodes classified under <strong>"${escapeHTML(categoryName)}"</strong>.
                </div>
                <div class="node-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:15px;">
                    ${data.members.map(member => `
                        <div class="node-item" style="background:#111; border:1px solid var(--border-color); padding:15px; border-left:3px solid var(--accent-cyan);">
                            <a href="/w/${encodeURIComponent(member.title.replace(/ /g, '_'))}" style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:bold; text-decoration:none; display:block; margin-bottom:5px;">▶ ${escapeHTML(member.title)}</a>
                            <div style="font-size:0.65rem; color:var(--text-muted); font-family:var(--font-mono);">
                                LAST_REVISION: ${member.updated_at} | AUTH: ${member.author}
                            </div>
                        </div>
                    `).join('') || '<div style="opacity:0.3; font-style:italic; padding:20px;">No members detected in this classification.</div>'}
                </div>
            `;
        } catch (e) {
            articleBody.innerHTML = "CRITICAL_SIGNAL_ERROR: Failed to load category index.";
        }
    }

    window.adminLockNode = async () => {
        const title = document.getElementById('admin-node-title').value.trim();
        if (!title) return alert("[ERROR]: No target title specified.");
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/article/lock`, {
                method: 'POST', body: JSON.stringify({ title })
            });
            if (res.ok) alert(`[SYSTEM]: Lockdown status toggled for node "${title}".`);
            else alert("[ERROR]: Node not found or unauthorized.");
        } catch (e) { alert("[CRITICAL]: Admin signal failure."); }
    };

    window.adminPurgeNode = async () => {
        const title = document.getElementById('admin-node-title').value.trim();
        if (!title) return;
        if (!confirm(`[ULTIMATE_WARNING]: PURGE node "${title}"? All associated transmissions will be permanently erased.`)) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/article/purge`, {
                method: 'DELETE', body: JSON.stringify({ title })
            });
            const data = await res.json();
            if (data.success) {
                alert(`[SYSTEM]: Node "${title}" has been purged from the grid.`);
                loadAdminDashboard();
            } else {
                alert(`[ERROR]: ${data.error}`);
            }
        } catch (e) { alert("[CRITICAL]: Purge sequence aborted due to connection error."); }
    };

    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        
        handleInternalLinks();
        
        if (path === '/admin') {
            await loadAdminDashboard();
            return;
        }

        let title = path.startsWith('/w/') ? decodeURIComponent(path.substring(3)).replace(/[_\s]+/g, ' ').trim() : 'Main_Page';
        const mode = urlParams.get('mode');
        
        if (title.startsWith('Category:')) {
            await renderCategoryPage(title.substring(9));
            return;
        }

        if (mode === 'edit') await loadEditor(title);
        else if (mode === 'history') await loadHistory(title);
        else await renderArticle(title);
        updateSidebarActivity();
    }

    window.scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('scroll', () => {
        const btnTop = document.getElementById('btn-top');
        if (btnTop) {
            if (window.scrollY > 300) {
                btnTop.style.display = 'block';
            } else {
                btnTop.style.display = 'none';
            }
        }
    });

    init();
    setInterval(updateSidebarActivity, 30000);
});
