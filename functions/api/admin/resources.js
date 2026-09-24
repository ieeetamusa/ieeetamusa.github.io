
import {requireAuth,json} from "../../_auth.js";
export async function onRequestGet(ctx){const u=await requireAuth(ctx);if(!u)return json({error:"Unauthorized"},401);
 const {results}=await ctx.env.DB.prepare("SELECT id,title,description,url,category,published,created_at FROM resources ORDER BY created_at DESC").all(); return json({resources:results||[]});
}
export async function onRequestPost(ctx){const u=await requireAuth(ctx);if(!u)return json({error:"Unauthorized"},401);
 const b=await ctx.request.json().catch(()=>null), title=String(b?.title||"").trim(),description=String(b?.description||"").trim(),url=String(b?.url||"").trim(),category=String(b?.category||"").trim();
 if(!title||title.length>200||!/^https?:\/\//i.test(url)||url.length>2000||description.length>2000)return json({error:"Invalid resource fields."},400);
 await ctx.env.DB.prepare("INSERT INTO resources (title,description,url,category,published,created_at,created_by) VALUES (?,?,?,?,1,?,?)").bind(title,description,url,category,Date.now(),u.id).run();
 return json({ok:true});
}
export async function onRequestDelete(ctx){const u=await requireAuth(ctx);if(!u)return json({error:"Unauthorized"},401);
 const id=Number(new URL(ctx.request.url).searchParams.get("id")); if(!Number.isInteger(id))return json({error:"Invalid id."},400);
 await ctx.env.DB.prepare("DELETE FROM resources WHERE id=?").bind(id).run(); return json({ok:true});
}
