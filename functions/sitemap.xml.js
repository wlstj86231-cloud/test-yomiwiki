const slugs=['potato-special-grade','produce-grading','storage-shipping','tractor-hours','farm-machinery','trade-terms','produce-items','cattle-traceability','rice-drying','fertilizer-use','farm-waste-terms'];
const lastmodFor = (path) => {
  if (path === 'knowledge/trade-terms') return '2026-09-19';
  if (path === '' || path === 'knowledge/farm-machinery' || path === 'knowledge/farm-waste-terms') return '2026-09-16';
  return '2026-08-09';
};

export async function onRequestGet(){
  const paths=['',...slugs.map(slug=>`knowledge/${slug}`),'about','editorial-policy','privacy','contact'];
  const body=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`  <url><loc>https://yomiwiki.com/${path}</loc><lastmod>${lastmodFor(path)}</lastmod><changefreq>${path?'monthly':'weekly'}</changefreq><priority>${!path?'1.0':path.startsWith('knowledge/')?'0.8':'0.4'}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(body,{headers:{'Content-Type':'application/xml;charset=UTF-8','Cache-Control':'public,max-age=1800'}});
}
