import { entries } from './_lib/entries.js';
import { SITE, ORIGIN } from './_lib/site.js';

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function onRequestGet() {
  const items = [...entries].sort((a, b) => (b.published || '2026-08-09').localeCompare(a.published || '2026-08-09') || b.modified.localeCompare(a.modified));
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE} 새 문서</title><link>${ORIGIN}/</link><description>농산물·농기계 거래 용어와 현장 확인 기준</description><language>ko-KR</language><lastBuildDate>${new Date('2026-10-26T00:00:00+09:00').toUTCString()}</lastBuildDate>${items.map(e => `<item><title>${esc(e.title)}</title><link>${ORIGIN}/knowledge/${e.slug}</link><guid>${ORIGIN}/knowledge/${e.slug}</guid><pubDate>${new Date(`${e.published || '2026-08-09'}T00:00:00+09:00`).toUTCString()}</pubDate><description>${esc(e.description)}</description></item>`).join('')}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml;charset=UTF-8', 'Cache-Control': 'public,max-age=1800' } });
}
