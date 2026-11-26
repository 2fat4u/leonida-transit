import {airDistance,WALK_LINE_ID} from './transfers';
import {MAX_WALK_DISTANCE} from './units';
import { demoNetwork } from './data';
import { researchNetwork } from './research-data';
import {parseNetwork, type Network, type RideState} from './model';
export function readNetwork():Network {try{const data=localStorage.getItem('vct-network');if(!data)return researchNetwork;const n=JSON.parse(data);if(n.id==='vct-demo-1')return demoNetwork;
  // Existing calls keep their order; declared loop closures are appended. Validate saved rides below.
  if(n.id==='lt-research-20261126-2'||n.id==='lt-research-20261126-3')return researchNetwork;
  if((n.id==='vct-research-20261126-1'||n.id==='lt-research-20261126-2')&&!localStorage.getItem('vct-ride'))return researchNetwork;
  // Preserve legacy imports while excluding the removed service category.
  if(Array.isArray(n.lines)&&n.lines.some((l:{mode?:string})=>l.mode==='night')){n.lines=n.lines.filter((l:{mode?:string})=>l.mode!=='night');n.id=String(n.id)+'-day';}
  return parseNetwork(n);}catch{return researchNetwork;}}
export function saveLocal(key:string,value:unknown):boolean {try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function readRide(network:Network):RideState|null {try{
  const value=localStorage.getItem('vct-ride');if(!value)return null;const r=JSON.parse(value) as RideState;
  const compatiblePrevious=['lt-research-20261126-2','lt-research-20261126-3'].includes(r.networkId)&&network.id==='lt-research-20261126-4';
  if((r.networkId!==network.id&&!compatiblePrevious)||!r.journey||!Array.isArray(r.journey.legs)||!r.journey.legs.length||r.journey.legs.length>3000||!['ready','riding','transfer','arrived'].includes(r.phase))return null;
  if(!Number.isInteger(r.leg)||r.leg<0||r.leg>=r.journey.legs.length||!Number.isInteger(r.stop))return null;
  for(let i=0;i<r.journey.legs.length;i++){const l=r.journey.legs[i];
    if(i&&r.journey.legs[i-1].stops.at(-1)!==l.stops?.[0])return null;
    if(l.kind==='walk'){const a=network.stops.find(s=>s.id===l.stops?.[0]),b=network.stops.find(s=>s.id===l.stops?.[1]);if(!a||!b||l.stops.length!==2||l.lineId!==WALK_LINE_ID||typeof l.distance!=='number'||!Number.isFinite(l.distance))return null;const distance=airDistance(a,b);if(distance===null||distance<1||distance>MAX_WALK_DISTANCE||Math.abs(distance-l.distance)>1||r.journey.legs[i+1]?.kind==='walk'||i===r.journey.legs.length-1)return null;continue;}
    const p=network.lines.find(x=>x.id===l.lineId)?.patterns.find(x=>x.id===l.patternId);if(!p||!Array.isArray(l.stops)||l.stops.length<2)return null;
    const ss=p.stops[0]===p.stops.at(-1)?[...p.stops,...p.stops.slice(1)]:p.stops;
    if(!ss.some((_,j)=>l.stops.every((s,k)=>ss[j+k]===s)))return null;
    if(i&&r.journey.legs[i-1].stops.at(-1)!==l.stops[0])return null;
  }
  if(r.stop<0||r.stop>=r.journey.legs[r.leg].stops.length||r.journey.from!==r.journey.legs[0].stops[0]||r.journey.to!==r.journey.legs.at(-1)!.stops.at(-1))return null;
  return {...r,networkId:network.id};
}catch{return null;}}
