import { layout, html, searchForm } from '../_lib/site.js';

export async function onRequestGet({ request, params }) {
  const path = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  const url = new URL(request.url);
  if (path === 'Main_Page') return Response.redirect(`${url.origin}/`, 301);
  const body = `<header class="page-head"><h1>이전 문서는 운영을 종료했습니다</h1><p>이 주소의 예전 문서는 더 이상 제공하지 않습니다. 농산물 거래사전은 농산물·농기계 거래 용어와 현장 확인 기준을 다루는 사전입니다.</p>${searchForm({ id: 'w-q' })}<p><a href="/knowledge">분야별 문서 보기</a> · <a href="/glossary">용어 사전 보기</a></p></header>`;
  return html(layout({ title: '이전 문서 종료', description: '이전 문서는 운영을 종료했습니다.', path: `/w/${encodeURI(path)}`, robots: 'noindex,follow', body, ads: false }), { status: 410, headers: { 'X-Robots-Tag': 'noindex,follow' } });
}
