import {nearbyStops,WALK_LINE_ID,type WalkingOptions} from './transfers';
export const modes = ['bus', 'metro', 'rail'] as const;
export type Mode = typeof modes[number];
export const modeNames: Record<Mode, string> = {bus:'Bus', metro:'Metro', rail:'Regionalzug'};
export interface Evidence { sources: string[]; level: 'single-source'|'cross-listed'|'observed'; note?:string }
export interface Source {id:string; name:string; url:string; checkedAt:string; scope:string}
export interface Stop { id: string; name: string; x: number; y: number; evidence?:Evidence; position?:{x:number;y:number;system:'game';sourceId:string} }
export function stopDisplayName(stop:Stop){const match=stop.id.match(/^unknown-([^-]+)-(\d+)-(\d+)$/);return match?`${stop.name} [${match[1]} · ${Number(match[2])+1}/${match[3]}]`:stop.name;}
export interface Pattern { id: string; headsign: string; stops: string[]; minutes: (number|null)[]; airDistancesMetres?: (number|null)[]; evidence?:Evidence; partial?:boolean }
export interface Line { id: string; name: string; mode: Mode; color: string; patterns: Pattern[] }
export interface Network { schemaVersion: 1; id: string; name: string; status: 'demo' | 'community' | 'research'; source: {name:string; url:string; license:string; checkedAt:string}; stops:Stop[]; lines:Line[]; sources?:Source[]; notes?:string[] }
export interface Leg { lineId:string; patternId:string; headsign:string; stops:string[]; minutes:number|null; kind?:'walk';distance?:number }
export interface Journey { from:string; to:string; legs:Leg[]; minutes:number|null; transfers:number; transferMinutes:number; strategy?:'time'|'stops'|'transfers' }

