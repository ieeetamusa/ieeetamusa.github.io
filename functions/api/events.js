// Merges upcoming events from the ICS feeds listed in CALENDAR_FEEDS.

// Feeds without a TZID (floating times) are assumed to be local to campus.
const SITE_TZ = "America/Chicago";

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

// Converts a wall-clock time in `tz` to a UTC Date (Workers run in UTC, so new Date(y,m,d,...) is wrong).
function zonedToUtc(y,mo,d,h,mi,s,tz){
  const guess=Date.UTC(y,mo-1,d,h,mi,s);
  let fmt;
  try{fmt=new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"});}
  catch{return zonedToUtc(y,mo,d,h,mi,s,SITE_TZ);} // non-IANA TZID, e.g. Outlook's "Central Standard Time"
  const p=Object.fromEntries(fmt.formatToParts(guess).map(x=>[x.type,+x.value]));
  const offset=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-guess;
  return new Date(guess-offset);
}

// Returns {iso, allDay}. All-day events keep a bare YYYY-MM-DD so they don't shift a day when displayed.
function dateValue(p){
  if(!p)return null; const v=p.value;
  const day=v.match(/^(\d{4})(\d\d)(\d\d)$/);
  if(day) return {iso:`${day[1]}-${day[2]}-${day[3]}`,allDay:true};
  const m=v.match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)?(Z)?$/); if(!m)return null;
  const [y,mo,d,h,mi,s]=m.slice(1,7).map(n=>+(n||0));
  if(m[7]) return {iso:new Date(Date.UTC(y,mo-1,d,h,mi,s)).toISOString(),allDay:false};
  const tz=p.params.match(/TZID="?([^";]+)"?/i)?.[1]||SITE_TZ;
  return {iso:zonedToUtc(y,mo,d,h,mi,s,tz).toISOString(),allDay:false};
}

const isHttp=u=>/^https?:\/\//i.test(u||"");
function extractUrl(desc,explicit){
  if(isHttp(explicit?.value)) return explicit.value;
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
    const desc=p.DESCRIPTION?.value||"";
    events.push({
      id:p.UID?.value||`${start.iso}-${p.SUMMARY?.value||""}`,
      title:p.SUMMARY?.value||"IEEE Event",
      start:start.iso,
      end:dateValue(p.DTEND)?.iso||null,
      allDay:start.allDay,
      location:p.LOCATION?.value||"",
      description:desc.replace(/https?:\/\/\S+/g,"").trim(),
      url:extractUrl(desc,p.URL)
    });
  } return events;
}

export async function onRequestGet({env}){
  const urls=(env.CALENDAR_FEEDS||"").split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
  if(!urls.length) return Response.json({events:[],configured:false},{headers:{"Cache-Control":"public, max-age=60"}});
  const results=await Promise.allSettled(urls.map(fetchFeed));
  results.filter(r=>r.status==="rejected").forEach(r=>console.error(r.reason));
  const all=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);
  // Keep events until they end (or an hour after start when there's no end time).
  const cutoff=Date.now()-3600000;
  const events=all.filter(e=>new Date(e.end||e.start).getTime()>=cutoff).sort((a,b)=>new Date(a.start)-new Date(b.start));
  const unique=[...new Map(events.map(e=>[e.id,e])).values()].slice(0,100);
  return Response.json({events:unique,configured:true},{headers:{"Cache-Control":"public, max-age=300"}});
}
