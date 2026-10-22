
// Linked from every newsletter email: /api/unsubscribe?token=...
// GET only shows a confirm button, because email link scanners open links automatically; the POST does the unsubscribe.
function page(body){
  return new Response(`<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>Unsubscribe | IEEE TAMUSA</title><link rel="stylesheet" href="/style.css"></head>
<body><main class="page"><h1>Newsletter</h1>${body}</main></body></html>`,
    {headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
export function onRequestGet(){
  return page(`<p class="page-intro">Stop receiving the IEEE TAMUSA newsletter?</p><form method="post"><button>Unsubscribe</button></form>`);
}
export async function onRequestPost({request,env}){
  const token=new URL(request.url).searchParams.get("token")||"";
  const {meta}=await env.DB.prepare("UPDATE subscribers SET unsubscribed_at=? WHERE token=? AND unsubscribed_at IS NULL")
    .bind(Date.now(),token).run();
  return page(`<p class="page-intro">${meta.changes ? "You've been unsubscribed. Sorry to see you go!" : "This link has already been used or is invalid."}</p><a class="button" href="/">Back to home</a>`);
}
