import { layout, html, esc, crumbs, breadcrumbSchema, pageSchema, byline, orgRef, siteRef, searchForm, AREAS, areaByKey, ORIGIN, SITE, bori } from '../_lib/site.js';
import { entries, entryBySlug, MOVED } from '../_lib/entries.js';
import { terms } from '../_lib/glossary.js';

const isInternal = href => href.startsWith('/');
const link = ([text, href]) => isInternal(href) ? `<a href="${esc(href)}">${esc(text)} →</a>` : `<a href="${esc(href)}" rel="noopener">${esc(text)} →</a>`;

const CALC = `<section class="calc" id="calc" aria-labelledby="calc-title"><h2 id="calc-title">kg당 가격 계산기</h2><p class="calc-note">가격은 32000, 32,000, 3만2천처럼 넣으면 됩니다. 계산은 이 화면 안에서만 이루어지고 어디에도 저장되지 않습니다.</p><form id="kg-calc" novalidate><div class="field"><label for="c-price">한 상자(망·단) 가격 <small>원</small></label><input id="c-price" inputmode="numeric" autocomplete="off" placeholder="예: 32000"></div><div class="field"><label for="c-qty">상자(망·단) 수</label><input id="c-qty" inputmode="numeric" autocomplete="off" value="1"></div><div class="field"><label for="c-weight">한 상자 표시 무게 <small>kg</small></label><input id="c-weight" inputmode="decimal" autocomplete="off" placeholder="예: 10"></div><fieldset class="field"><legend>표시 무게는 무엇인가요? <small>“표준규격품” 상자는 내용량</small></legend><label class="radio"><input type="radio" name="wtype" value="net" checked> 내용량(실중량)</label><label class="radio"><input type="radio" name="wtype" value="gross"> 상자 포함 총중량</label></fieldset><div class="field" id="pack-field" hidden><label for="c-pack">한 상자 포장재 무게 <small>kg</small></label><input id="c-pack" inputmode="decimal" autocomplete="off" placeholder="예: 0.8"></div><div class="field"><label for="c-loss">팔 수 없는 양 <small>kg, 선택</small></label><input id="c-loss" inputmode="decimal" autocomplete="off" placeholder="무른 것·상한 것 무게"></div><div class="field"><label for="c-ship">배송비 합계 <small>원, 선택</small></label><input id="c-ship" inputmode="numeric" autocomplete="off" placeholder="예: 4000"></div><button type="submit" class="btn">계산하기</button></form><div id="calc-result" class="calc-result" aria-live="polite" hidden></div><noscript><p>계산기를 쓰려면 자바스크립트가 필요합니다. 상품 금액 ÷ 내용물 실중량(kg)으로 직접 계산하세요.</p></noscript></section>`;

