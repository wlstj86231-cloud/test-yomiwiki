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

    // --- [TITLE NORMALIZATION HELPERS: Phase 5] ---
    window.titleToSlug = (title) => {
        if (!title) return "";
        return title.trim().replace(/ /g, '_');
    };

    window.slugToTitle = (slug) => {
        if (!slug) return "";
        try {
            return decodeURIComponent(slug).replace(/_/g, ' ').trim();
        } catch (e) {
            return slug.replace(/_/g, ' ').trim();
        }
    };

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
                
                // 1. Handle Hash Links (Smooth Scroll)
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

                // 2. Handle SPA Routing for Internal Wiki Links
                const url = new URL(link.href);
                if (!url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
                    e.preventDefault();
                    // Prevent redundant navigation to current path
                    if (window.location.pathname === url.pathname && window.location.search === url.search) return;
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
                <div class="comment-item" style="margin-left:${depth * 25}px; background:rgba(255,255,255,${isReply ? '0' : '0.005'}); border-left:2px solid ${isReply ? '#222' : 'var(--accent-orange)'}; padding:12px 18px; position:relative; margin-bottom:2px; border-bottom:1px solid rgba(255,255,255,0.02);">
                    <div class="comment-meta" style="font-family:var(--font-mono); font-size:0.80rem; color:var(--text-dim); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                        <span>
                            <span style="color:var(--accent-orange); font-weight:bold; margin-right:10px;">${indexStr}</span>
                            AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span>
                            ${c.author_tier ? `<span style="margin-left:8px; padding:1px 4px; background:rgba(255,153,0,0.05); border:1px solid rgba(255,153,0,0.2); color:var(--accent-orange); font-size:0.70rem; border-radius:2px;">LV.${c.author_tier.level} ${c.author_tier.title}</span>` : ''}
                        </span>
                        <span style="opacity:0.6;">[${c.timestamp}]</span>
                    </div>
                    <div class="comment-body" style="font-size:0.92rem; line-height:1.5; color:var(--text-main); margin-bottom:8px;">
                        ${escapeHTML(c.content).replace(/\n/g, '<br>')}
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        ${currentUser?.role === 'admin' ? `<button onclick="window.terminateAccess('${escapeHTML(c.author)}')" class="btn-clinical-toggle" style="font-size:0.65rem; padding:1px 5px; color:var(--hazard-red); border-color:var(--hazard-red); opacity:0.6;">[TERMINATE]</button>` : ''}
                        <button onclick="window.prepareReply(${c.id}, '${escapeHTML(c.author)}')" class="btn-clinical-toggle" style="font-size:0.65rem; padding:1px 5px; opacity:0.6;">[REPLY]</button>
                    </div>
                </div>
                ${subComments.map((sub, i) => buildCommentItem(sub, `${indexStr}.${i + 1}`, depth + 1)).join('')}
            `;
        }

        let html = `
        <div id="integrated-discussion" class="integrated-discussion" style="margin-top:10px;">
            <div class="discussion-header" style="background:#151515; padding:8px 15px; border:1px solid #222; border-left:4px solid var(--accent-orange); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-family:var(--font-mono); color:var(--accent-orange); font-weight:bold; font-size:0.90rem; letter-spacing:1px;">
                    [NODE_DISCUSSION_STREAM: ${escapeHTML(title)}]
                </span>
                <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim);">
                    LOGGED_ENTRIES: ${commentCount}
                </span>
            </div>
            <div class="comment-list" style="display:flex; flex-direction:column; gap:2px;">
                ${rootComments.map((c, i) => buildCommentItem(c, `#${i + 1}`)).join('') || `
                    <div style="text-align:center; padding:40px; border:1px dashed #151515; color:var(--text-dim); font-family:var(--font-mono); font-size:0.90rem;">
                        [SIGNAL_QUIET]: No archival discussions detected at this coordinate.
                    </div>
                `}
            </div>
            <div id="comment-form-container" class="comment-form" style="margin-top:20px; background:#050505; border:1px solid #111; padding:15px;">
                <div id="reply-indicator" style="display:none; font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-cyan); margin-bottom:10px; background:rgba(91,192,222,0.03); padding:6px; border-left:2px solid var(--accent-cyan);">
                    REPLYING_TO_AGENT: <span id="reply-target-agent" style="font-weight:bold;"></span> 
                    <span onclick="window.cancelReply()" style="float:right; cursor:pointer; color:var(--hazard-red); text-decoration:underline;">[ABORT]</span>
                </div>
                <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:6px; text-transform:uppercase;">[INITIATE_TRANSMISSION]</div>
                <textarea id="new-comment-content" data-parent-id="" placeholder="Enter transmission data..." style="width:100%; height:60px; background:#000; border:1px solid #222; color:#0f0; padding:12px; font-family:var(--font-mono); font-size:0.95rem; outline:none; transition:border-color 0.3s;" onfocus="this.style.borderColor='var(--accent-orange)'" onblur="this.style.borderColor='#222'"></textarea>
                <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                    <button id="transmit-btn" onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle" style="padding:8px 16px; font-size:0.80rem;">[TRANSMIT]</button>
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
        
        const urlParams = new URLSearchParams(window.location.search);
        const revId = urlParams.get('rev');

        try {
            const url = revId 
                ? `${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}?rev=${revId}`
                : `${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`;
            
            const res = await securedFetch(url);
            const data = await res.json();
            const originalContent = data.current_content || "";
            
            // Draft Logic (Only for live edits, skip if restoring)
            let content = originalContent;
            const draftKey = `yomi_draft_${title.replace(/[_\s]+/g, '_')}`;
            
            if (!revId) {
                const savedDraft = localStorage.getItem(draftKey);
                if (savedDraft && savedDraft !== originalContent) {
                    if (confirm("[SYSTEM_NOTICE]: A saved draft was found for this node. Load it?")) {
                        content = savedDraft;
                    }
                }
            }

            articleBody.innerHTML = `
                ${revId ? `<div style="background:rgba(91,192,222,0.1); border:1px solid var(--accent-cyan); padding:10px; margin-bottom:15px; font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-cyan);">[MODE]: RESTORING_HISTORICAL_SNAPSHOT (REV_ID: ${revId})</div>` : ''}
                <div class="editor-toolbar" style="margin-bottom:10px; display:flex; gap:5px; align-items:center;">
                    <button onclick="window.insertEditorTag('image')" class="btn-clinical-toggle" style="font-size:0.75rem;">[+IMG_TAG]</button>
                    <button onclick="document.getElementById('image-upload-input').click()" class="btn-clinical-toggle" style="font-size:0.75rem; color:var(--accent-cyan); border-color:var(--accent-cyan);">[+UPLOAD_IMG]</button>
                    <button onclick="window.insertEditorTag('footnote')" class="btn-clinical-toggle" style="font-size:0.75rem;">[+FOOTNOTE]</button>
                    <input type="file" id="image-upload-input" style="display:none" accept="image/*" onchange="window.uploadEditorImage(event)">
                    <span id="upload-status" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-orange); margin-left:10px;"></span>
                </div>
                <textarea id="editor-textarea" style="width:100%; height:500px; background:#000; color:#0f0; font-family:var(--font-mono); padding:15px; border:1px solid #333;">${escapeHTML(content)}</textarea>
                <div style="margin-top:15px;">
                    <input type="text" id="edit-summary" placeholder="ENTER_EDIT_SUMMARY (e.g. Fixed typo, Reverted to Rev ${revId || 'X'})" style="width:100%; background:#050505; border:1px solid #222; color:#aaa; padding:10px; font-family:var(--font-mono); font-size:0.85rem; margin-bottom:10px;" value="${revId ? `REVERTED_TO_SNAPSHOT_${revId}` : ''}">
                </div>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button onclick="window.submitEdit('${escapeHTML(title)}')" class="btn-clinical-toggle" style="flex:1; padding:15px;">[TRANSMIT_TO_ARCHIVE]</button>
                    <button onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(title))}')" class="btn-clinical-toggle" style="padding:15px;">[ABORT]</button>
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
        const summaryEl = document.getElementById('edit-summary');
        const summary = summaryEl ? summaryEl.value : "";
        const normalizedTitle = title.replace(/[_\s]+/g, '_');
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(normalizedTitle)}`, {
                method: 'POST', body: JSON.stringify({ content, summary })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.removeItem(`yomi_draft_${normalizedTitle}`);
                window.navigateTo(`/w/${encodeURIComponent(normalizedTitle)}`);
            } else {
                alert(`[TRANSMISSION_ERROR]: ${data.msg || data.error}`);
            }
        } catch (e) {
            alert("[CRITICAL_FAILURE]: Handshake lost during transmission.");
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
        mainTitle.textContent = `REVISION_HISTORY: ${title}`;
        
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/history`);
            const logs = await res.json();
            
            articleBody.innerHTML = `
                <div class="history-container" style="margin-top:20px;">
                    <div style="background:rgba(255,153,0,0.02); border:1px solid #222; padding:15px; margin-bottom:30px; font-size:0.95rem; color:var(--text-dim); font-family:var(--font-mono);">
                        [SYSTEM_AUDIT]: Total of ${logs.length} historical snapshots found for this archival node.
                    </div>
                    <div class="history-list" style="display:flex; flex-direction:column; gap:15px;">
                        ${logs.map(log => `
                            <div class="history-item" style="background:#111; border:1px solid var(--border-color); padding:20px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #444;">
                                <div style="flex:1;">
                                    <div style="font-family:var(--font-mono); font-size:0.90rem; color:var(--accent-orange); font-weight:bold; margin-bottom:5px;">
                                        REV_ID: ${log.id} | TIMESTAMP: ${log.timestamp}
                                    </div>
                                    <div style="font-size:0.95rem; color:var(--text-main);">
                                        AGENT: <span style="color:var(--accent-cyan); font-weight:bold;">${escapeHTML(log.author)}</span>
                                    </div>
                                    <div style="font-size:0.90rem; margin-top:8px; color:var(--text-main); font-style:italic; background:rgba(255,255,255,0.02); padding:10px; border-left:2px solid var(--accent-orange);">
                                        [LOG_SUMMARY]: ${escapeHTML(log.edit_summary || "NO_SUMMARY_PROVIDED")}
                                    </div>
                                </div>
                                <div style="margin-left:20px;">
                                    <a href="/w/${encodeURIComponent(title.replace(/ /g, '_'))}?rev=${log.id}" class="btn-clinical-toggle" style="text-decoration:none; display:inline-block; padding:10px 20px;">[DECRYPT_SNAPSHOT]</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:40px;">
                        <button onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(title))}')" class="btn-clinical-toggle" style="padding:15px 30px;">[BACK_TO_LIVE_NODE]</button>
                    </div>
                </div>
            `;
        } catch (e) { articleBody.innerHTML = "CRITICAL_HISTORY_FAILURE"; }
    }

    window.toggleTOC = () => {
        const list = document.getElementById('toc-list');
        const toggle = document.querySelector('.toc-toggle');
        if (list.style.display === 'none') {
            list.style.display = 'block';
            toggle.textContent = '[hide]';
        } else {
            list.style.display = 'none';
            toggle.textContent = '[show]';
        }
    };

    // --- [Cache System: Item 24] ---
    const articleCache = new Map();

    async function renderArticle(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        
        const urlParams = new URLSearchParams(window.location.search);
        const revId = urlParams.get('rev');
        const normalizedTitle = title.replace(/[_\s]+/g, '_');

        let data = null;

        // 1. Try SSR Hydration (Only on first load)
        const ssrDataEl = document.getElementById('ssr-data');
        if (ssrDataEl && !revId) {
            try {
                const ssrData = JSON.parse(ssrDataEl.textContent);
                if (normalizedTitle.toLowerCase() === ssrData.title.replace(/[_\s]+/g, '_').toLowerCase()) {
                    data = ssrData;
                    ssrDataEl.remove(); // Use once and remove
                }
            } catch (e) { console.error("HYDRATION_FAILED", e); }
        }

        // 2. Try Memory Cache
        if (!data && !revId && articleCache.has(normalizedTitle.toLowerCase())) {
            data = articleCache.get(normalizedTitle.toLowerCase());
        }

        try {
            if (!data) {
                const url = revId 
                    ? `${API_ENDPOINT}/article/${encodeURIComponent(normalizedTitle)}?rev=${revId}`
                    : `${API_ENDPOINT}/article/${encodeURIComponent(normalizedTitle)}`;
                const res = await securedFetch(url);
                data = await res.json();
                
                // Cache successful responses (non-revision only)
                if (!revId && !data.error) {
                    articleCache.set(normalizedTitle.toLowerCase(), data);
                }
            }
            
            if (data.error === "RECORD_NOT_FOUND") {
                // ... (previous 404 logic)
                return;
            }

            mainTitle.textContent = revId ? `REV_${revId}: ${data.title}` : data.title;
            metaText.innerHTML = ""; 

            const isBoard = data.title.startsWith('Sector:') && !data.title.includes('/');
            
            // CRITICAL: Always use wikiParse on RAW content to ensure TOC/Footnotes are generated correctly
            // SSR content is just a fallback for SEO/initial paint
            let contentHtml = wikiParse(data.current_content);

            if (revId) {
                contentHtml = `
                <div class="revision-warning" style="background:rgba(255,153,0,0.05); border:1px solid var(--accent-orange); padding:20px; margin-bottom:30px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-family:var(--font-mono); font-size:0.95rem; color:var(--accent-orange);">
                        [WARNING]: DECRYPTING HISTORICAL SNAPSHOT (REV_ID: ${revId}). 
                        <br><span style="font-size:0.8rem; color:var(--text-dim);">THIS IS NOT THE LIVE TRANSMISSION.</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.navigateTo('?mode=edit&rev=${revId}')" class="btn-clinical-toggle" style="background:var(--accent-orange); color:#000; font-weight:bold;">[RESTORE_THIS_VERSION]</button>
                        <a href="/w/${encodeURIComponent(title.replace(/ /g, '_'))}" class="btn-clinical-toggle" style="text-decoration:none;">[RETURN_TO_LIVE]</a>
                    </div>
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
                    
                    <!-- Item 5: Common Table Framework -->
                    <div class="wiki-table-container" style="overflow-x:auto;">
                        <table class="clinical-table" style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:0.85rem;">
                            <thead id="board-table-head">
                                <tr style="background:#111; border-bottom:2px solid var(--border-color);">
                                    <th style="padding:12px 15px; text-align:left; color:var(--accent-orange);">문서</th>
                                    <th style="padding:12px 15px; text-align:center; color:var(--accent-orange); width:100px;">기능</th>
                                    <th style="padding:12px 15px; text-align:left; color:var(--accent-orange); width:150px;">수정자</th>
                                    <th style="padding:12px 15px; text-align:right; color:var(--accent-orange); width:180px;">수정 시간</th>
                                </tr>
                            </thead>
                            <tbody id="board-table-body">
                                <!-- Rows will be added in Item 7 -->
                            </tbody>
                        </table>
                    </div>
                </div>`;
                
                // Item 2: Content (Protocol) is no longer displayed on board views
                contentHtml = "";
            }

            // 2. FOOTER (Metadata, Categories, Backlinks)
            let footer = `<div class="article-footer" style="margin-top:30px; border-top:1px solid var(--border-color); padding-top:15px; font-size:0.95rem;">`;
            
            if (data.is_locked) {
                contentHtml = `<div class="lock-warning" style="background:rgba(255,153,0,0.1); border:1px solid var(--accent-orange); padding:15px; margin-bottom:25px; color:var(--accent-orange); font-family:var(--font-mono); font-size:1.00rem;">
                    [LOCKED_NODE]: THIS ARCHIVAL RECORD IS UNDER ADMINISTRATIVE LOCKDOWN. MODIFICATIONS RESTRICTED TO OVERSEERS.
                </div>` + contentHtml;
            }

            footer += `
                <div style="color:var(--text-dim); margin-bottom:12px; font-family:var(--font-mono);">
                    REV: ${data.updated_at} | AUTH: ${data.author} 
                    ${data.author_tier ? `<span style="color:var(--accent-orange); margin-left:5px;">[LV.${data.author_tier.level} ${data.author_tier.title}]</span>` : ''} 
                    [SECURE_NODE] | 
                    ${data.is_locked && currentUser?.role !== 'admin' ? '<span style="opacity:0.5;">[EDIT_LOCKED]</span>' : `<a href="?mode=edit" style="color:var(--accent-orange);">[EDIT]</a>`} | 
                    <a href="?mode=history" style="color:var(--accent-orange);">[HISTORY]</a>
                </div>`;
            if (data.categories) footer += `<div style="margin-bottom:8px;"><strong>[CATEGORIES]:</strong> ${data.categories.split(',').map(c => `<a href="/w/Category:${encodeURIComponent(c.trim())}" style="color:var(--accent-orange); margin-right:8px;">[${escapeHTML(c.trim())}]</a>`).join(' ')}</div>`;
            if (data.backlinks?.length > 0) footer += `<div><strong>[LINKED_NODES]:</strong> ${data.backlinks.map(b => `<a href="/w/${encodeURIComponent(b)}" style="color:var(--accent-cyan); margin-right:8px;">[[${escapeHTML(b)}]]</a>`).join(' ')}</div>`;
            footer += '</div>';

            // 3. COMMENTS (Exclude commenting on top-level Sector boards to preserve context)
            let commentsHtml = "";
            if (!isBoard || revId) {
                // Modified renderCommentsHTML call with reduced margin
                commentsHtml = renderCommentsHTML(data.title, data.comments || []).replace('margin-top:100px;', 'margin-top:10px; border-top:none;');
            }
            
            // Assemble: Content (contains TOC) -> Board (if applicable) -> Comments (if not Board) -> Footer
            let finalOutput = contentHtml;
            if (isBoard && !revId) finalOutput += boardHtml;
            finalOutput += footer + commentsHtml;

            articleBody.innerHTML = finalOutput;

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

            const logsRes = await securedFetch(`${API_ENDPOINT}/admin/audit-logs`);
            const logsData = await logsRes.json();
            
            if (statsData.error) throw new Error(statsData.error);

            const getLogColor = (type) => {
                switch(type) {
                    case 'EDIT': return 'var(--accent-orange)';
                    case 'COMM': return 'var(--accent-cyan)';
                    case 'BAN': return 'var(--hazard-red)';
                    case 'SEC': return '#888';
                    default: return '#fff';
                }
            };

            articleBody.innerHTML = `
                <div class="admin-dashboard" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:30px;">
                    <div class="stat-card" style="background:#111; border:1px solid var(--accent-orange); padding:25px; text-align:center; box-shadow:var(--shadow-glow);">
                        <div style="font-size:0.85rem; color:var(--text-dim); margin-bottom:10px;">TOTAL_ARTICLES</div>
                        <div style="font-size:2rem; color:var(--accent-orange); font-family:var(--font-mono); font-weight:900;">${statsData.stats.articleCount}</div>
                    </div>
                    <div class="stat-card" style="background:#111; border:1px solid var(--accent-cyan); padding:25px; text-align:center;">
                        <div style="font-size:0.85rem; color:var(--text-dim); margin-bottom:10px;">VERIFIED_AGENTS</div>
                        <div style="font-size:2rem; color:var(--accent-cyan); font-family:var(--font-mono); font-weight:900;">${statsData.stats.userCount}</div>
                    </div>
                    <div class="stat-card" style="background:#111; border:1px solid var(--hazard-red); padding:25px; text-align:center;">
                        <div style="font-size:0.85rem; color:var(--text-dim); margin-bottom:10px;">BANNED_SIGNALS</div>
                        <div style="font-size:2rem; color:var(--hazard-red); font-family:var(--font-mono); font-weight:900;">${statsData.stats.banCount}</div>
                    </div>
                    <div class="stat-card" style="background:#111; border:1px solid #444; padding:25px; text-align:center;">
                        <div style="font-size:0.85rem; color:var(--text-dim); margin-bottom:10px;">TOTAL_REVISIONS</div>
                        <div style="font-size:2rem; color:#fff; font-family:var(--font-mono); font-weight:900;">${statsData.stats.revCount}</div>
                    </div>
                </div>

                <div id="audit-logs" style="margin-top:50px; border:1px solid #333; background:#0a0a0a; padding:30px;">
                    <h3 style="color:#eee; font-family:var(--font-mono); margin-top:0;">[SYSTEM_AUDIT_LOG]</h3>
                    <div class="log-timeline" style="margin-top:20px; display:flex; flex-direction:column; gap:8px;">
                        ${logsData.map(log => `
                            <div class="log-entry" style="font-family:var(--font-mono); font-size:0.90rem; display:flex; gap:15px; padding:8px; border-bottom:1px solid #111;">
                                <span style="color:var(--text-dim); width:140px; flex-shrink:0;">[${log.timestamp}]</span>
                                <span style="color:${getLogColor(log.type)}; font-weight:bold; width:50px; flex-shrink:0;">${log.type}</span>
                                <span style="color:var(--text-main); flex:1;">
                                    <strong>${escapeHTML(log.actor)}</strong> ➔ ${escapeHTML(log.target)} 
                                    <span style="color:var(--text-dim); font-style:italic;">(${escapeHTML(log.detail.substring(0, 50))}${log.detail.length > 50 ? '...' : ''})</span>
                                </span>
                            </div>
                        `).join('') || '<div style="opacity:0.3; padding:20px;">NO_LOGS_AVAILABLE</div>'}
                    </div>
                </div>
                
                <div id="blacklist-management" style="margin-top:50px; border:1px solid var(--hazard-red); background:#050000; padding:30px;">
                    <h3 style="color:var(--hazard-red); font-family:var(--font-mono); margin-top:0;">[ACTIVE_BLACKLIST_PROTOCOLS]</h3>
                    <div class="ban-list" style="margin-top:20px; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.95rem; font-family:var(--font-mono);">
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
                                        <td style="padding:10px; font-size:0.85rem;">${b.timestamp}</td>
                                        <td style="padding:10px;">
                                            <button onclick="window.revokeBan(${b.id})" class="btn-clinical-toggle" style="font-size:0.75rem; padding:4px 8px; border-color:var(--accent-cyan); color:var(--accent-cyan);">[REVOKE_SIGNAL]</button>
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
                    <div style="font-size:0.80rem; color:var(--text-dim); margin-top:10px; font-family:var(--font-mono);">
                        [CAUTION]: PURGE_NODE IS IRREVERSIBLE. ALL REVISIONS AND COMMENTS WILL BE ERASED.
                    </div>
                </div>

                <div style="margin-top:50px; border:1px solid #222; background:#050505; padding:30px;">
                    <h3 style="color:var(--accent-orange); font-family:var(--font-mono); margin-top:0;">[SYSTEM_CONTROL_PANEL]</h3>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:20px;">
                        <button onclick="document.getElementById('audit-logs').scrollIntoView({behavior:'smooth'})" class="btn-clinical-toggle">[ACCESS_LOGS]</button>
                        <button onclick="document.getElementById('blacklist-management').scrollIntoView({behavior:'smooth'})" class="btn-clinical-toggle">[MANAGE_BLACKLIST]</button>
                        <button onclick="document.getElementById('node-management').scrollIntoView({behavior:'smooth'})" class="btn-clinical-toggle">[NODE_OVERRIDE]</button>
                    </div>
                </div>
                
                <div style="margin-top:30px; font-family:var(--font-mono); font-size:0.80rem; color:#333; text-align:right;">
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
                            <div class="search-item" onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(title))}'); document.getElementById('search-input').value=''; document.getElementById('search-dropdown').style.display='none';">
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
                window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(searchInput.value.trim()))}`);
                searchInput.value = '';
                searchDropdown.style.display = 'none';
            }
        });
    }

    async function loadHistory(titleOrId) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        
        mainTitle.textContent = `ARCHIVAL_LOGS: ${titleOrId}`;
        articleBody.innerHTML = '<div class="loading">[AWAITING_CHRONOLOGICAL_DATA...]</div>';

        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(titleOrId)}/history`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            articleBody.innerHTML = `
                <div class="history-container">
                    <div style="background:rgba(255,153,0,0.05); border:1px solid var(--accent-orange); padding:15px; margin-bottom:25px; font-family:var(--font-mono); font-size:0.90rem; color:var(--accent-orange);">
                        [REVISION_HISTORY_PROTOCOL]: Displaying all recorded states for this node.
                    </div>
                    <div class="revision-list" style="display:flex; flex-direction:column; gap:10px;">
                        ${data.map((rev, index) => `
                            <div class="revision-item" style="background:#0a0a0a; border:1px solid #222; padding:15px; border-left:4px solid ${index === 0 ? 'var(--accent-orange)' : '#444'};">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                                    <span style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-cyan);">REV_ID: ${rev.id}</span>
                                    <span style="font-size:0.80rem; color:var(--text-dim); font-family:var(--font-mono);">[${rev.timestamp}]</span>
                                </div>
                                <div style="font-size:0.90rem; margin-bottom:10px; color:var(--text-main);">
                                    <span style="color:var(--text-dim);">AGENT:</span> ${escapeHTML(rev.author)} | 
                                    <span style="color:var(--text-dim);">LOG:</span> "${escapeHTML(rev.edit_summary || 'No summary provided')}"
                                </div>
                                <div style="display:flex; justify-content:flex-end; gap:10px;">
                                    <a href="/w/${encodeURIComponent(titleOrId)}?rev=${rev.id}" class="btn-clinical-toggle" style="font-size:0.75rem; padding:4px 10px;">[INSPECT_SNAPSHOT]</a>
                                </div>
                            </div>
                        `).join('') || '<div style="text-align:center; padding:50px; opacity:0.5;">[NULL_DATA]: No revisions found.</div>'}
                    </div>
                    <div style="margin-top:30px;">
                        <button onclick="window.navigateTo('/w/${encodeURIComponent(titleOrId)}')" class="btn-clinical-toggle">[BACK_TO_LIVE_NODE]</button>
                    </div>
                </div>
            `;
        } catch (e) {
            articleBody.innerHTML = `<div style="color:var(--hazard-red); border:1px solid var(--hazard-red); padding:30px;">[SIGNAL_ERROR]: Failed to retrieve history logs. ${e.message}</div>`;
        }
    }

    async function renderSearchResults(query) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = `SEARCH_RESULTS: "${query}"`;
        articleBody.innerHTML = '<div class="loading">[SCANNING_DATABASE_COORDINATES...]</div>';

        try {
            const res = await fetch(`${API_ENDPOINT}/api/search/full?q=${encodeURIComponent(query)}`, { headers: { 'X-Yomi-Request': 'true' } });
            const data = await res.json();

            articleBody.innerHTML = `
                <div class="search-info" style="background:rgba(0,255,255,0.02); border:1px solid #222; padding:20px; margin-bottom:30px; font-size:0.9rem; color:var(--text-dim);">
                    [SYSTEM]: Found <strong>${data.length}</strong> archival nodes matching your transmission query.
                </div>
                <div class="node-list" style="display:flex; flex-direction:column; gap:15px;">
                    ${data.map(item => `
                        <div class="node-item" style="background:#0a0a0a; border:1px solid var(--border-color); padding:15px; border-left:3px solid var(--accent-cyan);">
                            <a href="/w/${encodeURIComponent(window.titleToSlug(item.title))}" style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:bold; text-decoration:none; display:block; margin-bottom:5px;">▶ ${escapeHTML(item.title)}</a>
                            <div style="font-size:0.80rem; color:var(--text-muted); font-family:var(--font-mono);">
                                AGENT: ${escapeHTML(item.author)} | LAST_UPDATE: ${item.updated_at}
                            </div>
                        </div>
                    `).join('') || '<div style="text-align:center; padding:50px; opacity:0.5;">[NULL_RESULTS]: No matching data found in titles or content.</div>'}
                </div>
            `;
        } catch (e) {
            articleBody.innerHTML = `<div style="color:var(--hazard-red); border:1px solid var(--hazard-red); padding:30px;">[SCAN_FAILURE]: Failed to query the central database.</div>`;
        }
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.onclick = () => {
            const query = searchInput.value.trim();
            if (query) window.navigateTo(`/?mode=search&q=${encodeURIComponent(query)}`);
        };
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
                            <div style="font-size:0.80rem; color:var(--text-muted); font-family:var(--font-mono);">
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

        let titleOrId = 'Main_Page';
        if (path.startsWith('/w/')) {
            // Correctly handle slashes and numeric IDs
            const slug = path.substring(3);
            titleOrId = window.slugToTitle(slug);
        }
        
        const mode = urlParams.get('mode');
        const q = urlParams.get('q');
        
        if (mode === 'search' && q) {
            await renderSearchResults(q);
            return;
        }
        
        if (typeof titleOrId === 'string' && titleOrId.startsWith('Category:')) {
            await renderCategoryPage(titleOrId.substring(9));
            return;
        }

        if (mode === 'edit') await loadEditor(titleOrId);
        else if (mode === 'history') await loadHistory(titleOrId);
        else await renderArticle(titleOrId);
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

    async function updateSidebarActivity() {
        const sidebarRecent = document.getElementById('sidebar-recent-list');
        if (!sidebarRecent) {
            // Create the recent list container if it doesn't exist
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const recentBox = document.createElement('section');
                recentBox.className = 'sidebar-box';
                recentBox.style.marginTop = '20px';
                recentBox.innerHTML = `
                    <h3 class="sidebar-title">[RECENT_DECRYPTIONS]</h3>
                    <ul id="sidebar-recent-list" style="display:flex; flex-direction:column; gap:10px; font-family:var(--font-mono); font-size:0.8rem;">
                        <li style="opacity:0.5;">[AWAITING_SIGNAL...]</li>
                    </ul>
                `;
                sidebar.appendChild(recentBox);
            }
        }

        const listEl = document.getElementById('sidebar-recent-list');
        if (!listEl) return;

        try {
            const res = await fetch(`${API_ENDPOINT}/articles/recent`, { headers: { 'X-Yomi-Request': 'true' } });
            const data = await res.json();
            
            listEl.innerHTML = data.map(item => {
                // Item 58: Format timestamp to a shorter version
                const timeStr = item.updated_at ? item.updated_at.split(' ')[1] || item.updated_at : "??:??";
                return `
                    <li style="border-left:2px solid #333; padding-left:10px; display:flex; justify-content:space-between; align-items:center;">
                        <a href="/w/${encodeURIComponent(window.titleToSlug(item.title))}" style="color:var(--accent-cyan); text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;">▶ ${escapeHTML(item.title.split('/').pop())}</a>
                        <span style="font-size:0.65rem; color:var(--text-dim); opacity:0.5; font-family:var(--font-mono);">[${timeStr}]</span>
                    </li>
                `;
            }).join('') || '<li style="opacity:0.5;">[NO_RECENT_ACTIVITY]</li>';
        } catch (e) {
            console.error("[SYSTEM]: Failed to update sidebar activity.", e);
        }
    }

    init();
    updateSidebarActivity(); // Initial load
    setInterval(updateSidebarActivity, 60000); // Update every minute
});
