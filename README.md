

# 👁️ YomiWiki V2: The Occult Archive

**YomiWiki V2**는 미국 오컬트 매니아를 타깃으로 한 고성능 다크 테마 위키 시스템입니다. 나무위키의 사용자 경험을 계승하면서도, 클라우드 네이티브 아키텍처와 강력한 보안 엔진을 탑재하여 재설계되었습니다.

## 🌌 Project Overview
- **Objective:** 미국 오컬트 커뮤니티 전용 임상 보고서 및 기괴한 기록 보관소 구축.
- **Visual Identity:** 'Clinical Dark' 테마, 글리치 효과, 모노스페이스 폰트를 활용한 기밀 문서 컨셉.
- **Core Architecture:** Cloudflare Pages (Frontend) + Functions (Backend API) + D1 (SQL Database).

## 🔒 Security Protocols (Implemented)
보안 및 무결성을 위해 다음 계층이 구축되어 있습니다:
1. **Identity & Auth:** PBKDF2 단방향 해싱 기반 비밀번호 보호 및 HMAC 서명 세션 토큰 시스템.
2. **Access Control:** Admin/Editor/Viewer 등급별 API 접근 제어 로직.
3. **Attack Prevention:** CSRF 방어용 Custom Header 검증, Rate Limiting (IP당 요청 제한), XSS 원천 차단(HTML Entity Escape).
4. **Data Integrity:** 편집 충돌(409 Conflict) 감지 및 수동 병합 가이드 UI.

## 🛠️ Tech Stack
- **Frontend:** Vanilla JS, CSS3 (Theme Variables), HTML5.
- **Backend:** Cloudflare Workers (Functions / API Engine).
- **Storage:** Cloudflare D1 (Relational DB), Cloudflare R2 (Asset Bucket).
- **Deployment:** GitHub Actions CI/CD Pipeline.

## 🚀 Local Development
로컬 환경에서 개발을 진행하려면 아래 단계를 따르세요.

### 1. Prerequisites
- Node.js (Latest LTS)
- Cloudflare Wrangler CLI (`npm install -g wrangler`)

### 2. Installation
```bash
git clone <repository-url>
cd test-yomiwiki
npm install
```

### 3. Database Setup (Local)
```bash
# 스키마를 로컬 D1 에뮬레이터에 적용
npx wrangler d1 execute DB --local --file=./schema.sql
```

### 4. Running Dev Server
```bash
npm run dev
```
서버는 `http://localhost:8788`에서 실행됩니다. API 요청 시 자동으로 로컬 D1 및 R2 바인딩이 활성화됩니다.

## 📁 Directory Structure
- `/public`: 프론트엔드 자산 (HTML, CSS, Parser, Client Logic)
- `/functions/api`: 백엔드 API 핸들러 (보안 엔진 및 DB 로직)
- `schema.sql`: D1 데이터베이스 구조 정의
- `wrangler.toml`: Cloudflare 환경 설정

---
*본 시스템은 비인가된 전송을 감지하고 차단합니다. 모든 활동은 중앙 로그에 기록됩니다.*
