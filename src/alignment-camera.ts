import type {Point} from './schematic';

export type Size={width:number;height:number};
export type AlignmentCamera={zoom:number;center:Point};
export const MAX_ALIGNMENT_ZOOM=16;
export const initialAlignmentCamera=():AlignmentCamera=>({zoom:1,center:{x:.5,y:.5}});
export function alignmentView(image:Size,frame:Size,camera:AlignmentCamera){
 const zoom=Math.max(1,Math.min(MAX_ALIGNMENT_ZOOM,Number.isFinite(camera.zoom)?camera.zoom:1));
 const scale=Math.min(frame.width/image.width,frame.height/image.height)*zoom;
 const width=frame.width/scale,height=frame.height/scale;
 const bound=(v:number,span:number)=>span>=1?.5:Math.max(span/2,Math.min(1-span/2,Number.isFinite(v)?v:.5));
 const center={x:bound(camera.center.x,width/image.width),y:bound(camera.center.y,height/image.height)};
 return {x:center.x*image.width-width/2,y:center.y*image.height-height/2,width,height,scale,zoom,center};
}
export type AlignmentView=ReturnType<typeof alignmentView>;
// Screen fractions and image fractions are independent of zoom and bitmap resolution.
export function pointInAlignment(fraction:Point,view:AlignmentView,image:Size):Point|null{
 const p={x:(view.x+fraction.x*view.width)/image.width,y:(view.y+fraction.y*view.height)/image.height};
 return [p.x,p.y].every(n=>Number.isFinite(n)&&n>=0&&n<=1)?p:null;
}
export function cameraAtAnchor(image:Size,frame:Size,zoom:number,anchor:Point,fraction:Point):AlignmentCamera{
 const next=alignmentView(image,frame,{zoom,center:{x:.5,y:.5}});
 const view=alignmentView(image,frame,{zoom:next.zoom,center:{x:anchor.x-(fraction.x-.5)*next.width/image.width,y:anchor.y-(fraction.y-.5)*next.height/image.height}});
 return {zoom:view.zoom,center:view.center};
}
export function zoomAlignment(image:Size,frame:Size,view:AlignmentView,zoom:number,fraction:Point={x:.5,y:.5}):AlignmentCamera{
 return cameraAtAnchor(image,frame,zoom,{x:(view.x+fraction.x*view.width)/image.width,y:(view.y+fraction.y*view.height)/image.height},fraction);
}
export function panAlignment(image:Size,view:AlignmentView,delta:Point):AlignmentCamera{
 return {zoom:view.zoom,center:{x:view.center.x-delta.x/view.scale/image.width,y:view.center.y-delta.y/view.scale/image.height}};
}
