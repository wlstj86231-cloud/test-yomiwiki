export async function onRequestGet({request}){const url=new URL(request.url);return Response.redirect(`${url.origin}/knowledge/produce-items`,302)}
