import {useState} from 'react';
import {ArrowDownUp,Footprints} from 'lucide-react';
import {t} from './i18n';
import {formatDistance,useUnits} from './units';
import type {Network} from './model';
import {nearbyStops,servicesAtStop,sharedStops} from './transfers';

export function StopConnections({network,stopId,exclude,onLine}:{network:Network;stopId:string;exclude?:string;onLine?:(id:string,stopId:string)=>void}){
 const services=servicesAtStop(network,stopId).filter(s=>s.line.id!==exclude&&(!exclude||s.boarding.length));
 if(!services.length)return null;
 return <div className="stop-connections"><small>{t(exclude?'Umsteigen zu':'Linien an diesem Halt')}</small><div>{services.map(s=><button type="button" key={s.line.id} onClick={()=>onLine?.(s.line.id,stopId)} disabled={!onLine} title={s.boarding.length?s.boarding.map(p=>t(p.headsign)).join(' · '):t('Nur Ankunft in der gelisteten Richtung')} style={{borderColor:s.line.color}}><i style={{background:s.line.color}}/>{s.line.id}{!s.boarding.length&&<span> · {t('Ankunft')}</span>}</button>)}</div></div>;
}

export function NearbyStops({network,stopId,radius}:{network:Network;stopId:string;radius:number}){
 const [units]=useUnits(); const nearby=nearbyStops(network,stopId,radius);
 return <div className="nearby-stops"><h3><Footprints size={16}/>{t('Nahe Haltestellen')}</h3><p>{t('Bis {0} Luftlinie · Fußweg ungeprüft',formatDistance(radius,units))}</p>{nearby.length?<ul>{nearby.map(n=><li key={n.stop.id}><strong>{n.stop.name}</strong><span>≈ {formatDistance(n.distance,units)} · {n.services.map(s=>s.line.id).join(' / ')}</span></li>)}</ul>:<p>{t('Keine weiteren Einstiegsmöglichkeiten innerhalb dieser Grenze erfasst.')}</p>}</div>;
}

export function TransferDirectory({network,onPick,onLine}:{network:Network;onPick:(id:string,role:'from'|'to')=>void;onLine:(id:string)=>void}){
 const [a,setA]=useState(network.lines.find(l=>l.id==='N02')?.id??network.lines[0].id);
 const [b,setB]=useState(network.lines.find(l=>l.id==='1618')?.id??network.lines[1]?.id??network.lines[0].id);
 const stops=sharedStops(network,a,b);
 return <section className="transfer-directory"><h2><ArrowDownUp size={21}/>{t('Umsteigen zwischen Linien')}</h2><p>{t('Gemeinsame Haltestellen im geladenen Netz. Die verfügbare Fahrtrichtung steht bei der jeweiligen Linie.')}</p><div className="transfer-selects"><label>{t('Erste Linie')}<select value={a} onChange={e=>setA(e.target.value)}>{network.lines.map(l=><option value={l.id} key={l.id}>{l.id} · {l.name}</option>)}</select></label><label>{t('Zweite Linie')}<select value={b} onChange={e=>setB(e.target.value)}>{network.lines.map(l=><option value={l.id} key={l.id}>{l.id} · {l.name}</option>)}</select></label></div>{stops.length?<ul>{stops.map(s=><li key={s.id}><strong>{s.name}</strong><StopConnections network={network} stopId={s.id} onLine={onLine}/><div className="transfer-stop-actions"><button onClick={()=>onPick(s.id,'from')}>{t('Als Start')}</button><button onClick={()=>onPick(s.id,'to')}>{t('Als Ziel')}</button></div></li>)}</ul>:<p>{t('Keine identische Haltestelle für dieses Linienpaar erfasst. Ein Fußumstieg kann trotzdem möglich sein.')}</p>}</section>;
}