const CALC_SCRIPT = `<script>(function(){var f=document.getElementById('kg-calc');if(!f)return;var out=document.getElementById('calc-result'),pf=document.getElementById('pack-field');
function n(id){var v=(document.getElementById(id).value||'').replace(/[,\\s원㎏]|kg|키로그램|킬로그램|키로|킬로/gi,'');if(v==='')return null;
var m=v.match(/^(?:(\\d+(?:\\.\\d+)?)만)?(?:(\\d+(?:\\.\\d+)?)천)?(?:(\\d+(?:\\.\\d+)?)백)?(\\d+(?:\\.\\d+)?)?$/);if(m&&/[만천백]/.test(v))return (+(m[1]||0))*1e4+(+(m[2]||0))*1e3+(+(m[3]||0))*100+(+(m[4]||0));
var x=Number(v);return isFinite(x)?x:NaN}
function won(x){return Math.round(x).toLocaleString('ko-KR')+'원'}function kg(x){return (Math.round(x*1000)/1000).toLocaleString('ko-KR',{maximumFractionDigits:3})+'kg'}
function gross(){return f.querySelector('input[name=wtype]:checked').value==='gross'}
f.addEventListener('change',function(){pf.hidden=!gross()});
function show(html,err){out.hidden=false;out.className='calc-result'+(err?' calc-error':'');out.innerHTML=html;out.focus&&out.setAttribute('tabindex','-1');}
f.addEventListener('submit',function(e){e.preventDefault();var p=n('c-price'),q=n('c-qty'),w=n('c-weight'),pk=n('c-pack'),l=n('c-loss'),s=n('c-ship');var errs=[];
if(p===null||isNaN(p)||p<=0)errs.push('한 상자 가격을 0보다 큰 숫자로 넣어 주세요(예: 32000 또는 3만2천).');
if(q===null)q=1;if(isNaN(q)||q<1||q>100000||Math.floor(q)!==q)errs.push('상자 수는 1 이상의 정수로 넣어 주세요.');
if(w===null||isNaN(w)||w<=0||w>100000)errs.push('표시 무게를 0보다 큰 숫자(kg)로 넣어 주세요.');
var g=gross();if(g){if(pk===null)errs.push('총중량이면 포장재 무게가 필요합니다. 모르면 빈 상자를 재거나 판매자에게 물어보세요.');else if(isNaN(pk)||pk<0||(w&&pk>=w))errs.push('포장재 무게는 0 이상이고 표시 무게보다 작아야 합니다.');}
if(l!==null&&(isNaN(l)||l<0))errs.push('팔 수 없는 양은 0 이상의 숫자로 넣어 주세요.');if(s!==null&&(isNaN(s)||s<0))errs.push('배송비는 0 이상의 숫자로 넣어 주세요.');
if(errs.length){show('<p><strong>입력을 확인해 주세요.</strong></p><ul><li>'+errs.join('</li><li>')+'</li></ul>',true);return}
var per=g?w-pk:w,net=per*q-(l||0);if(net<=0){show('<p><strong>팔 수 있는 무게가 0 이하입니다.</strong> 팔 수 없는 양이 전체 무게보다 크지 않은지 확인해 주세요.</p>',true);return}
var total=p*q,h='<p class="calc-big">상품 kg당 <strong>'+won(total/net)+'</strong></p><ul><li>계산에 쓴 내용물 실중량: <strong>'+kg(net)+'</strong> ('+kg(per)+' × '+q.toLocaleString('ko-KR')+'상자'+(l?' − 팔 수 없는 양 '+kg(l):'')+')</li><li>상품 금액 합계: '+won(total)+'</li>';
if(s)h+='<li>배송비 포함 kg당: <strong>'+won((total+s)/net)+'</strong> (배송비 '+won(s)+' 포함 결제액 '+won(total+s)+')</li>';
if(g){var naive=total/(w*q-(l||0));h+='<li>포장재 무게를 빼지 않고 나눴다면 kg당 '+won(naive)+'으로, 실제보다 약 '+Math.round((1-naive/(total/net))*100)+'% 낮게 보였을 것입니다.</li>'}
if(w>50)h+='<li>한 상자 무게가 50kg을 넘습니다. g 단위 숫자를 kg 칸에 넣지 않았는지 확인하세요(500g = 0.5kg).</li>';
h+='</ul><p class="calc-next"><strong>다음 단계</strong> 같은 품목·품종·등급의 공식 가격도 kg당으로 바꿔 비교하세요(<a href="https://www.kamis.or.kr/" rel="noopener">aT KAMIS</a>, <a href="${bori('/guides/agricultural-price-lookup', 'kg-calculator')}">공식 가격 조회하는 법</a>). 도매 경락가와 직거래 판매가는 유통 단계가 달라 같은 숫자일 수 없습니다.</p>';show(h,false)});})();</script>`;

function nextBox(e) {
  const items = [];
  if (e.boribay) items.push(`<li class="next-bori"><span class="next-label">보리장터</span><p>${esc(e.boribay.desc)}</p><a class="btn" href="${esc(e.boribay.url)}">${esc(e.boribay.text)} →</a></li>`);
  for (const s of e.sisters || []) items.push(`<li><span class="next-label">${esc(s.name)}</span><a href="${esc(s.url)}" rel="noopener">${esc(s.text)} →</a></li>`);
  return items.length ? `<section class="next-box" aria-labelledby="next-title"><h2 id="next-title">확인을 마쳤다면 다음 단계</h2><ul>${items.join('')}</ul></section>` : '';
}

const host = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

