import type {Network,Pattern,Stop} from './model';

export type Point={x:number;y:number};
export type ViewBox={x:number;y:number;width:number;height:number};
export type StationPoint=Point&{id:string;stopId:string};
export type CallPoint=StationPoint&{call:number;totalCalls:number};
export type MapEdge={key:string;lineId:string;from:string;to:string;points:Point[]};
export const MAP_BOX:ViewBox={x:0,y:0,width:1400,height:1660};
const GRID=28;
const LAYOUT_VERSION=2;

function axis(value:number,anchors:[number,number][]){
 let i=0;while(i<anchors.length-2&&value>anchors[i+1][0])i++;
 const [a,b]=anchors[i],[c,d]=anchors[i+1];
 return b+(value-a)/(c-a)*(d-b);
}
// Expand the dense city while preserving north/south and east/west orientation.
// These are our own schematic coordinates, never inputs to walking distances.
export function projectGame(x:number,y:number):Point {
 return {x:axis(x,[[-10000,40],[-3200,400],[-1600,630],[200,1040],[2300,1320],[4000,1380]]),
 y:axis(y,[[-9000,1620],[-3000,1280],[-1000,1080],[1800,520],[2600,440],[10500,80]])};
}
export function fitPoints(points:Point[],padding=70):ViewBox{
 if(!points.length)return {...MAP_BOX};
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 const x=Math.min(...xs)-padding,y=Math.min(...ys)-padding;
 return {x,y,width:Math.max(180,Math.max(...xs)-x+padding),height:Math.max(180,Math.max(...ys)-y+padding)};
}
export function uniqueCalls(pattern:Pattern){
 return pattern.stops[0]===pattern.stops.at(-1)?pattern.stops.slice(0,-1):pattern.stops;
}
export function repeatedCalls(pattern:Pattern){
 const calls=uniqueCalls(pattern),groups=new Map<string,number[]>();
 calls.forEach((id,i)=>groups.set(id,[...(groups.get(id)??[]),i+1]));
 return [...groups].filter(([,calls])=>calls.length>1).map(([stopId,calls])=>({stopId,calls}));
}
export function callNeighbours(pattern:Pattern,call:number){
 const calls=uniqueCalls(pattern),closed=pattern.stops[0]===pattern.stops.at(-1),index=call-1;
 return {previous:index>0?calls[index-1]:closed?calls.at(-1):undefined,next:index<calls.length-1?calls[index+1]:closed?calls[0]:undefined};
}
function simplify(points:Point[]){
 const out:Point[]=[];
 for(const p of points){if(out.length&&Math.hypot(p.x-out.at(-1)!.x,p.y-out.at(-1)!.y)<.01)continue;
  while(out.length>1){const a=out[out.length-2],b=out.at(-1)!;if(Math.abs((b.x-a.x)*(p.y-b.y)-(b.y-a.y)*(p.x-b.x))>.01)break;out.pop();}out.push(p);
 }return out;
}
function octilinear(a:Point,b:Point,firstDiagonal:boolean):Point[]{
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.min(Math.abs(dx),Math.abs(dy));
 return simplify([a,firstDiagonal?{x:a.x+Math.sign(dx)*d,y:a.y+Math.sign(dy)*d}:{x:b.x-Math.sign(dx)*d,y:b.y-Math.sign(dy)*d},b]);
}
export function pointSegmentDistance(p:Point,a:Point,b:Point){
 const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
 const ratio=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;
 return Math.hypot(p.x-a.x-ratio*dx,p.y-a.y-ratio*dy);
}
export function pathCollisions(points:Point[],obstacles:Point[],clearance=10){
 let count=0;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];
  for(const p of obstacles){if(p.x<Math.min(a.x,b.x)-clearance||p.x>Math.max(a.x,b.x)+clearance||p.y<Math.min(a.y,b.y)-clearance||p.y>Math.max(a.y,b.y)+clearance)continue;
   if(pointSegmentDistance(p,a,b)<clearance)count++;
  }
 }return count;
}
function detour(a:Point,b:Point,obstacles:Point[]):Point[]|null{
 const step=6,margin=150;
 const bounds={left:Math.floor((Math.min(a.x,b.x)-a.x-margin)/step),right:Math.ceil((Math.max(a.x,b.x)-a.x+margin)/step),top:Math.floor((Math.min(a.y,b.y)-a.y-margin)/step),bottom:Math.ceil((Math.max(a.y,b.y)-a.y+margin)/step)};
 const directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
 type Item={x:number;y:number;dir:number;g:number;f:number;key:string};
 const heap:Item[]=[],cost=new Map<string,number>(),previous=new Map<string,string>(),items=new Map<string,Item>();
 const point=(x:number,y:number)=>({x:a.x+x*step,y:a.y+y*step});
 const push=(item:Item)=>{heap.push(item);let i=heap.length-1;while(i){const parent=(i-1)>>1;if(heap[parent].f<=item.f)break;heap[i]=heap[parent];i=parent;}heap[i]=item;};
 const pop=()=>{const first=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(last.f<=heap[c].f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;};
 const initial={x:0,y:0,dir:-1,g:0,f:Math.hypot(b.x-a.x,b.y-a.y),key:'0,0,-1'};push(initial);cost.set(initial.key,0);items.set(initial.key,initial);
 let iterations=0;
 while(heap.length&&iterations++<20000){
  const current=pop();if(current.g!==cost.get(current.key))continue;const p=point(current.x,current.y);
  if(Math.hypot(p.x-b.x,p.y-b.y)<step*2.5){
   const tail=[octilinear(p,b,true),octilinear(p,b,false)].find(path=>pathCollisions(path,obstacles,11)===0);
   if(tail){const path:Point[]=[];let key:string|undefined=current.key;while(key){const item=items.get(key)!;path.push(point(item.x,item.y));key=previous.get(key);}return simplify([...path.reverse(),...tail.slice(1)]);}
  }
  for(let dir=0;dir<directions.length;dir++){
   const [dx,dy]=directions[dir],x=current.x+dx,y=current.y+dy;if(x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom)continue;
   const q=point(x,y);if(pathCollisions([p,q],obstacles,11))continue;
   const g=current.g+step*Math.hypot(dx,dy)+(current.dir>=0&&current.dir!==dir?8:0),key=`${x},${y},${dir}`;
   if(g>=(cost.get(key)??Infinity))continue;cost.set(key,g);previous.set(key,current.key);
   const item={x,y,dir,g,f:g+Math.hypot(q.x-b.x,q.y-b.y),key};items.set(key,item);push(item);
  }
 }return null;
}
export function routePath(a:Point,b:Point,obstacles:Point[],detailedDetours=false):Point[]{
 const candidates=[octilinear(a,b,true),octilinear(a,b,false),simplify([a,{x:b.x,y:a.y},b]),simplify([a,{x:a.x,y:b.y},b])];
 for(const distance of [20,40,60,80,120])for(const sign of [-1,1]){
  const d=distance*sign;
  candidates.push(simplify([a,{x:a.x+d,y:a.y},{x:a.x+d,y:b.y},b]),simplify([a,{x:a.x,y:a.y+d},{x:b.x,y:a.y+d},b]));
 }
 let best=candidates[0],cost=Infinity;
 for(const points of candidates){
  const collisions=pathCollisions(points,obstacles,12);
  const length=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);
  const score=collisions*100000+length+(points.length-2)*12;
  if(score<cost){cost=score;best=points;}
 }return detailedDetours&&pathCollisions(best,obstacles,10)?detour(a,b,obstacles)??best:best;
}
function offsetPath(points:Point[],distance:number){
 if(!distance)return points;
 const normal=(a:Point,b:Point)=>{const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;return {x:-dy/length,y:dx/length};};
 return points.map((point,i)=>{
  const before=normal(points[Math.max(0,i-1)],point),after=normal(point,points[Math.min(points.length-1,i+1)]);
  if(i===0)return {x:point.x+after.x*distance,y:point.y+after.y*distance};
  if(i===points.length-1)return {x:point.x+before.x*distance,y:point.y+before.y*distance};
  const divisor=1+before.x*after.x+before.y*after.y;
  return divisor<.1?{x:point.x+before.x*distance,y:point.y+before.y*distance}:{x:point.x+(before.x+after.x)*distance/divisor,y:point.y+(before.y+after.y)*distance/divisor};
 });
}
export function pathData(points:Point[]){return points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');}
export function directionArrow(points:Point[]){
 let index=1,longest=0;
 for(let i=1;i<points.length;i++){const length=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);if(length>longest){longest=length;index=i;}}
 const a=points[index-1],b=points[index];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};
}

