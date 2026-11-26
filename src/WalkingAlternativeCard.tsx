import {Footprints} from 'lucide-react';
import {t} from './i18n';
import {stopDisplayName,type Network} from './model';
import {formatDistance,useUnits} from './units';
import type {WalkingAlternative} from './walking-alternative';

export function WalkingAlternativeCard({alternative,network,onChoose}:{alternative:WalkingAlternative;network:Network;onChoose:()=>void}){
 const [units]=useUnits();
 const name=(id:string)=>{const stop=network.stops.find(s=>s.id===id);return stop?stopDisplayName(stop):id;};
 return <aside className="walking-alternative" aria-label={t('Alternative mit Fußweg')}>
  <h3><Footprints size={20}/>{t('Alternative mit Fußweg')}</h3>
  <p className="alternative-saving"><strong>{t('{0} statt {1} Streckenabschnitte',alternative.segments,alternative.originalSegments)}</strong><span>{t('Zusätzlich ca. {0} Luftlinie zu Fuß',formatDistance(alternative.walkingMetres,units))}</span></p>
  <p>{t('{0} statt {1} Umstiege',alternative.journey.transfers,alternative.originalTransfers)}</p>
  <details><summary>{t('Alternative mit Fußweg ansehen')}</summary>
   <ol className="alternative-legs">{alternative.journey.legs.map((leg,index)=><li key={index}>
    {leg.kind==='walk'?<><strong>{t('Zu Fuß zu {0}',name(leg.stops.at(-1)!))}</strong><span>{t('Von {0}',name(leg.stops[0]))} · {formatDistance(leg.distance??0,units)} {t('Luftlinie')}</span></>:<><strong>{leg.lineId} · {name(leg.stops[0])}</strong><span>{t('Aussteigen: {0}',name(leg.stops.at(-1)!))}</span></>}
   </li>)}</ol>
   <p className="alternative-caveat">{t('Fußwege und Querungen sind ungeprüft. Weniger Abschnitte bedeuten keine bestätigte kürzere Fahrzeit.')}</p>
   <button type="button" className="secondary full-width" onClick={onChoose}>{t('Diese Alternative verwenden')}</button>
  </details>
 </aside>;
}
