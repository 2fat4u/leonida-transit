import {mapPalette} from './map-theme';
import {geographyOutlines} from './geography';
import {pathData,type Point} from './schematic';

export const backdropPlaces=[
 {name:'VICE CITY',x:-850,y:600,major:true},
 {name:'VICE BEACH',x:1700,y:1500,major:true},
 {name:'PORT GELLHORN',x:-6510,y:3820,major:true},
 {name:'AMBROSIA',x:-2900,y:4450,major:true},
 {name:'HAMLET',x:-2800,y:-3500,major:true},
 {name:'KEY LENTO',x:-2500,y:-5900,major:true},
 {name:'GRASSRIVERS',x:-4300,y:-3100,major:true},
 {name:'DRAPER ISLAND',x:-7550,y:5150,major:true},
 {name:'CAPRI',x:-6800,y:250,major:true},
 {name:'MOUNT KALAGA',x:-3520,y:5928,major:true},
 {name:'GRAYSON',x:-5530,y:6940,major:true},
 {name:'MILLPORT',x:-1000,y:6550,major:true},
 {name:'WANING SANDS',x:-100,y:4100,major:false},
 {name:'STARFISH ISLAND',x:760,y:490,major:false},
 {name:'LEAF LINKS',x:580,y:2550,major:false},
 {name:'SOUTHWIND',x:-6400,y:-6650,major:false}
];
export function GeographicBackdrop({project,mode='geographic',scale=1,dark=false,detail=false,localLabels=false}:{project:(x:number,y:number)=>Point;mode?:'geographic'|'schematic';scale?:number;dark?:boolean;detail?:boolean;localLabels?:boolean}){
 const schematic=mode==='schematic',unit=1/Math.max(.01,scale),palette=mapPalette(dark,schematic);
 const path=(rings:number[][][])=>rings.map(r=>pathData(r.map(([x,y])=>project(x,y)))+' Z').join(' ');
 const labels=backdropPlaces.filter(p=>p.major||!schematic&&localLabels);
 const label=(name:string,x:number,y:number,major=true)=>{const p=project(x,y);return <text key={name} x={p.x} y={p.y} textAnchor="middle" fontSize={(schematic?major?11.5:10:major?12:10.5)*unit} fontWeight={major?650:550} letterSpacing={.7*unit} fill={palette.place} stroke="none">{name}</text>;};
 const land=schematic?geographyOutlines.schematic:geographyOutlines.geographic;
 const lake=geographyOutlines.lakes.find(l=>l.id==='lake-leonida')!;
 const lakeCenter={x:-2027,y:4714},center=project(lakeCenter.x,lakeCenter.y);
 // Keep the lake compact when the diagram expands the dense city sideways.
 const diagramLake=lake.rings.map(r=>pathData(r.map(([x,y])=>({x:center.x+(x-lakeCenter.x)*.044,y:center.y-(y-lakeCenter.y)*.044})))+' Z').join(' ');
 const water=palette.water;
 return <g className={`schematic-geography backdrop-${mode}`} pointerEvents="none" opacity={detail?.5:1}>
  <rect x="-3000" y="-3000" width="7000" height="8000" fill={water}/>
  {land.map(feature=><path key={feature.id} data-land={feature.id} d={path(feature.rings)} fill={palette.land} stroke={palette.coast} strokeWidth={schematic?.8:1} fillRule="evenodd" vectorEffect="non-scaling-stroke"/>)}
  {!schematic&&<g className="backdrop-urban">{geographyOutlines.urban.map((rings,i)=><path key={i} d={path(rings)} fill={palette.urban} opacity=".62" fillRule="evenodd"/>)}</g>}
  {!schematic&&geographyOutlines.airport.map((rings,i)=><path key={i} data-airport="vcia" d={path(rings)} fill={palette.airport} stroke={palette.coast} strokeWidth=".8" fillRule="evenodd" vectorEffect="non-scaling-stroke"/>)}
  {schematic?<path data-lake="lake-leonida" d={diagramLake} fill={water}/>:geographyOutlines.lakes.map(l=><path key={l.id} data-lake={l.id} d={path(l.rings)} fill={water}/>)}
  {labels.map(p=>label(p.name,p.x,p.y,p.major))}
  {label('VCIA',-2800,-650,false)}
  {label('LEONIDA KEYS',-4800,-7600,true)}
  {label('ATLANTIC OCEAN',2700,700,false)}
  {label('GULF OF LEONIDA',-9000,1300,false)}
  <text x={center.x} y={center.y-4*unit} textAnchor="middle" fill={palette.lakeLabel} fontSize={(schematic?8.5:10.5)*unit} fontWeight="600"><tspan x={center.x}>LAKE</tspan><tspan x={center.x} dy={12*unit}>LEONIDA</tspan></text>
 </g>;
}
