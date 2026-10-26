import { layout, html, esc, searchForm, AREAS, areaByKey, bori } from './_lib/site.js';
import { entryBySlug } from './_lib/entries.js';
import { search } from './_lib/search.js';

const EXAMPLES = ['중도매인', '위탁수수료', '10kg 상자 kg당', '도정일', '원산지 표시', 'PTO', '콤바인 점검', '선입금', '표준규격품'];
const exampleLinks = () => `<p class="examples"><span>이런 말을 찾아보세요</span>${EXAMPLES.map(x => `<a href="/search?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</p>`;
const areaLinks = () => `<section class="area-grid" aria-label="분야별 찾아보기">${AREAS.map(a => `<a class="area-card" href="/knowledge#${a.key}"><strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span></a>`).join('')}</section>`;

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const r = search(url.searchParams.get('q') || '');
  let main;
  if (!r.q) {
    main = `<header class="page-head"><h1>사전에서 찾기</h1><p>품목·등급·포장·도매시장·농기계·직거래에서 쓰는 말을 넣어 보세요. 용어의 뜻과 자세한 문서를 함께 보여 드립니다.</p>${searchForm({ id: 's-q', big: true })}${exampleLinks()}</header>${areaLinks()}`;
  } else if (!r.terms.length && !r.entries.length) {
    main = `<header class="page-head"><h1>“${esc(r.q)}” 검색 결과</h1>${searchForm({ q: r.q, id: 's-q', big: true })}</header><section class="empty"><h2>아직 이 말을 다룬 문서가 없습니다</h2>${r.suggestions.length ? `<p>비슷한 말: ${r.suggestions.map(d => d.type === 'term' ? `<a href="/glossary#${d.ref.id}">${esc(d.ref.term)}</a>` : `<a href="/knowledge/${d.ref.slug}">${esc(d.ref.short)}</a>`).join(' · ')}</p>` : ''}<ul><li>띄어쓰기를 바꾸거나 더 짧은 말(예: “콤바인 점검” → “콤바인”)로 찾아보세요.</li><li>아래 분야에서 문서를 골라 보세요.</li><li>사전에 꼭 있어야 할 말이라면 <a href="/contact">빠진 용어로 알려주세요</a>. 공식 자료를 확인한 뒤 추가합니다.</li></ul></section>${areaLinks()}`;
  } else {
    const termHtml = r.terms.length ? `<section class="results" aria-labelledby="rt"><h2 id="rt">용어 ${r.terms.length}개</h2><ul class="term-results">${r.terms.map(t => {
      const e = entryBySlug[t.link];
      return `<li><h3><a href="/glossary#${t.id}">${esc(t.term)}</a> <span class="tag">${esc(areaByKey[t.area].name)}</span></h3><p>${esc(t.def)}</p>${t.check ? `<p class="term-check"><strong>확인할 점</strong> ${esc(t.check)}</p>` : ''}${e ? `<p class="term-link"><a href="/knowledge/${e.slug}">${esc(e.short)} 문서에서 자세히 →</a></p>` : ''}</li>`;
    }).join('')}</ul></section>` : '';
    const entryHtml = r.entries.length ? `<section class="results" aria-labelledby="re"><h2 id="re">문서 ${r.entries.length}개</h2><ul class="doc-list">${r.entries.map(e => `<li><a href="/knowledge/${e.slug}"><strong>${esc(e.title)}</strong><span>${esc(areaByKey[e.area].name)} · ${esc(e.description)}</span></a></li>`).join('')}</ul></section>` : '';
    main = `<header class="page-head"><h1>“${esc(r.q)}” 검색 결과</h1>${searchForm({ q: r.q, id: 's-q', big: true })}</header>${termHtml}${entryHtml}<p class="center muted">원하는 답이 없으면 <a href="/glossary">용어 사전 전체</a>나 <a href="/knowledge">분야별 문서</a>에서 찾아보세요.</p><p class="center muted">거래 준비가 끝났다면 <a href="${bori('/?category=PRODUCE', 'search')}">보리장터 농산물</a> · <a href="${bori('/?category=MACHINERY', 'search')}">농기계</a> 글을 볼 수 있습니다.</p>`;
  }
  return html(layout({
    title: r.q ? `“${r.q}” 검색 결과` : '사전에서 찾기',
    description: '농산물 거래사전의 용어와 문서를 검색합니다.',
    path: '/search', robots: 'noindex,follow', body: main, ads: false
  }), { headers: { 'X-Robots-Tag': 'noindex,follow' } });
}
