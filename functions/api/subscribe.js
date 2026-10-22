
import {json,randomToken} from "../_auth.js";
import {verifyTurnstile} from "../_turnstile.js";
export async function onRequestPost({request,env}) {
  const form=await request.formData().catch(()=>null);
  if(!form) return json({error:"Invalid form submission."},415);
  const email=String(form.get("email")||"").trim().toLowerCase();
  if(String(form.get("website")||"")) return json({ok:true}); // honeypot
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254) return json({error:"Please enter a valid email address."},400);
  const failed=await verifyTurnstile(request,env,String(form.get("cf-turnstile-response")||""));
  if(failed) return json({error:failed},failed.startsWith("This form")?503:403);
  // Re-subscribing clears a previous unsubscribe. The response is the same either way so the form can't be used to check who is subscribed.
  await env.DB.prepare("INSERT INTO subscribers (email,token,created_at) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET unsubscribed_at=NULL")
    .bind(email,randomToken(),Date.now()).run();
  return json({ok:true});
}
