import { onRequestGet as knowledge } from "../functions/knowledge/[[slug]].js";
import { onRequestGet as sitemap } from "../functions/sitemap.xml.js";
import { onRequestGet as feed } from "../functions/feed.xml.js";
import { onRequestGet as home } from "../functions/index.js";

const SISTER_DOMAINS = ["scamreader.com", "tripmarking.com", "goatool.com", "reportools.com", "megapureunasset.kr", "sumimap.com", "policyfundpedia.com", "occultworldcup.com"];

const expected = [
  ["listing-field-terms", "produce-listing-three-fields", "수확일·실중량·품종 칸이 뜻하는 것"],
  ["machinery-listing-terms", "used-machinery-listing-nameplate", "명판·시간계·작업기 포함의 뜻"],
  ["region-listing-terms", "nearby-produce-listing-search", "우리 동네·산지·발송지를 구분하는 말"],
  ["nearby-machinery-terms", "nearby-used-tractor-search", "지역 매물과 탁송 매물을 가리는 말"],
  ["meetup-parcel-terms", "meetup-vs-direct-shipping-choice", "방문수령·산지직송·계근 시점"],
  ["bulk-buyer-terms", "fake-bulk-buyer-seller-stop", "전량매입·제3자 계좌·운송비 선송금"],
  ["c2c-vs-mall-terms", "produce-and-machinery-one-list", "개인 직거래와 입점몰 입점의 차이"],
  ["listing-date-terms", "kimjang-rice-listing-dates", "출하가능일·수확일·도정일"],
];
const errors = [];

for (const [slug, dest, h1] of expected) {
  const res = await knowledge({ request: new Request(`https://yomiwiki.com/knowledge/${slug}`), params: { slug } });
  const html = await res.text();
  const header = html.slice(html.indexOf("<header"), html.indexOf("</header>") + 9);
  if (header.includes("보리장터")) errors.push(`${slug}: header has 보리장터`);
  if (!html.includes(`<h1>${h1}</h1>`)) errors.push(`${slug}: H1 mismatch`);
  if (!html.includes("utm_medium=referral&utm_campaign=support")) errors.push(`${slug}: missing support campaign`);
  if (!html.includes(`utm_content=${slug}`)) errors.push(`${slug}: missing utm_content`);
  if (!html.includes(`https://boribay.com/guides/${dest}?`)) errors.push(`${slug}: missing dest ${dest}`);
  if ((html.match(/boribay.com\/guides\//g) || []).length !== 1) errors.push(`${slug}: expected 1 boribay guide href`);
  if (html.includes("garak-market-price-lookup") || html.includes("garak-cabbage-price-lookup")) errors.push(`${slug}: Garak dest`);
  for (const href of html.match(/href="https:\/\/[^"]+"/g) || []) {
    const host = new URL(href.slice(6, -1).replace(/&amp;/g, "&")).hostname.replace(/^www\./, "");
    if (!["boribay.com", "yomiwiki.com"].includes(host) && !SISTER_DOMAINS.includes(host) && !/\.(go|or)\.kr$/.test(host)) errors.push(`${slug}: unexpected external host ${host}`);
  }
  if (!html.includes('id="checks"')) errors.push(`${slug}: missing practical checks`);
  if (html.includes("제휴하지 않습니다") || html.includes("같은 운영자")) errors.push(`${slug}: operator statement present`);
}

const trade = await knowledge({ request: new Request("https://yomiwiki.com/knowledge/trade-terms"), params: { slug: "trade-terms" } });
const tradeHtml = await trade.text();
if (!tradeHtml.includes("utm_campaign=support")) errors.push("trade-terms support campaign missing");
if (!tradeHtml.includes("agricultural-wholesale-market-guide")) errors.push("trade-terms wholesale guide dest missing");
if (/garak-[a-z-]+-price-lookup/.test(tradeHtml)) errors.push("trade-terms retired Garak dest");

const label = await knowledge({ request: new Request("https://yomiwiki.com/knowledge/produce-label-check"), params: { slug: "produce-label-check" } });
const labelHtml = await label.text();
if (label.status !== 200 || !labelHtml.includes('<link rel="canonical" href="https://yomiwiki.com/knowledge/produce-label-check">')) errors.push("label-check status or canonical");
if (!labelHtml.includes("자료 확인일 <time datetime=\"2026-10-26\">2026-10-26</time>") || !labelHtml.includes("menuId=MN40333")) errors.push("label-check source record");
if (!labelHtml.includes("표준규격품 표시가 없으면 바로 불량 상품인가요?")) errors.push("label-check scope caveat");
if ((labelHtml.match(/boribay.com\/guides\//g) || []).length !== 1 || !labelHtml.includes("produce-direct-shipping-buying-guide")) errors.push("label-check contextual destination");

const produceBox = await knowledge({ request: new Request("https://yomiwiki.com/knowledge/produce-box-terms"), params: { slug: "produce-box-terms" } });
const produceBoxHtml = await produceBox.text();
if (!produceBoxHtml.includes("utm_campaign=support")) errors.push("produce-box-terms support campaign missing");
if ((produceBoxHtml.match(/boribay\.com\/guides\/agricultural-price-lookup/g) || []).length !== 1) errors.push("produce-box price lookup dest");
if (/garak-[a-z-]+-price-lookup/.test(produceBoxHtml)) errors.push("produce-box retired Garak dest");
if (produceBoxHtml.includes("제휴하지 않습니다") || produceBoxHtml.includes("같은 운영자")) errors.push("produce-box operator statement present");

const sitemapRes = await sitemap();
const sitemapXml = await sitemapRes.text();
for (const [slug] of expected) {
  if (!sitemapXml.includes(`https://yomiwiki.com/knowledge/${slug}`)) errors.push(`sitemap missing ${slug}`);
}
if (!sitemapXml.includes("knowledge/trade-terms")) errors.push("sitemap dropped trade-terms");
if (!sitemapXml.includes("knowledge/produce-label-check")) errors.push("sitemap missing label-check");

const feedXml = await (await feed()).text();
for (const [slug] of expected) {
  if (!feedXml.includes(`/knowledge/${slug}`)) errors.push(`feed missing ${slug}`);
}
if (!feedXml.includes("/knowledge/produce-label-check")) errors.push("feed missing label-check");

const homeHtml = await (await home({ request: new Request("https://yomiwiki.com/") })).text();
const homeHeader = homeHtml.slice(homeHtml.indexOf("<header"), homeHtml.indexOf("</header>") + 9);
if (homeHeader.includes("보리장터")) errors.push("home header has 보리장터");
for (const slug of ["pack-unit-terms", "trade-terms", "produce-label-check", "kg-conversion", "wholesale-market-terms"]) if (!homeHtml.includes(`/knowledge/${slug}`)) errors.push(`home link missing ${slug}`);
if (!homeHtml.includes('name="google-site-verification"') || !homeHtml.includes("GTM-M3HSKLDR") || !homeHtml.includes("ca-pub-5877883031077615")) errors.push("home verification/analytics/adsense tags missing");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`yomi c2c inbound ok: ${expected.length} pages`);
