import {useEffect,useRef,useState} from 'react';
import {t} from './i18n';
import {MAX_WALK_DISTANCE,formatDistance,fromDisplayDistance,toDisplayDistance,useUnits,type UnitSystem} from './units';

export function DistanceLimit({value,onChange,required}:{value:number;onChange:(metres:number)=>void;required:boolean}){
 const [units,setUnits]=useUnits();
 const [text,setText]=useState(String(toDisplayDistance(value,units)));
 const editing=useRef(false);
 const previousUnits=useRef(units);
 useEffect(()=>{if((previousUnits.current!==units||!editing.current)&&Number.isFinite(value))setText(String(Math.round(toDisplayDistance(value,units)*10)/10));previousUnits.current=units;},[value,units]);
 const presets=units==='imperial'?[500,1000,1500]:[150,300,500];
 return <div className="distance-options">
  <label>{t('Entfernungseinheiten')}<select aria-label={t('Entfernungseinheiten')} value={units} onChange={e=>setUnits(e.target.value as UnitSystem)}><option value="metric">{t('Metrisch · m / km')}</option><option value="imperial">{t('Imperial · ft / mi')}</option></select></label>
  <label htmlFor="walk-radius">{t('Maximale Luftlinie')}<div className="distance-input"><input id="walk-radius" type="number" inputMode="decimal" step="any" min={toDisplayDistance(1,units)} max={Math.ceil(toDisplayDistance(MAX_WALK_DISTANCE,units)*10)/10} required={required} value={text} onFocus={()=>{editing.current=true;}} onBlur={()=>{editing.current=false;}} onChange={e=>{setText(e.target.value);onChange(e.target.value===''?NaN:fromDisplayDistance(Number(e.target.value),units));}}/><span>{units==='imperial'?'ft':'m'}</span></div></label>
  <div className="distance-presets">{presets.map(n=><button type="button" key={n} onClick={()=>onChange(fromDisplayDistance(n,units))}>{n} {units==='imperial'?'ft':'m'}</button>)}</div>
  <small>{t('Eigener Wert bis {0}.',formatDistance(MAX_WALK_DISTANCE,units))}</small>
 </div>;
}
