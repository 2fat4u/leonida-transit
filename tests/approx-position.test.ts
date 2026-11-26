import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {closestBoardingStops,positionAtClick,unprojectGeographic} from '../src/approx-position.ts';
import {GEOGRAPHIC_BOX,projectGeographic} from '../src/geography.ts';
import {initialMapCamera,mapView} from '../src/map-camera.ts';
import {BrowserCompatibility,isSamsungBrowser} from '../src/BrowserCompatibility.tsx';
import {researchNetwork} from '../src/research-data.ts';
import type {Network} from '../src/model.ts';

test('Manual positions use geographic game coordinates correctly after zoom and pan on phone and desktop',()=>{
 const point={x:-1500,y:1800},projected=projectGeographic(point.x,point.y);
 assert.deepEqual(unprojectGeographic(projected),point);
 for(const frame of [{width:339,height:580},{width:1100,height:760}])for(const zoom of [1,6,32]){
  const camera={zoom,pan:{x:projected.x-GEOGRAPHIC_BOX.width/2,y:projected.y-GEOGRAPHIC_BOX.height/2}},view=mapView(GEOGRAPHIC_BOX,camera),scale=Math.min(frame.width/view.width,frame.height/view.height);
  const screen={x:(projected.x-view.x)*scale+(frame.width-view.width*scale)/2,y:(projected.y-view.y)*scale+(frame.height-view.height*scale)/2};
  const actual=positionAtClick(GEOGRAPHIC_BOX,frame,camera,screen)!;assert.ok(actual);assert.ok(Math.abs(actual.x-point.x)<1e-8);assert.ok(Math.abs(actual.y-point.y)<1e-8);
 }
});
test('Empty SVG padding and areas outside the supported world do not become a location',()=>{
 assert.equal(positionAtClick(GEOGRAPHIC_BOX,{width:1000,height:500},initialMapCamera(),{x:1,y:100}),null);
 assert.equal(positionAtClick(GEOGRAPHIC_BOX,{width:360,height:580},{zoom:32,pan:{x:9000,y:9000}},{x:180,y:290}),null);
});
const network:Network={...researchNetwork,stops:[
 ...['a','b','c','d','terminal'].map((id,index)=>({id,name:id,x:9999-index*100,y:-9999,position:{x:[100,103,110,112,100][index],y:[100,104,100,100,100][index],system:'game' as const,sourceId:'test'}})),
 {id:'no-position',name:'No physical position',x:100,y:100}
],lines:[{id:'TEST',name:'Test route',mode:'bus',color:'#ffffff',patterns:[{id:'out',headsign:'out',stops:['a','b','c','d','terminal'],minutes:[null,null,null,null]}]}]};
test('Nearby boarding suggestions use physical positions, exclude terminal-only stops and limit the walk radius',()=>{
 const before=JSON.stringify(network),nearest=closestBoardingStops(network,{x:100,y:100},1000);
 assert.deepEqual(nearest.map(v=>[v.stop.id,v.distance]),[['a',0],['b',5],['c',10]]);
 assert.deepEqual(closestBoardingStops(network,{x:100,y:100},4).map(v=>v.stop.id),['a']);
 assert.deepEqual(closestBoardingStops(network,{x:9000,y:9000}),[]);
 assert.deepEqual(closestBoardingStops(network,{x:NaN,y:100}),[]);assert.deepEqual(closestBoardingStops(network,{x:100,y:100},0),[]);
 assert.equal(JSON.stringify(network),before);
});
test('Samsung compatibility advice is targeted to Samsung Internet and leaves Chrome on a Samsung phone unaffected',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 try{
  const samsung='Mozilla/5.0 Android SM-S911B SamsungBrowser/29.0 Chrome/136';assert.equal(isSamsungBrowser(samsung),true);
  Object.defineProperty(globalThis,'navigator',{value:{userAgent:samsung},configurable:true});
  const html=renderToStaticMarkup(createElement(BrowserCompatibility));assert.match(html,/eingeschränkte Unterstützung/);assert.match(html,/Link kopieren/);assert.match(html,/Chrome/);
  const chrome='Mozilla/5.0 Android SM-S911B Chrome/136';assert.equal(isSamsungBrowser(chrome),false);
  Object.defineProperty(globalThis,'navigator',{value:{userAgent:chrome},configurable:true});assert.equal(renderToStaticMarkup(createElement(BrowserCompatibility)),'');
 }finally{if(original)Object.defineProperty(globalThis,'navigator',original);else Reflect.deleteProperty(globalThis,'navigator');}
});
