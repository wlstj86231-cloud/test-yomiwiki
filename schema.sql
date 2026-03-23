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
