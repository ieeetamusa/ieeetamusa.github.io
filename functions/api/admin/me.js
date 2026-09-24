
import {requireAuth,json} from "../../_auth.js";
export async function onRequestGet(ctx){const u=await requireAuth(ctx); return u?json({authenticated:true,username:u.username}):json({authenticated:false},401);}
