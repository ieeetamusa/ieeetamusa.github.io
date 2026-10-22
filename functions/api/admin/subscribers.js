
import {requireAuth,json} from "../../_auth.js";
// Quote CSV cells and neutralize leading =+-@ so spreadsheet apps don't run them as formulas.
const csvCell=v=>`"${String(v).replace(/^[=+\-@]/,"'$&").replace(/"/g,'""')}"`;
// Officers (signed in to /Admin) or the scheduled newsletter job (Authorization: Bearer NEWSLETTER_TOKEN) can read the list.
export async function onRequestGet(ctx){
  const bearer=ctx.request.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");
  const allowed=(ctx.env.NEWSLETTER_TOKEN&&bearer===ctx.env.NEWSLETTER_TOKEN)||await requireAuth(ctx);
  if(!allowed) return json({error:"Unauthorized"},401);
  const url=new URL(ctx.request.url);
  const {results=[]}=await ctx.env.DB.prepare("SELECT email,token,created_at FROM subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at").all();
  const subscribers=results.map(s=>({email:s.email,subscribedAt:new Date(s.created_at).toISOString(),unsubscribeUrl:`${url.origin}/api/unsubscribe?token=${s.token}`}));
  if(url.searchParams.get("format")==="csv"){
    const csv="email,subscribed_at\n"+subscribers.map(s=>`${csvCell(s.email)},${csvCell(s.subscribedAt)}`).join("\n");
    return new Response(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="subscribers.csv"',"Cache-Control":"no-store"}});
  }
  return json({subscribers});
}
