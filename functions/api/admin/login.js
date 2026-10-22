
import {json,verifyPassword,randomToken,sessionCookie,SESSION_DAYS} from "../../_auth.js";
export async function onRequestPost({request,env}){
  const b=await request.json().catch(()=>null); const username=String(b?.username||"").trim().toLowerCase(), password=String(b?.password||"");
  if(!username||!password)return json({error:"Username and password are required."},400);
  const u=await env.DB.prepare("SELECT id,username,password_hash,password_salt FROM admins WHERE username=?").bind(username).first();
  if(!u||!(await verifyPassword(password,u.password_salt,u.password_hash))) return json({error:"Invalid credentials."},401);
  const token=randomToken(); const now=Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at<=?").bind(now),
    env.DB.prepare("INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)").bind(token,u.id,now+SESSION_DAYS*86400000)
  ]);
  return json({ok:true},200,{"Set-Cookie":sessionCookie(token)});
}