function renderEntry(e) {
  const area = areaByKey[e.area];
  const path = `/knowledge/${e.slug}`;
  const checked = e.sourceChecked || '';
  const sectionHtml = e.sections.map((s, i) => `<section class="content-section" id="${s[3] || `s${i + 1}`}"><h2><span class="num" aria-hidden="true">${i + 1}</span>${esc(s[0])}</h2><ul class="point-list">${s[1].map(item => `<li>${esc(item)}</li>`).join('')}</ul>${s[2] ? `<p class="context-link">${link(s[2])}</p>` : ''}</section>`).join('');
  const faqHtml = e.faq ? `<section class="content-section faq"><h2>자주 묻는 질문</h2><dl>${e.faq.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}</dl></section>` : '';
  const checksHtml = `<section class="checks" id="checks" aria-labelledby="checks-title"><h2 id="checks-title">현장에서 이것만은 확인</h2><p>거래 전에 하나씩 짚어 보세요. 표시는 저장되지 않습니다.</p><ul>${e.checks.map((c, i) => `<li><input type="checkbox" id="ck${i}"><label for="ck${i}">${esc(c)}</label></li>`).join('')}</ul></section>`;
  const limitsHtml = `<section class="limits" id="limits" aria-labelledby="limits-title"><h2 id="limits-title">범위와 한계</h2><p>${esc(e.limits)}</p></section>`;
  const entryTerms = terms.filter(t => t.link === e.slug);
  const termsHtml = entryTerms.length ? `<section class="term-chips" aria-labelledby="terms-title"><h2 id="terms-title">이 문서의 용어</h2><p>${entryTerms.map(t => `<a href="/glossary#${t.id}">${esc(t.term)}</a>`).join('')}</p></section>` : '';
  const related = e.related.map(s => entryBySlug[s]).filter(Boolean);
  const siblings = entries.filter(x => x.area === e.area && x.slug !== e.slug && !e.related.includes(x.slug));
  const historyHtml = e.history ? `<div class="editorial-record"><h3>이 문서의 수정 기록</h3>${e.history.map(([d, t]) => `<p><time datetime="${d}">${d}</time>: ${esc(t)}</p>`).join('')}<p><a href="/review-readiness">사이트 전체 수정 기록 보기</a></p></div>` : '';
  const sourcesHtml = `<section class="source-box" id="sources" aria-labelledby="src-title"><h2 id="src-title">출처: 확인한 공식 자료 ${e.sources.length}개</h2>${checked ? `<p class="checked">자료 확인일 <time datetime="${checked}">${checked}</time> · 아래 원문과 본문의 숫자·조문·날짜를 대조했습니다.</p>` : ''}<ul>${e.sources.map(s => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a><span class="src-meta">${esc(s.org)} · ${esc(host(s.url))}${checked ? ` · 확인일 ${checked}` : ''}</span></li>`).join('')}</ul><p>공식 기준은 개정될 수 있습니다. 실제 거래·사용 전 최신 원문과 지역 담당기관 안내를 다시 확인하세요. 이 문서는 법률·세무·정비 전문가의 판단을 대신하지 않습니다.</p>${historyHtml}<p class="fix-link"><a href="/contact">이 문서의 오류·공식 기준 변경 알리기</a></p></section>`;
  const body = `${crumbs([['홈', '/'], [area.name, `/knowledge#${area.key}`], [e.short, path]])}<article class="entry"><header class="article-head"><p class="kicker">${esc(area.name)}</p><h1>${esc(e.title)}</h1><p class="desc">${esc(e.description)}</p>${byline({ published: e.published, checked, sources: e.sources.length })}</header><div class="article-grid"><div class="article-main"><section class="lead-box"><strong>먼저 알아두세요</strong><p>${esc(e.lead)}</p></section>${e.calc ? CALC : ''}${sectionHtml}${faqHtml}${checksHtml}${limitsHtml}${nextBox(e)}${termsHtml}${sourcesHtml}</div><aside class="rail" aria-label="관련 문서"><section><h2>함께 보면 좋은 문서</h2><ul>${related.map(r => `<li><a href="/knowledge/${r.slug}">${esc(r.short)}</a></li>`).join('')}</ul></section>${siblings.length ? `<section><h2>${esc(area.name)} 다른 문서</h2><ul>${siblings.map(r => `<li><a href="/knowledge/${r.slug}">${esc(r.short)}</a></li>`).join('')}</ul></section>` : ''}<section><h2>다른 말을 찾나요?</h2>${searchForm({ id: 'rail-q' })}<p><a href="/glossary">용어 사전 전체 보기 →</a></p></section></aside></div></article>`;
  const url = `${ORIGIN}${path}`;
  const schema = [
    { '@type': 'Article', '@id': `${url}#article`, headline: e.title, description: e.description, datePublished: e.published, dateModified: e.modified, inLanguage: 'ko-KR', mainEntityOfPage: url, url, author: orgRef, publisher: orgRef, isPartOf: siteRef, citation: e.sources.map(s => s.url) },
    breadcrumbSchema([['홈', '/'], [area.name, `/knowledge#${area.key}`], [e.short, path]])
  ];
  return html(layout({ title: e.title, description: e.description, path, schema, body, current: e.area, scripts: e.calc ? CALC_SCRIPT : '' }));
}

