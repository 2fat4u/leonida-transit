import type {Point,ViewBox} from './schematic';
export type MapCamera={zoom:number;pan:Point};
export type MapFrame={width:number;height:number};
export const MIN_MAP_ZOOM=.7,MAX_MAP_ZOOM=32;
export const initialMapCamera=():MapCamera=>({zoom:1,pan:{x:0,y:0}});
export function mapView(base:ViewBox,camera:MapCamera):ViewBox{
 const zoom=Math.max(MIN_MAP_ZOOM,Math.min(MAX_MAP_ZOOM,camera.zoom));
 return {x:base.x+base.width/2-base.width/zoom/2+camera.pan.x,y:base.y+base.height/2-base.height/zoom/2+camera.pan.y,width:base.width/zoom,height:base.height/zoom};
}
export function mapPoint(base:ViewBox,frame:MapFrame,camera:MapCamera,screen:Point):Point{
 const view=mapView(base,camera),scale=Math.min(frame.width/view.width,frame.height/view.height);
 return {x:view.x+(screen.x-(frame.width-view.width*scale)/2)/scale,y:view.y+(screen.y-(frame.height-view.height*scale)/2)/scale};
}
// Both anchors are screen pixels, including SVG letterboxing. Moving them also pans.
export function zoomMap(base:ViewBox,frame:MapFrame,camera:MapCamera,requested:number,before:Point={x:frame.width/2,y:frame.height/2},after:Point=before):MapCamera{
 const zoom=Math.max(MIN_MAP_ZOOM,Math.min(MAX_MAP_ZOOM,Number.isFinite(requested)?requested:camera.zoom));
 const anchor=mapPoint(base,frame,camera,before),next=mapView(base,{zoom,pan:{x:0,y:0}}),scale=Math.min(frame.width/next.width,frame.height/next.height);
 return {zoom,pan:{x:anchor.x-(after.x-(frame.width-next.width*scale)/2)/scale-next.x,y:anchor.y-(after.y-(frame.height-next.height*scale)/2)/scale-next.y}};
}
