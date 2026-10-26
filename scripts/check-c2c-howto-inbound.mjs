// Site checks for 농산물 거래사전: entry pages (meta block, sources, scope note, footer, JSON-LD), merged-page
// redirects, 보리장터 inbound links, sitemap/feed, policy pages, ad placement and the inline CSS sync.
import { onRequestGet as knowledge } from "../functions/knowledge/[[slug]].js";
import { onRequestGet as sitemap } from "../functions/sitemap.xml.js";
import { onRequestGet as feed } from "../functions/feed.xml.js";
import { onRequestGet as home } from "../functions/index.js";
import { onRequestGet as glossary } from "../functions/glossary.js";
import { onRequestGet as searchPage } from "../functions/search.js";
import { onRequestGet as oldCorrections } from "../functions/review-readiness.js";
import { renderPolicy } from "../functions/_lib/policy.js";
import { entries, MOVED } from "../functions/_lib/entries.js";
import { ORG_ID } from "../functions/_lib/site.js";

const SISTER_DOMAINS = ["scamreader.com", "tripmarking.com", "goatool.com", "reportools.com", "megapureunasset.kr", "sumimap.com", "policyfundpedia.com", "occultworldcup.com"];
const OPERATOR_LINE = "대표 이정우 · 사업자등록번호 456-33-01705 · 고객센터";
const errors = [];
const get = async slug => knowledge({ request: new Request(`https://yomiwiki.com/knowledge/${slug}`), params: { slug } });
const graphOf = (html, label) => {
  const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!m) { errors.push(`${label}: JSON-LD missing`); return []; }
  try { return JSON.parse(m[1])["@graph"] || []; } catch { errors.push(`${label}: JSON-LD does not parse`); return []; }
};
const commonPageChecks = (html, label) => {
  if (!html.includes(OPERATOR_LINE)) errors.push(`${label}: footer operator line missing`);
  for (const p of ["/about", "/contact", "/editorial-policy", "/privacy", "/terms"]) if (!html.includes(`href="${p}"`)) errors.push(`${label}: footer link ${p} missing`);
  if (/href="mailto:[^"]+"/.test(html) && !html.includes("<!--email_off--><a href=\"mailto:")) errors.push(`${label}: mailto not wrapped in email_off`);
  const graph = graphOf(html, label);
  const org = graph.find(n => n["@id"] === ORG_ID);
  if (!org || org["@type"] !== "Organization" || org.url !== "https://jnewmedia.com/" || !org.address || !org.telephone || !org.email || !(org.sameAs || []).length) errors.push(`${label}: Organization node incomplete`);
  if (!graph.some(n => n["@type"] === "WebSite" && n.publisher?.["@id"] === ORG_ID)) errors.push(`${label}: WebSite publisher @id missing`);
  return graph;
};

// 1. Every entry page: meta block, real dates, sources with dates, scope note, checks, footer, JSON-LD.
for (const e of entries) {
  const res = await get(e.slug);
  const html = await res.text();
  const label = e.slug;
  if (res.status !== 200) errors.push(`${label}: status ${res.status}`);
  if (!html.includes(`<link rel="canonical" href="https://yomiwiki.com/knowledge/${e.slug}">`)) errors.push(`${label}: canonical`);
  if (!html.includes('<meta name="robots" content="index,follow">')) errors.push(`${label}: not indexable`);
  if (!html.includes("작성·관리") || !html.includes("제이 미디어 편집팀")) errors.push(`${label}: byline missing`);
  if (!/^2026-\d\d-\d\d$/.test(e.published || "") || !html.includes(`게시일 <time datetime="${e.published}">`)) errors.push(`${label}: 게시일 missing`);
  if (!e.sourceChecked || !html.includes(`최종 확인일 <time datetime="${e.sourceChecked}">`)) errors.push(`${label}: 최종 확인일 missing`);
  if (!html.includes(`출처 ${e.sources.length}개`) || !html.includes('id="sources"')) errors.push(`${label}: source count / sources section`);
  if ((html.match(/class="src-meta"/g) || []).length !== e.sources.length || (html.match(/· 확인일 2026-/g) || []).length !== e.sources.length) errors.push(`${label}: per-source institution/date`);
  if (!e.limits || !html.includes('id="limits"') || !html.includes("범위와 한계")) errors.push(`${label}: 범위와 한계 missing`);
  if (!html.includes('id="checks"')) errors.push(`${label}: missing practical checks`);
  if (!html.includes("adsbygoogle.js?client=ca-pub-5877883031077615")) errors.push(`${label}: AdSense code missing`);
  for (const old of Object.keys(MOVED)) if (html.includes(`/knowledge/${old}"`)) errors.push(`${label}: links to merged page ${old}`);
  const graph = commonPageChecks(html, label);
  const art = graph.find(n => n["@type"] === "Article");
  if (!art || art.author?.["@id"] !== ORG_ID || art.publisher?.["@id"] !== ORG_ID || art.datePublished !== e.published || art.dateModified !== e.modified || art.headline !== e.title) errors.push(`${label}: Article node`);
  if (!graph.some(n => n["@type"] === "BreadcrumbList")) errors.push(`${label}: BreadcrumbList missing`);
  if (graph.some(n => n["@type"] === "Person")) errors.push(`${label}: Person node present`);
}