export function makeSchematic(network:Network,detailedDetours=false){
 const geographic=network.stops.some(s=>s.position?.sourceId==='gtamap-positions');
 const nodes=new Map<string,StationPoint>();const occupied=new Set<string>();
 for(const stop of network.stops){
  const p=geographic&&stop.position?projectGame(stop.position.x,stop.position.y):{x:100+(stop.x-30)/940*1200,y:100+(stop.y-30)/740*1420};
  const gx=Math.round(p.x/GRID),gy=Math.round(p.y/GRID);let chosen:Point|undefined;
  for(let ring=0;ring<=15&&!chosen;ring++){
   const choices:Point[]=[];
   for(let dx=-ring;dx<=ring;dx++)for(let dy=-ring;dy<=ring;dy++)if(Math.max(Math.abs(dx),Math.abs(dy))===ring){
    const x=(gx+dx)*GRID,y=(gy+dy)*GRID;if(x<40||x>1360||y<40||y>1620||occupied.has(`${x},${y}`))continue;choices.push({x,y});
   }
   choices.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)||a.y-b.y||a.x-b.x);chosen=choices[0];
  }
  chosen??={x:gx*GRID,y:gy*GRID};occupied.add(`${chosen.x},${chosen.y}`);nodes.set(stop.id,{...chosen,id:stop.id,stopId:stop.id});
 }
 const groups=new Map<string,{a:string;b:string;lines:Set<string>}>();
 for(const line of network.lines)for(const pattern of line.patterns)for(let i=1;i<pattern.stops.length;i++){
  const [a,b]=[pattern.stops[i-1],pattern.stops[i]].sort(),key=`${a}:${b}`;
  if(!groups.has(key))groups.set(key,{a,b,lines:new Set()});groups.get(key)!.lines.add(line.id);
 }
 const edges:MapEdge[]=[];const all=[...nodes.values()];
 for(const [key,{a,b,lines}]of groups){
  const obstacles=all.filter(p=>p.id!==a&&p.id!==b),base=routePath(nodes.get(a)!,nodes.get(b)!,obstacles,detailedDetours);
  const ids=[...lines].sort();ids.forEach((lineId,i)=>edges.push({key:`${lineId}:${key}`,lineId,from:a,to:b,points:offsetPath(base,(i-(ids.length-1)/2)*5)}));
 }
 return {nodes,edges,geographic};
}
export function makeCallDiagram(pattern:Pattern,nodes:Map<string,StationPoint>){
 const ids=uniqueCalls(pattern),repeats=new Map(repeatedCalls(pattern).map(r=>[r.stopId,r.calls]));
 const calls:CallPoint[]=[];
 // Allocate single visits first, then split repeated visits around their shared location.
 const order=ids.map((stopId,index)=>({stopId,index})).sort((a,b)=>Number(repeats.has(a.stopId))-Number(repeats.has(b.stopId))||a.index-b.index);
 for(const {stopId,index}of order){
  const center=nodes.get(stopId)!,group=repeats.get(stopId),visit=group?.indexOf(index+1)??0;
  const neighbour=callNeighbours(pattern,index+1),before=nodes.get(neighbour.previous??stopId)!,after=nodes.get(neighbour.next??stopId)!;
  const vertical=Math.abs(before.y-center.y)+Math.abs(after.y-center.y)>=Math.abs(before.x-center.x)+Math.abs(after.x-center.x);
  const offset=group?(visit-(group.length-1)/2)*28:0;
  const target={x:center.x+(vertical?offset:0),y:center.y+(vertical?0:offset)};
  const choices=[target];for(const d of [20,40,60,80])for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]])choices.push({x:target.x+dx*d,y:target.y+dy*d});
  const chosen=choices.find(p=>calls.every(c=>Math.hypot(c.x-p.x,c.y-p.y)>=28))??target;
  calls.push({...chosen,id:`call-${index+1}`,stopId,call:index+1,totalCalls:ids.length});
 }
 calls.sort((a,b)=>a.call-b.call);
 const closed=pattern.stops[0]===pattern.stops.at(-1),edges:{from:CallPoint;to:CallPoint;points:Point[]}[]=[];
 for(let i=0;i<calls.length-(closed?0:1);i++){
  const from=calls[i],to=calls[(i+1)%calls.length];
  edges.push({from,to,points:routePath(from,to,calls.filter(c=>c.id!==from.id&&c.id!==to.id),true)});
 }
 return {calls,edges,repeats:[...repeats].map(([stopId,calls])=>({stopId,calls})),closed};
}

