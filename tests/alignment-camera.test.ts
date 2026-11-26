import {test} from 'node:test';
import assert from 'node:assert/strict';
import {alignmentView,cameraAtAnchor,initialAlignmentCamera,panAlignment,pointInAlignment,zoomAlignment} from '../src/alignment-camera.ts';

const image={width:2805,height:3840},frame={width:320,height:440};
test('A reference point under the cursor stays there across zoom levels',()=>{
 let view=alignmentView(image,frame,initialAlignmentCamera());
 const cursor={x:.6,y:.3},point=pointInAlignment(cursor,view,image)!;
 for(const zoom of [2,4,8,16]){
  view=alignmentView(image,frame,zoomAlignment(image,frame,view,zoom,cursor));
  const actual=pointInAlignment(cursor,view,image)!;assert.ok(Math.hypot(actual.x-point.x,actual.y-point.y)<1e-12);
 }
});
test('Panning uses the zoomed scale and preserves original normalized coordinates when selecting points',()=>{
 const view=alignmentView(image,frame,{zoom:8,center:{x:.5,y:.5}}),point=pointInAlignment({x:.5,y:.5},view,image)!;
 const delta={x:35,y:-22},panned=alignmentView(image,frame,panAlignment(image,view,delta));
 const actual=pointInAlignment({x:.5+delta.x/frame.width,y:.5+delta.y/frame.height},panned,image)!;
 assert.ok(Math.hypot(actual.x-point.x,actual.y-point.y)<1e-12);
});
test('Fit, resize and bounded panning avoid losing the image outside the viewer',()=>{
 for(const size of [{width:320,height:440},{width:900,height:400},{width:320,height:700}]){
  const view=alignmentView(image,size,{zoom:1000,center:{x:-200,y:500}});
  assert.equal(view.zoom,16);assert.ok(view.x>=0&&view.y>=0);assert.ok(view.x+view.width<=image.width+.001&&view.y+view.height<=image.height+.001);
  const fit=alignmentView(image,size,initialAlignmentCamera());assert.equal(fit.zoom,1);
  assert.deepEqual(pointInAlignment({x:.5,y:.5},fit,image),{x:.5,y:.5});
 }
});
test('Pinch zoom keeps the anchor under a moving midpoint and padding does not set a point',()=>{
 const start=alignmentView(image,frame,{zoom:4,center:{x:.5,y:.5}}),anchor=pointInAlignment({x:.5,y:.5},start,image)!;
 const midpoint={x:.3,y:.4},next=alignmentView(image,frame,cameraAtAnchor(image,frame,8,anchor,midpoint));
 const p=pointInAlignment(midpoint,next,image)!;assert.ok(Math.hypot(p.x-anchor.x,p.y-anchor.y)<1e-12);
 const wide={width:1000,height:300},fit=alignmentView(image,wide,initialAlignmentCamera());
 assert.equal(pointInAlignment({x:.01,y:.5},fit,image),null);
});
