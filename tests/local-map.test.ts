import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchNetwork} from '../src/research-data.ts';
import {makeGeographic,projectGeographic} from '../src/geography.ts';
import {alignmentCheck,alignmentDraft,applyTransform,defaultAnchors,imageTransform,inverseTransform,pointInImage,storedImageTransform,validLocalMap,type Anchor} from '../src/local-map.ts';

function fixture(width=2805,height=3840){
 const game=(p:{x:number;y:number})=>{const x=p.x*width,y=p.y*height,c=Math.cos(.18),s=Math.sin(.18);return {x:(300+.35*(c*x-s*y))*10-10000,y:10500-(100+.35*(s*x+c*y))*10};};
 const anchors:Anchor[]=[{x:.1,y:.15},{x:.8,y:.85},{x:.7,y:.3}].map((image,i)=>({id:String(i),name:`Demo ${i}`,image,game:game(image)}));
 return {anchors,game,width,height};
}
test('Two control places align a rotated image while preserving its original aspect ratio',()=>{
 for(const [width,height] of [[2805,3840],[4000,600],[700,1000]]){
  const f=fixture(width,height),matrix=imageTransform(f.anchors,width,height)!;assert.ok(matrix);
  for(const p of [{x:0,y:0},{x:1,y:1},{x:.4,y:.6}]){
   const actual=applyTransform(matrix,{x:p.x*width,y:p.y*height}),g=f.game(p),expected=projectGeographic(g.x,g.y);
   assert.ok(Math.hypot(actual.x-expected.x,actual.y-expected.y)<1e-9);
   const back=inverseTransform(matrix,actual)!;assert.ok(Math.hypot(back.x-p.x*width,back.y-p.y*height)<1e-9);
  }
  assert.equal(matrix.a,matrix.d);assert.equal(matrix.c,-matrix.b);
  assert.ok(matrix.a*matrix.d-matrix.b*matrix.c>0);
  const xScale=Math.hypot(matrix.a,matrix.b),yScale=Math.hypot(matrix.c,matrix.d);
  assert.ok(Math.abs(xScale/yScale-1)<1e-12);
  assert.ok(Math.abs((width*xScale)/(height*yScale)-width/height)<1e-12);
 }
});
test('Incomplete, too-close, duplicate and invalid alignment controls cannot be applied',()=>{
 const anchors=defaultAnchors();assert.equal(imageTransform(anchors,800,1000),null);
 anchors[0].image={x:.2,y:.2};anchors[1].image={x:.21,y:.21};assert.equal(imageTransform(anchors,800,1000),null);
 anchors[1].image={x:.8,y:.8};assert.ok(imageTransform(anchors,800,1000));
 for(const bad of [NaN,Infinity,-.1,1.1]){const copy=structuredClone(anchors);copy[1].image!.x=bad;assert.equal(imageTransform(copy,800,1000),null);}
 const copy=structuredClone(anchors);copy[1].game=copy[0].game;assert.equal(imageTransform(copy,800,1000),null);
 assert.equal(imageTransform(anchors,0,1000),null);
});
test('An inaccurate optional third point reports an offset without stretching, shearing or flipping the image',()=>{
 const f=fixture(),initial=imageTransform(f.anchors,f.width,f.height)!;
 assert.ok(alignmentCheck(f.anchors,f.width,f.height)!.residualMetres!<1e-8);
 f.anchors[2].image={x:.05,y:.95};
 const report=alignmentCheck(f.anchors,f.width,f.height)!;
 assert.deepEqual(report.matrix,initial);assert.ok(report.residualMetres!>report.toleranceMetres);
 f.anchors[2].image=null;
 assert.deepEqual(imageTransform(f.anchors,f.width,f.height),initial);
 assert.equal(alignmentCheck(f.anchors,f.width,f.height)!.residualMetres,null);
});
test('Legacy images and points remain readable but cannot display until proportional alignment is explicitly applied',()=>{
 const f=fixture(800,1000),map={blob:new Blob(['fixture'],{type:'image/png'}),name:'old.png',width:f.width,height:f.height,anchors:f.anchors,opacity:.7,enabled:true};
 const before=structuredClone(map.anchors);assert.ok(validLocalMap(map));assert.equal(storedImageTransform(map),null);
 assert.ok(storedImageTransform({...map,alignmentVersion:2}));assert.deepEqual(map.anchors,before);
 assert.equal(validLocalMap({...map,alignmentVersion:999}),false);
});
test('Image clicks respect letterboxing and reject taps in the empty margins',()=>{
 const box={x:20,y:50,width:400,height:400};
 assert.deepEqual(pointInImage({x:220,y:250},box,400,200),{x:.5,y:.5});
 assert.deepEqual(pointInImage({x:20,y:150},box,400,200),{x:0,y:0});
 assert.equal(pointInImage({x:100,y:60},box,400,200),null);
 assert.equal(pointInImage({x:450,y:250},box,400,200),null);
});
test('Local image records preserve their blob and reject invalid type, dimensions and calibration data',()=>{
 const map={blob:new Blob(['local fixture'],{type:'image/png'}),name:'test.png',width:800,height:600,anchors:defaultAnchors(),opacity:.7,enabled:true};
 assert.ok(validLocalMap(map));assert.equal(imageTransform(map.anchors,map.width,map.height),null);
 assert.equal(validLocalMap({...map,blob:new Blob(['<svg/>'],{type:'image/svg+xml'})}),false);
 assert.equal(validLocalMap({...map,width:10000,height:10000}),false);
 assert.equal(validLocalMap({...map,opacity:NaN}),false);
 assert.equal(validLocalMap({...map,anchors:[{...map.anchors[0],game:{x:Infinity,y:0}}]}),false);
});
test('Geographic mode places every sourced stop exactly and only connects consecutive source calls',()=>{
 const before=JSON.stringify(researchNetwork),layout=makeGeographic(researchNetwork);
 assert.equal(layout.nodes.size,340);
 for(const s of researchNetwork.stops)assert.deepEqual(layout.nodes.get(s.id),{...projectGeographic(s.position!.x,s.position!.y),id:s.id,stopId:s.id});
 for(const edge of layout.edges){const line=researchNetwork.lines.find(l=>l.id===edge.lineId)!;
  assert.ok(line.patterns.some(p=>p.stops.slice(1).some((s,i)=>[p.stops[i],s].sort().join(':')===[edge.from,edge.to].sort().join(':'))));
  assert.deepEqual(edge.points,[layout.nodes.get(edge.from),layout.nodes.get(edge.to)]);
 }
 assert.equal(JSON.stringify(researchNetwork),before);
 const partial=structuredClone(researchNetwork);delete partial.stops[0].position;
 const missing=makeGeographic(partial);assert.equal(missing.nodes.size,339);assert.ok(missing.edges.every(e=>e.from!==partial.stops[0].id&&e.to!==partial.stops[0].id));
});

test('Legacy review selects the most separated places without changing any saved point values',()=>{
 const anchors=defaultAnchors();anchors.forEach((a,i)=>a.image={x:.2+i*.2,y:.1+i*.3});
 const legacy=[anchors[0],anchors[2],anchors[1]],before=structuredClone(legacy);
 const map={blob:new Blob(['fixture'],{type:'image/png'}),name:'old.png',width:800,height:1000,anchors:legacy,opacity:.7,enabled:true};
 const draft=alignmentDraft(map);assert.deepEqual(draft.map(a=>a.id),anchors.map(a=>a.id));
 assert.deepEqual(legacy,before);for(const a of draft)assert.deepEqual(a.image,legacy.find(b=>b.id===a.id)!.image);
 draft[0].image!.x=0;assert.deepEqual(legacy,before);
 assert.deepEqual(alignmentDraft({...map,alignmentVersion:2}),legacy);
});
