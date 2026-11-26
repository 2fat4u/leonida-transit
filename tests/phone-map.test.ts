import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {initialMapCamera,mapPoint,mapView,zoomMap,MAX_MAP_ZOOM} from '../src/map-camera.ts';
import {luminance,mapLineInk,mapPalette} from '../src/map-theme.ts';
import {researchNetwork} from '../src/research-data.ts';
import {InstallHelp} from '../src/InstallHelp.tsx';

const base={x:0,y:0,width:1400,height:2000},close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('A map point stays under the pinch midpoint on narrow and wide SVGs, including letterboxing',()=>{
 for(const frame of [{width:360,height:580},{width:1100,height:760}]){
  const before={x:100,y:210},after={x:160,y:280},camera={zoom:3,pan:{x:-170,y:240}},anchor=mapPoint(base,frame,camera,before);
  for(const zoom of [1,6,16,32]){const next=zoomMap(base,frame,camera,zoom,before,after),actual=mapPoint(base,frame,next,after);close(anchor.x,actual.x);close(anchor.y,actual.y);}
 }
});
test('Panning at 32x uses map pixels, and lifting one finger can resume panning without a jump',()=>{
 const frame={width:360,height:580},a={x:100,y:200},b={x:190,y:240},camera=zoomMap(base,frame,initialMapCamera(),32,a),anchor=mapPoint(base,frame,camera,a);
 const moved=zoomMap(base,frame,camera,camera.zoom,a,b),actual=mapPoint(base,frame,moved,b);close(actual.x,anchor.x);close(actual.y,anchor.y);
 assert.deepEqual(zoomMap(base,frame,moved,moved.zoom,b,b),moved);
 const reset=mapView(base,initialMapCamera());assert.deepEqual(reset,base);
 assert.equal(zoomMap(base,frame,camera,100).zoom,MAX_MAP_ZOOM);assert.equal(zoomMap(base,frame,camera,.01).zoom,.7);
});
test('Both map palettes keep route colours distinct from water and land, and text readable',()=>{
 const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 for(const dark of [true,false])for(const schematic of [true,false]){
  const p=mapPalette(dark,schematic);
  for(const surface of [p.water,p.land,p.paper]){
   assert.ok(contrast(p.text,surface)>=4.5);
   for(const line of researchNetwork.lines)assert.ok(contrast(mapLineInk(line.color,dark),surface)>=3,`${line.id}, dark=${dark}, ${surface}`);
  }
 }
});
test('The private manifest sends credentials and its declared icons exist with the exact PNG dimensions',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/<link[^>]+rel="manifest"[^>]+crossorigin="use-credentials"/);
 const manifest=JSON.parse(readFileSync(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/');assert.equal(manifest.id,'/');
 for(const icon of manifest.icons){const png=readFileSync(new URL('../public'+icon.src,import.meta.url));assert.equal(png.readUInt32BE(16)+'x'+png.readUInt32BE(20),icon.sizes);}
});
test('Samsung installation help explains the Apps screen without sending Android users to iPhone instructions',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 try{
  Object.defineProperty(globalThis,'navigator',{value:{userAgent:'Android SamsungBrowser/29'},configurable:true});
  const html=renderToStaticMarkup(createElement(InstallHelp,{available:false,installed:false,busy:false,onInstall:()=>{}}));
  assert.match(html,/App-Liste/);assert.match(html,/Hochwischen/);assert.doesNotMatch(html,/iPhone|Safari/);assert.match(html,/keine Bestätigung einer App-Installation/);assert.match(html,/eingeschränkt/);assert.match(html,/Chrome/);
  const installed=renderToStaticMarkup(createElement(InstallHelp,{available:true,installed:true,busy:false,onInstall:()=>{}}));assert.doesNotMatch(installed,/<button/);
 }finally{if(original)Object.defineProperty(globalThis,'navigator',original);else Reflect.deleteProperty(globalThis,'navigator');}
});
