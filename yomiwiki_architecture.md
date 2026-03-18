**타깃:** 미국 오컬트 매니아 (영문판)
**목표:** 나무위키 아키텍처 기반 다크 테마 위키 시스템 (yomiwiki.com 전용 최적화)

## 1. 계획서 (Project Blueprint)
코드가 엉키지 않도록 아키텍처를 초기화하고, 오직 `yomiwiki.com` 도메인 서비스 품질에 맞춰 한 번에 하나의 기능(Step)만 완벽하게 고도화합니다.

* **1단계 (캐시 제어 및 환경 동기화):** 커스텀 도메인(yomiwiki.com)의 강력한 캐싱으로 인한 업데이트 지연 현상(`pages.dev`와 화면이 달라지는 문제)을 해결하고 DB 연결을 정상화한다.
* **2단계 (예정):** 프론트엔드 라우팅 및 렌더링 안정성 확보
* **3단계 (예정):** 백엔드 API 및 DB 쿼리 최적화
* **4단계 (예정):** 오컬트 위키 코어 기능 고도화

## 2. 맥락노트 (Contextual Notes)
* **[2026-03-18] 도메인 불일치 이슈:** `test-yomiwiki.pages.dev`는 `max-age=0`으로 최신 상태를 즉시 반영하지만, 커스텀 도메인 `yomiwiki.com`은 Cloudflare Edge 캐싱(`max-age=14400`)이 적용되어 사용자가 구버전의 CSS/JS를 보게 됨. 이를 해결하기 위해 `public/_headers`를 도입하여 강제 캐시 무효화(Cache-Busting)를 적용.

## 3. 작업 체크리스트 (One Step at a Time)

### 🚀 Step 1: 캐시 제어 및 환경 동기화 (Cache & DB Sync)
- [x] 1. `public/_headers` 파일을 생성하여 yomiwiki.com의 정적 자산(CSS, JS, HTML) 캐시 만료 시간을 0으로 강제 설정 (브라우저 캐시로 인한 구버전 노출 방지)
- [ ] 2. (안내) Cloudflare 대시보드에서 `yomiwiki.com` 프로덕션(Production) 환경에 D1 데이터베이스(yomi-db-prod)가 정확히 바인딩되어 있는지 확인하고, `npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql` 명령어를 통해 운영 DB 테이블을 생성하도록 유도.