const fail = (message:string):never => {throw new Error(message);};
const obj=(x:unknown):Record<string,unknown> => x && typeof x==='object' && !Array.isArray(x) ? x as Record<string,unknown> : fail('Ein JSON-Objekt wird erwartet.');
const str=(x:unknown,label:string,max=160):string => typeof x==='string' && x.trim().length>0 && x.length<=max ? x : fail(`${label}: Text mit 1–${max} Zeichen erwartet.`);
const id=(x:unknown):string => {const s=str(x,'ID',80);return /^[a-zA-Z0-9_-]+$/.test(s)?s:fail('IDs dürfen nur Buchstaben, Zahlen, _ und - enthalten.');};
const num=(x:unknown,min:number,max:number,label:string):number => typeof x==='number' && Number.isFinite(x) && x>=min && x<=max ? x : fail(`${label}: Zahl zwischen ${min} und ${max} erwartet.`);
const arr=(x:unknown,min:number,max:number,label:string):unknown[] => Array.isArray(x) && x.length>=min && x.length<=max ? x : fail(`${label}: ${min}–${max} Einträge erwartet.`);
function unique(ids:string[],label:string){if(new Set(ids).size!==ids.length)fail(`${label}: doppelte ID.`);}
function evidence(value:unknown):Evidence|undefined {if(value===undefined)return undefined;const e=obj(value);if(!['single-source','cross-listed','observed'].includes(e.level as string))fail('Unbekannter Belegstatus.');return {sources:arr(e.sources,1,20,'Quellenbelege').map(id),level:e.level as Evidence['level'],...(e.note===undefined?{}:{note:str(e.note,'Beleghinweis',800)})};}
function position(value:unknown):NonNullable<Stop['position']>{const p=obj(value);if(p.system!=='game')fail('Unbekanntes Positionssystem.');return {x:num(p.x,-200000,200000,'Positions-x'),y:num(p.y,-200000,200000,'Positions-y'),system:'game',sourceId:id(p.sourceId)};}
export const hasUnknownTimes=(n:Network,allowed:Mode[]=[...modes])=>n.lines.some(l=>allowed.includes(l.mode)&&l.patterns.some(p=>p.minutes.some(m=>m===null)));
export function parseNetwork(input:unknown):Network {
  const n=obj(input); if(n.schemaVersion!==1)fail('Nicht unterstützte schemaVersion (erwartet: 1).');
  if(n.status!=='demo' && n.status!=='community' && n.status!=='research')fail('status muss demo, community oder research sein.');
  const source=obj(n.source); const url=str(source.url,'Quellen-URL',1000);
  if(!/^https:\/\//.test(url))fail('Quellen-URL muss mit https:// beginnen.');
  const checkedAt=str(source.checkedAt,'Prüfdatum');if(!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)||!Number.isFinite(Date.parse(checkedAt))||new Date(checkedAt).toISOString().slice(0,10)!==checkedAt)fail('Prüfdatum als gültiges YYYY-MM-DD angeben.');
  const stops=arr(n.stops,2,500,'Haltestellen').map(v=>{const s=obj(v);return {id:id(s.id),name:str(s.name,'Haltestellenname'),x:num(s.x,30,970,'x'),y:num(s.y,30,770,'y'),...(s.evidence===undefined?{}:{evidence:evidence(s.evidence)}),...(s.position===undefined?{}:{position:position(s.position)})};});
  unique(stops.map(s=>s.id),'Haltestellen');const stopIds=new Set(stops.map(s=>s.id)); const stopById=new Map(stops.map(s=>[s.id,s])); let occurrenceCount=0;
  const lines=arr(n.lines,1,50,'Linien').map(v=>{const l=obj(v);if(l.id===WALK_LINE_ID)fail('Dieses Linienkürzel ist reserviert.');if(!modes.includes(l.mode as Mode))fail('Unbekanntes Verkehrsmittel.');const color=str(l.color,'Farbe');if(!/^#[0-9a-fA-F]{6}$/.test(color))fail('Farbe als #RRGGBB angeben.');
    const patterns=arr(l.patterns,1,4,'Richtungen').map(v=>{const p=obj(v);const ss=arr(p.stops,2,300,'Haltestellenfolge').map(id);occurrenceCount+=ss.length;
      if(ss.some(s=>!stopIds.has(s)))fail('Linie verweist auf eine unbekannte Haltestelle.');if(ss.some((s,i)=>i>0&&s===ss[i-1]))fail('Direkt aufeinanderfolgende Haltestellen müssen verschieden sein.');
      const minutes=arr(p.minutes??ss.slice(1).map(()=>null),ss.length-1,ss.length-1,'Fahrzeiten').map(v=>v===null?null:num(v,0.1,180,'Fahrzeit'));
      // Distances are derived from sourced positions, never from the schematic or supplied claims.
      if(p.airDistancesMetres!==undefined)arr(p.airDistancesMetres,ss.length-1,ss.length-1,'Luftlinien').forEach(v=>{if(v!==null)num(v,0,600000,'Luftlinie');});
      const airDistancesMetres=ss.slice(1).map((s,i)=>{const a=stopById.get(ss[i])!.position,b=stopById.get(s)!.position;return a&&b?Math.hypot(a.x-b.x,a.y-b.y):null;});
      if(p.partial!==undefined&&typeof p.partial!=='boolean')fail('partial muss true oder false sein.');
      return {id:id(p.id),headsign:str(p.headsign,'Fahrtrichtung'),stops:ss,minutes,...(airDistancesMetres.some(d=>d!==null)?{airDistancesMetres}:{}),...(p.evidence===undefined?{}:{evidence:evidence(p.evidence)}),...(p.partial===undefined?{}:{partial:p.partial as boolean})};});
    unique(patterns.map(p=>p.id),'Richtungen');return {id:id(l.id),name:str(l.name,'Linienname'),mode:l.mode as Mode,color,patterns};});
  unique(lines.map(l=>l.id),'Linien');if(occurrenceCount>3000)fail('Maximal 3000 Haltestellenvorkommen je Netz.');
  const sources=n.sources===undefined?undefined:arr(n.sources,1,30,'Quellen').map(v=>{const s=obj(v),url=str(s.url,'Quellen-URL',1000);if(!/^https:\/\//.test(url))fail('Quellen-URL muss mit https:// beginnen.');const checkedAt=str(s.checkedAt,'Prüfdatum');if(!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)||!Number.isFinite(Date.parse(checkedAt))||new Date(checkedAt).toISOString().slice(0,10)!==checkedAt)fail('Ungültiges Quellen-Prüfdatum.');return {id:id(s.id),name:str(s.name,'Quelle'),url,checkedAt,scope:str(s.scope,'Quellenumfang',800)};});
  if(sources)unique(sources.map(s=>s.id),'Quellen');const sourceIds=new Set(sources?.map(s=>s.id));
  for(const e of [...stops.map(s=>s.evidence),...lines.flatMap(l=>l.patterns.map(p=>p.evidence))])if(e&&e.sources.some(s=>!sourceIds.has(s)))fail('Beleg verweist auf unbekannte Quelle.');
  for(const stop of stops)if(stop.position&&!sourceIds.has(stop.position.sourceId))fail('Position verweist auf unbekannte Quelle.');
  const notes=n.notes===undefined?undefined:arr(n.notes,0,12,'Netzhinweise').map(v=>str(v,'Netzhinweis',1000));
  return {schemaVersion:1,id:id(n.id),name:str(n.name,'Netzname'),status:n.status as Network['status'],source:{name:str(source.name,'Quelle'),url,license:str(source.license,'Lizenz',500),checkedAt},stops,lines,...(sources?{sources}:{}),...(notes?{notes}:{})};
}

type Edge={to:string; minutes:number|null; board:number; kind:'board'|'ride'|'exit'|'continue'|'walk'; distance?:number; line?:Line; pattern?:Pattern; fromStop?:string; toStop?:string};
type Cost={minutes:number;boards:number;hops:number;walkMetres:number};
export function findJourney(network:Network,from:string,to:string,allowed:Mode[]= [...modes],preference:'fastest'|'transfers'|'stops'='fastest',walking?:WalkingOptions):Journey|null {
  if(!network.stops.some(s=>s.id===from)||!network.stops.some(s=>s.id===to))return null;
  if(from===to)return {from,to,legs:[],minutes:0,transfers:0,transferMinutes:0};
  const graph=new Map<string,Edge[]>(); const add=(key:string,e:Edge)=>graph.set(key,[...(graph.get(key)??[]),e]);
  for(const line of network.lines.filter(l=>allowed.includes(l.mode))) for(const p of line.patterns){
    p.stops.forEach((s,i)=>{const key=`p:${line.id}:${p.id}:${i}`;
      if(i<p.stops.length-1){
        const boarding=`b:${line.id}:${p.id}:${i}`;
        add(`s:${s}`,{to:boarding,minutes:4,board:1,kind:'board',line,pattern:p});
        // Boarding must include a travelled segment before another alight/walk.
        add(boarding,{to:`p:${line.id}:${p.id}:${i+1}`,minutes:p.minutes[i],board:0,kind:'ride',line,pattern:p,fromStop:s,toStop:p.stops[i+1]});
      }
      add(key,{to:`s:${s}`,minutes:0,board:0,kind:'exit'});
      if(i<p.stops.length-1)add(key,{to:`p:${line.id}:${p.id}:${i+1}`,minutes:p.minutes[i],board:0,kind:'ride',line,pattern:p,fromStop:s,toStop:p.stops[i+1]});
    });
    // An explicitly closed ring continues on the same vehicle across its boundary.
    if(p.stops[0]===p.stops.at(-1))add(`p:${line.id}:${p.id}:${p.stops.length-1}`,{to:`p:${line.id}:${p.id}:0`,minutes:0,board:0,kind:'continue'});
  }
  if(walking?.enabled){
    for(const stop of network.stops){
      for(const target of nearbyStops(network,stop.id,walking.maxDistance,3,allowed))add(`s:${stop.id}`,{to:`w:${target.stop.id}`,minutes:null,board:0,kind:'walk',distance:target.distance,fromStop:stop.id,toStop:target.stop.id});
      // A walk must lead to boarding; there are no chained walks or synthetic end links.
      for(const edge of graph.get(`s:${stop.id}`)??[])if(edge.kind==='board')add(`w:${stop.id}`,edge);
    }
  }
  const timeKnown=!hasUnknownTimes(network,allowed)&&!walking?.enabled;const strategy=preference==='transfers'?'transfers':preference==='stops'||!timeKnown?'stops':'time';
  const secondary=(a:Cost,b:Cost)=>timeKnown&&preference!=='stops'?a.minutes-b.minutes||a.hops-b.hops:a.hops-b.hops||a.minutes-b.minutes;
  const compare=(a:Cost,b:Cost)=>strategy==='transfers' ? a.boards-b.boards||a.walkMetres-b.walkMetres||secondary(a,b) : strategy==='stops'?a.hops-b.hops||a.walkMetres-b.walkMetres||a.boards-b.boards:a.minutes-b.minutes||a.boards-b.boards;
  // A heap keeps imports up to 3000 occurrences responsive on mobile devices.
  const heap:{key:string;cost:Cost}[]=[];
  function push(v:{key:string;cost:Cost}){heap.push(v);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(compare(heap[p].cost,v.cost)<=0)break;heap[i]=heap[p];i=p;}heap[i]=v;}
  function pop(){const first=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&compare(heap[c+1].cost,heap[c].cost)<0)c++;if(compare(last.cost,heap[c].cost)<=0)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;}
  const start=`s:${from}`,end=`s:${to}`;const costs=new Map<string,Cost>([[start,{minutes:0,boards:0,hops:0,walkMetres:0}]]);const prev=new Map<string,{key:string;edge:Edge}>();push({key:start,cost:{minutes:0,boards:0,hops:0,walkMetres:0}});
  while(heap.length){const {key,cost}=pop();if(compare(cost,costs.get(key)!)!==0)continue;if(key===end)break;
    for(const edge of graph.get(key)??[]){const next={minutes:cost.minutes+(edge.minutes??0),boards:cost.boards+edge.board,hops:cost.hops+(edge.kind==='ride'?1:edge.kind==='walk'?Math.max(1,Math.ceil((edge.distance??0)/100)):0),walkMetres:cost.walkMetres+(edge.distance??0)};const old=costs.get(edge.to);if(!old||compare(next,old)<0){costs.set(edge.to,next);prev.set(edge.to,{key,edge});push({key:edge.to,cost:next});}}
  }
  const total=costs.get(end);if(!total)return null;
  const path:Edge[]=[];for(let key=end;key!==start;){const p=prev.get(key)!;path.push(p.edge);key=p.key;}path.reverse();
  const legs:Leg[]=[];let current:Leg|undefined;
  for(const e of path){if(e.kind==='walk'){legs.push({kind:'walk',lineId:WALK_LINE_ID,patternId:'walk',headsign:network.stops.find(s=>s.id===e.toStop)!.name,stops:[e.fromStop!,e.toStop!],minutes:null,distance:e.distance});current=undefined;}if(e.kind==='board'){current={lineId:e.line!.id,patternId:e.pattern!.id,headsign:e.pattern!.headsign,stops:[],minutes:0};}if(e.kind==='ride'&&current){if(!current.stops.length){current.stops.push(e.fromStop!);legs.push(current);}current.stops.push(e.toStop!);current.minutes=current.minutes===null||e.minutes===null?null:current.minutes+e.minutes;}}
  const transfers=Math.max(0,legs.filter(l=>l.kind!=='walk').length-1);return {from,to,legs,minutes:legs.some(l=>l.minutes===null)?null:Math.round((total.minutes-4)*10)/10,transfers,transferMinutes:transfers*4,strategy};
}
export interface RideState {networkId:string; journey:Journey; leg:number; stop:number; phase:'ready'|'riding'|'transfer'|'arrived'}
export function startRide(networkId:string,journey:Journey):RideState {return {networkId,journey,leg:0,stop:0,phase:journey.legs.length?'ready':'arrived'};}
export function advanceRide(ride:RideState):RideState {
  if(ride.phase==='arrived')return ride;
  if(ride.phase==='ready'||ride.phase==='transfer')return {...ride,phase:'riding'};
  const leg=ride.journey.legs[ride.leg];if(ride.stop+1<leg.stops.length-1)return {...ride,stop:ride.stop+1};
  if(ride.leg+1<ride.journey.legs.length)return {...ride,leg:ride.leg+1,stop:0,phase:'transfer'};
  return {...ride,stop:leg.stops.length-1,phase:'arrived'};
}

// Exports need only stop topology; retain legacy time support when reading older files.
export function exportNetwork(network:Network){return {...network,lines:network.lines.map(l=>({...l,patterns:l.patterns.map(({minutes:_,...p})=>p)}))};}
