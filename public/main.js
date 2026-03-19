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

    // --- [Unified Comment Rendering: Phase 3-4 Threaded] ---
    function renderCommentsHTML(title, comments) {
        const commentCount = comments.length;
        
        // Group comments by parent_id
        const rootComments = comments.filter(c => !c.parent_id);
        const children = comments.filter(c => c.parent_id);

        function buildCommentItem(c, depth = 0) {
            const isReply = depth > 0;
            const subComments = children.filter(child => child.parent_id === c.id);
            
            return `
                <div class="comment-item" style="margin-left:${depth * 30}px; background:rgba(255,255,255,${isReply ? '0.005' : '0.01'}); border-left:2px solid ${isReply ? 'var(--text-dim)' : 'var(--accent-orange)'}; padding:15px 20px; position:relative; margin-bottom:10px;">
                    ${isReply ? '<div style="position:absolute; left:-20px; top:15px; color:var(--text-dim); font-size:0.8rem;">└</div>' : ''}
                    <div class="comment-meta" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); margin-bottom:10px; display:flex; justify-content:space-between;">
                        <span>AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(c.author)}</span></span>
                        <span>[${c.timestamp}]</span>
                    </div>
                    <div class="comment-body" style="font-size:0.9rem; line-height:1.6; color:var(--text-main);">
                        ${escapeHTML(c.content).replace(/\n/g, '<br>')}
                    </div>
                    <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:flex-end;">
                        <button onclick="window.prepareReply(${c.id}, '${escapeHTML(c.author)}')" class="btn-clinical-toggle" style="font-size:0.6rem; padding:4px 8px;">[REPLY]</button>
                        <div style="font-size:0.55rem; color:#222; font-family:var(--font-mono);">TRANS_ID: ${c.id.toString(16).toUpperCase()}</div>
                    </div>
                </div>
                ${subComments.map(sub => buildCommentItem(sub, depth + 1)).join('')}
            `;
        }

        let html = `
        <div id="integrated-discussion" class="integrated-discussion" style="margin-top:80px; border-top:1px solid #333; padding-top:40px;">
            <div class="discussion-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <span style="font-family:var(--font-mono); color:var(--accent-orange); font-weight:bold; letter-spacing:1px;">
                    [NODE_DISC_CHANNEL: ${escapeHTML(title)}]
                </span>
                <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim);">
                    ACTIVE_TRANSMISSIONS: ${commentCount}
                </span>
            </div>
            <div class="comment-list" style="display:flex; flex-direction:column;">
                ${rootComments.map(c => buildCommentItem(c)).join('') || `
                    <div style="text-align:center; padding:40px; border:1px dashed #222; color:var(--text-dim); font-family:var(--font-mono); font-size:0.85rem;">
                        [SIGNAL_QUIET]: No archival discussions found for this coordinate.
                    </div>
                `}
            </div>
            <div id="comment-form-container" class="comment-form" style="margin-top:40px; background:#050505; border:1px solid #222; padding:20px;">
                <div id="reply-indicator" style="display:none; font-family:var(--font-mono); font-size:0.7rem; color:var(--accent-cyan); margin-bottom:10px; background:rgba(91,192,222,0.1); padding:8px; border:1px solid var(--accent-cyan);">
                    REPLYING_TO: <span id="reply-target-agent"></span> 
                    <span onclick="window.cancelReply()" style="float:right; cursor:pointer; color:var(--hazard-red);">[CANCEL]</span>
                </div>
                <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--accent-orange); margin-bottom:10px;">[INITIATE_NEW_TRANSMISSION]</div>
                <textarea id="new-comment-content" data-parent-id="" placeholder="Enter archival entry or inquiry..." style="width:100%; height:80px; background:#000; border:1px solid #333; color:#0f0; padding:15px; font-family:var(--font-mono); font-size:0.85rem; outline:none; transition:border-color 0.3s;" onfocus="this.style.borderColor='var(--accent-orange)'" onblur="this.style.borderColor='#333'"></textarea>
                <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                    <button id="transmit-btn" onclick="window.postComment('${escapeHTML(title)}')" class="btn-clinical-toggle" style="padding:10px 20px;">[TRANSMIT_DATA]</button>
                </div>
            </div>
        </div>`;
        return html;
    }

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
    window.insertEditorTag = (tagType) => {
        const textarea = document.getElementById('editor-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        let insertion = "";
        
        if (tagType === 'image') insertion = "[[File:URL_HERE|caption=Description]]";
        else if (tagType === 'footnote') insertion = "[* Footnote_Text_Here]";
        
        textarea.value = text.substring(0, start) + insertion + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + 7, start + 15); // Highlight URL_HERE or Footnote_Text
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
                <div class="editor-toolbar" style="margin-bottom:10px; display:flex; gap:5px;">
                    <button onclick="window.insertEditorTag('image')" class="btn-clinical-toggle" style="font-size:0.6rem;">[+IMAGE]</button>
                    <button onclick="window.insertEditorTag('footnote')" class="btn-clinical-toggle" style="font-size:0.6rem;">[+FOOTNOTE]</button>
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

        try {
            const url = revId 
                ? `${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}?rev=${revId}`
                : `${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`;
            
            const res = await securedFetch(url);
            const data = await res.json();
            
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
            let footer = `<div class="article-footer" style="margin-top:60px; border-top:1px solid var(--border-color); padding-top:20px; font-size:0.85rem;">
                <div style="color:var(--text-dim); margin-bottom:15px; font-family:var(--font-mono);">
                    REV: ${data.updated_at} | AUTH: ${data.author} [SECURE_NODE] | <a href="?mode=edit" style="color:var(--accent-orange);">[EDIT]</a> | <a href="?mode=history" style="color:var(--accent-orange);">[HISTORY]</a>
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

    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        let title = path.startsWith('/w/') ? decodeURIComponent(path.substring(3)).replace(/[_\s]+/g, ' ').trim() : 'Main_Page';
        const mode = urlParams.get('mode');
        
        handleInternalLinks();
        if (mode === 'edit') await loadEditor(title);
        else if (mode === 'history') await loadHistory(title);
        else await renderArticle(title);
        updateSidebarActivity();
    }

    init();
    setInterval(updateSidebarActivity, 30000);
});
