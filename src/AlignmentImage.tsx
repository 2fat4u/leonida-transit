import {useEffect,useRef,useState} from 'react';
import {Minus,Plus,RotateCcw,Focus} from 'lucide-react';
import {t} from './i18n';
import type {Anchor} from './local-map';
import type {Point} from './schematic';
import {alignmentView,cameraAtAnchor,initialAlignmentCamera,MAX_ALIGNMENT_ZOOM,panAlignment,pointInAlignment,zoomAlignment,type AlignmentView} from './alignment-camera';

export function AlignmentImage({url,width,height,anchors,active,onPick,overlayPoints=[],expectedCheck}:{url:string;width:number;height:number;anchors:Anchor[];active:number;onPick:(p:Point)=>void;overlayPoints?:(Point&{id:string})[];expectedCheck?:(Point&{name:string})}){
 const [camera,setCamera]=useState(initialAlignmentCamera),[frame,setFrame]=useState({width:700,height:500}),[dragging,setDragging]=useState(false),[expanded,setExpanded]=useState(false);
 const svg=useRef<SVGSVGElement>(null),image={width,height};
 const view=alignmentView(image,frame,camera),current=useRef(view);current.current=view;
 const pointers=useRef(new Map<number,Point>());
 const gesture=useRef<{point:Point;view:AlignmentView;moved:boolean;pinch?:{distance:number;anchor:Point}}|null>(null);
 useEffect(()=>{setCamera(initialAlignmentCamera());pointers.current.clear();gesture.current=null;setDragging(false);},[url]);
 useEffect(()=>{if(!svg.current)return;const observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;if(r.width>0&&r.height>0)setFrame({width:r.width,height:r.height});});observer.observe(svg.current);return()=>observer.disconnect();},[]);
 const fraction=(p:Point)=>{const r=svg.current!.getBoundingClientRect();return {x:(p.x-r.x)/r.width,y:(p.y-r.y)/r.height};};
 useEffect(()=>{const el=svg.current;if(!el)return;const wheel=(e:WheelEvent)=>{e.preventDefault();const r=el.getBoundingClientRect();setCamera(zoomAlignment({width,height},frame,current.current,current.current.zoom*Math.exp(-Math.max(-160,Math.min(160,e.deltaY))*.003),{x:(e.clientX-r.x)/r.width,y:(e.clientY-r.y)/r.height}));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[width,height,frame]);
 const zoom=(factor:number)=>setCamera(zoomAlignment(image,frame,current.current,current.current.zoom*factor));
 const stopGesture=()=>{pointers.current.clear();gesture.current=null;setDragging(false);};
 return <div className={`alignment-image-viewer ${expanded?'alignment-image-expanded':''}`}>
  <div className="alignment-image-tools" role="group" aria-label={t('Bildzoom')}>
   <button type="button" aria-label={t('Ausrichtungsbild vergrößern')} title={t('Ausrichtungsbild vergrößern')} disabled={view.zoom>=MAX_ALIGNMENT_ZOOM} onClick={()=>zoom(1.5)}><Plus size={18}/></button>
   <button type="button" aria-label={t('Ausrichtungsbild verkleinern')} title={t('Ausrichtungsbild verkleinern')} disabled={view.zoom<=1} onClick={()=>zoom(1/1.5)}><Minus size={18}/></button>
   <output aria-live="polite">{Math.round(view.zoom*100)} %</output>
   <button type="button" className="alignment-image-fit" onClick={()=>setCamera(initialAlignmentCamera())}><RotateCcw size={15}/>{t('Ganzes Bild')}</button>
   <button type="button" disabled={!anchors[active]?.image} onClick={()=>setCamera({zoom:Math.max(4,view.zoom),center:anchors[active].image!})}><Focus size={15}/>{t('Gewählten Punkt zeigen')}</button>
   <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{t(expanded?'Bildbereich verkleinern':'Bildbereich vergrößern')}</button>
  </div>
  <p className="alignment-image-help">{t('Mit + hineinzoomen. Ziehen verschiebt das Bild; kurzes Tippen setzt den Punkt. Auch Mausrad und Zwei-Finger-Zoom sind möglich.')}</p>
  <svg ref={svg} className={`alignment-preview ${dragging?'is-dragging':''}`} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="img" tabIndex={0} aria-label={t('Kartenbild zum Ausrichten')} onKeyDown={e=>{
   if(['+','=','-','Home','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
   if(e.key==='+'||e.key==='=')zoom(1.5);if(e.key==='-')zoom(1/1.5);if(e.key==='Home')setCamera(initialAlignmentCamera());
   const step=e.shiftKey?120:40;if(e.key.startsWith('Arrow'))setCamera(panAlignment(image,view,{x:e.key==='ArrowLeft'?step:e.key==='ArrowRight'?-step:0,y:e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0}));
  }} onPointerDown={e=>{
   if(e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
   const points=[...pointers.current.values()];if(points.length===1)gesture.current={point:points[0],view:current.current,moved:false};
   if(points.length===2){const mid={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2},f=fraction(mid),v=current.current;gesture.current={point:mid,view:v,moved:true,pinch:{distance:Math.max(1,Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)),anchor:{x:(v.x+f.x*v.width)/width,y:(v.y+f.y*v.height)/height}}};setDragging(true);}
  }} onPointerMove={e=>{
   if(!pointers.current.has(e.pointerId)||!gesture.current)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const g=gesture.current,points=[...pointers.current.values()];
   if(points.length===2&&g.pinch){const mid={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2};setCamera(cameraAtAnchor(image,frame,g.view.zoom*Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)/g.pinch.distance,g.pinch.anchor,fraction(mid)));return;}
   if(points.length!==1||g.pinch)return;const delta={x:e.clientX-g.point.x,y:e.clientY-g.point.y};if(Math.hypot(delta.x,delta.y)>5)g.moved=true;if(g.moved){setDragging(true);setCamera(panAlignment(image,g.view,delta));}
  }} onPointerUp={e=>{
   const g=gesture.current;if(!pointers.current.has(e.pointerId))return;pointers.current.delete(e.pointerId);
   if(pointers.current.size){gesture.current={point:[...pointers.current.values()][0],view:current.current,moved:true};return;}
   if(g&&!g.moved&&Math.hypot(e.clientX-g.point.x,e.clientY-g.point.y)<=5){const point=pointInAlignment(fraction({x:e.clientX,y:e.clientY}),current.current,image);if(point)onPick(point);}
   stopGesture();
  }} onPointerCancel={stopGesture}>
   <image href={url} width={width} height={height} pointerEvents="none"/>
   <g className="alignment-stop-preview" pointerEvents="none" aria-hidden="true">{overlayPoints.map(p=><circle key={p.id} cx={p.x} cy={p.y} r={2.7/view.scale} fill="#086e75" stroke="#fff" strokeWidth=".7" vectorEffect="non-scaling-stroke"/>)}</g>
   {expectedCheck&&<g className="alignment-expected-check" pointerEvents="none" aria-hidden="true">
    {anchors[2]?.image&&<line x1={expectedCheck.x} y1={expectedCheck.y} x2={anchors[2].image.x*width} y2={anchors[2].image.y*height} stroke="#9d2b85" strokeWidth="1.8" strokeDasharray="5 4" vectorEffect="non-scaling-stroke"/>}
    <path d={`M${expectedCheck.x-9/view.scale} ${expectedCheck.y} h${18/view.scale} M${expectedCheck.x} ${expectedCheck.y-9/view.scale} v${18/view.scale}`} stroke="#8c1c78" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
    <text x={expectedCheck.x+12/view.scale} y={expectedCheck.y-9/view.scale} fontSize={11/view.scale} fill="#671460" stroke="#fff" strokeWidth={3/view.scale} paintOrder="stroke">{t('Erwartet: {0}',expectedCheck.name)}</text>
   </g>}
   {anchors.map((a,i)=>a.image&&<g key={i} transform={`translate(${a.image.x*width} ${a.image.y*height})`} pointerEvents="none"><circle r={11/view.scale} fill={active===i?'#c3267c':'#165e62'} stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke"/><text textAnchor="middle" dy=".35em" fill="#fff" fontSize={13/view.scale} fontWeight="750">{i+1}</text></g>)}
  </svg>
 </div>;
}
