document.addEventListener('DOMContentLoaded', () => {
    // --- [2. Boot Terminal Animation] ---
    const bootTerminal = document.getElementById('boot-terminal');
    if (bootTerminal) {
        setTimeout(() => {
            bootTerminal.classList.add('fade-out');
            setTimeout(() => {
                bootTerminal.style.display = 'none';
            }, 400);
        }, 800);
    }

    const API_ENDPOINT = '/api';
    const PAGE_SIZE = 15;

    // --- [75. i18n Localization Engine] ---
    const TRANSLATIONS = {
        en: {
            auth_login: "AGENT_LOGIN", auth_register: "REGISTER_NEW_AGENT", designation: "Designation", access_cipher: "Access Cipher",
            welcome_back: "WELCOME_BACK: AGENT_{user}", identity_created: "IDENTITY_CREATED: Please login.",
            logout: "LOGOUT", login: "LOGIN", register: "REGISTER", agent: "AGENT", recent_changes: "RECENT_CHANGES",
            history: "HISTORY", edit: "EDIT", transmit: "TRANSMIT", rollback: "ROLLBACK", diff: "DIFF", purged: "PURGED",
            not_found: "RECORD_NOT_FOUND", create: "CREATE_NEW_RECORD", confirm_rollback: "Rollback to REV #{id}?",
            restored: "Timeline restored.", failed: "Operation failed.", loading: "Loading data...", summary: "Summary",
            previous: "PREVIOUS", next: "NEXT", view: "VIEW", record: "RECORD", discuss: "DISCUSS",
            license_agree: "By transmitting, you agree to license your contribution under CC BY-SA 4.0.",
            clearance: "CLEARANCE", active_editors: "ACTIVE_SIM_EDITORS",
            change_image: "CHANGE_INFOBOX_IMAGE", delete: "DELETE", report: "REPORT", lock: "LOCK", unlock: "UNLOCK"
        },
        ko: {
            auth_login: "요원_로그인", auth_register: "신규_요원_등록", designation: "요원 식별 코드", access_cipher: "접근 암호",
            welcome_back: "귀환 환영: 요원_{user}", identity_created: "신원 생성됨. 로그인하십시오.",
            logout: "접근_종료", login: "로그인", register: "등록", agent: "요원", recent_changes: "최근_전송_내역",
            history: "기록_보관소", edit: "수정", transmit: "데이터_전송", rollback: "시간선_복구", diff: "차이점", purged: "말소됨",
            not_found: "기록_없음", create: "기록_생성", confirm_rollback: "REV #{id}로 복구하시겠습니까?",
            restored: "복구됨.", failed: "실패.", loading: "데이터 수신 중...", summary: "요약",
            previous: "이전", next: "다음", view: "보기", record: "문서", discuss: "토론",
            license_agree: "전송 시 귀하의 기여물을 CC BY-SA 4.0 라이선스로 배포함에 동의하게 됩니다.",
            clearance: "보안 승인 등급", active_editors: "동시 편집 중인 요원",
            change_image: "인포박스 이미지 변경", delete: "삭제", report: "신고", lock: "잠금", unlock: "잠금 해제"
        }
    };

    const LANG = navigator.language.startsWith('ko') ? 'ko' : 'en';
    const t = (key, params = {}) => {
        let str = (TRANSLATIONS[LANG] && TRANSLATIONS[LANG][key]) ? TRANSLATIONS[LANG][key] : key;
        for (const [k, v] of Object.entries(params)) str = str.replace(`{${k}}`, v);
        return str;
    };

    // --- [Auth & Fetch] ---
    let currentUser = JSON.parse(localStorage.getItem('yomi_user')) || null;
    let currentTier = null;
    window.unreadNotificationsCount = 0;
    let editorHeartbeatInterval = null;

    const securedFetch = async (url, options = {}) => {
        const headers = { ...options.headers, 'X-Yomi-Request': 'true', 'Content-Type': 'application/json' };
        if (currentUser?.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
        let res = await fetch(url, { ...options, headers });
        
        if (res.status === 401) {
            const data = await res.clone().json();
            if (data.error === "UNAUTH") {
                const success = await handleSessionExpiry();
                if (success) {
                    headers['Authorization'] = `Bearer ${currentUser.token}`;
                    res = await fetch(url, { ...options, headers });
                }
            }
        }
        else if (res.status === 403) {
            const data = await res.clone().json();
            if (data.error === "ACCESS_REVOKED") {
                yomiAlert(`[ACCESS_REVOKED]\nREASON: ${data.reason || "NO_REASON_PROVIDED"}\nSESSION_TERMINATED.`);
                window.logout();
            }
        }
        return res;
    };

    async function handleSessionExpiry() {
        if (!currentUser) return false;
        const confirm = await yomiConfirm("[SESSION_EXPIRED]\nYour authorization has timed out.\nRe-authenticate to preserve current session data?");
        if (confirm) {
            return await window.showAuthModal('login', currentUser.username);
        }
        return false;
    }

    // --- [81. Sync Clearance Tier on Init] ---
    async function syncClearance() {
        if (!currentUser) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/auth/me`);
            const data = await res.json();
            if (data.authenticated) {
                currentTier = data.tier;
                currentUser.role = data.role; // Sync role
                updateAuthUI();
                checkNotifications(); // Check notifications after sync
            }
        } catch (e) {}
    }

    window.showAuthModal = async (mode = 'login', prefilledUsername = "") => {
        const title = t(mode === 'login' ? 'auth_login' : 'auth_register');
        const username = await yomiPrompt(`${title}: ${t('designation')}`, prefilledUsername); if (!username) return false;
        const password = await yomiPrompt(`${title}: ${t('access_cipher')}`, ""); if (!password) return false;

        // 92. Client-side Validation
        if (mode === 'register') {
            if (username.length < 3 || username.length > 20) { yomiAlert("Username must be 3-20 chars."); return false; }
            if (!/^[a-zA-Z0-9_\-]+$/.test(username)) { yomiAlert("Invalid format. Use alphanumeric, _ or -."); return false; }
            if (password.length < 8) { yomiAlert("Password must be at least 8 chars."); return false; }
        }

        try {
            const res = await securedFetch(`${API_ENDPOINT}/auth/${mode}`, { method: 'POST', body: JSON.stringify({ username, password }) });
            const data = await res.json();
            if (res.ok) {
                if (mode === 'login') { 
                    currentUser = data; 
                    localStorage.setItem('yomi_user', JSON.stringify(data)); 
                    location.reload(); // Hard reload to reset state
                    return true;
                }
                else { yomiAlert(t('identity_created')); showAuthModal('login', username); return true; }
            } else {
                yomiAlert(`AUTH_ERROR: ${data.error}`);
                return false;
            }
        } catch (e) { 
            yomiAlert("CONNECTION_LOST."); 
            return false;
        }
    };
    window.logout = () => { localStorage.removeItem('yomi_user'); location.reload(); };

    const mainTitle = document.querySelector('.article-title');
    const articleBody = document.querySelector('.article-body');
    const metaText = document.querySelector('.article-meta');

    // --- [96. Dynamic Title Management] ---
    let currentRecordTitle = "Archival Gateway";
    function setPageTitle(title) {
        currentRecordTitle = title;
        document.title = `YomiWiki | ${title} [SECURE]`;
    }

    // --- [SPA Routing Engine] ---
    window.navigateTo = (url, push = true) => {
        if (push) history.pushState(null, "", url);
        init();
    };

    window.onpopstate = () => init();

    function handleInternalLinks() {
        document.body.onclick = (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin) && !link.target && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                const url = new URL(link.href);
                // API 경로나 정적 파일 등은 제외
                if (!url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
                    e.preventDefault();
                    window.navigateTo(link.href);
                }
            }
        };
    }

    // 96. Browser Tab Activation Listener
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            document.title = `YomiWiki | ${currentRecordTitle} [ACTIVE]`;
            setTimeout(() => setPageTitle(currentRecordTitle), 2000);
            checkNotifications(); // Refresh notifications on activation
        } else {
            if (window.unreadNotificationsCount > 0) {
                document.title = `(${window.unreadNotificationsCount}) NEW_UPLINK_DATA`;
            }
        }
    });

    // 100. Clinical Mode Toggle
    window.toggleClinicalMode = () => {
        const body = document.body;
        const btn = document.getElementById('btn-clinical');
        const isActive = body.classList.toggle('clinical-mode-active');
        if (isActive) {
            btn.textContent = "[EXIT_CLINICAL_MODE]";
            btn.setAttribute('aria-pressed', 'true');
            yomiAlert("[NOTICE]\nDistractions suppressed. Archival focus engaged.");
        } else {
            btn.textContent = "[ENTER_CLINICAL_MODE]";
            btn.setAttribute('aria-pressed', 'false');
        }
    };

    // 46. Reduced Motion Toggle
    window.toggleReducedMotion = () => {
        const body = document.body;
        const btn = document.getElementById('btn-reduced-motion');
        const isReduced = body.classList.toggle('reduced-motion');
        btn.setAttribute('aria-pressed', isReduced);
        btn.textContent = isReduced ? "[RESTORE_VISUAL_FLUX]" : "[SUPPRESS_GLITCH_EFFECTS]";
    };

    function updateAuthUI() {
        const nav = document.querySelector('.nav-links') || document.querySelector('.nav');
        if (!nav) return;
        let authDiv = document.getElementById('auth-info-display');
        if (!authDiv) {
            authDiv = document.createElement('div'); authDiv.id = 'auth-info-display';
            authDiv.style.cssText = "font-size:0.75rem; margin-top:10px; font-family:monospace; color:#888;";
            nav.appendChild(authDiv);
        }
        
        if (currentUser) {
            const tierStr = currentTier ? `<span style="color:var(--accent-orange);">[${currentTier.level}: ${currentTier.title}]</span>` : '';
            const adminLink = currentUser.role === 'admin' ? `<a href="/?mode=admin" style="color:var(--hazard-red); margin-left:10px;">[ADMIN_PANEL]</a>` : '';
            const notifCount = window.unreadNotificationsCount ? `<a href="/?mode=notifications" style="color:var(--hazard-red); font-weight:bold; margin-left:10px;">[!] ${window.unreadNotificationsCount}</a>` : `<a href="/?mode=notifications" style="color:#666; margin-left:10px;">[0]</a>`;
            authDiv.innerHTML = `${t('agent')}: ${currentUser.username} ${tierStr} ${notifCount} ${adminLink} | <span onclick="window.logout()" style="cursor:pointer; text-decoration:underline;">[${t('logout')}]</span>`;
        } else {
            authDiv.innerHTML = `<span onclick="window.showAuthModal('login')" style="cursor:pointer; text-decoration:underline;">[${t('login')}]</span> | <span onclick="window.showAuthModal('register')" style="cursor:pointer; text-decoration:underline;">[${t('register')}]</span>`;
        }
    }

    function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

    // --- [Modals] ---
    window.yomiModal = ({ type, message, defaultValue = "", inputType = "text" }) => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div'); overlay.className = 'yomi-modal-overlay';
            let inputHtml = type === 'prompt' ? `<input type="${inputType}" class="yomi-modal-input" id="yomi-modal-input" value="${escapeHTML(defaultValue)}" autocomplete="off">` : '';
            overlay.innerHTML = `
                <div class="yomi-modal">
                    <div class="modal-header-clinical">[SECURE_COMM_CHANNEL]</div>
                    <div class="yomi-modal-message">${message}</div>
                    ${inputHtml}
                    <div class="yomi-modal-actions">
                        ${type !== 'alert' ? '<button class="btn-action modal-btn-cancel" id="y-cancel">[ABORT]</button>' : ''}
                        <button class="btn-action modal-btn-confirm" id="y-confirm">[AUTHORIZE]</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            const inputEl = overlay.querySelector('#yomi-modal-input'); if (inputEl) inputEl.focus();
            overlay.querySelector('#y-confirm').onclick = () => { const val = inputEl ? inputEl.value : true; document.body.removeChild(overlay); resolve(val); };
            if (type !== 'alert') overlay.querySelector('#y-cancel').onclick = () => { document.body.removeChild(overlay); resolve(null); };
        });
    };
    window.yomiAlert = (msg) => window.yomiModal({ type: 'alert', message: msg });
    window.yomiConfirm = (msg) => window.yomiModal({ type: 'confirm', message: msg });
    window.yomiPrompt = (msg, def, inputType = "text") => window.yomiModal({ type: 'prompt', message: msg, defaultValue: def, inputType });

    // --- [Wiki Core] ---
    function updateTabs(mode) {
        const tView = document.getElementById('tab-view'), tDiscuss = document.getElementById('tab-discuss');
        if (!tView || !tDiscuss) return;
        const activeStyle = "background:#1a1a1a; color:var(--accent-orange); border-color:#333;";
        const idleStyle = "background:#0a0a0a; color:#666; border-color:#222;";
        tView.style.cssText += (mode === 'discuss' ? idleStyle : activeStyle);
        tDiscuss.style.cssText += (mode === 'discuss' ? activeStyle : idleStyle);
    }

    async function loadDiscussion(title) {
        setPageTitle(`Talk: ${title}`);
        articleBody.innerHTML = `<div id="comment-form" style="margin-bottom:30px; border:1px solid #333; padding:20px;"><textarea id="comment-content" style="width:100%; height:80px; background:#000; color:#0f0; border:1px solid #222; padding:10px; margin-bottom:10px;"></textarea><button onclick="window.postComment('${escapeHTML(title)}')" class="btn-action">[${t('transmit')}]</button></div><div id="comment-list">${t('loading')}</div>`;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments`);
            const comments = await res.json();
            document.getElementById('comment-list').innerHTML = comments.map(c => {
                const isAuthor = currentUser && (c.author === currentUser.username || currentUser.role === 'admin');
                const actionLinks = isAuthor ? ` | <span onclick="window.editComment('${escapeHTML(title)}', ${c.id}, '${escapeHTML(c.content).replace(/'/g, "\\'")}')" style="cursor:pointer; text-decoration:underline;">[${t('edit')}]</span> | <span onclick="window.deleteComment('${escapeHTML(title)}', ${c.id})" style="cursor:pointer; text-decoration:underline; color:var(--hazard-red);">[${t('delete')}]</span>` : '';
                return `<div style="border-left:2px solid #333; padding-left:15px; margin-bottom:20px;">
                    <small>${c.author} | ${c.timestamp}${actionLinks} | <span onclick="window.reportContent('comment', ${c.id})" style="cursor:pointer; opacity:0.5;">[${t('report')}]</span></small>
                    <p style="margin-top:5px;">${escapeHTML(c.content)}</p>
                </div>`;
            }).join('') || "No active threads.";
        } catch (e) { document.getElementById('comment-list').textContent = t('failed'); }
    }

    window.postComment = async (title) => {
        const content = document.getElementById('comment-content').value; if (!content) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
            if (res.ok) loadDiscussion(title);
        } catch (e) {}
    };

    // --- [98. Comment Edit/Delete Frontend] ---
    window.editComment = async (title, id, oldContent) => {
        const newContent = await yomiPrompt(`${t('edit')} ${t('discuss')}`, oldContent);
        if (!newContent) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments/${id}`, { method: 'PUT', body: JSON.stringify({ content: newContent }) });
            if (res.ok) loadDiscussion(title);
            else yomiAlert(t('failed'));
        } catch (e) { yomiAlert(t('failed')); }
    };

    window.deleteComment = async (title, id) => {
        if (!await yomiConfirm(`[PERMANENT_ERASURE_NOTICE]\n${t('delete')} this comment?`)) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/comments/${id}`, { method: 'DELETE' });
            if (res.ok) loadDiscussion(title);
            else yomiAlert(t('failed'));
        } catch (e) { yomiAlert(t('failed')); }
    };

    window.reportContent = async (type, id) => {
        const reason = await yomiPrompt("[REPORT_PROTOCOL_INITIATED]\nEnter reason for report:", "");
        if (!reason) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/report`, { method: 'POST', body: JSON.stringify({ target_type: type, target_id: id, reason }) });
            if (res.ok) yomiAlert("REPORT_FILED_SUCCESSFULLY.");
        } catch (e) { yomiAlert(t('failed')); }
    };

    window.loadHistory = async (title) => {
        setPageTitle(`History: ${title}`);
        mainTitle.textContent = `${t('history')}: ${title}`; articleBody.innerHTML = t('loading');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/history`);
            const logs = await res.json();
            articleBody.innerHTML = logs.map(log => `<div style="border-bottom:1px solid #333; padding:10px 0;"><div style="display:flex; justify-content:space-between;"><div style="color:var(--accent-orange); font-weight:bold;">REV #${log.id}</div><button onclick="window.rollbackRevision('${escapeHTML(title)}', ${log.id})" class="btn-action" style="font-size:0.7rem; border-color:var(--hazard-red); color:var(--hazard-red);">[${t('rollback')}]</button></div><small>${log.timestamp} | ${t('agent')}: ${log.editor_info}</small><br><i>${escapeHTML(log.edit_summary) || ""}</i></div>`).join('');
        } catch (e) { articleBody.innerHTML = t('failed'); }
    };

    // --- [81. Agent Dossier with Tier Display] ---
    async function loadAgentDossier(username) {
        setPageTitle(`Agent: ${username}`);
        mainTitle.textContent = `AGENT_DOSSIER: ${username}`;
        articleBody.innerHTML = t('loading');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/user/${encodeURIComponent(username)}`);
            const data = await res.json();
            const tier = data.tier;
            articleBody.innerHTML = `
                <div style="background:rgba(255,153,0,0.05); border-left:4px solid var(--accent-orange); padding:20px; margin-bottom:30px;">
                    <div style="font-family:monospace; color:var(--accent-orange); font-weight:bold; margin-bottom:10px;">[CLASSIFIED_PERSONNEL_DATA]</div>
                    <strong>${t('designation').toUpperCase()}:</strong> ${escapeHTML(username)}<br>
                    <strong>${t('clearance').toUpperCase()}:</strong> ${tier.level} (${tier.title})<br>
                    <strong>TOTAL_CONTRIBUTIONS:</strong> ${tier.count}
                </div>
                <h3>Recent Activity</h3>
                ${data.contributions.map(c => `<div style="border-bottom:1px solid #222; padding:10px 0;"><a href="/w/${encodeURIComponent(c.title.replace(/[_\s]+/g, '_'))}">${escapeHTML(c.title)}</a><br><small>${c.timestamp} | <i>${escapeHTML(c.edit_summary) || ""}</i></small></div>`).join('') || "No recent activity logged."}
            `;
        } catch (e) { articleBody.innerHTML = t('failed'); }
    }

    // --- [86. Notifications UI] ---
    async function loadNotifications() {
        setPageTitle("Notifications");
        if (!currentUser) { yomiAlert("LOGIN_REQUIRED."); return; }
        mainTitle.textContent = "UPLINK_NOTIFICATIONS";
        articleBody.innerHTML = `<button onclick="window.markAllRead()" class="btn-action" style="margin-bottom:20px;">[MARK_ALL_AS_READ]</button><div id="notification-list">${t('loading')}</div>`;
        await refreshNotificationList();
    }

    async function refreshNotificationList() {
        const listDiv = document.getElementById('notification-list');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/notifications`);
            const data = await res.json();
            window.unreadNotificationsCount = data.unread_count;
            updateAuthUI();
            listDiv.innerHTML = data.notifications.map(n => `
                <div style="padding:15px; border-bottom:1px solid #222; background:${n.is_read ? 'transparent' : 'rgba(255,153,0,0.05)'};">
                    <small style="color:#666;">${n.timestamp} | FROM: ${n.sender || 'SYSTEM'}</small>
                    <p style="margin-top:5px; color:${n.is_read ? 'var(--text-main)' : '#fff'}; font-weight:${n.is_read ? 'normal' : 'bold'};">${escapeHTML(n.message)}</p>
                    ${n.article_title ? `<a href="/w/${encodeURIComponent(n.article_title.replace(/[_\s]+/g, '_'))}" style="font-size:0.75rem; color:var(--accent-orange);">[VIEW_RECORD]</a>` : ''}
                </div>
            `).join('') || "No archived notifications.";
        } catch (e) { listDiv.textContent = "FAILED_TO_LOAD_NOTIFICATIONS"; }
    }

    window.markAllRead = async () => {
        try {
            await securedFetch(`${API_ENDPOINT}/notifications/read`, { method: 'POST', body: JSON.stringify({}) });
            window.unreadNotificationsCount = 0;
            updateAuthUI();
            if (document.getElementById('notification-list')) refreshNotificationList();
        } catch (e) {}
    };

    async function checkNotifications() {
        if (!currentUser) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/notifications`);
            const data = await res.json();
            if (data.unread_count !== window.unreadNotificationsCount) {
                window.unreadNotificationsCount = data.unread_count;
                updateAuthUI();
            }
        } catch (e) {}
    }

    // --- [88. Sim-Editor Heartbeat UI] ---
    async function startEditorHeartbeat(title) {
        if (editorHeartbeatInterval) clearInterval(editorHeartbeatInterval);
        const heartbeat = async () => {
            try {
                const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/heartbeat`, { method: 'POST' });
                const data = await res.json();
                const display = document.getElementById('active-editors-display');
                if (display) {
                    if (data.editors && data.editors.length > 0) {
                        display.innerHTML = `<span style="color:var(--hazard-red); animation: blink 1s infinite;">[!] ${t('active_editors')}: ${data.editors.join(', ')}</span>`;
                    } else {
                        display.innerHTML = '';
                    }
                }
            } catch (e) {}
        };
        await heartbeat();
        editorHeartbeatInterval = setInterval(heartbeat, 15000); // 15 seconds
    }

    function stopEditorHeartbeat() {
        if (editorHeartbeatInterval) {
            clearInterval(editorHeartbeatInterval);
            editorHeartbeatInterval = null;
        }
    }

    // --- [89. Help & Protocol Guide] ---
    function loadHelp() {
        setPageTitle("Help Protocols");
        mainTitle.textContent = "ARCHIVAL_PROTOCOLS_&_TABOOS";
        articleBody.innerHTML = `
            <div class="protocol-guide">
                <section style="margin-bottom:30px;">
                    <h3 style="color:var(--accent-orange);">[1. EDITING_PROTOCOLS]</h3>
                    <p>All transmissions must maintain clinical detachment. Avoid emotional bias.</p>
                    <div style="background:#111; padding:15px; border:1px solid #222; margin-top:10px;">
                        <strong>Standard Record Template:</strong><br>
                        <pre style="font-size:0.8rem; color:#888;">
{{infobox
| title = ITEM_NAME
| image = URL_HERE
| caption = ITEM_CAPTION
| type = TYPE_HERE
}}
== RECORD_OVERVIEW ==
'''ITEM_ID:''' [[ITEM_NAME]]
'''THREAT_LEVEL:''' [WHITE/GREEN/YELLOW/ORANGE/RED/BLACK]
'''CLEARANCE_LEVEL:''' [I/II/III/IV]

== CLINICAL_DESCRIPTION ==
[CLINICAL]
Describe the subject here.
[/CLINICAL]

== CONTAINMENT_PROTOCOL ==
* Protocol alpha
* Protocol beta
                        </pre>
                    </div>
                </section>
                <section>
                    <h3 style="color:var(--hazard-red);">[2. ARCHIVAL_TABOOS]</h3>
                    <ul style="margin-left:20px; margin-top:10px; line-height:2;">
                        <li><strong>NO_VANDALISM:</strong> Intentional data corruption will result in immediate IP termination.</li>
                        <li><strong>NO_PERSONAL_DATA:</strong> Do not leak agent identities or real-world coordinates.</li>
                        <li><strong>NO_REDUNDANCY:</strong> Check for existing nodes before establishing new ones.</li>
                        <li><strong>SECURITY_FIRST:</strong> Always apply appropriate [CLASSIFICATION] tags to sensitive data.</li>
                    </ul>
                </section>
            </div>
        `;
    }

    // --- [90. Search Autocomplete with Debounce] ---
    function setupSearchAutocomplete() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        let debounceTimer;
        const suggestionBox = document.createElement('div');
        suggestionBox.id = 'search-suggestions';
        suggestionBox.style.cssText = "position:absolute; background:var(--bg-sidebar); border:1px solid var(--border-color); width:100%; z-index:10000; display:none; max-height:300px; overflow-y:auto; box-shadow:0 10px 30px rgba(0,0,0,0.5);";
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(suggestionBox);

        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();
            if (query.length < 2) { suggestionBox.style.display = 'none'; return; }

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`${API_ENDPOINT}/search?q=${encodeURIComponent(query)}`, { headers: { 'X-Yomi-Request': 'true' } });
                    const titles = await res.json();
                    if (titles.length > 0) {
                        suggestionBox.innerHTML = titles.map(t => `<div class="suggestion-item" style="padding:10px; border-bottom:1px solid #222; cursor:pointer; font-family:monospace; font-size:0.8rem; color:var(--accent-orange);">[NODE]: ${escapeHTML(t)}</div>`).join('');
                        suggestionBox.style.display = 'block';
                        suggestionBox.querySelectorAll('.suggestion-item').forEach((el, i) => {
                            el.onclick = () => {
                                window.location.href = `/w/${encodeURIComponent(titles[i].replace(/[_\s]+/g, '_'))}`;
                            };
                        });
                    } else {
                        suggestionBox.style.display = 'none';
                    }
                } catch (e) { suggestionBox.style.display = 'none'; }
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
                suggestionBox.style.display = 'none';
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) window.location.href = `/w/${encodeURIComponent(query.replace(/[_\s]+/g, '_'))}`;
            }
        });
    }

    // --- [94. Immediate Image Change UI for Infobox] ---
    window.changeInfoboxImage = async () => {
        const textarea = document.getElementById('editor-textarea');
        if (!textarea) return;
        const content = textarea.value;
        const imageMatch = content.match(/\|\s*image\s*=\s*(.*?)\s*(\n|\||\}\})/i);
        const currentUrl = imageMatch ? imageMatch[1].trim() : "";
        const newUrl = await yomiPrompt(t('change_image'), currentUrl);
        if (newUrl === null) return;

        if (imageMatch) {
            textarea.value = content.replace(/(\|\s*image\s*=\s*)(.*?)(\s*(\n|\||\}\}))/i, `$1${newUrl}$3`);
        } else {
            if (content.match(/\{\{infobox/i)) {
                textarea.value = content.replace(/(\{\{infobox.*?\n)/i, `$1| image = ${newUrl}\n`);
            } else {
                yomiAlert("NO_INFOBOX_FOUND.");
            }
        }
    };

    // --- [82 & 99. Admin Dashboard & Unified Views] ---
    async function loadAdminDashboard() {
        setPageTitle("Admin Panel");
        if (!currentUser || currentUser.role !== 'admin') { yomiAlert("ADMIN_ACCESS_REQUIRED."); window.location.href = "/"; return; }
        mainTitle.textContent = "ADMINISTRATIVE_CONTROL_PANEL";
        articleBody.innerHTML = `
            <div style="background:rgba(255,68,68,0.05); border-left:4px solid var(--hazard-red); padding:20px; margin-bottom:30px;">
                <h3 style="color:var(--hazard-red);">[BAN_PROTOCOL_INITIATION]</h3>
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <select id="ban-type" style="background:#000; color:#fff; border:1px solid #333; padding:5px;">
                        <option value="user">USER</option>
                        <option value="ip">IP</option>
                    </select>
                    <input type="text" id="ban-value" placeholder="Target (Username or IP)" style="flex:1; background:#000; color:#fff; border:1px solid #333; padding:5px;">
                    <input type="text" id="ban-reason" placeholder="Reason" style="flex:1; background:#000; color:#fff; border:1px solid #333; padding:5px;">
                    <button onclick="window.banTarget()" class="btn-action" style="border-color:var(--hazard-red); color:var(--hazard-red);">[EXECUTE_BAN]</button>
                </div>
            </div>
            <div id="admin-reports-container" style="margin-bottom:30px;">
                <h3>Active Reports</h3>
                <div id="report-list">${t('loading')}</div>
            </div>
            <div id="admin-locked-container" style="margin-bottom:30px;">
                <h3>Locked Articles</h3>
                <div id="locked-list">${t('loading')}</div>
            </div>
            <div id="ban-list-container">
                <h3>Active Bans</h3>
                <div id="ban-list">${t('loading')}</div>
            </div>
        `;
        await Promise.all([refreshReportList(), refreshLockedList(), refreshBanList()]);
    }

    async function refreshReportList() {
        const listDiv = document.getElementById('report-list');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/reports`);
            const reports = await res.json();
            listDiv.innerHTML = `<table class="wikitable">
                <thead><tr><th>Type</th><th>ID</th><th>Reason</th><th>By IP</th><th>Action</th></tr></thead>
                <tbody>
                    ${reports.map(r => `<tr>
                        <td>${r.target_type}</td>
                        <td>${r.target_id}</td>
                        <td>${escapeHTML(r.reason)}</td>
                        <td>${r.reporter_ip}</td>
                        <td><button onclick="window.resolveReport(${r.id})" class="btn-action" style="font-size:0.7rem;">[RESOLVE]</button></td>
                    </tr>`).join('') || '<tr><td colspan="5">No active reports.</td></tr>'}
                </tbody>
            </table>`;
        } catch (e) { listDiv.textContent = "FAILED_TO_LOAD_REPORTS"; }
    }

    async function refreshLockedList() {
        const listDiv = document.getElementById('locked-list');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/locked`);
            const locked = await res.json();
            listDiv.innerHTML = `<ul>${locked.map(l => `<li>${escapeHTML(l.title)} <span onclick="window.toggleLock('${escapeHTML(l.title)}', false)" style="cursor:pointer; color:var(--accent-orange);">[UNLOCK]</span></li>`).join('') || 'No locked articles.'}</ul>`;
        } catch (e) { listDiv.textContent = "FAILED_TO_LOAD_LOCKED"; }
    }

    window.toggleLock = async (title, lock) => {
        try {
            await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}/lock`, { method: 'PUT', body: JSON.stringify({ locked: lock }) });
            refreshLockedList();
        } catch (e) {}
    };

    async function refreshBanList() {
        const listDiv = document.getElementById('ban-list');
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/bans`);
            const bans = await res.json();
            listDiv.innerHTML = `<table class="wikitable">
                <thead><tr><th>Type</th><th>Value</th><th>Reason</th><th>By</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                    ${bans.map(b => `<tr>
                        <td>${b.target_type}</td>
                        <td>${b.target_value}</td>
                        <td>${escapeHTML(b.reason || "")}</td>
                        <td>${b.banned_by}</td>
                        <td>${b.timestamp}</td>
                        <td><button onclick="window.unbanTarget(${b.id})" class="btn-action" style="font-size:0.7rem;">[REVOKE]</button></td>
                    </tr>`).join('') || '<tr><td colspan="6">No active bans.</td></tr>'}
                </tbody>
            </table>`;
        } catch (e) { listDiv.textContent = "FAILED_TO_LOAD_BAN_LIST"; }
    }

    window.banTarget = async () => {
        const type = document.getElementById('ban-type').value;
        const value = document.getElementById('ban-value').value;
        const reason = document.getElementById('ban-reason').value;
        if (!value) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/bans`, { method: 'POST', body: JSON.stringify({ target_type: type, target_value: value, reason }) });
            if (res.ok) { yomiAlert("BAN_PROTOCOL_SUCCESSFUL."); refreshBanList(); }
            else yomiAlert("FAILED_TO_EXECUTE_BAN.");
        } catch (e) { yomiAlert("CONNECTION_ERROR."); }
    };

    window.unbanTarget = async (id) => {
        if (!await yomiConfirm("REVOKE_BAN_PROTOCOL?")) return;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/admin/bans`, { method: 'DELETE', body: JSON.stringify({ id }) });
            if (res.ok) refreshBanList();
        } catch (e) {}
    };

    window.loadEditor = async (title) => {
        setPageTitle(`Editing: ${title}`);
        if (!currentUser) { yomiAlert(t('login') + " required."); window.location.href = `/w/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`; return; }
        mainTitle.textContent = `${t('edit')}: ${title}`;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`);
            const data = await res.json();
            window.currentBaseVersion = data.version || 0;

            let initialContent = data.current_content || "";
            if (!initialContent) {
                initialContent = `{{infobox\n| title = ${title}\n| image = \n| caption = \n| type = \n}}\n\n== RECORD_OVERVIEW ==\n'''ITEM_ID:''' [[${title}]]\n'''THREAT_LEVEL:''' [WHITE]\n'''CLEARANCE_LEVEL:''' [I]\n\n== CLINICAL_DESCRIPTION ==\n[CLINICAL]\nDescribe the subject here.\n[/CLINICAL]\n\n== CONTAINMENT_PROTOCOL ==\n* \n\n[[Category:UNCLASSIFIED]]`;
            }

            articleBody.innerHTML = `
                <div class="editor-container">
                    <div id="active-editors-display" style="margin-bottom:10px; font-family:monospace; font-size:0.8rem;"></div>
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <input type="text" id="editor-classification" placeholder="CLASSIFICATION (e.g. SECRET)" value="${escapeHTML(data.classification || "")}" style="flex:1; background:#111; color:var(--hazard-red); border:1px solid #333; padding:5px; font-family:monospace;">
                        <button onclick="window.changeInfoboxImage()" class="btn-action" style="font-size:0.7rem;">[${t('change_image')}]</button>
                        ${currentUser.role === 'admin' ? `<button onclick="window.toggleLock('${escapeHTML(title)}', ${!data.is_locked})" class="btn-action" style="font-size:0.7rem;">[${data.is_locked ? t('unlock') : t('lock')}]</button>` : ''}
                    </div>
                    <textarea id="editor-textarea" style="width:100%; height:400px; background:#000; color:#0f0; font-family:monospace; padding:10px;">${escapeHTML(initialContent)}</textarea>
                    <input type="text" id="editor-summary" placeholder="${t('summary')}" style="width:100%; margin:10px 0; background:#111; color:#fff; border:1px solid #333; padding:5px;">
                    <div style="font-size:0.7rem; color:#666; margin-bottom:15px; border:1px dashed #333; padding:10px;">[PROTOCOL_NOTICE]: ${t('license_agree')}</div>
                    <button onclick="window.submitEdit('${escapeHTML(title)}')" class="btn-action">[${t('transmit')}]</button>
                </div>`;
            startEditorHeartbeat(title);
        } catch (e) { articleBody.innerHTML = t('failed'); }
    };

    window.submitEdit = async (title) => {
        const content = document.getElementById('editor-textarea').value;
        const summary = document.getElementById('editor-summary').value;
        const classification = document.getElementById('editor-classification').value;
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`, { 
                method: 'POST', 
                body: JSON.stringify({ content, summary, classification }) 
            });
            const data = await res.json();
            if (res.ok) {
                stopEditorHeartbeat();
                window.location.href = `/w/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`;
            }
            else if (res.status === 403 && data.error === "INSUFFICIENT_CLEARANCE") {
                yomiAlert(`[ACCESS_DENIED]\nREQUIRED_TIER: ${data.required}\nYOUR_TIER: ${data.current}`);
            }
            else yomiAlert(t('failed') + ": " + (data.error || "UNKNOWN"));
        } catch (e) { yomiAlert(t('failed')); }
    };

    async function renderArticle(title) {
        stopEditorHeartbeat();
        try {
            const res = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}`);
            const data = await res.json();
            if (!data.title) { 
                setPageTitle("Record Not Found");
                mainTitle.textContent = t('not_found'); 
                articleBody.innerHTML = `
                    <div style="text-align:center; padding:50px 20px; border:1px dashed var(--hazard-red); background:rgba(255,68,68,0.02);">
                        <div style="font-size:3rem; color:var(--hazard-red); margin-bottom:20px; animation: pulse 2s infinite;">[!]</div>
                        <h3 style="color:var(--hazard-red); margin-bottom:10px;">SIGNAL_LOST: NODE_NOT_ESTABLISHED</h3>
                        <p style="margin-bottom:30px; opacity:0.7;">The requested coordinates do not correspond to any known archival record. This area of the grid remains unmapped.</p>
                        <button onclick="window.navigateTo('?mode=edit')" class="btn-action" style="padding:10px 30px; border-color:var(--accent-orange); color:var(--accent-orange);">
                            [ESTABLISH_NEW_NODE: ${escapeHTML(title)}]
                        </button>
                    </div>
                `; 
                return; 
            }
            if (data.redirect) return renderArticle(data.redirect);
            
            setPageTitle(data.title);
            mainTitle.innerHTML = escapeHTML(data.title);
            
            const authTierStr = data.author_tier ? `<span style="color:#888; font-size:0.7rem;">[${data.author_tier.level}]</span>` : '';
            const classificationStr = data.classification ? `<div style="color:var(--hazard-red); font-family:var(--font-mono); font-size:0.8rem; margin-bottom:10px;">[CLASSIFICATION: ${data.classification}]</div>` : '';
            const lockStr = data.is_locked ? `<span style="color:var(--hazard-red); font-size:0.7rem; margin-left:10px;">[LOCKED]</span>` : '';
            
            metaText.innerHTML = `${classificationStr}REV: ${data.updated_at} | AUTH: <a href="/user/${encodeURIComponent(data.author)}" style="color:inherit;">${escapeHTML(data.author)}</a> ${authTierStr} ${lockStr} | <a href="?mode=edit">[${t('edit')}]</a> | <a href="?mode=history">[${t('history')}]</a>`;
            
            let html = wikiParse(data.current_content);

            // --- [Step 4-1 & 4-2. Backlinks & Categories UI] ---
            let footerHtml = '<div class="article-footer" style="margin-top:50px; border-top:1px solid #222; padding-top:20px;">';
            
            // Categories
            if (data.categories) {
                const cats = data.categories.split(',').filter(c => c.trim());
                if (cats.length > 0) {
                    footerHtml += `<div class="categories-box" style="margin-bottom:20px;"><strong style="color:var(--accent-orange); font-size:0.8rem;">[ARCHIVAL_CATEGORIES]:</strong> ${cats.map(c => `<a href="/w/Category:${encodeURIComponent(c.trim().replace(/ /g, '_'))}" style="margin-left:10px; color:#888; text-decoration:underline;">${escapeHTML(c.trim())}]</a>`).join('')}</div>`;
                }
            }

            // Backlinks
            if (data.backlinks && data.backlinks.length > 0) {
                footerHtml += `<div class="backlinks-box"><strong style="color:var(--accent-orange); font-size:0.8rem;">[LINKED_NODES]:</strong> ${data.backlinks.map(b => `<a href="/w/${encodeURIComponent(b.replace(/ /g, '_'))}" style="margin-left:10px; color:#666;">[[${escapeHTML(b)}]]</a>`).join('')}</div>`;
            }

            footerHtml += '</div>';
            articleBody.innerHTML = html + footerHtml;

        } catch (e) { articleBody.innerHTML = t('failed'); }
    }

    function getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        let title = path.startsWith('/w/') ? decodeURIComponent(path.substring(3)).replace(/[_\s]+/g, ' ').trim() : 'Main_Page';
        const user = path.startsWith('/user/') ? decodeURIComponent(path.substring(6)) : null;
        return { title, mode: urlParams.get('mode'), user };
    }

    async function init() {
        const { title, mode, user } = getParams();
        updateAuthUI();
        syncClearance();
        updateTabs(mode);
        setupSearchAutocomplete();
        handleInternalLinks();
        const tabV = document.getElementById('tab-view'), tabD = document.getElementById('tab-discuss');
        if (tabV) tabV.href = `/w/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}?mode=view`;
        if (tabD) tabD.href = `/w/${encodeURIComponent(title.replace(/[_\s]+/g, '_'))}?mode=discuss`;

        // --- [SPA/SSR Hydration Logic] ---
        // 만약 서버에서 렌더링된 타이틀과 현재 로드하려는 타이틀이 같고, 
        // 쿼리 파라미터가 없는 '보기' 모드라면 API 호출을 생략합니다.
        if (window.isSSR && window.ssrTitle === title && !mode && !user) {
            console.log("[HYDRATION]: SSR_CONTENT_RETAINED");
            window.isSSR = false; // 다음 이동부터는 CSR 작동
            return;
        }
        window.isSSR = false; // 명시적 이동 시 플래그 해제

        if (mode === 'edit') await loadEditor(title);
        else if (mode === 'history') await loadHistory(title);
        else if (mode === 'discuss') await loadDiscussion(title);
        else if (mode === 'admin') await loadAdminDashboard();
        else if (mode === 'notifications') await loadNotifications();
        else if (mode === 'help') loadHelp();
        else if (user) await loadAgentDossier(user);
        else if (mode === 'recent') {
            setPageTitle(t('recent_changes'));
            mainTitle.textContent = t('recent_changes');
            const res = await securedFetch(`${API_ENDPOINT}/history`);
            const logs = await res.json();
            articleBody.innerHTML = logs.map(log => `<div style="border-bottom:1px solid #333; padding:10px 0;"><a href="/w/${encodeURIComponent(log.title.replace(/[_\s]+/g, '_'))}" style="color:var(--accent-orange); font-weight:bold;">${escapeHTML(log.title)}</a><br><small>${log.timestamp}</small></div>`).join('');
        }
        else await renderArticle(title);
    }
    init();
    setInterval(checkNotifications, 60000);
});
