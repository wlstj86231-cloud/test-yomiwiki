export async function onRequestGet(context) {
  return context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
}
