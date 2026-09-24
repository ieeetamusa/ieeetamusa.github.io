
import {hashPassword,json} from "../../_auth.js";
export async function onRequestPost({request,env}){
 const token=request.headers.get("Authorization")?.replace(/^Bearer\s+/i,""); if(!env.SETUP_TOKEN||token!==env.SETUP_TOKEN)return json({error:"Unauthorized"},401);
 const count=await env.DB.prepare("SELECT COUNT(*) n FROM admins").first();
 if(Number(count?.n)>0)return json({error:"Admin setup has already been completed."},409);
 const b=await request.json().catch(()=>null), username=String(b?.username||"").trim().toLowerCase(), password=String(b?.password||"");
 if(!/^[a-z0-9._-]{3,40}$/.test(username)||password.length<12)return json({error:"Use a valid username and a password of at least 12 characters."},400);
 const h=await hashPassword(password);
 await env.DB.prepare("INSERT INTO admins (username,password_hash,password_salt,created_at) VALUES (?,?,?,?)").bind(username,h.hash,h.salt,Date.now()).run();
 return json({ok:true});
}
