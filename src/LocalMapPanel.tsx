import {useEffect,useRef,useState} from 'react';
import {t} from './i18n';
import type {Network} from './model';
import {projectGeographic,referencePlaces} from './geography';
import {formatDistance,useUnits} from './units';
import {AlignmentImage} from './AlignmentImage';
import {alignmentCheck,alignmentDraft,defaultAnchors,imageTransform,inverseTransform,loadLocalMap,readImageFile,saveLocalMap,validLocalMap,type Anchor,type LocalMap} from './local-map';

export function useLocalMap(){
 const [map,setMap]=useState<LocalMap|null>(null),[ready,setReady]=useState(false),[error,setError]=useState('');
 const dirty=useRef(false),saveQueue=useRef(Promise.resolve());
 useEffect(()=>{let active=true;loadLocalMap().then(m=>{if(active&&!dirty.current)setMap(m);}).catch(()=>{if(active)setError(t('Lokaler Speicher ist nicht verfügbar. Das Bild funktioniert nur für diese Sitzung.'));}).finally(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
 // Publish a change to the UI only after its transaction commits. A reload after
 // removing an image must not resurrect a record from an unfinished write.
 const update=(next:LocalMap|null)=>{dirty.current=true;saveQueue.current=saveQueue.current.then(async()=>{try{await saveLocalMap(next);setError('');}catch{setError(t('Das Kartenbild konnte nicht dauerhaft gespeichert werden. Es bleibt für diese Sitzung verfügbar.'));}setMap(next);});};
 const [url,setUrl]=useState<string|null>(null);
 useEffect(()=>{if(!map){setUrl(null);return;}const next=URL.createObjectURL(map.blob);setUrl(next);return()=>URL.revokeObjectURL(next);},[map?.blob]);
 return {map,url,update,ready,error};
}
export function LocalMapPanel({network,map,url,onChange,onShow,error,ready}:{network:Network;map:LocalMap|null;url:string|null;onChange:(m:LocalMap|null)=>void;onShow:()=>void;error:string;ready:boolean}){
 const [draft,setDraft]=useState<Anchor[]>(map?alignmentDraft(map):[]),[active,setActive]=useState(0),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[showPreview,setShowPreview]=useState(true);
 const [units]=useUnits(); const details=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{setDraft(map?alignmentDraft(map):[]);},[map?.blob,map?.anchors]);
 useEffect(()=>{setMessage('');if(map&&map.alignmentVersion!==2&&details.current)details.current.open=true;},[map?.blob]);
 const references=[...referencePlaces.map(p=>({id:p.id,name:p.name,game:{x:p.x,y:p.y}})),...network.stops.filter(s=>s.position).map(s=>({id:s.id,name:s.name,game:{x:s.position!.x,y:s.position!.y}}))];
 const report=map?alignmentCheck(draft,map.width,map.height):null,matrix=report?.matrix??null;
 const previewPoints=map&&matrix?network.stops.flatMap(s=>{if(!s.position)return [];const p=inverseTransform(matrix,projectGeographic(s.position.x,s.position.y));return p&&p.x>=0&&p.x<=map.width&&p.y>=0&&p.y<=map.height?[{...p,id:s.id}]:[];}):[];
 const expected=matrix&&draft[2]?inverseTransform(matrix,projectGeographic(draft[2].game.x,draft[2].game.y)):null;
 const legacy=!!map&&map.alignmentVersion!==2;
 const canApply=!!matrix&&!!map&&validLocalMap({...map,anchors:draft,alignmentVersion:2});
 const stepNames=[t('Erster Ort'),t('Zweiter Ort'),t('Kontrolle · optional')];
 return <details ref={details} className="local-map-panel"><summary>{t('Eigenes Kartenbild')} {map&&<span>· {map.name}</span>}</summary>
  <p>{t('Lade eine selbst beschaffte Karte. Das Bild bleibt auf diesem Gerät und wird weder hochgeladen noch im Netzexport mitgegeben.')}</p>
  <label className="local-map-file">{busy?t('Bild wird geladen…'):t('Kartenbild auswählen')}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!ready||busy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);setMessage('');try{const next=await readImageFile(file);onChange(next);setDraft(next.anchors);setActive(0);onShow();}catch{setMessage(t('Bitte ein lesbares JPG-, PNG- oder WebP-Bild bis 15 MB und 30 Megapixel wählen.'));}finally{setBusy(false);}}}/></label>
  {(error||message)&&<p role="status" className="local-map-status">{error||message}</p>}
  {map&&url&&<>
   <p><strong>{map.name}</strong> · {map.width} × {map.height}</p>
   {legacy&&<p className="alignment-legacy" role="status">{t('Dein Bild und die bisherigen Punkte sind noch da. Die alte Ausrichtung wird nicht mehr angezeigt. Prüfe die Vorschau und übernimm die proportionale Ausrichtung, oder setze die Punkte neu.')}</p>}
   <p>{t('Wähle zwei gut erkennbare Orte weit auseinander: zuerst Ort 1 im Bild antippen, dann Ort 2. Der dritte Punkt ist eine freiwillige Kontrolle. Das Bild wird nicht gestreckt oder geschert.')}</p>
   <div className="alignment-steps alignment-named-steps">{draft.map((a,i)=><button type="button" key={i} aria-label={t('Punkt {0}: {1}',i+1,a.name)} aria-pressed={active===i} onClick={()=>setActive(i)}><b>{i+1}</b><span>{a.name}<small>{stepNames[i]}{a.image?' · ✓':''}</small></span></button>)}</div>
   {draft[active]&&<label>{t('Referenzpunkt {0}',active+1)}<select aria-label={t('Referenzpunkt {0}',active+1)} value={draft[active].id} onChange={e=>{const p=references.find(r=>r.id===e.target.value)!;setDraft(d=>d.map((a,i)=>i===active?{...p,image:a.image}:a));}}><optgroup label={t('Orte · ungefähre Mitte')}>{references.slice(0,referencePlaces.length).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</optgroup><optgroup label={t('Haltestellen')}>{references.slice(referencePlaces.length).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</optgroup></select></label>}
   <div className="alignment-instructions" aria-live="polite">{t('Punkt {0}: {1} im Bild antippen.',active+1,draft[active]?.name??'')}{active===2&&<small>{t('Optional: Dieser Punkt prüft die Lage und verändert die Form des Bildes nicht.')}</small>}</div>
   {matrix&&<label className="alignment-preview-toggle"><input type="checkbox" checked={showPreview} onChange={e=>setShowPreview(e.target.checked)}/>{t('Erwartete Haltestellen im Bild zeigen')}</label>}
   <AlignmentImage url={url} width={map.width} height={map.height} anchors={draft} active={active} overlayPoints={showPreview?previewPoints:[]} expectedCheck={expected?{...expected,name:draft[2].name}:undefined} onPick={point=>{setDraft(d=>d.map((a,i)=>i===active?{...a,image:point}:a));setActive(i=>Math.min(2,i+1));setMessage('');}}/>
   {matrix&&<p className="alignment-preview-legend">{t('Türkise Punkte: erwartete Haltestellen. Violettes Kreuz: erwartete Lage des Prüforts.')}</p>}
   <div className="alignment-coordinates">{draft.map((a,i)=><div key={i}><b>{i+1} · {a.name}{i===2?` · ${t('optional')}`:''}</b><label>{t('Horizontal (%)')}<input aria-label={t('Punkt {0} horizontal (%)',i+1)} type="number" min="0" max="100" step=".01" value={a.image?Math.round(a.image.x*10000)/100:''} onChange={e=>{const v=e.target.value===''?null:Number(e.target.value)/100;setDraft(d=>d.map((a,j)=>j===i?{...a,image:v===null?null:{x:v,y:a.image?.y??.5}}:a));}}/></label><label>{t('Vertikal (%)')}<input aria-label={t('Punkt {0} vertikal (%)',i+1)} type="number" min="0" max="100" step=".01" value={a.image?Math.round(a.image.y*10000)/100:''} onChange={e=>{const v=e.target.value===''?null:Number(e.target.value)/100;setDraft(d=>d.map((a,j)=>j===i?{...a,image:v===null?null:{x:a.image?.x??.5,y:v}}:a));}}/></label></div>)}</div>
   {!matrix&&draft[0]?.image&&draft[1]?.image&&<p className="local-map-status">{t('Ort 1 und Ort 2 müssen verschieden und im Bild weit genug auseinanderliegen. Bitte prüfe die Auswahl und die gesetzten Punkte.')}</p>}
   {matrix&&!canApply&&<p className="local-map-status">{t('Bitte für gesetzte Punkte gültige Werte zwischen 0 und 100 Prozent verwenden.')}</p>}
   {report&&<div className="alignment-report" role="status"><strong>{t('Proportionen bleiben erhalten')}</strong><p>{t('Die Karte wird nur verschoben, gedreht und gleichmäßig vergrößert. Prüfe vor dem Übernehmen, ob die eingeblendeten Haltestellen zur Karte passen.')}</p>
    {Math.abs(report.rotationDegrees)>30&&<p className="alignment-warning">{t('Die Karte würde stark gedreht. Prüfe, ob Ort 1 und Ort 2 richtig zugeordnet sind.')}</p>}
    {report.residualMetres!==null&&<p className={report.residualMetres>report.toleranceMetres?'alignment-warning':'alignment-check-ok'}>{t('Abweichung am freiwilligen Prüfpunkt: ca. {0}.',formatDistance(report.residualMetres,units))} {report.residualMetres>report.toleranceMetres?t('Der Prüfpunkt passt noch nicht gut. Prüfe zuerst die beiden Ausrichtungsorte; das Bild wird für den dritten Punkt nicht verzerrt.'):t('Das ist eine Orientierungshilfe aus vorläufigen Positionsdaten.')}</p>}
   </div>}
   <div className="alignment-apply-actions"><button type="button" className="secondary" disabled={!canApply} onClick={()=>{onChange({...map,anchors:draft,enabled:true,alignmentVersion:2});onShow();setMessage(t('Ausrichtung übernommen. Die Bildproportionen bleiben erhalten.'));}}>{t('Ausrichtung übernehmen')}</button>
    <button type="button" onClick={()=>{setDraft(defaultAnchors());setActive(0);setMessage('');}}>{t('Punkte neu setzen')}</button>
    {draft[2]?.image&&<button type="button" onClick={()=>setDraft(d=>d.map((a,i)=>i===2?{...a,image:null}:a))}>{t('Prüfpunkt entfernen')}</button>}
   </div>
   <p className="alignment-caution">{t('Ortsmitten sind ungefähre Referenzen aus Fan-Daten. Exakt bekannte Halte sind genauer. Unterschiedliche Karten oder ungenaue Punkte können weiterhin zu versetzten Haltestellen führen.')}</p>
   <label className="local-map-toggle"><input type="checkbox" checked={map.enabled&&map.alignmentVersion===2} disabled={legacy} onChange={e=>onChange({...map,enabled:e.target.checked})}/>{t('Eigenes Bild einblenden')}</label>
   <label>{t('Deckkraft')}<input aria-label={t('Deckkraft')} type="range" min="10" max="100" step="5" value={Math.round(map.opacity*100)} onChange={e=>onChange({...map,opacity:Number(e.target.value)/100})}/><span>{Math.round(map.opacity*100)} %</span></label>
   {!imageTransform(map.anchors,map.width,map.height)&&<p>{t('Zwei Orte setzen, die Vorschau prüfen und dann „Ausrichtung übernehmen“ drücken.')}</p>}
   <button type="button" className="local-map-remove" onClick={()=>{onChange(null);setMessage(t('Lokales Kartenbild entfernt.'));}}>{t('Lokales Kartenbild entfernen')}</button>
  </>}
 </details>;
}