function renderIndex() {
  const body = `${crumbs([['홈', '/'], ['전체 문서', '/knowledge']])}<header class="page-head"><h1>전체 문서</h1><p>농산물 거래사전의 문서 ${entries.length}개를 분야별로 모았습니다. 각 문서는 공식 자료를 바탕으로 뜻을 풀고, 끝에 현장에서 확인할 목록, 범위와 한계, 출처와 확인일을 둡니다.</p>${byline({})}${searchForm({ id: 'index-q' })}</header>${AREAS.map(a => {
    const list = entries.filter(e => e.area === a.key);
    const n = terms.filter(t => t.area === a.key).length;
    return `<section class="area-block" id="${a.key}" aria-labelledby="h-${a.key}"><h2 id="h-${a.key}">${esc(a.name)}</h2><p class="area-desc">${esc(a.desc)}</p><ul class="doc-list">${list.map(e => `<li><a href="/knowledge/${e.slug}"><strong>${esc(e.short)}</strong><span>${esc(e.description)}</span></a></li>`).join('')}</ul>${n ? `<p class="area-terms"><a href="/glossary#area-${a.key}">${esc(a.name)} 용어 ${n}개 보기 →</a></p>` : ''}</section>`;
  }).join('')}`;
  const schema = [{ ...pageSchema({ type: 'CollectionPage', path: '/knowledge', name: `전체 문서 | ${SITE}`, description: `농산물 거래사전 문서 ${entries.length}개의 분야별 목록` }), hasPart: entries.map(e => ({ '@id': `${ORIGIN}/knowledge/${e.slug}#article` })) }, breadcrumbSchema([['홈', '/'], ['전체 문서', '/knowledge']])];
  return html(layout({ title: '전체 문서: 분야별 농산물·농기계 거래 기준', description: `등급·선별, 표시사항, kg 환산, 보관·출하, 경매·도매, 중고 농기계 점검, 직거래 용어까지 농산물 거래사전 문서 ${entries.length}개를 분야별로 모았습니다.`, path: '/knowledge', schema, body, current: 'knowledge', ads: false }));
}

export function notFound(path = '') {
  const body = `<header class="page-head"><h1>찾는 문서가 없습니다</h1><p>주소가 바뀌었거나 아직 없는 문서입니다. 찾는 말을 검색하거나 분야에서 골라 보세요.</p>${searchForm({ id: 'nf-q' })}</header><section class="area-grid">${AREAS.map(a => `<a class="area-card" href="/knowledge#${a.key}"><strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span></a>`).join('')}</section><p class="center"><a href="/glossary">용어 사전 보기</a> · <a href="/contact">빠진 용어 알려주기</a></p>`;
  return html(layout({ title: '문서를 찾을 수 없습니다', description: '요청한 문서를 찾을 수 없습니다.', path: path || '/knowledge', robots: 'noindex,follow', body, ads: false }), { status: 404, headers: { 'X-Robots-Tag': 'noindex,follow' } });
}

export async function onRequestGet({ request, params }) {
  const raw = Array.isArray(params.slug) ? params.slug.join('/') : String(params.slug || '');
  const slug = raw.replace(/^\/+|\/+$/g, '');
  if (!slug) return renderIndex();
  // Merged pages keep working: 301 to the section that now holds their content.
  if (MOVED[slug]) return new Response(null, { status: 301, headers: { Location: `${request ? new URL(request.url).origin : ORIGIN}/knowledge/${MOVED[slug]}`, 'Cache-Control': 'public,max-age=3600' } });
  const entry = entryBySlug[slug];
  if (!entry) return notFound(`/knowledge/${encodeURIComponent(slug)}`);
  return renderEntry(entry);
}
