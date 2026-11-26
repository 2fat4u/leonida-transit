import type {Network} from './model';
import outlines from './geography-outlines.json';
import pathReferences from './geographic-routes.json';
import {fitPoints,type MapEdge,type Point,type StationPoint,type ViewBox} from './schematic';

// Uniform game-coordinate projection for aligned user images. Never snap these nodes.
export const GEOGRAPHIC_BOX:ViewBox={x:0,y:0,width:1400,height:2000};
export const projectGeographic=(x:number,y:number):Point=>({x:(x+10000)/10,y:(10500-y)/10});
export const geographicRegions:Record<string,ViewBox>={
 all:GEOGRAPHIC_BOX,city:fitPoints([projectGeographic(-4500,-3000),projectGeographic(2600,3000)],45),
 north:fitPoints([projectGeographic(-9000,2800),projectGeographic(2300,10000)],45),
 south:fitPoints([projectGeographic(-8500,-8300),projectGeographic(1000,-2600)],45)
};
export function makeGeographic(network:Network){
 const nodes=new Map<string,StationPoint>();
 for(const stop of network.stops)if(stop.position)nodes.set(stop.id,{...projectGeographic(stop.position.x,stop.position.y),id:stop.id,stopId:stop.id});
 const edges:MapEdge[]=[],seen=new Set<string>();
 for(const line of network.lines)for(const pattern of line.patterns)pattern.stops.slice(1).forEach((to,i)=>{
  const from=pattern.stops[i],key=`${line.id}:${[from,to].sort().join(':')}`;
  const a=nodes.get(from),b=nodes.get(to);if(!a||!b||seen.has(key))return;
  seen.add(key);edges.push({key,lineId:line.id,from,to,points:[a,b]});
 });
 return {nodes,edges,geographic:true};
}

// Named reference positions from GTAMap's public home-page map configuration,
// checked 2026-11-26. Approximate place labels, not surveyed control points.
export const referencePlaces=[
 {id:'place-vcia',name:'VCIA',x:-2800,y:-650},
 {id:'place-millport',name:'Millport',x:-885,y:6565},
 {id:'place-key-lento',name:'Key Lento',x:-2509,y:-5894},
 {id:'place-port-gellhorn',name:'Port Gellhorn',x:-6543,y:3812},
 {id:'place-ambrosia',name:'Ambrosia',x:-2900,y:4200},
 {id:'place-draper',name:'Draper Island',x:-7450,y:5150},
 {id:'place-capri',name:'Capri',x:-7128,y:167},
 {id:'place-watson',name:'Watson Bay',x:-4950,y:-3250},
 {id:'place-goose',name:'Goose Key',x:-6600,y:-6380},
 {id:'place-ocean-beach',name:'Ocean Beach',x:1750,y:500},
 {id:'place-waning',name:'Waning Sands',x:-100,y:3900}
];

export const geographyOutlines=outlines;
export const geographicPathSource=pathReferences.source;
export type GeographicPath={key:string;lineId:string;patternId:string;points:Point[];sourced:boolean};
export function geographicRoutePaths(network:Network):GeographicPath[]{
 const positions=new Map(network.stops.map(s=>[s.id,s.position]));
 const original=pathReferences.positions as Record<string,number[]>;
 return network.lines.flatMap(line=>line.patterns.flatMap<GeographicPath>(pattern=>{
  const source=pathReferences.routes.find(r=>r.lineId===line.id&&r.patternId===pattern.id);
  const matches=source&&source.calls.length===pattern.stops.length&&source.calls.every((id,i)=>{
   const p=positions.get(id),expected=original[id];return id===pattern.stops[i]&&p&&expected&&p.x===expected[0]&&p.y===expected[1];
  });
  if(matches)return [{key:`source:${line.id}:${pattern.id}`,lineId:line.id,patternId:pattern.id,points:source.coordinates.map(([x,y])=>projectGeographic(x,y)),sourced:true}];
  return pattern.stops.slice(1).flatMap((to,i)=>{const from=pattern.stops[i],a=positions.get(from),b=positions.get(to);return a&&b?[{key:`${line.id}:${[from,to].sort().join(':')}`,lineId:line.id,patternId:pattern.id,points:[projectGeographic(a.x,a.y),projectGeographic(b.x,b.y)],sourced:false}]:[];});
 }));
}
