# 농산물 거래사전 (yomiwiki.com)

농산물·농기계 거래에서 쓰는 말을 공식 기준과 현장 확인 순서로 풀어 쓴 사전입니다. 운영: 제이 미디어(J MEDIA, 보리장터 운영사). 운영자 정보는 `functions/_lib/site.js`의 `OPERATOR`에 한 번만 적고, 보리장터 소개·jnewmedia.com에 있는 사실만 씁니다.

## 구조
- `functions/` — Cloudflare Pages Functions. 모든 HTML 페이지를 서버에서 렌더링합니다.
  - `_lib/site.js` 공통 레이아웃·운영자 정보·하단(운영자 줄)·작성·관리 표시(byline)·JSON-LD 그래프(Organization·WebSite)·분야(AREAS)·보리장터 UTM·자매 사이트 링크
  - `_lib/entries.js` 지식 문서 데이터(분야, 본문, 현장 확인 목록, 범위와 한계, 출처·확인일, 수정 기록, 보리장터/자매 사이트 연결)와 합친 문서의 301 대상(`MOVED`)
  - `_lib/glossary.js` 용어 사전 데이터, `_lib/search.js` 문서·용어 검색
  - `index.js`(홈), `knowledge/[[slug]].js`(전체 문서·각 문서), `glossary.js`, `search.js`, `sitemap.xml.js`, `feed.xml.js`, 운영 정보 페이지(`_lib/policy.js`: 소개·문의·편집 원칙·정정 정책과 수정 기록·개인정보처리방침·이용약관·면책)
  - `api/[[path]].js`, `w/[[path]].js` — 이전 사이트 주제의 위키 API·문서 주소. 410으로 종료 안내만 합니다.
- `public/` — 정적 파일(`knowledge.css`, `404.html`, `mn/` 몽골어 자료, 검증 파일, `ads.txt`, `robots.txt`, `_redirects`).

## 문서 추가·수정
1. `functions/_lib/entries.js`에 문서를 추가하거나 고칩니다. 사실(숫자·기한·법령 내용)은 공식 원문에서 확인한 것만 적고 `sources`(기관·제목·주소)에 넣습니다.
2. `published`는 그 주소가 처음 공개된 날(git 기록), `sourceChecked`는 출처 원문을 실제로 다시 대조한 날입니다. 날짜를 앞당기지 않습니다.
3. `checks`(현장 확인 목록)와 `limits`(범위와 한계: 다루지 않는 것, 어느 기관에 확인할지)는 반드시 채웁니다. 내용을 바꾸면 `history`에 날짜와 함께 남깁니다.
4. 짧은 문서를 새로 만들기보다 관련 문서에 합칩니다. 문서를 합치면 `MOVED`에 이전 주소를 넣어 301로 연결합니다.
5. 관련 용어는 `functions/_lib/glossary.js`에 추가하고 `link`로 문서를 연결합니다.
6. `public/knowledge.css`를 고치면 `node scripts/sync-css.mjs`를 실행합니다.
7. 작성자 표시는 “제이 미디어 편집팀”만 씁니다. 확보하지 않은 현장 경험·전문가 감수·후기를 표시하지 않습니다.

## 몽골어 자료
`public/mn/`은 `npm run build:mn`으로 만듭니다. 몽골어는 Google AdSense 지원 언어가 아니어서 광고 없이 noindex로 두고 사이트맵에서 뺍니다(주소는 그대로 유지).

## 검증
```bash
node scripts/check-c2c-howto-inbound.mjs
node scripts/verify-mn.mjs
```

## 배포
`main`에 push하면 GitHub Actions가 `wrangler pages deploy public --project-name=test-yomiwiki`로 배포합니다.
