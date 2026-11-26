import type {Line,Network} from './model';
import type {Point} from './schematic';

export type DirectionSelection={lineId:string;patternId:string};

export function boardingPatternIndex(line:Line,stopId?:string):number {
 if(!stopId)return 0;
 const index=line.patterns.findIndex(p=>p.stops.slice(0,-1).includes(stopId));
 return Math.max(0,index);
}

export function directionStopIds(network:Network,visibleLineIds:string[],selection?:DirectionSelection):Set<string> {
 return new Set(network.lines.filter(l=>visibleLineIds.includes(l.id)).flatMap(line=>
  line.patterns.filter(p=>!selection||(line.id===selection.lineId&&p.id===selection.patternId)).flatMap(p=>p.stops)));
}

// Mark the direction of the actual ordered polyline, including turns and retraced parts.
export function directionMarkers(points:Point[],spacing:number):Array<Point&{angle:number}> {
 if(points.length<2||!Number.isFinite(spacing)||spacing<=0)return [];
 const markers:Array<Point&{angle:number}>=[];
 let along=0,next=spacing/2;
 for(let i=1;i<points.length&&markers.length<500;i++){
  const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
  if(!length)continue;
  while(next<=along+length&&markers.length<500){
   const ratio=(next-along)/length;
   markers.push({x:a.x+ratio*dx,y:a.y+ratio*dy,angle:Math.atan2(dy,dx)*180/Math.PI});
   next+=spacing;
  }
  along+=length;
 }
 return markers;
}
