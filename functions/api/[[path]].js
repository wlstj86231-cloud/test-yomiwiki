// functions/api/[[path]].js - Professional Resilient Engine (v2.4.8 Final Fix)

const SECURITY_CONFIG = {
    SESSION_EXPIRY: 86400 * 7,
    SALT_ROUNDS: 100000,
    MAX_TITLE_LENGTH: 255,
    MAX_CONTENT_LENGTH: 500000,
    RATE_LIMIT_WINDOW: 60,
    MAX_WRITE_PER_MIN: 10,
    MAX_COMMENT_PER_MIN: 5
};

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api', '');
    const method = request.method;
    const clientIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";

    const securityHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Yomi-Request",
        "Content-Type": "application/json"
    };

    if (method === "OPTIONS") return new Response(null, { headers: securityHeaders });

    function normalizeTitle(rawTitle) {
        try {
            let decoded = decodeURIComponent(rawTitle || "");
            // Strip trailing /comments if present in title lookup
            if (decoded.toLowerCase().endsWith('/comments')) {
                decoded = decoded.substring(0, decoded.length - 9);
            }
            return decoded.trim().replace(/\s+/g, '_');
        } catch (e) {
            let res = (rawTitle || "").trim().replace(/\s+/g, '_');
            if (res.toLowerCase().endsWith('/comments')) res = res.substring(0, res.length - 9);
            return res;
        }
    }

    async function hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const saltData = encoder.encode(salt || "");
        const passwordData = encoder.encode(password);
        const combined = new Uint8Array(saltData.length + passwordData.length);
        combined.set(saltData);
        combined.set(passwordData, saltData.length);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function base64UrlEncode(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    function base64UrlDecode(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    async function signJWT(payload, secret) {
        const encoder = new TextEncoder();
        const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payloadStr = base64UrlEncode(JSON.stringify(payload));
        const data = encoder.encode(`${header}.${payloadStr}`);
        
        const key = await crypto.subtle.importKey(
            "raw", encoder.encode(secret || "YOMI_FALLBACK_SECRET"),
            { name: "HMAC", hash: "SHA-256" },
            false, ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, data);
        const signatureBytes = new Uint8Array(signature);
        let signatureBinary = "";
        for (let i = 0; i < signatureBytes.byteLength; i++) {
            signatureBinary += String.fromCharCode(signatureBytes[i]);
        }
        const signatureStr = btoa(signatureBinary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        return `${header}.${payloadStr}.${signatureStr}`;
    }

    async function verifySession(token, secret) {
        if (!token) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            
            const encoder = new TextEncoder();
            const data = encoder.encode(`${parts[0]}.${parts[1]}`);
            
            let sigBase64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
            while (sigBase64.length % 4) sigBase64 += '=';
            const signature = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0));
            
            const key = await crypto.subtle.importKey(
                "raw", encoder.encode(secret || "YOMI_FALLBACK_SECRET"),
                { name: "HMAC", hash: "SHA-256" },
                false, ["verify"]
            );
            
            const isValid = await crypto.subtle.verify("HMAC", key, signature, data);
            if (!isValid) return null;

            const payload = JSON.parse(base64UrlDecode(parts[1]));
            if (payload.exp && Date.now() > payload.exp) return null;
            return payload;
        } catch (e) { return null; }
    }

    async function getAgentTier(username) {
        return { level: "I", title: "AGENT" };
    }

    try {
        let resData = null;
        let status = 200;

        // AUTH CHECK FOR WRITE OPERATIONS
        const authHeader = request.headers.get("Authorization");
        const token = authHeader ? authHeader.split(' ')[1] : null;
        const user = await verifySession(token, env.JWT_SECRET);

        // [ULTIMATE_CLEANUP_SCRIPT]
        if (path === '/admin/cleanup-ghosts' && method === "GET") {
            // Use a batch to ensure all commands run in order
            await env.DB.batch([
                env.DB.prepare("PRAGMA foreign_keys = OFF"),
                env.DB.prepare("DELETE FROM revisions WHERE article_id IN (SELECT id FROM articles WHERE title LIKE '%/comments')"),
                env.DB.prepare("DELETE FROM article_chunks WHERE article_id IN (SELECT id FROM articles WHERE title LIKE '%/comments')"),
                env.DB.prepare("DELETE FROM articles WHERE title LIKE '%/comments'"),
                env.DB.prepare("PRAGMA foreign_keys = ON")
            ]);
            return new Response(JSON.stringify({ success: true, message: "ULTIMATE_PURGE_COMPLETE" }), { headers: securityHeaders });
        }

        // 1. ARTICLE FETCH
        if (path.startsWith('/article/') && method === "GET" && !path.endsWith('/history') && !path.endsWith('/comments')) {
            const identifier = path.replace('/article/', '');
            const title = normalizeTitle(identifier);
            const revId = url.searchParams.get('rev');
            const isNumericId = /^\d+$/.test(identifier);
            
            // Special Case: SubSector_Archive Hub
            if (title === 'SubSector_Archive') {
                const { results } = await env.DB.prepare("SELECT id, title, author, updated_at FROM articles WHERE title LIKE 'SubSector:%' AND title NOT LIKE '%/%' AND is_deleted = 0 ORDER BY updated_at DESC").all();
                resData = {
                    title: 'SUB-SECTOR HUB',
                    current_content: '== ACCESSING_ALL_ACTIVE_CHANNELS ==\nBelow is a list of all active sub-sector archival nodes managed by agents.',
                    author: 'Archive_System',
                    updated_at: new Date().toISOString(),
                    sub_articles: results,
                    is_hub: true
                };
            } else {
                let article;
                if (revId) {
                    article = await env.DB.prepare("SELECT a.title, r.content_snapshot as current_content, r.editor_info as author, r.timestamp as updated_at, a.id, a.comments_data FROM revisions r JOIN articles a ON r.article_id = a.id WHERE (a.title = ? OR a.id = ?) AND r.id = ?").bind(title, isNumericId ? parseInt(identifier) : -1, revId).first();
                } else {
                    if (isNumericId) article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(parseInt(identifier)).first();
                    else article = await env.DB.prepare("SELECT * FROM articles WHERE title = ?").bind(title).first();
                }

                if (!article) {
                    status = 404; resData = { error: "RECORD_NOT_FOUND", title: identifier };
                } else {
                    let comments = [];
                    try {
                        comments = JSON.parse(article.comments_data || '[]');
                    } catch (e) { comments = []; }
                    
                    let subArticles = [];
                    const isBoard = (article.title.startsWith('Sector:') || article.title.startsWith('SubSector:')) && !article.title.split(':').pop().includes('/');
                    
                    if (isBoard) {
                        const { results } = await env.DB.prepare("SELECT id, title, author, updated_at, classification FROM articles WHERE title LIKE ? AND title != ? AND is_deleted = 0 ORDER BY CASE WHEN classification = 'NOTICE' THEN 0 ELSE 1 END, updated_at DESC").bind(`${article.title}/%`, article.title).all();
                        subArticles = results;
                    }
                    resData = { ...article, comments, sub_articles: subArticles };
                }
            }
        }

        // 1.1 ARTICLE HISTORY (Revision List)
        else if (path.startsWith('/article/') && path.endsWith('/history') && method === "GET") {
            const titlePart = path.replace(/^\/article\//, '').replace(/\/history$/, '');
            const title = normalizeTitle(titlePart);
            const article = await env.DB.prepare("SELECT id, title FROM articles WHERE title = ?").bind(title).first();
            
            if (!article) {
                status = 404; resData = { error: "NODE_NOT_FOUND" };
            } else {
                const { results } = await env.DB.prepare("SELECT id, editor_info as author, timestamp, edit_summary FROM revisions WHERE article_id = ? ORDER BY timestamp DESC LIMIT 100").bind(article.id).all();
                resData = { title: article.title, revisions: results };
            }
        }

        // 2. SEARCH SUGGEST
        else if (path === '/search/suggest' && method === "GET") {
            const query = url.searchParams.get('q') || "";
            if (!query.trim()) {
                resData = [];
            } else {
                const searchTerm = `%${query}%`;
                const { results } = await env.DB.prepare("SELECT title FROM articles WHERE (title LIKE ? OR current_content LIKE ?) AND is_deleted = 0 LIMIT 10").bind(searchTerm, searchTerm).all();
                resData = results.map(r => r.title);
            }
        }

        // 3. GLOBAL HISTORY (Combined Edit & Comment Feed)
        else if (path === '/history' && method === "GET") {
            const { results } = await env.DB.prepare(`
                SELECT 'edit' as type, a.title, r.timestamp, r.editor_info as author 
                FROM revisions r 
                JOIN articles a ON r.article_id = a.id
                UNION ALL
                SELECT 'comment' as type, article_title as title, timestamp, sender as author
                FROM notifications
                WHERE type = 'comment'
                ORDER BY timestamp DESC LIMIT 30
            `).all();
            resData = results;
        }

        // 4. SIDEBAR RECENT
        else if (path === '/api/articles/recent' && method === "GET") {
            const { results } = await env.DB.prepare("SELECT id, title, updated_at FROM articles WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 10").all();
            resData = results;
        }

        // 5. POST COMMENT (Integrated JSON Storage)
        else if (path.startsWith('/article/') && path.endsWith('/comments') && method === "POST") {
            const titlePart = path.replace(/^\/article\//, '').replace(/\/comments$/, '');
            const title = normalizeTitle(titlePart);
            const { content, parent_id } = await request.json();
            
            const article = await env.DB.prepare("SELECT id, title, comments_data FROM articles WHERE title = ?").bind(title).first();
            if (article) {
                let comments = [];
                try {
                    comments = JSON.parse(article.comments_data || '[]');
                } catch (e) { comments = []; }

                const newComment = {
                    id: Date.now() + Math.random().toString(36).substring(2, 7), // More robust ID
                    author: user ? user.username : 'Anonymous_Agent',
                    content: content,
                    timestamp: new Date().toISOString(),
                    parent_id: parent_id || null
                };
                comments.push(newComment);

                const batch = [
                    env.DB.prepare("UPDATE articles SET comments_data = ?, last_comment_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(comments), article.id),
                    env.DB.prepare("INSERT INTO notifications (target_user, type, sender, article_title, message) VALUES (?, ?, ?, ?, ?)").bind('GLOBAL', 'comment', user ? user.username : 'Anonymous_Agent', article.title, content.substring(0, 50))
                ];
                await env.DB.batch(batch);
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 6. UPDATE ARTICLE (Registered Users Only)
        else if (path.startsWith('/article/') && (method === "POST" || method === "PUT")) {
            if (!user) {
                return new Response(JSON.stringify({ error: "UNAUTHORIZED_CLEARANCE_REQUIRED" }), { status: 401, headers: securityHeaders });
            }
            const title = normalizeTitle(path.replace(/^\/article\//, ''));
            const { content, classification } = await request.json();
            
            // Only admins can set NOTICE classification
            const finalClassification = (classification === 'NOTICE' && user.role !== 'admin') ? 'GENERAL' : (classification || 'GENERAL');

            const batch = [
                env.DB.prepare("INSERT INTO articles (title, current_content, author, classification) VALUES (?, ?, ?, ?) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content, updated_at=CURRENT_TIMESTAMP, author=excluded.author, classification=COALESCE(excluded.classification, articles.classification)").bind(title, content, user.username, finalClassification),
                env.DB.prepare("INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary) SELECT id, ?, ?, ? FROM articles WHERE title = ?").bind(content, user.username, finalClassification === 'NOTICE' ? '[OFFICIAL_NOTICE]' : '', title)
            ];
            await env.DB.batch(batch);
            resData = { success: true };
        }

        // 7. AUTHENTICATION (Login/Register)
        else if ((path.endsWith('/auth/login') || path.endsWith('/auth/register')) && method === "POST") {
            const { username, password } = await request.json();
            if (!username || !password) {
                status = 400; resData = { error: "FIELDS_INCOMPLETE" };
            } else if (path.includes('register')) {
                const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
                if (existing) {
                    status = 409; resData = { error: "IDENTIFIER_ALREADY_EXISTS" };
                } else {
                    const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
                    const passHash = await hashPassword(password, salt);
                    await env.DB.prepare("INSERT INTO users (username, password_hash, salt, role, registration_ip) VALUES (?, ?, ?, 'viewer', ?)").bind(username, passHash, salt, clientIP).run();
                    const payload = { username, role: 'viewer', exp: Date.now() + SECURITY_CONFIG.SESSION_EXPIRY * 1000 };
                    const tokenStr = await signJWT(payload, env.JWT_SECRET);
                    resData = { success: true, username, token: tokenStr, role: 'viewer' };
                }
            } else {
                // Login
                const userRec = await env.DB.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE").bind(username).first();
                if (!userRec) {
                    status = 404; resData = { error: "IDENTIFIER_NOT_FOUND" };
                } else {
                    const passHash = await hashPassword(password, userRec.salt);
                    if (userRec.password_hash === passHash) {
                        const payload = { username: userRec.username, role: userRec.role, exp: Date.now() + SECURITY_CONFIG.SESSION_EXPIRY * 1000 };
                        const tokenStr = await signJWT(payload, env.JWT_SECRET);
                        resData = { success: true, username: userRec.username, token: tokenStr, role: userRec.role };
                    } else {
                        status = 401; resData = { error: "PASSWORD_MISMATCH" };
                    }
                }
            }
        }

        // 8. ADMIN: STATS
        else if (path === '/admin/stats' && method === "GET") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { count: articleCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM articles WHERE is_deleted = 0").first();
            const { count: userCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
            const { count: banCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM bans").first();
            const { count: revCount } = await env.DB.prepare("SELECT COUNT(*) as count FROM revisions").first();
            resData = { stats: { articleCount, userCount, banCount, revCount }, system_status: "OPTIMAL" };
        }

        // 9. ADMIN: AUDIT LOGS
        else if (path === '/admin/audit-logs' && method === "GET") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { results } = await env.DB.prepare(`
                SELECT 'EDIT' as type, editor_info as actor, a.title as target, edit_summary as detail, r.timestamp FROM revisions r JOIN articles a ON r.article_id = a.id
                UNION ALL
                SELECT 'BAN' as type, banned_by as actor, target_value as target, reason as detail, timestamp FROM bans
                UNION ALL
                SELECT 'SEC' as type, ip_address as actor, action as target, 'System security check' as detail, timestamp FROM ip_logs
                ORDER BY timestamp DESC LIMIT 50
            `).all();
            resData = results;
        }

        // 10. ADMIN: BANS
        else if (path === '/admin/bans' && method === "GET") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { results } = await env.DB.prepare("SELECT * FROM bans ORDER BY timestamp DESC").all();
            resData = results;
        }

        else if (path === '/admin/ban' && method === "POST") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { target_user, target_ip, reason } = await request.json();
            const batch = [];
            if (target_user) batch.push(env.DB.prepare("INSERT OR REPLACE INTO bans (target_type, target_value, reason, banned_by) VALUES ('user', ?, ?, ?)").bind(target_user, reason || "Protocol Violation", user.username));
            if (target_ip) batch.push(env.DB.prepare("INSERT OR REPLACE INTO bans (target_type, target_value, reason, banned_by) VALUES ('ip', ?, ?, ?)").bind(target_ip, reason || "Protocol Violation", user.username));
            if (batch.length > 0) await env.DB.batch(batch);
            resData = { success: true };
        }

        else if (path.startsWith('/admin/ban/') && method === "DELETE") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const banId = path.split('/')[3];
            await env.DB.prepare("DELETE FROM bans WHERE id = ?").bind(banId).run();
            resData = { success: true };
        }

        // 11. ADMIN: ARTICLE CONTROL
        else if (path === '/admin/article/lock' && method === "POST") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { title } = await request.json();
            await env.DB.prepare("UPDATE articles SET is_locked = 1 - is_locked WHERE title = ?").bind(normalizeTitle(title)).run();
            resData = { success: true };
        }

        else if (path === '/admin/article/purge' && method === "DELETE") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const { title } = await request.json();
            const normalized = normalizeTitle(title);
            const article = await env.DB.prepare("SELECT id FROM articles WHERE title = ?").bind(normalized).first();
            if (article) {
                await env.DB.batch([
                    env.DB.prepare("DELETE FROM revisions WHERE article_id = ?").bind(article.id),
                    env.DB.prepare("DELETE FROM article_chunks WHERE article_id = ?").bind(article.id),
                    env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(article.id)
                ]);
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 11.1 ADMIN: DELETE COMMENT
        else if (path.includes('/comments/') && method === "DELETE") {
            if (user?.role !== 'admin') return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 403, headers: securityHeaders });
            const match = path.match(/^\/article\/(.+?)\/comments\/(.+)$/);
            if (!match) return new Response(JSON.stringify({ error: "INVALID_PATH" }), { status: 400, headers: securityHeaders });
            
            const titlePart = match[1];
            const commentId = match[2];
            const title = normalizeTitle(titlePart);

            const article = await env.DB.prepare("SELECT id, comments_data FROM articles WHERE title = ?").bind(title).first();
            if (article) {
                let comments = JSON.parse(article.comments_data || '[]');
                comments = comments.filter(c => String(c.id) !== String(commentId));
                await env.DB.prepare("UPDATE articles SET comments_data = ? WHERE id = ?").bind(JSON.stringify(comments), article.id).run();
                resData = { success: true };
            } else { status = 404; resData = { error: "NODE_NOT_FOUND" }; }
        }

        // 12. ASSETS (Upload & Serve)
        else if (path === '/assets/upload' && method === "POST") {
            if (!user) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: securityHeaders });

            try {
                const formData = await request.formData();
                const file = formData.get('file');
                if (!file || !(file instanceof File)) return new Response(JSON.stringify({ error: "INVALID_FILE" }), { status: 400, headers: securityHeaders });

                // 3.0MB Limit Check
                if (file.size > 3 * 1024 * 1024) return new Response(JSON.stringify({ error: "FILE_TOO_LARGE", message: "Maximum size is 3.0MB" }), { status: 413, headers: securityHeaders });

                if (!env.ASSETS_BUCKET) {
                    return new Response(JSON.stringify({ error: "R2_BUCKET_NOT_BOUND", message: "Storage system is not configured." }), { status: 500, headers: securityHeaders });
                }

                // Security: Force Image Content-Type
                if (!file.type.startsWith('image/')) {
                    return new Response(JSON.stringify({ error: "UNAUTHORIZED_FILE_TYPE", message: "Only archival images are permitted." }), { status: 403, headers: securityHeaders });
                }

                const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const uploadKey = `archives/images/${fileName}`;
                
                await env.ASSETS_BUCKET.put(uploadKey, file.stream(), {
                    httpMetadata: { contentType: file.type }
                });

                const publicUrl = `/api/assets/${fileName}`;
                await env.DB.prepare("INSERT INTO assets (filename, url, uploader) VALUES (?, ?, ?)").bind(fileName, publicUrl, user.username).run();
                
                resData = { success: true, url: publicUrl, filename: fileName };
            } catch (uploadErr) {
                return new Response(JSON.stringify({ error: "UPLOAD_PROCESS_FAILED", message: uploadErr.message }), { status: 500, headers: securityHeaders });
            }
        }

        else if (path.startsWith('/assets/') && method === "GET") {
            const fileName = path.split('/')[2];
            const object = await env.ASSETS_BUCKET.get(`archives/images/${fileName}`);
            if (!object) return new Response("SIGNAL_NOT_FOUND", { status: 404 });
            
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set("etag", object.httpEtag);
            headers.set("Cache-Control", "public, max-age=31536000");
            return new Response(object.body, { headers });
        }

        else { status = 404; resData = { error: "PATH_NOT_FOUND" }; }

        return new Response(JSON.stringify(resData), { status, headers: securityHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: "CRITICAL_SYSTEM_ERROR", message: err.message }), { status: 500, headers: securityHeaders });
    }
}
