import { onRequestGet as knowledge } from "../functions/knowledge/[[slug]].js";
import { onRequestGet as sitemap } from "../functions/sitemap.xml.js";
import { onRequestGet as feed } from "../functions/feed.xml.js";
import fs from "node:fs/promises";
import path from "node:path";

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
  if (!html.includes("utm_campaign=c2c_howto_202609")) errors.push(`${slug}: missing campaign`);
  if (!html.includes(`utm_content=${slug}`)) errors.push(`${slug}: missing utm_content`);
  if (!html.includes(`https://boribay.com/guides/${dest}?`)) errors.push(`${slug}: missing dest ${dest}`);
  if ((html.match(/boribay.com\/guides\//g) || []).length !== 1) errors.push(`${slug}: expected 1 boribay guide href`);
  if (html.includes("garak-market-price-lookup") || html.includes("garak-cabbage-price-lookup")) errors.push(`${slug}: Garak dest`);
  if (html.includes("occultworldcup") || html.includes("reportools") || html.includes("goatool") || html.includes("scamreader")) errors.push(`${slug}: satellite-to-satellite`);
  if (html.includes("제휴하지 않습니다") || html.includes("같은 운영자")) errors.push(`${slug}: operator statement present`);
}

const trade = await knowledge({ request: new Request("https://yomiwiki.com/knowledge/trade-terms"), params: { slug: "trade-terms" } });
const tradeHtml = await trade.text();
if (!tradeHtml.includes("utm_campaign=knowledge_article")) errors.push("trade-terms campaign rewritten");
if (!tradeHtml.includes("garak-market-price-lookup")) errors.push("trade-terms Garak dest missing");

const produceBox = await knowledge({ request: new Request("https://yomiwiki.com/knowledge/produce-box-terms"), params: { slug: "produce-box-terms" } });
const produceBoxHtml = await produceBox.text();
if (!produceBoxHtml.includes("utm_campaign=knowledge_article")) errors.push("produce-box-terms campaign rewritten");
if (!produceBoxHtml.includes("garak-pumpkin-price-lookup")) errors.push("produce-box pumpkin dest missing");
if (!produceBoxHtml.includes("garak-astringent-persimmon-price-lookup")) errors.push("produce-box astringent dest missing");
if (!produceBoxHtml.includes("garak-paprika-price-lookup")) errors.push("produce-box paprika dest missing");
if (produceBoxHtml.includes("utm_campaign=c2c_howto_202609")) errors.push("produce-box mixed C2C campaign");
if (produceBoxHtml.includes("제휴하지 않습니다") || produceBoxHtml.includes("같은 운영자")) errors.push("produce-box operator statement present");

const sitemapRes = await sitemap();
const sitemapXml = await sitemapRes.text();
for (const [slug] of expected) {
  if (!sitemapXml.includes(`https://yomiwiki.com/knowledge/${slug}`)) errors.push(`sitemap missing ${slug}`);
}
if (!sitemapXml.includes("knowledge/trade-terms")) errors.push("sitemap dropped trade-terms");

const feedXml = await (await feed()).text();
for (const [slug] of expected) {
  if (!feedXml.includes(`/knowledge/${slug}`)) errors.push(`feed missing ${slug}`);
}

const home = await fs.readFile(path.resolve(import.meta.dirname, "../public/index.html"), "utf8");
const homeHeader = home.slice(home.indexOf("<header"), home.indexOf("</header>") + 9);
if (homeHeader.includes("보리장터")) errors.push("home header has 보리장터");
if (!home.includes("/knowledge/pack-unit-terms")) errors.push("home pack-unit card missing");
if (!home.includes("/knowledge/trade-terms")) errors.push("home trade-terms card missing");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`yomi c2c inbound ok: ${expected.length} pages`);
