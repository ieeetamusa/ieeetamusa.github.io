
function unfold(s){return s.replace(/\r?\n[ \t]/g,"");}
function unescapeIcs(v){return v.replace(/\\n/gi,"\n").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\");}
function props(block){
  const out={};
  for(const line of unfold(block).split(/\r?\n/)){
    const i=line.indexOf(":"); if(i<0)continue;
    const left=line.slice(0,i), value=line.slice(i+1);
    const semi=left.indexOf(";"); const name=(semi<0?left:left.slice(0,semi)).toUpperCase();
    const params=semi<0?"":left.slice(semi+1);
    out[name]={value:unescapeIcs(value),params};
  } return out;
}
function dateValue(p){
  if(!p)return null; let v=p.value;
  if(/^\d{8}$/.test(v)) return new Date(`${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}T00:00:00Z`).toISOString();
  const m=v.match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)?(Z)?$/); if(!m)return null;
  if(m[8]) return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))).toISOString();
  return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)).toISOString();
}
function extractUrl(desc,explicit){
  if(explicit?.value) return explicit.value;
  const m=(desc||"").match(/https?:\/\/[^\s<>"\\]+/i); return m?m[0]:null;
}
async function fetchFeed(url){
  const r=await fetch(url,{headers:{"User-Agent":"IEEE-TAMUSA-Website/1.0"},cf:{cacheTtl:300,cacheEverything:true}});
  if(!r.ok) throw new Error(`Calendar feed returned ${r.status}`);
  const text=await r.text();
  const events=[];
  for(const block of unfold(text).split(/BEGIN:VEVENT/i).slice(1)){
    const body=block.split(/END:VEVENT/i)[0], p=props(body), start=dateValue(p.DTSTART);
    if(!start)continue;
    const desc=p.DESCRIPTION?.value||"", url=extractUrl(desc,p.URL);
    events.push({id:p.UID?.value||`${start}-${p.SUMMARY?.value||""}`,title:p.SUMMARY?.value||"IEEE Event",start,end:dateValue(p.DTEND),location:p.LOCATION?.value||"",description:desc.replace(/https?:\/\/\S+/g,"").trim(),url,rsvpUrl:url});
  } return events;
}
export async function onRequestGet({env}){
  const urls=(env.CALENDAR_FEEDS||"").split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
  if(!urls.length) return Response.json({events:[],configured:false,message:"Set CALENDAR_FEEDS to one or more Google Calendar/Jagsync/ICS calendar feed URLs."},{headers:{"Cache-Control":"public, max-age=60"}});
  const all=[];
  for(const u of urls){try{all.push(...await fetchFeed(u));}catch(e){console.error(e);}}
  const now=Date.now();
  const events=all.filter(e=>new Date(e.start).getTime()>=now-3600000).sort((a,b)=>new Date(a.start)-new Date(b.start));
  const unique=[...new Map(events.map(e=>[e.id,e])).values()].slice(0,100);
  return Response.json({events:unique,configured:true},{headers:{"Cache-Control":"public, max-age=300"}});
}
