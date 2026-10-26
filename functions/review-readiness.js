// The corrections policy and change log moved to /corrections on 2026-10-26; the old address keeps working.
export async function onRequestGet({ request }) {
  return Response.redirect(`${new URL(request.url).origin}/corrections`, 301);
}
