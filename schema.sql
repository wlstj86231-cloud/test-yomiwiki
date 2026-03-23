-- articles: 문서 본문 및 최신 메타데이터 (title은 UNIQUE이므로 자동 인덱스 생성됨)
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL COLLATE NOCASE,
    current_content TEXT NOT NULL,
    author TEXT DEFAULT 'Archive_Admin',
    classification TEXT,
    location TEXT,
    threatLevel TEXT,
    categories TEXT,
    likes INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_locked INTEGER DEFAULT 0,
    is_chunked INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    comments_data TEXT DEFAULT '[]', -- Added for integrated comments (v3.0)
    last_comment_at DATETIME -- Added to track recent discussion activity
);
-- 35. 분류 기반 조회 성능 향상을 위한 인덱스 (Item 60)
CREATE INDEX IF NOT EXISTS idx_articles_classification ON articles(classification);
CREATE INDEX IF NOT EXISTS idx_articles_last_comment ON articles(last_comment_at DESC);

-- article_chunks: 대용량 문서 본문 분할 저장용 (Step 39)
CREATE TABLE IF NOT EXISTS article_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    chunk_order INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY(article_id) REFERENCES articles(id)
);
CREATE INDEX IF NOT EXISTS idx_chunks_article ON article_chunks(article_id);

-- revisions: 문서 수정 이력 (역사)
CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    content_snapshot TEXT NOT NULL,
    editor_info TEXT NOT NULL,
    edit_summary TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(article_id) REFERENCES articles(id)
);
-- 34. 역사 및 기여도 조회를 위한 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_revisions_article_history ON revisions(article_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_editor_activity ON revisions(editor_info, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_timestamp_sort ON revisions(timestamp DESC);

-- 33. 문서 상태 및 작성자 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(is_deleted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);

-- reports: 콘텐츠 신고 내역
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    reporter_ip TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 33. 관리자 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);

-- users: 요원(사용자) 정보
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT, -- Added for cryptographic salting (v3.1)
    role TEXT CHECK(role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
    registration_ip TEXT, -- Added to restrict one account per IP
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_ip ON users(registration_ip);

-- ip_logs: 보안 감시 로그
CREATE TABLE IF NOT EXISTS ip_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    action TEXT NOT NULL,
    target_article TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 33. Rate Limiting 및 보안 감사를 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_ip_logs_ip_action_time ON ip_logs(ip_address, action, timestamp);

-- assets: 업로드된 자산 메타데이터
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    uploader TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 33. 자산 로딩 최적화
CREATE INDEX IF NOT EXISTS idx_assets_timestamp ON assets(timestamp DESC);

-- error_logs: 500 서버 에러 로그 수집 (Step 62)
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    path TEXT,
    method TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON error_logs(timestamp DESC);

-- bans: 차단된 IP 및 사용자 목록 (Step 82)
CREATE TABLE IF NOT EXISTS bans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT CHECK(target_type IN ('ip', 'user')) NOT NULL,
    target_value TEXT NOT NULL,
    reason TEXT,
    banned_by TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bans_target ON bans(target_type, target_value);
-- notifications: 사용자 알림 시스템 (Step 86)
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_user TEXT NOT NULL,
    type TEXT NOT NULL, -- 'edit', 'reply'
    sender TEXT,
    article_title TEXT,
    comment_id INTEGER,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(target_user, is_read, timestamp DESC);

-- editing_sessions: 실시간 동시 편집자 추적 (Step 88)
CREATE TABLE IF NOT EXISTS editing_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_title TEXT NOT NULL,
    username TEXT NOT NULL,
    last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_title, username)
);
CREATE INDEX IF NOT EXISTS idx_editing_article ON editing_sessions(article_title);

-- links: 문서 간의 내부 링크 및 역링크 추적용 (Step 4-1)
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_title TEXT NOT NULL,
    to_title TEXT NOT NULL,
    UNIQUE(from_title, to_title)
);
CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_title);
CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_title);

