
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});}
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
  if(!env.TURNSTILE_SECRET) return json({error:"Contact form is not configured yet."},503);
  if(!token) return json({error:"Please complete the security check."},400);
  const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:request.headers.get("CF-Connecting-IP")||""})
  });
  const result=await verify.json();
  if(!result.success) return json({error:"Security verification failed. Please try again."},403);
  await env.DB.prepare("INSERT INTO contact_messages (name,email,message,created_at) VALUES (?,?,?,?)")
    .bind(name,email,message,Date.now()).run();
  return json({ok:true});
}
