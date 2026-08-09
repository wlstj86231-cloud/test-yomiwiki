export async function onRequestGet({request,params}){
  const path=Array.isArray(params.path)?params.path.join('/'):String(params.path||'');
  const url=new URL(request.url);
  if(path==='Main_Page')return Response.redirect(`${url.origin}/`,301);
  return new Response(`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>이전 문서 종료 | 요미위키</title><body style="font-family:sans-serif;max-width:720px;margin:80px auto;padding:20px"><h1>이전 문서는 운영을 종료했습니다.</h1><p>요미위키는 농산물·농축산물·농기계 거래 지식사전으로 새롭게 운영됩니다.</p><p><a href="/">새 요미위키에서 현장 기준 검색하기</a></p></body></html>`,{status:410,headers:{'Content-Type':'text/html;charset=UTF-8','X-Robots-Tag':'noindex,follow'}});
}
