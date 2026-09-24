
export async function onRequestGet({env}) {
  const {results}=await env.DB.prepare("SELECT id,title,description,url,category,created_at FROM resources WHERE published=1 ORDER BY created_at DESC").all();
  return Response.json({resources:results||[]},{headers:{"Cache-Control":"public, max-age=60"}});
}
