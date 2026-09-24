
const SESSION_DAYS = 7;
const enc = new TextEncoder();

function b64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}
function unb64(s) {
  s=s.replaceAll("-","+").replaceAll("_","/");
  while(s.length%4)s+="=";
  const bin=atob(s); return Uint8Array.from(bin,c=>c.charCodeAt(0));
}
export function randomToken(n=32){ const a=new Uint8Array(n); crypto.getRandomValues(a); return b64(a); }

export async function hashPassword(password, saltB64) {
  const salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:210000,hash:"SHA-256"},key,256);
  return { salt: b64(salt), hash: b64(new Uint8Array(bits)) };
}
function equal(a,b){ if(a.length!==b.length)return false; let x=0; for(let i=0;i<a.length;i++)x|=a[i]^b[i]; return x===0; }
export async function verifyPassword(password, salt, expected) {
  const r=await hashPassword(password,salt); return equal(unb64(r.hash),unb64(expected));
}
export async function requireAuth(context) {
  const cookie=context.request.headers.get("Cookie")||"";
  const m=cookie.match(/(?:^|;\s*)ieee_session=([^;]+)/);
  if(!m) return null;
  const row=await context.env.DB.prepare(
    "SELECT s.token,u.id,u.username FROM sessions s JOIN admins u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?"
  ).bind(m[1],Date.now()).first();
  return row||null;
}
export function sessionCookie(token,maxAge=SESSION_DAYS*86400){
  return `ieee_session=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}
export function clearSessionCookie(){ return "ieee_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"; }
export function json(data,status=200,headers={}) {
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers}});
}
