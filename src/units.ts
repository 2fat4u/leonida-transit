import {useSyncExternalStore} from 'react';
import {readLanguage} from './i18n';

export type UnitSystem='metric'|'imperial';
export const METRES_PER_FOOT=.3048;
export const MAX_WALK_DISTANCE=10000;
let units:UnitSystem='metric';
try{if(localStorage.getItem('lt-units')==='imperial')units='imperial';}catch{/* Defaults also work offline without storage. */}
const listeners=new Set<()=>void>();
export function setUnits(next:UnitSystem){units=next;try{localStorage.setItem('lt-units',next);}catch{/* Keep the preference for this session. */}listeners.forEach(fn=>fn());}
export function useUnits(){return [useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>units,()=> 'metric' as UnitSystem),setUnits] as const;}
export function toDisplayDistance(metres:number,system:UnitSystem){return system==='imperial'?metres/METRES_PER_FOOT:metres;}
export function fromDisplayDistance(value:number,system:UnitSystem){return system==='imperial'?value*METRES_PER_FOOT:value;}
export function validWalkDistance(metres:number){return Number.isFinite(metres)&&metres>=1&&metres<=MAX_WALK_DISTANCE;}
export function formatDistance(metres:number,system:UnitSystem,language=readLanguage()){
 if(!Number.isFinite(metres))return '—';
 const large=system==='imperial'?metres>=1609.344:metres>=1000;
 const value=large?metres/(system==='imperial'?1609.344:1000):toDisplayDistance(metres,system);
 return `${new Intl.NumberFormat(language,{maximumFractionDigits:large?1:0}).format(value)} ${system==='imperial'?(large?'mi':'ft'):(large?'km':'m')}`;
}