export function shortStopLabel(stop:Stop):string[]{
 const match=stop.name.match(/^(.+?), (.+?)(?: \(Stop ([A-Z])\))?$/);
 if(match)return [`${match[1]}${match[3]?` · ${match[3]}`:''}`,match[2]];
 const text=stop.name.replace(/ (Metro Station|Metromover Station|Train Station|Station)$/,'');
 if(text.length<=24)return [text];
 const words=text.split(' ');let first='';while(words.length&&(!first||first.length+words[0].length<24))first+=(first?' ':'')+words.shift();
 return [first,words.join(' ')];
}
type LabelCandidate={id:string;point:Point;rows:string[];priority:number};
export type PlacedLabel={id:string;rows:string[];x:number;y:number;anchor:'start'|'end';box:ViewBox;point:Point};
export function placeLabels(candidates:LabelCandidate[],view:ViewBox,fontSize:number,obstacles:Point[]){
 const labels:PlacedLabel[]=[],boxes:ViewBox[]=[];const lineHeight=fontSize*1.2,unit=fontSize/13;
 const intersects=(a:ViewBox,b:ViewBox)=>a.x<b.x+b.width+5*unit&&a.x+a.width+5*unit>b.x&&a.y<b.y+b.height+4*unit&&a.y+a.height+4*unit>b.y;
 for(const c of [...candidates].sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id))){
  if(c.point.x<view.x||c.point.x>view.x+view.width||c.point.y<view.y||c.point.y>view.y+view.height)continue;
  const width=Math.max(...c.rows.map(s=>s.length))*fontSize*.51+4*unit,height=c.rows.length*lineHeight;
  let chosen:PlacedLabel|undefined;
  for(const distance of [10,24,40,56,72]){for(const side of [1,-1])for(const vertical of [0,-1,1]){
   const x=c.point.x+side*distance*unit,y=c.point.y+vertical*(height+8*unit)-fontSize*.5;
   const box={x:side===1?x:x-width,y:y-fontSize,width,height};
   if(box.x<view.x+6*unit||box.x+width>view.x+view.width-6*unit||box.y<view.y+6*unit||box.y+height>view.y+view.height-6*unit)continue;
   if(boxes.some(b=>intersects(box,b))||obstacles.some(p=>p!==c.point&&p.x>box.x-6*unit&&p.x<box.x+width+6*unit&&p.y>box.y-6*unit&&p.y<box.y+height+6*unit))continue;
   chosen={id:c.id,rows:c.rows,x,y,anchor:side===1?'start':'end',box,point:c.point};break;
  }if(chosen)break;}if(chosen){labels.push(chosen);boxes.push(chosen.box);}
 }return labels;
}

export const regionLabels=[
 {text:'PORT GELLHORN',x:-6600,y:4500},{text:'MOUNT KALAGA',x:-3600,y:7900},{text:'LUMMOX COUNTY',x:-3000,y:9200},
 {text:'AMBROSIA',x:-2400,y:4300},{text:'VICE CITY',x:-900,y:1500},{text:'VICE BEACH',x:1750,y:2550},
 {text:'GRASSRIVERS',x:-4800,y:-3800},{text:'LEONIDA KEYS',x:-3900,y:-7100},{text:'CAPRI',x:-7400,y:100}
];
export const regionBounds:Record<string,ViewBox>={
 all:MAP_BOX,city:fitPoints([projectGame(-3100,-3000),projectGame(2400,2800)],55),
 north:fitPoints([projectGame(-8700,1100),projectGame(1000,9900)],55),
 south:fitPoints([projectGame(-8400,-8200),projectGame(-600,-2800)],55)
};
export function schematicSignature(network:Network){
 const text=JSON.stringify([LAYOUT_VERSION,network.stops.map(s=>[s.id,s.x,s.y,s.position]),network.lines.map(l=>[l.id,l.patterns.map(p=>p.stops)])]);
 let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
 return (hash>>>0).toString(16);
}
