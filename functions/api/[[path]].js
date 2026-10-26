// The former wiki API (accounts, articles, comments, uploads) from the site's previous topic is retired.
// Every /api/* request now answers 410 Gone. Stored data is not touched by this handler.
export async function onRequest() {
  const body = JSON.stringify({ error: 'GONE', message: '이 API는 운영을 종료했습니다. 농산물 거래사전은 https://yomiwiki.com/ 에서 이용하세요.' });
  return new Response(body, { status: 410, headers: { 'Content-Type': 'application/json;charset=UTF-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public,max-age=3600' } });
}
