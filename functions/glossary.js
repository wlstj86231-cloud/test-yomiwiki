import { layout, html, esc, crumbs, breadcrumbSchema, searchForm, AREAS, ORIGIN, SITE } from './_lib/site.js';
import { terms } from './_lib/glossary.js';
import { entryBySlug } from './_lib/entries.js';

export async function onRequestGet() {
  const groups = AREAS.map(a => ({ a, list: terms.filter(t => t.area === a.key).sort((x, y) => x.term.localeCompare(y.term, 'ko')) })).filter(g => g.list.length);
  const body = `${crumbs([['홈', '/'], ['용어 사전', '/glossary']])}<header class="page-head"><h1>농산물·농기계 거래 용어 사전</h1><p>거래 현장에서 자주 쓰는 말 ${terms.length}개를 분야별로 풀었습니다. 각 용어는 뜻, 현장에서 확인할 점, 자세한 설명 문서로 이어집니다. 법령·공식 기관 자료로 확인한 내용은 연결 문서의 “확인한 공식 자료”에 출처와 확인일을 적었습니다.</p>${searchForm({ id: 'g-q' })}<nav class="jump" aria-label="분야 바로가기">${groups.map(g => `<a href="#area-${g.a.key}">${esc(g.a.name)} <span>${g.list.length}</span></a>`).join('')}</nav></header>${groups.map(g => `<section class="term-group" id="area-${g.a.key}" aria-labelledby="gh-${g.a.key}"><h2 id="gh-${g.a.key}">${esc(g.a.name)}</h2><dl class="terms">${g.list.map(t => {
    const e = entryBySlug[t.link];
    return `<div class="term" id="${t.id}"><dt>${esc(t.term)}</dt><dd><p>${esc(t.def)}</p>${t.check ? `<p class="term-check"><strong>확인할 점</strong> ${esc(t.check)}</p>` : ''}${e ? `<p class="term-link"><a href="/knowledge/${e.slug}#checks">${esc(e.short)} 문서에서 자세히 →</a></p>` : ''}</dd></div>`;
  }).join('')}</dl></section>`).join('')}<p class="center">찾는 용어가 없나요? <a href="/contact">빠진 용어나 틀린 설명을 알려주세요.</a></p>`;
  const schema = [{
    '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: `${SITE} 용어 사전`, url: `${ORIGIN}/glossary`, inLanguage: 'ko-KR',
    hasDefinedTerm: terms.map(t => ({ '@type': 'DefinedTerm', name: t.term, description: t.def, url: `${ORIGIN}/glossary#${t.id}`, inDefinedTermSet: `${ORIGIN}/glossary` }))
  }, breadcrumbSchema([['홈', '/'], ['용어 사전', '/glossary']])];
  return html(layout({
    title: '농산물·농기계 거래 용어 사전: 등급·표시·kg 환산·경매·농기계·직거래',
    description: `중도매인·위탁수수료·경락가, 실중량·kg당 가격, 원산지·도정 연월일, PTO·3점 히치, 선입금·제3자 계좌 등 거래 용어 ${terms.length}개의 뜻과 현장에서 확인할 점을 정리했습니다.`,
    path: '/glossary', schema, body, current: 'glossary'
  }));
}
