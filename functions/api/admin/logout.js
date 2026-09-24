
import {requireAuth,clearSessionCookie,json} from "../../_auth.js";
export async function onRequestPost({request,env}){
 const user=await requireAuth({request,env}); if(user) await env.DB.prepare("DELETE FROM sessions WHERE token=?").bind(user.token).run();
 return json({ok:true},{headers:{"Set-Cookie":clearSessionCookie()}});
}
