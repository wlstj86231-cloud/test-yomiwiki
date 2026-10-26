// Shared layout and constants for 농산물 거래사전 (yomiwiki.com).
import { CSS } from './css.js';
export const SITE = '농산물 거래사전';
export const ORIGIN = 'https://yomiwiki.com';
export const CHECKED = '2026-10-26';

const ADSENSE = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5877883031077615" crossorigin="anonymous"></script>';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const jsonLd = data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// 보리장터 links always carry the shared support UTM set.
export const bori = (path, content) => `https://boribay.com${path}${path.includes('?') ? '&' : '?'}utm_source=yomiwiki.com&utm_medium=referral&utm_campaign=support${content ? `&utm_content=${content}` : ''}`;

export const SISTERS = {
  scamProduce: { name: '직거래 사기 점검', url: 'https://scamreader.com/agri/checklists/produce-direct-trade', text: '농산물 직거래 사기 신호 점검표' },
  scamMachinery: { name: '직거래 사기 점검', url: 'https://scamreader.com/agri/checklists/used-farm-machinery', text: '중고 농기계 거래 사기 신호 점검표' },
  transport: { name: '농기계 탁송 견적 비교', url: 'https://tripmarking.com/agri/quote-compare/', text: '농기계 탁송 견적 항목 비교하기' },
  waste: { name: '영농폐기물 집하장 지도', url: 'https://sumimap.com/kr/farm-waste-collection/', text: '우리 지역 공동집하장 주소 찾기' },
  profit: { name: '농가 손익 계산기', url: 'https://www.reportools.com/', text: '판매 정산과 손익 계산하기' },
  tractorCost: { name: '농가 손익 계산기', url: 'https://www.reportools.com/tools/used-tractor-total-cost/', text: '중고 트랙터 총비용 계산하기' },
  filesSale: { name: '거래 증빙 도우미', url: 'https://goatool.com/agri/guides/direct-sale-settlement-files/', text: '직거래 정산 사진·서류 정리하기' },
  filesMachinery: { name: '거래 증빙 도우미', url: 'https://goatool.com/agri/guides/used-machinery-handover-files/', text: '중고 농기계 인수인계 서류 정리하기' }
};

// Seven core areas plus supplies. Order is the browse order everywhere.
export const AREAS = [
  { key: 'grading', name: '등급·선별', desc: '특·상·보통, 고르기·결점, 선별 기준을 읽는 법' },
  { key: 'labeling', name: '표시사항·이력', desc: '표준규격품·원산지·양곡 표시와 축산물 이력번호' },
  { key: 'packing', name: '포장 단위·kg 환산', desc: '망·단·상자 가격을 실중량 kg당으로 바꾸기' },
  { key: 'storage', name: '보관·출하', desc: '품온·결로·예건, 벼 건조, 출하 기록' },
  { key: 'wholesale', name: '경매·도매 용어', desc: '경락가, 중도매인, 위탁수수료, 표준정산서' },
  { key: 'machinery', name: '중고 농기계 점검·용어', desc: '명판·시간계·PTO와 기종별 실물 점검' },
  { key: 'direct', name: '직거래 용어', desc: '방문수령·산지직송, 선입금·계약금, 판매글 칸' },
  { key: 'supplies', name: '농자재·영농폐기물', desc: '비료 표시, 영농폐기물 분류와 공동집하장' }
];
export const areaByKey = Object.fromEntries(AREAS.map(a => [a.key, a]));

const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const MARK = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="16" fill="#f7bd24"/><path d="M16 25V14m0 0c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5Zm0 3c0-3.5-2.6-5.5-6-5.5 0 3.5 2.6 5.5 6 5.5Z" fill="none" stroke="#104b2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function searchForm({ q = '', id = 'q', big = false } = {}) {
  return `<form class="search-form${big ? ' search-big' : ''}" action="/search" method="get" role="search"><label class="sr-only" for="${id}">사전에서 찾을 말</label><input id="${id}" name="q" type="search" value="${esc(q)}" placeholder="예: 중도매인, 도정일" autocomplete="off" enterkeyhint="search" maxlength="60"><button type="submit">${ICON_SEARCH}<span>찾기</span></button></form>`;
}

function header(current) {
  const nav = [['/knowledge', '전체 문서', 'knowledge'], ['/glossary', '용어 사전', 'glossary'], ...AREAS.slice(0, 7).map(a => [`/knowledge#${a.key}`, a.name.replace('중고 농기계 점검·용어', '농기계 점검').replace('포장 단위·kg 환산', 'kg 환산'), a.key])];
  return `<a class="skip" href="#main">본문 바로가기</a><header class="site-header"><div class="header-inner"><a class="brand" href="/">${MARK}<strong>${SITE}</strong></a><a class="header-search" href="/search">${ICON_SEARCH}<span>찾기</span></a></div><nav class="area-nav" aria-label="사전 분야"><div class="area-nav-inner">${nav.map(([href, label, key]) => `<a href="${href}"${current === key ? ` aria-current="${key === 'knowledge' || key === 'glossary' ? 'page' : 'true'}"` : ''}>${esc(label)}</a>`).join('')}</div></nav></header><script>(function(){var a=document.querySelector('.area-nav [aria-current]');if(a&&a.offsetLeft>a.parentNode.clientWidth-80)a.parentNode.scrollLeft=a.offsetLeft-16})()</script>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-inner"><div><strong>${SITE}</strong><p>농산물·농기계 거래에서 쓰는 말을 공식 기준과 현장 확인 순서로 풀어 쓴 사전입니다. 운영: J MEDIA(제이 미디어) · <a href="${bori('/', 'footer')}">보리장터</a> 운영사</p></div><nav aria-label="운영 정보"><a href="/about">소개</a><a href="/editorial-policy">편집 원칙</a><a href="/review-readiness">수정 기록</a><a href="/contact">문의·정정 요청</a><a href="/privacy">개인정보</a><a href="/terms">이용약관</a><a href="/disclaimer">면책</a><a href="/mn/" lang="mn">Монгол</a><a href="/feed.xml">RSS</a></nav></div></footer>`;
}

export function layout({ title, fullTitle, description, path, robots = 'index,follow', schema = [], ads = true, body, current = '', extraHead = '', bodyStart = '', scripts = '' }) {
  const canonical = `${ORIGIN}${path}`;
  const docTitle = fullTitle || `${title} | ${SITE}`;
  const schemas = (Array.isArray(schema) ? schema : [schema]).filter(Boolean).map(jsonLd).join('');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(docTitle)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${esc(docTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${path.startsWith('/knowledge/') ? 'article' : 'website'}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="${SITE}"><meta name="theme-color" content="#104b2d"><link rel="icon" href="/mn/favicon.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${SITE} 새 문서" href="${ORIGIN}/feed.xml"><style>${CSS}</style>${extraHead}${schemas}${ads ? ADSENSE : ''}</head><body>${bodyStart}${header(current)}<main id="main">${body}</main>${footer()}${scripts}</body></html>`;
}

export const html = (body, init = {}) => new Response(body, { status: init.status || 200, headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public,max-age=0,must-revalidate', ...(init.headers || {}) } });

export function breadcrumbSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${ORIGIN}${path}` })) };
}

export function crumbs(items) {
  return `<nav class="breadcrumb" aria-label="현재 위치"><ol>${items.map(([name, path], i) => `<li>${i < items.length - 1 ? `<a href="${path}">${esc(name)}</a>` : `<span aria-current="page">${esc(name)}</span>`}</li>`).join('')}</ol></nav>`;
}
