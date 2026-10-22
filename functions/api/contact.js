
import {json} from "../_auth.js";
import {verifyTurnstile} from "../_turnstile.js";
export async function onRequestPost({request,env}) {
  if(request.headers.get("Content-Type")?.startsWith("multipart/form-data")!==true &&
     request.headers.get("Content-Type")?.startsWith("application/x-www-form-urlencoded")!==true)
    return json({error:"Invalid form submission."},415);
  const form=await request.formData();
  const name=String(form.get("name")||"").trim(), email=String(form.get("email")||"").trim(),
        message=String(form.get("message")||"").trim(), website=String(form.get("website")||"").trim(),
        token=String(form.get("cf-turnstile-response")||"");
  if(website) return json({ok:true});
  if(!name||name.length>100||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254||!message||message.length>5000)
    return json({error:"Please provide a valid name, email, and message."},400);
  const failed=await verifyTurnstile(request,env,token);
  if(failed) return json({error:failed},failed.startsWith("This form")?503:403);
  await env.DB.prepare("INSERT INTO contact_messages (name,email,message,created_at) VALUES (?,?,?,?)")
    .bind(name,email,message,Date.now()).run();
  return json({ok:true});
}
