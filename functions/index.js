import { layout, html, esc, searchForm, pageSchema, AREAS, SITE, bori } from './_lib/site.js';
import { entries } from './_lib/entries.js';
import { terms, termById } from './_lib/glossary.js';

const VERIFY = '<meta name="google-adsense-account" content="ca-pub-5877883031077615"><meta name="google-site-verification" content="tSlD6MvlQAUKN3XASMGLU-vJTeaoUxCSFg-tn3JMmvk">';
const ANALYTICS = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-M3HSKLDR');</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-V4TQXXND3M"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-V4TQXXND3M');</script>`;
const GTM_NOSCRIPT = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M3HSKLDR" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>';

const POPULAR = ['auction-price', 'broker', 'commission', 'net-weight', 'per-kg', 'standard-product', 'origin-label', 'milling-date', 'hour-meter', 'pto', 'prepay', 'third-party-account'];
const EXAMPLES = ['중도매인', '10kg 상자 kg당', '도정일', '콤바인 점검', '선입금', '원산지 표시'];

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (q !== null) return Response.redirect(`${url.origin}/search?q=${encodeURIComponent(q.slice(0, 60))}`, 302);

  const recent = [...entries].filter(e => e.published === '2026-10-26');
  const body = `<section class="hero"><p class="kicker">현장에서 쓰는 거래 사전</p><h1>${SITE}</h1><p class="hero-desc">농산물·농기계 거래에서 쓰는 말을 공식 기준과 현장 확인 순서로 풀어 쓴 사전입니다. 등급·표시·kg 환산부터 도매시장 경매, 중고 농기계 점검, 직거래 결제 용어까지 찾을 수 있습니다.</p>${searchForm({ id: 'home-q', big: true })}<p class="examples"><span>예시</span>${EXAMPLES.map(x => `<a href="/search?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</p><a class="hero-tool" href="/knowledge/kg-conversion#calc"><div><strong>kg당 가격 계산기</strong><span>상자·망·단 가격을 포장재를 뺀 1kg당 가격으로 바꿔 비교</span></div><b aria-hidden="true">→</b></a></section>
<section class="home-section" aria-labelledby="areas-title"><div class="section-head"><h2 id="areas-title">분야별로 찾아보기</h2><a href="/knowledge">전체 문서 ${entries.length}개 →</a></div><div class="area-blocks">${AREAS.map(a => {
    const list = entries.filter(e => e.area === a.key);
    const n = terms.filter(t => t.area === a.key).length;
    return `<section class="area-box" aria-labelledby="ab-${a.key}"><h3 id="ab-${a.key}"><a href="/knowledge#${a.key}">${esc(a.name)}</a></h3><p>${esc(a.desc)}</p><ul>${list.map(e => `<li><a href="/knowledge/${e.slug}">${esc(e.short)}</a></li>`).join('')}</ul>${n ? `<a class="area-more" href="/glossary#area-${a.key}">이 분야 용어 ${n}개</a>` : ''}</section>`;
  }).join('')}</div></section>
<section class="home-section" aria-labelledby="terms-title"><div class="section-head"><h2 id="terms-title">자주 찾는 용어</h2><a href="/glossary">용어 사전 ${terms.length}개 전체 →</a></div><dl class="popular-terms">${POPULAR.map(id => termById[id]).filter(Boolean).map(t => `<div><dt><a href="/glossary#${t.id}">${esc(t.term)}</a></dt><dd>${esc(t.def.split('. ')[0].replace(/\.$/, ''))}.</dd></div>`).join('')}</dl></section>
${recent.length ? `<section class="home-section" aria-labelledby="new-title"><div class="section-head"><h2 id="new-title">새로 추가한 문서</h2></div><ul class="doc-list">${recent.map(e => `<li><a href="/knowledge/${e.slug}"><strong>${esc(e.title)}</strong><span>${esc(e.description)}</span></a></li>`).join('')}</ul></section>` : ''}
<section class="home-section how" aria-labelledby="how-title"><h2 id="how-title">이 사전을 만드는 방식</h2><ul><li><strong>공식 원문이 기준입니다.</strong> 국가법령정보센터의 법령, 국립농산물품질관리원·농촌진흥청·한국환경공단 등 기관 자료를 먼저 확인하고, 문서마다 출처를 기관·주소·확인일과 함께 적습니다.</li><li><strong>날짜를 숨기지 않습니다.</strong> 문서마다 게시일과 최종 확인일을 표시합니다. 기준은 바뀔 수 있으니 거래 전 원문을 다시 확인하세요.</li><li><strong>문서 끝에는 현장 확인 목록과 “범위와 한계”가 있습니다.</strong> 무엇을 확인하고, 어떤 판단은 어느 기관에 물어야 하는지 함께 적습니다.</li><li><strong>누가 만드나요.</strong> 보리장터 운영사 제이 미디어의 편집팀이 작성·관리합니다. 초안 작성과 자료 대조에 AI 도구를 활용하며, 게시 내용의 책임은 운영사에 있습니다. <a href="/editorial-policy">편집 원칙</a> · <a href="/about">소개</a></li><li><strong>틀린 곳은 고칩니다.</strong> 오류나 빠진 용어는 <a href="/contact">문의·정정 요청</a>으로 알려주세요. 고친 내용은 <a href="/corrections">수정 기록</a>에 남깁니다.</li></ul></section>
<section class="home-section bori-line" aria-labelledby="bori-title"><h2 id="bori-title">거래 준비가 끝났다면</h2><p>같은 동네 농산물·농기계 글과 농기계 운송 업체는 보리장터에서 볼 수 있습니다. 보리장터는 농산물 거래사전을 운영하는 J MEDIA의 거래 서비스입니다.</p><p class="bori-links"><a href="${bori('/?category=PRODUCE', 'home-produce')}">농산물 글 보기</a><a href="${bori('/?category=MACHINERY', 'home-machinery')}">중고 농기계 글 보기</a><a href="${bori('/?category=TRANSPORT', 'home-transport')}">농기계 운송 업체 보기</a></p></section>`;

  const schema = pageSchema({ path: '/', name: SITE, description: '농산물 등급·표시사항·kg 환산·보관·출하·도매시장 경매·중고 농기계 점검·직거래 용어를 공식 기준으로 설명하는 사전', modified: '2026-10-26' });
  return html(layout({
    fullTitle: `${SITE} | 농산물·농기계 거래 용어와 현장 확인 기준`,
    description: '농산물 등급·선별, 표시사항, 포장 단위·kg 환산, 보관·출하, 도매시장 경매 용어, 중고 농기계 점검, 직거래 결제 용어를 공식 기준과 현장 확인 목록으로 찾는 사전입니다.',
    path: '/', schema, body, extraHead: VERIFY + ANALYTICS, bodyStart: GTM_NOSCRIPT
  }));
}