// 2. Merged pages answer 301 to the section that now holds their content.
for (const [old, target] of Object.entries(MOVED)) {
  const res = await get(old);
  if (res.status !== 301 || res.headers.get("Location") !== `https://yomiwiki.com/knowledge/${target}`) errors.push(`${old}: expected 301 to ${target}, got ${res.status} ${res.headers.get("Location")}`);
}

// 3. 보리장터 inbound pages that remain after the merge (one contextual guide link each, support UTM).
const inbound = [
  ["listing-field-terms", "produce-listing-three-fields", "농산물 판매글 칸 읽는 법: 품종·실중량·날짜·지역"],
  ["machinery-listing-terms", "used-machinery-listing-nameplate", "중고 농기계 판매글 읽는 법: 명판·시간계·작업기·인도 장소"]
];
for (const [slug, dest, h1] of inbound) {
  const html = await (await get(slug)).text();
  const header = html.slice(html.indexOf("<header"), html.indexOf("</header>") + 9);
  if (header.includes("보리장터")) errors.push(`${slug}: header has 보리장터`);
  if (!html.includes(`<h1>${h1}</h1>`)) errors.push(`${slug}: H1 mismatch`);
  if (!html.includes(`utm_content=${slug}`) || !html.includes("utm_medium=referral&amp;utm_campaign=support") && !html.includes("utm_medium=referral&utm_campaign=support")) errors.push(`${slug}: missing support UTM`);
  if (!html.includes(`https://boribay.com/guides/${dest}?`)) errors.push(`${slug}: missing dest ${dest}`);
  if ((html.match(/boribay.com\/guides\//g) || []).length !== 1) errors.push(`${slug}: expected 1 boribay guide href`);
  for (const href of html.match(/href="https:\/\/[^"]+"/g) || []) {
    const host = new URL(href.slice(6, -1).replace(/&amp;/g, "&")).hostname.replace(/^www\./, "");
    if (!["boribay.com", "yomiwiki.com"].includes(host) && !SISTER_DOMAINS.includes(host) && !/\.(go|or)\.kr$/.test(host)) errors.push(`${slug}: unexpected external host ${host}`);
  }
  if (html.includes("제휴하지 않습니다") || html.includes("같은 운영자")) errors.push(`${slug}: operator statement present`);
}

const tradeHtml = await (await get("trade-terms")).text();
if (!tradeHtml.includes("utm_campaign=support") || !tradeHtml.includes("agricultural-wholesale-market-guide")) errors.push("trade-terms support campaign / wholesale guide dest");
if (/garak-[a-z-]+-price-lookup/.test(tradeHtml)) errors.push("trade-terms retired Garak dest");

const labelHtml = await (await get("produce-label-check")).text();
if (!labelHtml.includes("자료 확인일 <time datetime=\"2026-10-26\">2026-10-26</time>") || !labelHtml.includes("menuId=MN40333")) errors.push("label-check source record");
if (!labelHtml.includes("표준규격품 표시가 없으면 바로 불량 상품인가요?")) errors.push("label-check scope caveat");
if ((labelHtml.match(/boribay.com\/guides\//g) || []).length !== 1 || !labelHtml.includes("produce-direct-shipping-buying-guide")) errors.push("label-check contextual destination");

const packHtml = await (await get("pack-unit-terms")).text();
if ((packHtml.match(/boribay\.com\/guides\/agricultural-price-lookup/g) || []).length !== 1 || !packHtml.includes('id="fruit"') || !packHtml.includes('id="fruit-veg"')) errors.push("pack-unit-terms merged sections / price lookup dest");

// 4. Sitemap and feed: every entry, no merged or noindex URLs.
const sitemapXml = await (await sitemap()).text();
const feedXml = await (await feed()).text();
for (const e of entries) {
  if (!sitemapXml.includes(`<loc>https://yomiwiki.com/knowledge/${e.slug}</loc>`)) errors.push(`sitemap missing ${e.slug}`);
  if (!feedXml.includes(`/knowledge/${e.slug}<`)) errors.push(`feed missing ${e.slug}`);
}
for (const old of Object.keys(MOVED)) {
  if (sitemapXml.includes(`/knowledge/${old}<`)) errors.push(`sitemap lists merged ${old}`);
  if (feedXml.includes(`/knowledge/${old}<`)) errors.push(`feed lists merged ${old}`);
}
if (sitemapXml.includes("/mn/") || sitemapXml.includes("/search")) errors.push("sitemap lists noindex pages");
for (const p of ["about", "contact", "editorial-policy", "corrections", "privacy", "terms", "disclaimer"]) if (!sitemapXml.includes(`<loc>https://yomiwiki.com/${p}</loc>`)) errors.push(`sitemap missing ${p}`);

// 5. Home: verification, analytics, AdSense, links.
const homeHtml = await (await home({ request: new Request("https://yomiwiki.com/") })).text();
const homeHeader = homeHtml.slice(homeHtml.indexOf("<header"), homeHtml.indexOf("</header>") + 9);
if (homeHeader.includes("보리장터")) errors.push("home header has 보리장터");
for (const slug of ["pack-unit-terms", "trade-terms", "produce-label-check", "kg-conversion", "wholesale-market-terms"]) if (!homeHtml.includes(`/knowledge/${slug}`)) errors.push(`home link missing ${slug}`);
if (!homeHtml.includes('name="google-site-verification"') || !homeHtml.includes("GTM-M3HSKLDR") || !homeHtml.includes('<meta name="google-adsense-account" content="ca-pub-5877883031077615">') || !homeHtml.includes("adsbygoogle.js?client=ca-pub-5877883031077615")) errors.push("home verification/analytics/adsense tags missing");
commonPageChecks(homeHtml, "home");

// 6. Glossary, utility pages and policy pages.
const glossaryHtml = await (await glossary()).text();
commonPageChecks(glossaryHtml, "glossary");
const indexHtml = await (await get("")).text();
if (indexHtml.includes("adsbygoogle")) errors.push("/knowledge list must not carry ads");
const searchHtml = await (await searchPage({ request: new Request("https://yomiwiki.com/search?q=%EB%8F%84%EC%A0%95%EC%9D%BC") })).text();
if (searchHtml.includes("adsbygoogle") || !searchHtml.includes('content="noindex,follow"')) errors.push("/search must be noindex without ads");
const nf = await get("no-such-page");
if (nf.status !== 404 || (await nf.text()).includes("adsbygoogle")) errors.push("404 status/ads");
if (sitemapXml.includes("/review-readiness")) errors.push("sitemap lists the old corrections address");
{
  const r = await oldCorrections({ request: new Request("https://yomiwiki.com/review-readiness") });
  if (r.status !== 301 || r.headers.get("Location") !== "https://yomiwiki.com/corrections") errors.push("/review-readiness must 301 to /corrections");
  const fsMod = await import("node:fs");
  const pathMod = await import("node:path");
  const staticNotFound = fsMod.readFileSync(pathMod.resolve(import.meta.dirname, "../public/404.html"), "utf8");
  if (/adsbygoogle|google-adsense-account/.test(staticNotFound)) errors.push("public/404.html must not carry AdSense code or meta");
  if (!staticNotFound.includes(OPERATOR_LINE)) errors.push("public/404.html footer operator line missing");
}

const policyNeeds = {
  about: ["사업자등록번호", "456-33-01705", "jnewmedia.com/company", "Google AdSense", "유료 게재", "scamreader.com", "AI 도구"],
  contact: ["010-2846-2011", "open.kakao.com/o/scuvl1wi", "open.kakao.com/o/p6HiJ9Pi", "consultingjinjeong@gmail.com", "의료원로 80-8", "영업일 기준"],
  "editorial-policy": ["AI 도구", "제이 미디어 편집팀", "감수", "이해관계", "가상 예시"],
  corrections: ["정정 처리 절차", "2026-10-26", "2026-08-09", "/review-readiness"],
  privacy: ["https://adssettings.google.com", "https://policies.google.com/technologies/ads", "제3자 공급업체", "Google Analytics", "localStorage", "시행일"],
  terms: ["시행일", "저작권"],
  disclaimer: ["국립농산물품질관리원", "경찰청"]
};
for (const [p, needs] of Object.entries(policyNeeds)) {
  const html = renderPolicy(p);
  for (const n of needs) if (!html.includes(n)) errors.push(`/${p}: missing “${n}”`);
  commonPageChecks(html, `/${p}`);
}
// Sister sites are listed on /about only, never in the site-wide footer.
if (SISTER_DOMAINS.some(d => homeHtml.slice(homeHtml.indexOf('<footer')).includes(d))) errors.push("footer lists sister sites");

// 7. Inline CSS stays in sync with public/knowledge.css.
{
  const fsMod = await import("node:fs");
  const pathMod = await import("node:path");
  const css = fsMod.readFileSync(pathMod.resolve(import.meta.dirname, "../public/knowledge.css"), "utf8").replace(/\r\n/g, "\n").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*/g, "").trim();
  const { CSS } = await import("../functions/_lib/css.js");
  if (css !== CSS) errors.push("functions/_lib/css.js is out of sync: run node scripts/sync-css.mjs");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`yomi site checks ok: ${entries.length} entries, ${Object.keys(MOVED).length} merged redirects, policy pages, sitemap, feed`);
