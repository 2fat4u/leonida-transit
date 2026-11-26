import { parseNetwork } from './model';
// Entirely fictional test network. No GTAMap stops, routes, times or geometry copied.
const stops = [
 ['hamlet','Hamlet Demo Station',130,160],['pine','Pine Grove Demo',260,160],['north','North Junction Demo',400,220],['airport','Airport Demo Terminal',130,440],['garden','Garden Square Demo',270,440],['central','Central Demo Station',400,440],['canal','Canal Street Demo',540,440],['bayside','Bayside Demo Pier',700,360],['beach','Ocean Demo Beach',840,440],['south','South Point Demo',700,630],['market','Market Hall Demo',540,630],['port','Harbor Demo Terminal',260,630],['island','Island Demo Stop',840,630],['hill','Hilltop Demo',540,130]
].map(([id,name,x,y])=>({id:id as string,name:name as string,x:x as number,y:y as number}));
const both=(ss:string[],mm:number[])=>[{id:'out',headsign:stops.find(s=>s.id===ss.at(-1))!.name,stops:ss,minutes:mm},{id:'back',headsign:stops.find(s=>s.id===ss[0])!.name,stops:[...ss].reverse(),minutes:[...mm].reverse()}];
export const demoNetwork=parseNetwork({schemaVersion:1,id:'vct-demo-2',name:'Vice City · Demo-Netz',status:'demo',source:{name:'Eigenes fiktives Testnetz · keine Spieldaten',url:'https://example.com/vice-city-transit-demo',license:'CC0-1.0 – nur die selbst erstellten Demo-Daten',checkedAt:'2026-11-26'},stops,lines:[
 {id:'D-R1',name:'Demo Regional',mode:'rail',color:'#a494ed',patterns:both(['hamlet','pine','north','central','port'],[5,6,7,8])},
 {id:'D-M1',name:'Demo Metro',mode:'metro',color:'#57dac5',patterns:both(['airport','garden','central','canal','bayside','beach'],[3,3,2,4,3])},
 {id:'D-B1',name:'Demo Coast Bus',mode:'bus',color:'#f6ba70',patterns:both(['north','hill','bayside','south','port'],[5,7,6,8])},
 {id:'D-B2',name:'Demo City Loop',mode:'bus',color:'#f28db3',patterns:[{id:'clockwise',headsign:'Central Demo Station · Ring im Uhrzeigersinn',stops:['central','canal','beach','island','south','market','central'],minutes:[4,7,4,5,4,6]}]}
]});
