import {parseNetwork,type Mode,type Network,type Stop} from './model';
export type CaptureStop={id?:string;name:string};
export interface CaptureInput {lineId:string;name:string;headsign:string;mode:Mode;sourceName:string;sourceUrl:string;stops:CaptureStop[]}
export function captureDirection(network:Network,input:CaptureInput,stamp:string):Network {
 if(input.stops.length<2)throw Error('Mindestens zwei Haltestellen hinzufügen.');
 const next=structuredClone(network);const stampId=stamp.replace(/[^a-zA-Z0-9_-]/g,'');if(!stampId)throw Error('Ungültige Erfassungskennung.');
 const lineId=input.lineId.trim();const sourceId=`entry-${stampId}`;const used=new Set(next.stops.map(s=>`${s.x},${s.y}`));
 next.sources=[...(next.sources??[]),{id:sourceId,name:input.sourceName.trim(),url:input.sourceUrl.trim(),checkedAt:new Date().toISOString().slice(0,10),scope:'Lokal eingegebener Beleg für diese Fahrtrichtung. Inhalt nicht automatisch verifiziert.'}];
 const ids=input.stops.map((s,i)=>{if(s.id){const existing=next.stops.find(x=>x.id===s.id);if(!existing)throw Error('Die ausgewählte Haltestelle existiert nicht mehr.');return existing.id;}
   let pos=0;while(used.has(`${70+(pos%7)*140},${90+Math.floor(pos/7)*90}`))pos++;
   const x=70+(pos%7)*140,y=90+(Math.floor(pos/7)%8)*90;used.add(`${x},${y}`);
   const added:Stop={id:`entry-${stampId}-${i}`,name:s.name.trim(),x,y,evidence:{sources:[sourceId],level:'single-source',note:'Lokal neu angelegt; noch nicht unabhängig bestätigt.'}};next.stops.push(added);return added.id;});
 const pattern={id:`entry-${stampId}`,headsign:input.headsign.trim(),stops:ids,minutes:ids.slice(1).map(()=>null),partial:true,evidence:{sources:[sourceId],level:'single-source' as const,note:'Lokal erfasste gerichtete Folge. Umfang und Vollständigkeit bitte im Spiel prüfen.'}};
 const existing=next.lines.find(l=>l.id===lineId);if(existing){if(existing.mode!==input.mode)throw Error('Das Verkehrsmittel stimmt nicht mit der vorhandenen Linie überein.');existing.patterns.push(pattern);}else next.lines.push({id:lineId,name:input.name.trim(),mode:input.mode,color:{bus:'#ffc45e',metro:'#20ead7',rail:'#ad8bff'}[input.mode],patterns:[pattern]});
 next.id=`${network.id.slice(0,35)}-entry-${stampId}`;next.status='community';next.name='Mein lokal ergänztes Verkehrsnetz';return parseNetwork(next);
}
