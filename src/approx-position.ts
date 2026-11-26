import type {Network} from './model';
import {GEOGRAPHIC_BOX} from './geography';
import {mapPoint,mapView,type MapCamera,type MapFrame} from './map-camera';
import type {Point,ViewBox} from './schematic';

export const unprojectGeographic=(point:Point):Point=>({x:point.x*10-10000,y:10500-point.y*10});
// A tap outside the rendered SVG map must not become a position in empty padding.
export function positionAtClick(base:ViewBox,frame:MapFrame,camera:MapCamera,screen:Point):Point|null{
 const view=mapView(base,camera),scale=Math.min(frame.width/view.width,frame.height/view.height),left=(frame.width-view.width*scale)/2,top=(frame.height-view.height*scale)/2;
 if(screen.x<left||screen.x>frame.width-left||screen.y<top||screen.y>frame.height-top)return null;
 const point=mapPoint(base,frame,camera,screen);
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<GEOGRAPHIC_BOX.x||point.x>GEOGRAPHIC_BOX.width||point.y<GEOGRAPHIC_BOX.y||point.y>GEOGRAPHIC_BOX.height)return null;
 return unprojectGeographic(point);
}
export function closestBoardingStops(network:Network,point:Point,radius=1000){
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||!Number.isFinite(radius)||radius<=0)return [];
 const boardable=new Set(network.lines.flatMap(line=>line.patterns.flatMap(pattern=>pattern.stops.slice(0,-1))));
 return network.stops.flatMap(stop=>{
  if(!stop.position||!boardable.has(stop.id))return [];
  const distance=Math.hypot(stop.position.x-point.x,stop.position.y-point.y);
  const lines=network.lines.filter(line=>line.patterns.some(pattern=>pattern.stops.slice(0,-1).includes(stop.id)));
  return distance<=radius?[{stop,distance,lines}]:[];
 }).sort((a,b)=>a.distance-b.distance||a.stop.id.localeCompare(b.stop.id)).slice(0,3);
}
