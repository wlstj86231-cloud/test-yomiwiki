# 농산물 거래사전 (yomiwiki.com)

농산물·농기계 거래에서 쓰는 말을 공식 기준과 현장 확인 순서로 풀어 쓴 사전입니다. 운영: J MEDIA(보리장터 운영사).

## 구조
- `functions/` — Cloudflare Pages Functions. 모든 HTML 페이지를 서버에서 렌더링합니다.
  - `_lib/site.js` 공통 레이아웃·분야(AREAS)·보리장터 UTM·자매 사이트 링크
  - `_lib/entries.js` 지식 문서 데이터(분야, 본문, 현장 확인 목록, 출처·확인일, 보리장터/자매 사이트 연결)
  - `_lib/glossary.js` 용어 사전 데이터, `_lib/search.js` 문서·용어 검색
  - `index.js`(홈), `knowledge/[[slug]].js`(전체 문서·각 문서), `glossary.js`, `search.js`, `sitemap.xml.js`, `feed.xml.js`, 운영 정보 페이지(`_lib/policy.js`)
  - `api/[[path]].js`, `w/[[path]].js` — 이전 사이트 주제의 위키 API·문서 주소. 410으로 종료 안내만 합니다.
- `public/` — 정적 파일(`knowledge.css`, `404.html`, `mn/` 몽골어 자료, 검증 파일, `ads.txt`, `robots.txt`, `_redirects`).

## 문서 추가·수정
1. `functions/_lib/entries.js`에 문서를 추가하거나 고칩니다. 사실(숫자·기한·법령 내용)은 공식 원문에서 확인한 것만 적고 `sources`에 링크, `sourceChecked`에 확인일을 넣습니다.
2. 문서 끝 `checks`(현장 확인 목록)는 반드시 채웁니다.
3. 관련 용어는 `functions/_lib/glossary.js`에 추가하고 `link`로 문서를 연결합니다.

## 검증
```bash
node scripts/check-c2c-howto-inbound.mjs
node scripts/verify-mn.mjs
```

## 배포
`main`에 push하면 GitHub Actions가 `wrangler pages deploy public --project-name=test-yomiwiki`로 배포합니다.
