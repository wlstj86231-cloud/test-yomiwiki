import { entries } from './_lib/entries.js';

const staticPages = [
  ['', '2026-10-26', 'weekly', '1.0'],
  ['knowledge', '2026-10-26', 'weekly', '0.9'],
  ['glossary', '2026-10-26', 'weekly', '0.9'],
  ['mn/', '2026-09-24', 'monthly', '0.4'],
  ['mn/storage-glossary', '2026-09-25', 'monthly', '0.4'],
  ['mn/seed-labels', '2026-09-25', 'monthly', '0.4'],
  ['about', '2026-10-26', 'monthly', '0.4'],
  ['editorial-policy', '2026-10-26', 'monthly', '0.4'],
  ['review-readiness', '2026-10-26', 'monthly', '0.4'],
  ['privacy', '2026-08-09', 'monthly', '0.4'],
  ['contact', '2026-10-26', 'monthly', '0.4']
];

export async function onRequestGet() {
  const rows = [
    ...staticPages,
    ...entries.map(e => [`knowledge/${e.slug}`, e.modified, 'monthly', '0.8'])
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.map(([path, lastmod, freq, priority]) => `  <url><loc>https://yomiwiki.com/${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml;charset=UTF-8', 'Cache-Control': 'public,max-age=1800' } });
}
