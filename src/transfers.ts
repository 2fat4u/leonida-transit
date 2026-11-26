import type {Mode,Network,Stop} from './model';
import {validWalkDistance} from './units';
export const WALK_LINE_ID='__walk__';
export interface WalkingOptions {enabled:boolean;maxDistance:number}
export function servicesAtStop(network:Network,stopId:string,allowed?:Mode[]){
 return network.lines.filter(l=>!allowed||allowed.includes(l.mode)).flatMap(line=>{
  const patterns=line.patterns.filter(p=>p.stops.includes(stopId));
  return patterns.length?[{line,patterns,boarding:patterns.filter(p=>p.stops.slice(0,-1).includes(stopId))}]:[];
 });
}
export function sharedStops(network:Network,lineA:string,lineB:string){
 const a=network.lines.find(l=>l.id===lineA),b=network.lines.find(l=>l.id===lineB);
 if(!a||!b||lineA===lineB)return [];
 const aa=new Set(a.patterns.flatMap(p=>p.stops)),bb=new Set(b.patterns.flatMap(p=>p.stops));
 return network.stops.filter(s=>aa.has(s.id)&&bb.has(s.id));
}
export function airDistance(a:Stop,b:Stop):number|null{
 if(!a.position||!b.position)return null;
 return Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y);
}
export function nearbyStops(network:Network,from:string,radius=300,limit=3,allowed?:Mode[]){
 const origin=network.stops.find(s=>s.id===from);
 if(!origin?.position||!validWalkDistance(radius))return [];
 const sourceServices=servicesAtStop(network,from,allowed).flatMap(s=>s.boarding.map(p=>`${s.line.id}:${p.id}`));
 return network.stops.flatMap(stop=>{
  if(stop.id===from)return [];
  const distance=airDistance(origin,stop);
  if(distance===null||distance>radius||distance<1)return [];
  const services=servicesAtStop(network,stop.id,allowed).filter(s=>s.boarding.some(p=>!sourceServices.includes(`${s.line.id}:${p.id}`)));
  return services.length?[{stop,distance,services}]:[];
 }).sort((a,b)=>a.distance-b.distance||a.stop.id.localeCompare(b.stop.id)).slice(0,Math.max(0,Math.min(3,limit)));
}
