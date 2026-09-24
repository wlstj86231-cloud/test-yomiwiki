const slugs=['potato-special-grade','produce-grading','produce-label-check','storage-shipping','tractor-hours','farm-machinery','trade-terms','pack-unit-terms','fruit-box-terms','produce-box-terms','produce-items','cattle-traceability','rice-drying','fertilizer-use','farm-waste-terms','listing-field-terms','machinery-listing-terms','region-listing-terms','nearby-machinery-terms','meetup-parcel-terms','bulk-buyer-terms','c2c-vs-mall-terms','listing-date-terms'];
const lastmodFor = (path) => {
  if (path.startsWith('mn/')) return '2026-09-24';
  if (path === 'knowledge/produce-label-check') return '2026-09-24';
  if (path === 'knowledge/listing-field-terms' || path === 'knowledge/machinery-listing-terms' || path === 'knowledge/region-listing-terms' || path === 'knowledge/nearby-machinery-terms' || path === 'knowledge/meetup-parcel-terms' || path === 'knowledge/bulk-buyer-terms' || path === 'knowledge/c2c-vs-mall-terms' || path === 'knowledge/listing-date-terms') return '2026-09-20';
  if (path === 'knowledge/fruit-box-terms' || path === 'knowledge/pack-unit-terms' || path === 'knowledge/produce-box-terms') return '2026-09-20';
  if (path === 'knowledge/trade-terms') return '2026-09-19';
  if (path === '' || path === 'knowledge/farm-machinery' || path === 'knowledge/farm-waste-terms') return '2026-09-16';
  return '2026-08-09';
};

export async function onRequestGet(){
  const paths=['',...slugs.map(slug=>`knowledge/${slug}`),'mn/','mn/storage-glossary','mn/seed-labels','about','editorial-policy','privacy','contact'];
  const body=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`  <url><loc>https://yomiwiki.com/${path}</loc><lastmod>${lastmodFor(path)}</lastmod><changefreq>${path?'monthly':'weekly'}</changefreq><priority>${!path?'1.0':path.startsWith('knowledge/')?'0.8':'0.4'}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(body,{headers:{'Content-Type':'application/xml;charset=UTF-8','Cache-Control':'public,max-age=1800'}});
}
