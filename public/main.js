document.addEventListener('DOMContentLoaded', () => {
    // --- [BOOT SEQUENCE] ---
    const bootTerminal = document.getElementById('boot-terminal');
    if (bootTerminal) {
        if (sessionStorage.getItem('yomi_booted')) {
            // Skip boot sequence if already seen in this session
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

    // --- [SEARCH FUNCTIONALITY] ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchDropdown = document.getElementById('search-dropdown');
    let searchTimeout;

    const performSearch = async (query) => {
        if (!query) {
            searchDropdown.classList.remove('active');
            return;
        }
        try {
            const res = await fetch(`${API_ENDPOINT}/search/suggest?q=${encodeURIComponent(query)}`);
            const results = await res.json();
            
            searchDropdown.innerHTML = '';
            if (results.length > 0) {
                results.forEach(title => {
                    const div = document.createElement('div');
                    div.className = 'search-item';
                    div.textContent = title;
                    div.onclick = () => {
                        window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(title))}`);
                        searchDropdown.classList.remove('active');
                        searchInput.value = '';
                    };
                    searchDropdown.appendChild(div);
                });
                searchDropdown.classList.add('active');
            } else {
                searchDropdown.innerHTML = '<div class="search-item" style="color:var(--hazard-red); opacity:0.7;">[NO_SIGNAL_FOUND]</div>';
                searchDropdown.classList.add('active');
            }
        } catch (e) {
            console.error("Search failed", e);
        }
    };

    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            searchTimeout = setTimeout(() => performSearch(query), 0); // 0ms for absolute instant reaction
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    // Try to go to exact match if exists, otherwise first suggestion
                    const firstItem = searchDropdown.querySelector('.search-item');
                    if (firstItem && firstItem.textContent !== '[NO_SIGNAL_FOUND]') {
                        firstItem.click();
                    } else {
                        window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(query))}`);
                        searchDropdown.classList.remove('active');
                        searchInput.value = '';
                    }
                }
            }
        });

        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                const firstItem = searchDropdown.querySelector('.search-item');
                if (firstItem && firstItem.textContent !== '[NO_SIGNAL_FOUND]') {
                    firstItem.click();
                } else {
                    window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(query))}`);
                    searchDropdown.classList.remove('active');
                    searchInput.value = '';
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.remove('active');
            }
        });
    }

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

    const updateAuthUI = () => {
        const authContainer = document.getElementById('auth-controls');
        if (!authContainer) return;

        if (currentUser) {
            const adminBtn = currentUser.role === 'admin' ? `<button onclick="window.navigateTo('/admin')" class="auth-btn" style="border-color:var(--accent-cyan); color:var(--accent-cyan); margin-right:5px;">[ADMIN]</button>` : "";
            authContainer.innerHTML = `
                ${adminBtn}
                <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-right:10px;">[AGENT: ${escapeHTML(currentUser.username)}]</span>
                <button onclick="window.logout()" class="auth-btn logout">[LOGOUT]</button>
            `;
        } else {
            authContainer.innerHTML = `
                <button onclick="window.navigateTo('/?mode=login')" class="auth-btn">[LOGIN]</button>
                <button onclick="window.navigateTo('/?mode=register')" class="auth-btn">[REGISTER]</button>
            `;
        }
    };

    window.logout = () => {
        localStorage.removeItem('yomi_user');
        currentUser = null;
        window.navigateTo('/w/Main_Page');
    };

    const securedFetch = async (url, options = {}) => {
        const headers = { 'X-Yomi-Request': 'true', ...options.headers };
        if (currentUser?.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
        
        // Only set JSON content type if body is present and NOT FormData
        if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        
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

    window.adminPurgeCurrentNode = async (title, stayOnPage = false) => {
        if (!confirm(`[ULTIMATE_WARNING]: PURGE node "${title}" from the archival grid? This action is irreversible.`)) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/article/purge`, {
                method: 'DELETE', body: JSON.stringify({ title })
            });
            if (res.ok) { 
                alert(`[SYSTEM]: Node "${title}" has been successfully expunged.`);
                if (stayOnPage) init();
                else window.navigateTo('/w/Main_Page');
            }
        } catch (e) { alert("[CRITICAL]: Purge sequence failed."); }
    };

    window.adminDeleteComment = async (title, commentId) => {
        if (!confirm("[SYSTEM_CONFIRMATION]: PURGE this comment from archival records?")) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}/comments/${commentId}`, {
                method: 'DELETE'
            });
            if (res.ok) { init(); }
        } catch (e) { alert("[CRITICAL]: Command sequence interrupted."); }
    };

    async function renderArticle(title) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');
        
        const urlParams = new URLSearchParams(window.location.search);
        const revId = urlParams.get('rev');
        const slug = window.titleToSlug(title);

        // --- [PREVENT LOADING FLICKER] ---
        // If content already exists (from SSR) and it's the first render, don't show loading
        const isInitialHydration = articleBody.children.length > 0 && !articleBody.querySelector('.loading-text');
        if (!isInitialHydration) {
            articleBody.innerHTML = '<div class="loading">[DECRYPTING...]</div>';
        }

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

            // Board Detection Logic (Sector, SubSector, or Hub)
            const isSubSector = data.title.startsWith('SubSector:');
            const isBoard = (data.title.startsWith('Sector:') || isSubSector) && !data.title.split(':').pop().includes('/');
            const isHub = data.is_hub === true;

            // Apply Theme based on type
            if (isSubSector || isHub) document.body.classList.add('theme-subsector');
            else document.body.classList.remove('theme-subsector');
            
            const displayTitle = (data.title || title).split('/').pop();
            mainTitle.textContent = displayTitle;
            const purgeBtn = (currentUser?.role === 'admin' && !isBoard && !isHub) ? `<button onclick="window.adminPurgeCurrentNode('${escapeHTML(data.title)}')" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-family:var(--font-mono); font-size:0.65rem; margin-left:10px;">[PURGE_NODE]</button>` : "";
            
            // Hide meta metadata for boards and hub
            if (isBoard || isHub) metaText.innerHTML = "";
            else metaText.innerHTML = `REV: ${data.updated_at || "STABLE"} | AUTH: ${data.author || "Archive_Admin"} ${purgeBtn}`;

            let contentHtml = typeof wikiParse === 'function' ? wikiParse(data.current_content) : data.current_content;

            // Assemble Output
            let boardHtml = "";
            if (isHub && !revId) {
                // Different UI for Hub: Cards instead of Table
                const subNodes = data.sub_articles || [];
                boardHtml = `
                    <div style="margin-top:20px; border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:20px;">
                        <h3 style="font-family:var(--font-mono); color:var(--accent-cyan); margin:0;">[ACTIVE_SUB_SECTOR_HUB]</h3>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${subNodes.map(sub => `
                            <div class="channel-card">
                                <div style="display:flex; align-items:center;">
                                    <span class="channel-badge">CHANNEL</span>
                                    <a href="/w/${encodeURIComponent(window.titleToSlug(sub.title))}" style="color:var(--accent-cyan); font-weight:900; font-size:1.1rem; text-decoration:none;">
                                        # ${escapeHTML(sub.title.split(':').pop())}
                                    </a>
                                </div>
                                <div style="text-align:right; font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim);">
                                    AGENT: ${escapeHTML(sub.author)} | ${window.timeAgo(sub.updated_at)}
                                </div>
                            </div>
                        `).join('') || '<div style="opacity:0.3; padding:40px; text-align:center;">[NO_ACTIVE_CHANNELS_DETECTED]</div>'}
                    </div>
                `;
                contentHtml = contentHtml; // Show hub description
            } else if (isBoard && !revId) {
                const subNodes = data.sub_articles || [];
                const sectorName = data.title.split(':').pop();
                
                const themeColor = isSubSector ? 'var(--accent-cyan)' : 'var(--accent-orange)';
                const adminNoticeBtn = (currentUser?.role === 'admin') ? `<button onclick="window.establishNewNode('${escapeHTML(data.title)}', true)" class="btn-clinical-toggle" style="border-color:var(--hazard-red); color:var(--hazard-red); margin-left:10px;">[POST_NOTICE]</button>` : "";
                const createBtn = `<button onclick="window.establishNewNode('${escapeHTML(data.title)}')" class="btn-clinical-toggle">${isSubSector ? '[+ NEW_POST]' : '[NEW_NODE]'}</button>`;

                boardHtml = `
                    <div style="margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:15px; display:flex; justify-content:flex-end; align-items:center;">
                        <div>
                            ${createBtn}
                            ${adminNoticeBtn}
                        </div>
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
                            ${subNodes.map(sub => {
                                const isNotice = sub.classification === 'NOTICE';
                                const noticeTag = isNotice ? `<span style="background:var(--hazard-red); color:#000; padding:1px 4px; font-size:0.6rem; margin-right:5px; font-weight:bold;">[NOTICE]</span>` : "";
                                const rowBg = isNotice ? "rgba(255, 60, 60, 0.05)" : "transparent";
                                const adminActions = currentUser?.role === 'admin' ? `<button onclick="window.adminPurgeCurrentNode('${escapeHTML(sub.title)}', true)" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-family:var(--font-mono); font-size:0.6rem; margin-left:5px;">[PURGE]</button>` : "";
                                const linkColor = isNotice ? 'var(--hazard-red)' : (isSubSector ? 'var(--accent-cyan)' : 'var(--accent-cyan)');
                                
                                return `
                                <tr style="border-bottom:1px solid #111; background:${rowBg};">
                                    <td style="padding:10px;">${noticeTag}<a href="/w/${sub.id || encodeURIComponent(window.titleToSlug(sub.title))}" style="color:${linkColor}; font-weight:bold; text-decoration:none;">▶ ${escapeHTML(sub.title.split('/').pop())}</a></td>
                                    <td style="padding:10px; text-align:center;">
                                        <a href="/w/${encodeURIComponent(window.titleToSlug(sub.title))}?mode=history" class="btn-clinical-toggle" style="font-size:0.6rem; padding:2px 5px; text-decoration:none;">[HISTORY]</a>
                                        ${adminActions}
                                    </td>
                                    <td style="padding:10px; color:var(--text-dim);">${escapeHTML(sub.author)}</td>
                                    <td style="padding:10px; text-align:right; color:var(--text-dim);">${window.timeAgo(sub.updated_at)}</td>
                                </tr>
                                `;
                            }).join('') || '<tr><td colspan="4" style="padding:20px; text-align:center; opacity:0.3;">[NO_ACTIVE_CHANNELS]</td></tr>'}
                        </tbody>
                    </table>
                `;
                contentHtml = ""; 
            }

            const commentsHtml = (isBoard && !revId) ? "" : renderCommentsHTML(data.title, data.comments || []);
            articleBody.innerHTML = contentHtml + boardHtml + commentsHtml;
            
            // --- [POST-RENDER CLEANUP] ---
            document.documentElement.classList.remove('is-board-loading');
            
            // --- [SCROLL HANDLING] ---
            if (window.location.hash) {
                const targetId = decodeURIComponent(window.location.hash.substring(1));
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.scrollTo(0, 0);
            }

        } catch (e) {
            articleBody.innerHTML = `<div style="color:var(--hazard-red);">[CRITICAL_SYSTEM_ERROR]: Handshake failed.</div>`;
            console.error(e);
        } finally {
            // Ensure content is visible even on error
            document.documentElement.classList.remove('is-board-loading');
            const antiFlicker = document.getElementById('anti-flicker');
            if (antiFlicker) antiFlicker.remove();
        }
    }

    async function renderAuthForm(type) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        const metaText = document.querySelector('.article-meta');

        mainTitle.textContent = type === 'login' ? '[AUTH: LOGIN]' : '[AUTH: REGISTER]';
        metaText.textContent = "CLEARANCE_REQ";
        
        articleBody.innerHTML = `
            <div style="max-width:400px; margin:40px auto; background:#050505; border:1px solid #222; padding:30px;">
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-family:var(--font-mono); color:var(--text-dim); font-size:0.8rem; margin-bottom:8px;">[IDENTIFIER]</label>
                    <input type="text" id="auth-username" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:10px; font-family:var(--font-mono); outline:none;">
                </div>
                <div style="margin-bottom:30px;">
                    <label style="display:block; font-family:var(--font-mono); color:var(--text-dim); font-size:0.8rem; margin-bottom:8px;">[PASSCODE]</label>
                    <input type="password" id="auth-password" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:10px; font-family:var(--font-mono); outline:none;">
                </div>
                <button onclick="window.performAuth('${type}')" class="btn-clinical-toggle" style="width:100%; padding:12px;">[INITIATE_HANDSHAKE]</button>
                <div id="auth-error" style="margin-top:20px; color:var(--hazard-red); font-family:var(--font-mono); font-size:0.8rem; text-align:center; display:none;"></div>
            </div>
        `;
    }

    window.performAuth = async (type) => {
        const username = document.getElementById('auth-username').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        const errorEl = document.getElementById('auth-error');

        if (!username || !password) {
            errorEl.textContent = "[ERROR]: FIELDS_INCOMPLETE";
            errorEl.style.display = 'block';
            return;
        }

        try {
            const res = await fetch(`${API_ENDPOINT}/auth/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('yomi_user', JSON.stringify({ username: data.username, token: data.token, role: data.role }));
                currentUser = JSON.parse(localStorage.getItem('yomi_user'));
                window.navigateTo('/w/Main_Page');
            } else {
                errorEl.textContent = `[ERROR]: ${data.error || 'AUTH_DENIED'}`;
                errorEl.style.display = 'block';
            }
        } catch (e) {
            errorEl.textContent = "[ERROR]: CONNECTION_INTERRUPTED";
            errorEl.style.display = 'block';
        }
    };

    window.establishNewNode = (sector, isNotice = false) => {
        const name = prompt(isNotice ? "Enter NOTICE designation (Title):" : "Enter new node designation:");
        if (name) {
            const mode = isNotice ? "edit&type=notice" : "edit";
            window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(sector + "/" + name))}?mode=${mode}`);
        }
    };

    window.establishNewSector = () => {
        const name = prompt("Enter new SUB-SECTOR designation (e.g. Occult_Arts):");
        if (name) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug("SubSector:" + name))}`);
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
                const typeTag = l.type === 'comment' ? '<span style="color:var(--accent-orange); font-weight:bold; margin-right:5px;">[COMM]</span>' : '<span style="color:var(--accent-cyan); font-weight:bold; margin-right:5px;">[EDIT]</span>';
                return `<div style="margin-bottom:8px; border-bottom:1px solid #111; padding-bottom:4px; font-size:0.7rem;">
                    <span style="color:#444;">${time}</span> 
                    ${typeTag}
                    <a href="/w/${encodeURIComponent(window.titleToSlug(l.title))}" style="color:#aaa; text-decoration:none;">${escapeHTML(l.title)}</a>
                </div>`;
            }).join('') || '<div style="opacity:0.3;">[OFFLINE]</div>';
        } catch (e) { logEl.textContent = "SYNC_OFFLINE"; }
    }

    async function loadAdminDashboard() {
        if (currentUser?.role !== 'admin') {
            window.navigateTo('/w/Main_Page');
            return;
        }

        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = "OVERSEER_COMMAND_CENTER";
        
        articleBody.innerHTML = '<div class="loading">[INITIALIZING_COMMAND_STREAM...]</div>';

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
                    case 'BAN': return 'var(--hazard-red)';
                    case 'SEC': return '#888';
                    default: return '#fff';
                }
            };

            articleBody.innerHTML = `
                <div class="admin-dashboard" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:30px;">
                    <div class="stat-card" style="background:#111; border:1px solid var(--accent-orange); padding:25px; text-align:center;">
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

                <div id="audit-logs" style="margin-top:50px; border:1px solid #333; background:#0a0a0a; padding:30px;">
                    <h3 style="color:#eee; font-family:var(--font-mono); margin-top:0;">[SYSTEM_AUDIT_LOG]</h3>
                    <div class="log-timeline" style="margin-top:20px; display:flex; flex-direction:column; gap:8px;">
                        ${logsData.map(log => `
                            <div class="log-entry" style="font-family:var(--font-mono); font-size:0.75rem; display:flex; gap:15px; padding:8px; border-bottom:1px solid #111;">
                                <span style="color:var(--text-dim); width:140px; flex-shrink:0;">[${log.timestamp}]</span>
                                <span style="color:${getLogColor(log.type)}; font-weight:bold; width:50px; flex-shrink:0;">${log.type}</span>
                                <span style="color:var(--text-main); flex:1;">
                                    <strong>${escapeHTML(log.actor)}</strong> ➔ ${escapeHTML(log.target)} 
                                    <span style="color:var(--text-dim); font-style:italic;">(${escapeHTML(log.detail?.substring(0, 50))}${log.detail?.length > 50 ? '...' : ''})</span>
                                </span>
                            </div>
                        `).join('') || '<div style="opacity:0.3; padding:20px;">NO_LOGS_AVAILABLE</div>'}
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
                </div>

                <div style="margin-top:50px; border:1px solid #222; background:#050505; padding:30px;">
                    <h3 style="color:var(--accent-orange); font-family:var(--font-mono); margin-top:0;">[SYSTEM_CONTROL_PANEL]</h3>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:20px;">
                        <button onclick="document.getElementById('audit-logs').scrollIntoView({behavior:'smooth'})" class="btn-clinical-toggle">[ACCESS_LOGS]</button>
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
        if (!confirm("[SYSTEM_CONFIRMATION]: Restore access for this signal?")) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/ban/${banId}`, { method: 'DELETE' });
            if (res.ok) { loadAdminDashboard(); }
        } catch (e) { alert("[ERROR]: Connection failure."); }
    };

    window.adminLockNode = async () => {
        const title = document.getElementById('admin-node-title').value.trim();
        if (!title) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/article/lock`, {
                method: 'POST', body: JSON.stringify({ title })
            });
            if (res.ok) alert(`[SYSTEM]: Lock status toggled for node "${title}".`);
        } catch (e) { alert("[CRITICAL]: Admin signal failure."); }
    };

    window.adminPurgeNode = async () => {
        const title = document.getElementById('admin-node-title').value.trim();
        if (!title) return;
        if (!confirm(`[ULTIMATE_WARNING]: PURGE node "${title}"?`)) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/article/purge`, {
                method: 'DELETE', body: JSON.stringify({ title })
            });
            if (res.ok) { alert(`[SYSTEM]: Node "${title}" purged.`); loadAdminDashboard(); }
        } catch (e) { alert("[CRITICAL]: Purge sequence aborted."); }
    };

    async function uploadImage(file) {
        if (file.size > 3 * 1024 * 1024) {
            alert("[ACCESS_DENIED]: File size exceeds 3.0MB clinical limit.");
            return null;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await securedFetch(`${API_ENDPOINT}/assets/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) return data.url;
            else {
                const errorMsg = data.message ? `${data.error}: ${data.message}` : data.error;
                throw new Error(errorMsg);
            }
        } catch (e) {
            alert(`[SIGNAL_ERROR]: Upload failed. ${e.message}`);
            return null;
        }
    }

    async function handleEditorDrop(e, targetTextarea) {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const url = await uploadImage(file);
                    if (url) {
                        const insertion = `\n[[File:${url}|width=300px|caption=IMAGE_DATA]]\n`;
                        const start = targetTextarea.selectionStart;
                        const end = targetTextarea.selectionEnd;
                        targetTextarea.value = targetTextarea.value.substring(0, start) + insertion + targetTextarea.value.substring(end);
                    }
                }
            }
        }
    }

    async function handleInfoboxDrop(e, imgEl, urlInput) {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && files[0].type.startsWith('image/')) {
            const url = await uploadImage(files[0]);
            if (url) {
                imgEl.src = url;
                imgEl.style.display = 'block';
                urlInput.value = url;
                // Hide placeholder
                imgEl.parentElement.querySelector('.builder-placeholder').style.display = 'none';
            }
        }
    }

    async function loadEditor(titleOrId) {
        const mainTitle = document.getElementById('article-title');
        const articleBody = document.querySelector('.article-body');
        mainTitle.textContent = `EDITING: ${titleOrId}`;

        let currentContent = "";
        let existingInfobox = { title: "", image: "", caption: "", type: "", data: [] };

        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(titleOrId))}`);
            const data = await res.json();
            if (!data.error) {
                currentContent = data.current_content;
                // Basic Infobox Extraction
                const infoMatch = currentContent.match(/\{\{infobox([\s\S]*?)\}\}/);
                if (infoMatch) {
                    const body = infoMatch[1];
                    currentContent = currentContent.replace(infoMatch[0], "").trim();
                    const rows = body.split('|').map(r => r.trim()).filter(r => r);
                    rows.forEach(row => {
                        if (row.includes('=')) {
                            const [k, ...vParts] = row.split('=');
                            const key = k.trim().toLowerCase();
                            const val = vParts.join('=').trim();
                            if (key === 'title') existingInfobox.title = val;
                            else if (key === 'image') existingInfobox.image = val;
                            else if (key === 'caption') existingInfobox.caption = val;
                            else if (key === 'type') existingInfobox.type = val;
                            else existingInfobox.data.push({ key: k.trim(), val });
                        }
                    });
                }
            }
        } catch (e) {}

        articleBody.innerHTML = `
            <div style="display:flex; gap:30px; align-items:flex-start;">
                <div style="flex:1;">
                    <div class="textarea-container" style="position:relative;">
                        <textarea id="editor-text" style="width:100%; height:600px; background:#000; color:#0f0; padding:15px; border:1px solid #333; font-family:var(--font-mono); resize:vertical;">${currentContent}</textarea>
                        <div class="editor-drop-overlay">[DRAG_DROP_IMAGE_TO_INCLUDE]</div>
                    </div>
                    <button onclick="window.transmitEdit('${escapeHTML(titleOrId)}')" class="btn-clinical-toggle" style="width:100%; padding:15px; margin-top:10px;">[TRANSMIT_TO_ARCHIVE]</button>
                </div>
                
                <div class="infobox-builder">
                    <div style="padding:10px; font-family:var(--font-mono); font-size:0.65rem; color:var(--accent-orange); border-bottom:1px solid #222;">[VISUAL_INFOBOX_CONSTRUCTOR]</div>
                    <input type="text" id="ib-title" placeholder="ARCHIVAL_TITLE" class="builder-title-input" value="${existingInfobox.title}">
                    <div id="ib-drop-zone" class="builder-drop-zone">
                        <img id="ib-preview" src="${existingInfobox.image}" style="${existingInfobox.image ? 'display:block;' : 'display:none;'}">
                        <div class="builder-placeholder" style="${existingInfobox.image ? 'display:none;' : ''}">[DRAG_DROP_PRIMARY_IMAGE]</div>
                        <input type="hidden" id="ib-image-url" value="${existingInfobox.image}">
                    </div>
                    <div class="builder-rows">
                        <div class="builder-row">
                            <input type="text" value="caption" class="builder-key" readonly>
                            <input type="text" id="ib-caption" placeholder="IMAGE_CAPTION" class="builder-val" value="${existingInfobox.caption}">
                        </div>
                        <div class="builder-row">
                            <input type="text" value="type" class="builder-key" readonly>
                            <input type="text" id="ib-type" placeholder="NODE_TYPE" class="builder-val" value="${existingInfobox.type}">
                        </div>
                        <div id="ib-extra-rows">
                            ${existingInfobox.data.map((d, i) => `
                                <div class="builder-row">
                                    <input type="text" placeholder="KEY" class="builder-key ib-extra-key" value="${d.key}">
                                    <input type="text" placeholder="VALUE" class="builder-val ib-extra-val" value="${d.val}">
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="window.addInfoboxRow()" class="btn-clinical-toggle" style="width:100%; font-size:0.6rem; padding:4px; opacity:0.6;">[ADD_METADATA_FIELD]</button>
                    </div>
                </div>
            </div>
        `;

        const textarea = document.getElementById('editor-text');
        const container = textarea.parentElement;
        const ibDropZone = document.getElementById('ib-drop-zone');
        const ibPreview = document.getElementById('ib-preview');
        const ibUrlInput = document.getElementById('ib-image-url');

        // Textarea Drag & Drop
        container.addEventListener('dragover', (e) => { e.preventDefault(); container.classList.add('dragover'); });
        container.addEventListener('dragleave', () => container.classList.remove('dragover'));
        container.addEventListener('drop', async (e) => {
            container.classList.remove('dragover');
            await handleEditorDrop(e, textarea);
        });

        // Infobox Drag & Drop
        ibDropZone.addEventListener('dragover', (e) => { e.preventDefault(); ibDropZone.classList.add('dragover'); });
        ibDropZone.addEventListener('dragleave', () => ibDropZone.classList.remove('dragover'));
        ibDropZone.addEventListener('drop', async (e) => {
            ibDropZone.classList.remove('dragover');
            await handleInfoboxDrop(e, ibPreview, ibUrlInput);
        });
    }

    window.addInfoboxRow = () => {
        const container = document.getElementById('ib-extra-rows');
        const div = document.createElement('div');
        div.className = 'builder-row';
        div.innerHTML = `<input type="text" placeholder="KEY" class="builder-key ib-extra-key"> <input type="text" placeholder="VALUE" class="builder-val ib-extra-val">`;
        container.appendChild(div);
    };

    let currentRenderedTitle = "";

    async function init() {
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        if (path === '/admin') {
            await loadAdminDashboard();
            updateAuthUI();
            updateSidebarActivity();
            return;
        }

        let titleOrId = "Main_Page";
        if (path.startsWith('/w/')) titleOrId = window.slugToTitle(path.substring(3));

        // --- [SAME_TITLE_PREVENTION] ---
        // If it's just a hash change within the same document, don't re-render everything
        if (titleOrId === currentRenderedTitle && !mode) {
            if (window.location.hash) {
                const targetId = decodeURIComponent(window.location.hash.substring(1));
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                    return;
                }
            }
        }
        currentRenderedTitle = titleOrId;

        if (mode === 'login' || mode === 'register') {
            await renderAuthForm(mode);
        } else if (mode === 'edit') {
            await loadEditor(titleOrId);
        } else {
            await renderArticle(titleOrId);
        }
        updateAuthUI();
        updateSidebarActivity();
    }

    window.transmitEdit = async (title) => {
        const bodyText = document.getElementById('editor-text').value;
        const ibTitle = document.getElementById('ib-title').value.trim();
        const ibImage = document.getElementById('ib-image-url').value.trim();
        const ibCaption = document.getElementById('ib-caption').value.trim();
        const ibType = document.getElementById('ib-type').value.trim();
        
        const urlParams = new URLSearchParams(window.location.search);
        const classification = urlParams.get('type') === 'notice' ? 'NOTICE' : 'GENERAL';

        let infoboxMarkup = "";
        if (ibTitle || ibImage) {
            infoboxMarkup = `{{infobox\n| title = ${ibTitle}\n| image = ${ibImage}\n| caption = ${ibCaption}\n| type = ${ibType}\n`;
            const extraKeys = document.querySelectorAll('.ib-extra-key');
            const extraVals = document.querySelectorAll('.ib-extra-val');
            extraKeys.forEach((k, i) => {
                if (k.value.trim()) infoboxMarkup += `| ${k.value.trim()} = ${extraVals[i].value.trim()}\n`;
            });
            infoboxMarkup += `}}\n\n`;
        }

        const finalContent = infoboxMarkup + bodyText;

        try {
            await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(title))}`, {
                method: 'POST', body: JSON.stringify({ content: finalContent, classification })
            });
            window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(title))}`);
        } catch (e) { alert("FAILED"); }
    };

    init();
    setInterval(updateSidebarActivity, 60000);
});