-- [SEED DATA: Initial Archival Handshake]
INSERT INTO articles (title, current_content, author, classification, threatLevel)
VALUES (
    'Main_Page',
    '<div class="scp-warning-block">
    <div class="scp-warning-header">ACCESS_DENIED_IF_UNVERIFIED</div>
    YOU ARE ATTEMPTING TO ACCESS THE YOMIWIKI CORE ARCHIVE. ALL TRANSMISSIONS ARE MONITORED.
</div>

{{infobox
| title = YomiWiki_Node_00
| image = https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300
| type = CORE_TERMINAL
| status = ACTIVE_UPLINK
}}

This node serves as the primary archival point for paranormal and occult data.
- **Browse:** Use [ARCHIVAL_SECTORS] below.
- **Access:** Verified Agents only.
- **Safety:** Report signal leakage immediately.

== 1. [PROTOCOL : ENGLISH] ==
Secure repository. Clinical detachment mandatory.

== 2. [PROTOCOL : KOREAN] ==
보안 보관소. 모든 기록은 객관적으로 작성하십시오.

== 3. [PROTOCOL : JAPANESE] ==
アーカイブ。客観的な記述を徹底してください。

== 4. ARCHIVAL SECTORS ==
* [[Sector:South_Korea|Sector 1: South Korea]]
* [[Sector:USA|Sector 2: USA]]
* [[Sector:Japan|Sector 3: Japan]]
* [[Sector:India|Sector 4: India]]

== 5. SYSTEM NOTICE ==
Grid integrity: 99.9%. Signal stable.

[[Category:CORE_SYSTEM]]',
    'Archive_System',
    'CONFIDENTIAL',
    'GREEN'
) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content;
-- [SEED DATA: Regional Sectors (Auto-Activate Boards)]
INSERT INTO articles (title, current_content, author, classification) VALUES 
('Sector:South_Korea', '== SECTOR 1: SOUTH KOREA ==\n[CLINICAL]\nMonitoring active anomalies in the Korean Peninsula.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:USA', '== SECTOR 2: UNITED STATES ==\n[CLINICAL]\nMonitoring federal and anomalous activities in North America.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:Japan', '== SECTOR 3: JAPAN ==\n[CLINICAL]\nTracking localized phenomena in the Japanese archipelago.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:India', '== SECTOR 4: INDIA ==\n[CLINICAL]\nMonitoring subcontinental grid fluctuations.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:China', '== SECTOR 5: CHINA ==\n[CLINICAL]\nMainland surveillance and archival data.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:Australia', '== SECTOR 6: AUSTRALIA ==\n[CLINICAL]\nOceanic and outback anomalies detected.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:France', '== SECTOR 7: FRANCE ==\n[CLINICAL]\nEuropean command node active.\n[/CLINICAL]', 'SYSTEM', 'RESTRICTED'),
('Sector:North_Korea', '== SECTOR 8: NORTH KOREA ==\n[CLINICAL]\nEXTREME HAZARD: Proceed with absolute caution. Signal often jammed.\n[/CLINICAL]', 'SYSTEM', 'SECRET')
ON CONFLICT(title) DO NOTHING;

INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary)
SELECT id, current_content, author, 'INITIAL_HANDSHAKE' FROM articles
WHERE title IN ('Main_Page', 'Sector:South_Korea', 'Sector:USA', 'Sector:Japan', 'Sector:India', 'Sector:China', 'Sector:Australia', 'Sector:France', 'Sector:North_Korea')
ON CONFLICT DO NOTHING;

-- [SEED DATA: Authorized Agent Creation]
-- User ID: 021017, Password: 20021017 (Hashed via SHA-256)
INSERT INTO users (username, password_hash, role, registration_ip)
VALUES ('021017', 'e75da086743c25092c9ed9b23cc79bedeee3f72360bad564214bf911b9eac8b1', 'viewer', '127.0.0.1')
ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash, role=excluded.role;

-- User ID: YOMIWIKI, Password: yomiwikiadmin (Hashed via SHA-256)
INSERT INTO users (username, password_hash, role, registration_ip)
VALUES ('YOMIWIKI', 'a1d28f6b8c0d640884a127a2b981135478e87e0ccee54a1531a627aa1adfe11c', 'admin', '127.0.0.1')
ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash, role=excluded.role;
