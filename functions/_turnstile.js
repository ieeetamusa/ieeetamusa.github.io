
// Server-side Turnstile check shared by the public forms. Returns an error message, or null if the token is valid.
export async function verifyTurnstile(request, env, token) {
  if(!env.TURNSTILE_SECRET) return "This form is not configured yet.";
  if(!token) return "Please complete the security check.";
  const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:request.headers.get("CF-Connecting-IP")||""})
  });
  return (await r.json()).success ? null : "Security verification failed. Please try again.";
}
