
import {requireAuth,json} from "../../_auth.js";
export async function onRequestGet(ctx){const u=await requireAuth(ctx);if(!u)return json({error:"Unauthorized"},401);
 const {results}=await ctx.env.DB.prepare("SELECT id,name,email,message,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 100").all(); return json({messages:results||[]});
}
