document.addEventListener('DOMContentLoaded', () => {
    const API_ENDPOINT = '/api';
    window.titleToSlug = (t) => (t || "").trim().replace(/ /g, '_');
    window.slugToTitle = (s) => { if (!s) return ""; try { return decodeURIComponent(s).replace(/_/g, ' '); } catch (e) { return s.replace(/_/g, ' '); } };
    window.timeAgo = (d) => { if (!d) return "UNKNOWN"; const s = Math.floor((new Date() - new Date(d)) / 1000); if (s < 60) return "JUST_NOW"; const m = Math.floor(s / 60); if (m < 60) return `${m}M_AGO`; const h = Math.floor(m / 60); if (h < 24) return `${h}H_AGO`; return new Date(d).toLocaleDateString(); };
    function escapeHTML(s) { if (!s) return ""; return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
    let currentUser = JSON.parse(localStorage.getItem('yomi_user'));
    async function securedFetch(u, o = {}) { const h = o.headers || {}; if (currentUser?.token) h['Authorization'] = `Bearer ${currentUser.token}`; h['X-Yomi-Request'] = 'true'; if (!(o.body instanceof FormData) && o.body) h['Content-Type'] = 'application/json'; return fetch(u, { ...o, headers: h }); }
    function updateAuthUI() { const c = document.getElementById('auth-controls'); if (!c) return; if (currentUser) c.innerHTML = `<span style="color:var(--accent-orange); font-family:var(--font-mono); font-size:0.75rem; margin-right:10px;">[AGENT_${escapeHTML(currentUser.username)}]</span><button onclick="window.logout()" class="auth-btn logout">[DEACTIVATE]</button>`; else c.innerHTML = `<a href="/w/Main_Page?mode=login" class="auth-btn">[LOGIN]</a>`; }
    window.logout = () => { localStorage.removeItem('yomi_user'); currentUser = null; window.navigateTo('/w/Main_Page'); };
    let _currentPathSearch = window.location.pathname + window.location.search;
    window.navigateTo = (p) => { window.history.pushState({}, "", p); _currentPathSearch = window.location.pathname + window.location.search; init(); };
    window.onpopstate = () => { const ps = window.location.pathname + window.location.search; if (ps === _currentPathSearch) return; _currentPathSearch = ps; init(); };
    const si = document.getElementById('search-input'); const sd = document.getElementById('search-dropdown');
    if (si && sd) { let dt; si.addEventListener('input', () => { clearTimeout(dt); const q = si.value.trim(); if (q.length < 1) { sd.style.display = 'none'; return; } dt = setTimeout(async () => { try { const r = await fetch(`${API_ENDPOINT}/search/suggest?q=${encodeURIComponent(q)}`); const s = await r.json(); if (s.length > 0) { sd.innerHTML = s.map(i => `<div class="dropdown-item" onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(i))}')">${escapeHTML(i)}</div>`).join(''); sd.style.display = 'block'; } else sd.style.display = 'none'; } catch (e) { } }, 1); }); document.getElementById('search-btn').onclick = () => { const q = si.value.trim(); if (q) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(q))}`); }; si.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('search-btn').onclick(); }; }
    function renderCommentsHTML(t, c) { if (!c || !Array.isArray(c)) return ""; const s = [...c].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); const bi = (i, n, d = 0) => { const p = currentUser?.role === 'admin' ? `<button onclick="window.adminDeleteComment('${escapeHTML(t)}', '${i.id}')" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-size:0.65rem;">[PURGE]</button>` : ""; const sc = s.filter(x => x.parent_id === i.id); return `<div class="comment-item" style="margin-left:${d * 20}px; border-left:2px solid ${d > 0 ? '#222' : 'var(--accent-orange)'}; padding:10px 15px; margin-bottom:2px;"><div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-bottom:5px;">[${n}] AGENT: <span style="color:var(--accent-cyan);">${escapeHTML(i.author)}</span> ${p}</div><div style="font-size:0.9rem; color:var(--text-main); line-height:1.4;">${escapeHTML(i.content).replace(/\n/g, '<br>')}</div></div> ${sc.map((x, j) => bi(x, `${n}.${j + 1}`, d + 1)).join('')}`; }; return `<div id="discussion" style="margin-top:20px; border-top:1px solid #222; padding-top:20px;"><div class="comment-list">${s.filter(x => !x.parent_id).map((x, i) => bi(x, `#${i + 1}`)).join('') || '[SIGNAL_QUIET]'}</div><div style="margin-top:20px; background:#050505; border:1px solid #111; padding:15px;"><textarea id="new-comment-content" placeholder="Initiate transmission..." class="comment-input"></textarea><div style="margin-top:10px; text-align:right;"><button onclick="window.postComment('${escapeHTML(t)}')" class="btn-clinical-toggle" id="transmit-btn">[TRANSMIT]</button></div></div></div>`; }
    async function renderArticle(t) {
        const ab = document.querySelector('.article-body'); const mt = document.querySelector('.article-meta'); const s = window.titleToSlug(t); ab.innerHTML = '<div class="loading">[DECRYPTING...]</div>';
        try {
            const r = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(s)}`); const d = await r.json();
            if (d.error) { if (d.error === "RECORD_NOT_FOUND") { document.getElementById('article-title').textContent = `[NULL_NODE]: ${t}`; ab.innerHTML = `<div style="border:1px solid var(--hazard-red); padding:20px; color:var(--hazard-red);">[ALERT]: Archival coordinate not found. <button onclick="window.navigateTo('?mode=edit')" class="btn-clinical-toggle">[ESTABLISH_NODE]</button></div>`; } else ab.innerHTML = `[SYSTEM_EXCEPTION]: ${d.error}`; return; }
            const ib = (d.title.startsWith('Sector:') || d.title.startsWith('SubSector:')) && !d.title.split(':').pop().includes('/'); const ih = d.is_hub || d.title === 'SubSector_Archive';
            document.body.classList.toggle('theme-subsector', d.title.startsWith('SubSector:') || ih); document.getElementById('article-title').textContent = d.title.split('/').pop();
            const ia = currentUser?.role === 'admin'; const eb = (d.title === 'Main_Page' ? ia : (ia || currentUser?.username === d.author)) ? `<a href="/w/${encodeURIComponent(window.titleToSlug(d.title))}?mode=edit" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px;">[EDIT_NODE]</a>` : ""; const hb = `<a href="/w/${encodeURIComponent(window.titleToSlug(d.title))}?mode=history" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px;">[HISTORY]</a>`;
            const pb = ia ? `<button onclick="window.adminPurgeArticle('${escapeHTML(d.title)}')" class="btn-clinical-toggle" style="font-size:0.65rem; margin-left:5px; color:var(--hazard-red); border-color:var(--hazard-red);">[PURGE_NODE]</button>` : "";
            if (ib || ih) mt.innerHTML = ia ? eb + pb : ""; else mt.innerHTML = `REV: ${d.updated_at || "STABLE"} | AUTH: ${d.author || "Archive_Admin"} ${hb} ${eb} ${pb}`;
            let ch = typeof wikiParse === 'function' ? wikiParse(d.current_content) : d.current_content; let bh = "";
            if (ib || ih) {
                const sl = d.sub_articles || [];
                const nb = ia ? `<button onclick="window.establishNewNode('${escapeHTML(d.title)}', true)" class="btn-clinical-toggle" style="border-color:var(--hazard-red); color:var(--hazard-red); margin-left:10px;">[POST_NOTICE]</button>` : "";
                const cb = `<button onclick="window.establishNewNode('${escapeHTML(d.title)}')" class="btn-clinical-toggle">[NEW_NODE]</button>`;
                bh = `<div style="margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:15px; display:flex; justify-content:flex-end;"><div>${cb} ${nb}</div></div>
                <table class="clinical-table" style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                    <thead>
                        <tr style="background:#111; border-bottom:2px solid #222; text-align:left;">
                            <th style="padding:10px;">NODE</th>
                            <th style="padding:10px;">AGENT</th>
                            <th style="padding:10px; text-align:right;">TIMESTAMP</th>
                            ${ia ? '<th style="padding:10px; text-align:right;">CONTROL</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>${sl.map(x => {
                        const n = x.classification === 'NOTICE';
                        const r = n ? "rgba(255, 60, 60, 0.05)" : "transparent";
                        const l = n ? 'var(--hazard-red)' : 'var(--accent-cyan)';
                        const ctrl = ia ? `<td style="padding:10px; text-align:right;"><button onclick="event.stopPropagation(); window.adminPurgeArticle('${escapeHTML(x.title)}')" style="background:none; border:none; color:var(--hazard-red); cursor:pointer; font-size:0.65rem;">[PURGE]</button></td>` : '';
                        return `<tr onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(x.title))}')" style="border-bottom:1px solid #111; cursor:pointer; background:${r};">
                            <td style="padding:10px;">${n ? '<span style="background:var(--hazard-red); color:#000; padding:1px 4px; font-size:0.6rem; margin-right:5px; font-weight:bold;">[NOTICE]</span>' : ''} <span style="color:${l};">&gt; ${escapeHTML(x.title.split('/').pop())}</span></td>
                            <td style="padding:10px;">${escapeHTML(x.author)}</td>
                            <td style="padding:10px; text-align:right;">${window.timeAgo(x.updated_at)}</td>
                            ${ctrl}
                        </tr>`
                    }).join('') || `<tr><td colspan="${ia ? 4 : 3}" style="padding:20px; text-align:center;">[SIGNAL_QUIET]</td></tr>`}</tbody>
                </table>`;
                ch = "";
            }
            const co = (ib || ih || !currentUser) ? "" : renderCommentsHTML(d.title, d.comments || []); ab.innerHTML = ch + bh + co;
        } catch (e) { ab.innerHTML = "[Handshake failed.]"; }
        finally { document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove(); }
    }
    async function loadEditor(t) {
        const ab = document.querySelector('.article-body'); document.getElementById('article-title').textContent = `EDITING: ${t}`;
        ab.innerHTML = `<div id="editor-container" style="display:flex; gap:30px; align-items:flex-start;"><div style="flex:1;"><div class="textarea-container" style="position:relative; background:#000; border:1px solid #222;"><textarea id="editor-text" style="width:100%; height:550px; background:transparent; color:var(--text-main); padding:20px; border:none; font-family:var(--font-mono); caret-color:var(--accent-orange); outline:none;" placeholder="[LOADING...]"></textarea><div class="editor-drop-overlay">[DROP_IMAGE_TO_UPLOAD]</div></div><div style="background:#0a0a0a; border:1px solid #111; padding:20px; margin-top:20px;"><label style="display:block; font-size:0.7rem; color:var(--accent-orange); margin-bottom:10px;">[EDIT_SUMMARY]</label><input type="text" id="edit-summary" style="width:100%; background:#000; border:1px solid #222; color:var(--accent-cyan); padding:10px; outline:none;"></div><div style="display:flex; gap:15px; margin-top:20px;"><button onclick="window.transmitEdit('${escapeHTML(t)}')" class="btn-clinical-toggle" style="flex:2; padding:15px; font-weight:bold;">[TRANSMIT]</button><button onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(t))}')" class="btn-clinical-toggle" style="flex:1; padding:15px; color:#888;">[ABORT]</button></div></div><div class="infobox-builder" id="editor-ib-builder"><div style="padding:10px; font-size:0.65rem; color:var(--accent-orange); border-bottom:1px solid #222;">[INFOBOX_CONSTRUCTOR]</div><input type="text" id="ib-title" placeholder="ARCHIVAL_TITLE" class="builder-title-input"><div id="ib-drop-zone" class="builder-drop-zone"><img id="ib-preview" style="display:none;"><div class="builder-placeholder">[DRAG_DROP_IMAGE]</div></div><input type="hidden" id="ib-image-url"><div class="builder-rows" id="ib-rows"><div id="ib-extra-rows"></div><button onclick="window.addInfoboxRow()" class="btn-clinical-toggle" style="width:100%; border:none; border-top:1px solid #222; font-size:0.6rem; padding:8px;">[+ ADD_FIELD]</button></div></div></div>`;
        try {
            const r = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}`); const d = await r.json(); const tx = document.getElementById('editor-text'); tx.value = d.current_content || "";
            const cnt = tx.parentElement; cnt.addEventListener('dragover', (e) => { e.preventDefault(); cnt.classList.add('dragover'); }); cnt.addEventListener('dragleave', () => cnt.classList.remove('dragover')); cnt.addEventListener('drop', (e) => { e.preventDefault(); cnt.classList.remove('dragover'); handleEditorDrop(e, tx); });
            const idz = document.getElementById('ib-drop-zone'); idz.addEventListener('dragover', (e) => { e.preventDefault(); idz.classList.add('dragover'); }); idz.addEventListener('dragleave', () => idz.classList.remove('dragover')); idz.addEventListener('drop', (e) => { e.preventDefault(); idz.classList.remove('dragover'); handleInfoboxDrop(e, document.getElementById('ib-preview'), document.getElementById('ib-image-url')); });
        } catch (e) { } finally { document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove(); }
    }
    async function handleEditorDrop(e, t) { e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f || !f.type.startsWith('image/')) return; const u = await uploadImage(f); if (u) { const tag = `\n[[File:${u}|width=300px|caption=IMAGE_DATA]]\n`; const s = t.selectionStart; t.value = t.value.substring(0, s) + tag + t.value.substring(t.selectionEnd); } }
    async function handleInfoboxDrop(e, i, u) { e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f || !f.type.startsWith('image/')) return; const url = await uploadImage(f); if (url) { i.src = url; i.style.display = 'block'; u.value = url; document.querySelector('.builder-placeholder').style.display = 'none'; } }
    async function uploadImage(f) { const fd = new FormData(); fd.append('file', f); try { const r = await securedFetch(`${API_ENDPOINT}/assets/upload`, { method: 'POST', body: fd }); const d = await r.json(); return d.url; } catch (e) { alert("UPLOAD_FAILED"); return null; } }
    window.addInfoboxRow = () => { const c = document.getElementById('ib-extra-rows'); const d = document.createElement('div'); d.className = 'builder-row'; d.innerHTML = `<input type="text" placeholder="KEY" class="builder-key"> <input type="text" placeholder="VALUE" class="builder-val">`; c.appendChild(d); };
    window.postComment = async (t) => { const c = document.getElementById('new-comment-content').value.trim(); if (!c) return; const b = document.getElementById('transmit-btn'); b.disabled = true; try { const r = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}/comments`, { method: 'POST', body: JSON.stringify({ content: c }) }); if (r.ok) init(); } catch (e) { alert("FAILED"); } finally { b.disabled = false; } };
    window.adminDeleteComment = async (t, i) => { if (!confirm("PURGE?")) return; try { const r = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}/comments/${i}`, { method: 'DELETE' }); if (r.ok) init(); } catch (e) { } };
    window.establishNewNode = (s, n = false) => { const m = n ? "edit&type=notice" : "edit"; const nm = prompt(n ? "NOTICE Title:" : "Node Title:"); if (nm) window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(s + "/" + nm))}?mode=${m}`); };
    async function renderAuthForm(m) {
        const ab = document.querySelector('.article-body'); document.getElementById('article-title').textContent = m === 'login' ? 'AGENT_ID' : 'NEW_AGENT';
        ab.innerHTML = `<div style="max-width:400px; margin:40px auto; background:#0a0a0a; border:1px solid #222; padding:30px; box-shadow:0 0 20px rgba(0,0,0,0.5);"><div style="margin-bottom:25px; text-align:center; font-family:var(--font-mono); color:var(--accent-orange); font-size:0.85rem;">[${m === 'login' ? 'UPLINK' : 'HANDSHAKE'}]</div><div style="display:flex; flex-direction:column; gap:20px;"><div><label style="display:block; font-size:0.7rem; color:var(--text-dim); margin-bottom:8px;">AGENT_ID</label><input type="text" id="auth-username" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:12px; outline:none; font-size:1rem;" autofocus></div><div><label style="display:block; font-size:0.7rem; color:var(--text-dim); margin-bottom:8px;">ACCESS_KEY</label><input type="password" id="auth-password" style="width:100%; background:#000; border:1px solid #333; color:var(--accent-cyan); padding:12px; outline:none; font-size:1rem;"></div><div id="auth-error" style="color:var(--hazard-red); font-size:0.75rem; min-height:1.2rem; text-align:center;"></div><button id="auth-submit-btn" class="btn-clinical-toggle" style="width:100%; padding:15px; font-weight:bold;">${m === 'login' ? '[AUTHENTICATE]' : '[REGISTER]'}</button><div style="text-align:center; margin-top:20px;"><a href="/?mode=${m === 'login' ? 'register' : 'login'}" style="color:var(--text-dim); font-size:0.7rem; text-decoration:none;">[${m === 'login' ? 'NEW_ID' : 'LOGIN'}]</a></div></div></div>`;
        const sb = document.getElementById('auth-submit-btn'); const pi = document.getElementById('auth-password'); const ui = document.getElementById('auth-username'); const er = document.getElementById('auth-error');
        const pa = async () => { const u = ui.value.trim(); const p = pi.value; if (!u || !p) { er.textContent = "INCOMPLETE"; return; } sb.disabled = true; sb.textContent = "WAIT..."; try { const ep = m === 'login' ? '/api/auth/login' : '/api/auth/register'; const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Yomi-Request': 'true' }, body: JSON.stringify({ username: u, password: p }) }); const d = await r.json(); if (r.ok && d.token) { localStorage.setItem('yomi_user', JSON.stringify(d)); currentUser = d; window.navigateTo('/w/Main_Page'); } else er.textContent = d.error || "DENIED"; } catch (e) { er.textContent = "TERMINATED"; } finally { sb.disabled = false; sb.textContent = m === 'login' ? '[AUTHENTICATE]' : '[REGISTER]'; } };
        sb.onclick = pa; pi.onkeydown = (e) => { if (e.key === 'Enter') pa(); }; ui.onkeydown = (e) => { if (e.key === 'Enter') pi.focus(); };
        document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove();
    }
    async function renderHistory(t) {
        const ab = document.querySelector('.article-body'); const mt = document.querySelector('.article-meta');
        document.getElementById('article-title').textContent = `HISTORY: ${t}`;
        ab.innerHTML = '<div class="loading">[DECRYPTING...]</div>';
        try {
            const [hr, ar] = await Promise.all([
                securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}/history`),
                securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}`)
            ]);
            const hd = await hr.json(); const ad = await ar.json();
            if (hd.error) { ab.innerHTML = `[SYSTEM_EXCEPTION]: ${hd.error}`; return; }
            const ia = currentUser?.role === 'admin'; const isAuthor = currentUser?.username === ad.author; const canRollback = ia || isAuthor;
            mt.innerHTML = `<a href="/w/${encodeURIComponent(window.titleToSlug(t))}" class="btn-clinical-toggle" style="font-size:0.65rem;">[BACK]</a>`;
            const revs = hd.revisions || [];
            if (revs.length === 0) { ab.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-dim);">[SIGNAL_QUIET]: No revision records found.</div>'; return; }
            const rb = (rev, i) => canRollback ? (i > 0 ? `<button onclick="event.stopPropagation(); window.rollbackRevision('${escapeHTML(t)}', ${parseInt(rev.id)})" style="background:none; border:1px solid var(--accent-orange); color:var(--accent-orange); cursor:pointer; font-size:0.65rem; padding:3px 8px; font-family:var(--font-mono);">[ROLLBACK]</button>` : `<span style="color:var(--text-dim); font-size:0.65rem;">[CURRENT]</span>`) : '';
            ab.innerHTML = `<table class="clinical-table" style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                <thead><tr style="background:#111; border-bottom:2px solid #222; text-align:left;">
                    <th style="padding:10px;">REV_ID</th><th style="padding:10px;">TIMESTAMP</th><th style="padding:10px;">AGENT</th><th style="padding:10px;">SUMMARY</th>${canRollback ? '<th style="padding:10px; text-align:right;">CONTROL</th>' : ''}
                </tr></thead>
                <tbody>${revs.map((rev, i) => `<tr style="border-bottom:1px solid #111; cursor:pointer;" onclick="window.navigateTo('/w/${encodeURIComponent(window.titleToSlug(t))}?rev=${parseInt(rev.id)}')">
                    <td style="padding:10px; font-family:var(--font-mono); color:var(--accent-cyan);">#${parseInt(rev.id)}</td>
                    <td style="padding:10px;">${escapeHTML(rev.timestamp || '')}</td>
                    <td style="padding:10px;">${escapeHTML(rev.author || '')}</td>
                    <td style="padding:10px; color:var(--text-dim);">${escapeHTML(rev.edit_summary || '-')}</td>
                    ${canRollback ? `<td style="padding:10px; text-align:right;" onclick="event.stopPropagation();">${rb(rev, i)}</td>` : ''}
                </tr>`).join('')}</tbody>
            </table>`;
        } catch(e) { ab.innerHTML = "[Handshake failed.]"; }
        finally { document.documentElement.classList.remove('is-board-loading'); const af = document.getElementById('anti-flicker'); if (af) af.remove(); }
    }
    async function updateSidebarActivity() { try { const r = await fetch(`${API_ENDPOINT}/activity`); const d = await r.json(); const l = document.getElementById('activity-list'); if (l) l.innerHTML = d.map(a => `<div style="margin-bottom:8px; border-bottom:1px solid #111; padding-bottom:4px;"><div style="font-size:0.6rem; color:var(--text-dim);">[${a.type}] ${a.actor}</div><div style="font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><a href="/w/${encodeURIComponent(window.titleToSlug(a.target))}" style="color:var(--accent-cyan);">&gt; ${escapeHTML(a.target.split('/').pop())}</a></div></div>`).join(''); } catch (e) { } }
    window.rollbackRevision = async (t, revId) => { if (!confirm(`[CAUTION]: Rollback "${t}" to revision #${revId}?\nCurrent content will be overwritten.`)) return; try { const r = await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}/rollback`, { method: 'POST', body: JSON.stringify({ rev_id: revId }) }); if (r.ok) { alert('[ROLLBACK_SUCCESS]: Document has been restored.'); window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(t))}`); } else { const d = await r.json(); alert(`FAILED: ${d.error}`); } } catch(e) { alert("NETWORK_ERROR"); } };
    async function init() { const p = decodeURIComponent(window.location.pathname); const u = new URLSearchParams(window.location.search); const m = u.get('mode'); let t = "Main_Page"; if (p.startsWith('/w/')) t = p.substring(3); if (m === 'login' || m === 'register') await renderAuthForm(m); else if (m === 'edit') await loadEditor(t); else if (m === 'history') await renderHistory(t); else await renderArticle(t); updateAuthUI(); updateSidebarActivity(); }
    window.transmitEdit = async (t) => { const c = document.getElementById('editor-text').value; const s = document.getElementById('edit-summary').value; const it = document.getElementById('ib-title').value.trim(); const ii = document.getElementById('ib-image-url').value.trim(); const ic = document.getElementById('ib-caption')?.value || ""; const ty = document.getElementById('ib-type')?.value || ""; const up = new URLSearchParams(window.location.search); const cl = up.get('type') === 'notice' ? 'NOTICE' : 'GENERAL'; let im = ""; if (it || ii) { im = `{{infobox\n| title = ${it}\n| image = ${ii}\n| caption = ${ic}\n| type = ${ty}\n`; document.querySelectorAll('.infobox-builder .builder-key').forEach((k, i) => { const v = document.querySelectorAll('.infobox-builder .builder-val')[i + 2]; if (k.value.trim()) im += `| ${k.value.trim()} = ${v.value.trim()}\n`; }); im += `}}\n\n`; } try { await securedFetch(`${API_ENDPOINT}/article/${encodeURIComponent(window.titleToSlug(t))}`, { method: 'POST', body: JSON.stringify({ content: im + c, edit_summary: s, classification: cl }) }); window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(t))}`); } catch (e) { alert("FAILED"); } };
    window.adminPurgeArticle = async (t) => {
        if (!confirm(`[CRITICAL_WARNING]: PURGE NODE "${t}"? THIS ACTION IS IRREVERSIBLE.`)) return;
        try {
            const r = await securedFetch(`${API_ENDPOINT}/admin/article/purge`, { method: 'DELETE', body: JSON.stringify({ title: t }) });
            if (r.ok) {
                alert("NODE_PURGED");
                const currentPath = decodeURIComponent(window.location.pathname);
                const targetPath = `/w/${window.titleToSlug(t)}`;
                if (currentPath === targetPath) {
                    const lastSlash = t.lastIndexOf('/');
                    const parent = lastSlash !== -1 ? t.substring(0, lastSlash) : "Main_Page";
                    window.navigateTo(`/w/${encodeURIComponent(window.titleToSlug(parent))}`);
                } else {
                    init();
                }
            } else {
                const d = await r.json(); alert(`FAILED: ${d.error}`);
            }
        } catch (e) { alert("NETWORK_ERROR"); }
    };
    init(); setInterval(updateSidebarActivity, 60000);
});
