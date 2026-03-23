INSERT INTO articles (title, current_content, author, classification, threatLevel)
VALUES (
    'Main_Page',
    '<div class="scp-warning-block">
    <div class="scp-warning-header">ACCESS_RESTRICTED</div>
    UNAUTHORIZED ACCESS PROHIBITED. ALL UPLINKS MONITORED.
</div>

{{infobox
| title = CORE_NODE_00
| image = https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300
| type = GATEWAY
| status = ONLINE
}}

- **BROWSE:** [ARCHIVAL_SECTORS]
- **ACCESS:** AUTHORIZED_ONLY
- **PROTOCOL:** CLINICAL_DETACHMENT

== 1. [PROTOCOL : ENGLISH] ==
Secure archive. Clinical detachment mandatory.

== 2. [PROTOCOL : KOREAN] ==
보안 보관소. 객관적 기록 원칙 준수.

== 3. [PROTOCOL : JAPANESE] ==
アーカイブ。客観的記述の徹底。

== 4. ARCHIVAL SECTORS ==
* [[Sector:South_Korea|S1: South Korea]]
* [[Sector:USA|S2: USA]]
* [[Sector:Japan|S3: Japan]]
* [[Sector:India|S4: India]]

== 5. SYSTEM NOTICE ==
GRID_STABLE_99.9%

[[Category:CORE]]',
    'System',
    'CONFIDENTIAL',
    'GREEN'
) ON CONFLICT(title) DO UPDATE SET current_content=excluded.current_content;
