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
    is_deleted INTEGER DEFAULT 0
);

-- article_chunks: 대용량 문서 본문 분할 저장용 (Step 39)
CREATE TABLE IF NOT EXISTS article_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    chunk_order INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY(article_id) REFERENCES articles(id)
);
CREATE INDEX IF NOT EXISTS idx_chunks_article ON article_chunks(article_id);

-- revisions: 문서 변경 이력
CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    content_snapshot TEXT NOT NULL,
    editor_info TEXT NOT NULL,
    edit_summary TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(article_id) REFERENCES articles(id)
);
-- 33. 히스토리 및 사용자 기여 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_revisions_article_id ON revisions(article_id);
CREATE INDEX IF NOT EXISTS idx_revisions_timestamp ON revisions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_editor ON revisions(editor_info, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_article_history ON revisions(article_id, timestamp DESC);

-- 33. 문서 상태 및 작성자 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(is_deleted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);

-- comments: 토론 스레드
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER DEFAULT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_id) REFERENCES comments(id)
);
-- 33. 토론 로딩 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_article_title ON comments(article_title);

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
    role TEXT CHECK(role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

-- [SEED DATA: Initial Archival Handshake]
INSERT INTO articles (title, current_content, author, classification, threatLevel)
VALUES (
    'Main_Page',
    '{{infobox
| title = YomiWiki Archival Gateway
| image = https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300
| caption = GATEWAY_TERMINAL_NODE_7
| type = SYSTEM_CORE
}}

== WELCOME_AGENT ==
Welcome to the '''YomiWiki Archival Gateway'''. This is a secure repository for occult, paranormal, and clinical data. All transmissions are monitored.

== SYSTEM_NOTICE ==
[CLINICAL]
The archival grid is currently operating at 99.9% efficiency. Unauthorized attempts to decrypt Tier IV records will result in immediate IP termination.
[/CLINICAL]

== ARCHIVAL_PROTOCOLS ==
* [[Help:Protocols|Maintain Clinical Detachment]]
* [[Help:Taboos|Avoid Emotional Bias]]
* [[Help:Editing|Report Anomalies Immediately]]

[[Category:CORE_SYSTEM]]',
    'Archive_System',
    'CONFIDENTIAL',
    'GREEN'
) ON CONFLICT(title) DO NOTHING;

INSERT INTO revisions (article_id, content_snapshot, editor_info, edit_summary)
SELECT id, current_content, author, 'INITIAL_HANDSHAKE' FROM articles WHERE title = 'Main_Page'
ON CONFLICT DO NOTHING;
