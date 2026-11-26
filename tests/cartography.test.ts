import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {GeographicBackdrop,backdropPlaces} from '../src/GeographicBackdrop.tsx';
import {geographyOutlines,geographicRoutePaths,projectGeographic} from '../src/geography.ts';
import {projectGame} from '../src/schematic.ts';
import {researchNetwork as network} from '../src/research-data.ts';

function inRing(point:number[],ring:number[][]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
const inFeature=(p:number[],f:{rings:number[][][]})=>inRing(p,f.rings[0])&&!f.rings.slice(1).some(r=>inRing(p,r));
function distanceToRing(p:number[],ring:number[][]){return Math.min(...ring.slice(1).map((b,i)=>{const a=ring[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}));}

test('Simplified coast covers source stop positions, apart from a documented near-shore causeway marker',()=>{
 const land=geographyOutlines.geographic,outside:string[]=[];
 for(const s of network.stops){const p=[s.position!.x,s.position!.y];if(land.some(f=>inFeature(p,f)))continue;
  outside.push(s.id);const distance=Math.min(...land.flatMap(f=>f.rings.map(r=>distanceToRing(p,r))));assert.ok(distance<12,`${s.name}: ${distance}m outside land`);
 }
 assert.deepEqual(outside,['rialto-cswy-t']);
});
test('Draper Island and Vice Beach are separate land features with water between them and the mainland',()=>{
 const land=geographyOutlines.geographic,draper=land.find(f=>f.id==='draper-island')!,main=land.find(f=>f.id==='mainland')!,beach=land.find(f=>f.id==='vice-beach')!;
 assert.ok(draper&&main&&beach);assert.ok(inFeature([-7304.9,4865.2],draper));assert.equal(inFeature([-7304.9,4865.2],main),false);
 assert.ok(inFeature([1784,576],beach));assert.equal(inFeature([1784,576],main),false);
 assert.equal(land.some(f=>inFeature([-6800,4700],f)),false);
 assert.equal(land.some(f=>inFeature([300,800],f)),false);
});
test('Schematic backdrop keeps only large land masses, one compact lake and no airport area or invented river',()=>{
 const html=renderToStaticMarkup(createElement(GeographicBackdrop,{project:projectGame,mode:'schematic',scale:1}));
 assert.ok(geographyOutlines.schematic.length<geographyOutlines.geographic.length/4);
 assert.equal((html.match(/data-lake=/g)??[]).length,1);assert.equal(html.includes('data-airport='),false);assert.equal(html.includes('backdrop-urban'),false);
 for(const name of ['HAMLET','KEY LENTO','DRAPER ISLAND','GRAYSON'])assert.ok(html.includes(name));
 const path=html.match(/data-lake="lake-leonida" d="([^"]+)"/)![1];const numbers=path.match(/-?\d+(?:\.\d+)?/g)!.map(Number),xs=numbers.filter((_,i)=>i%2===0),ys=numbers.filter((_,i)=>i%2===1);
 assert.ok((Math.max(...xs)-Math.min(...xs))/(Math.max(...ys)-Math.min(...ys))<1.1);
});
test('Mount Kalaga label is south of Grayson and new place labels use geographic locations',()=>{
 const park=backdropPlaces.find(p=>p.name==='MOUNT KALAGA')!,grayson=network.stops.find(s=>s.id==='grayson-station')!;
 assert.ok(park.y<grayson.position!.y);assert.ok(projectGame(park.x,park.y).y>projectGame(grayson.position!.x,grayson.position!.y).y);
 for(const name of ['HAMLET','KEY LENTO']){const place=backdropPlaces.find(p=>p.name===name)!;assert.ok(geographyOutlines.geographic.some(f=>inFeature([place.x,place.y],f)));}
});
test('All default passenger directions use matching source paths without changing routing data',()=>{
 const before=JSON.stringify(network),paths=geographicRoutePaths(network);
 assert.equal(paths.length,25);assert.ok(paths.every(p=>p.sourced&&p.points.length>10));assert.ok(paths.every(p=>p.lineId!=='freight-rail'));
 assert.equal(JSON.stringify(network),before);
 const rail=paths.filter(p=>p.lineId==='AR').flatMap(p=>p.points);assert.ok(Math.min(...rail.map(p=>p.y))<projectGeographic(-3520,5928).y);
});
test('Changed imported positions and stop sequences fall back to explicit connections, not stale path geometry',()=>{
 const n=structuredClone(network),line=n.lines[0];n.stops.find(s=>s.id===line.patterns[0].stops[0])!.position!.x+=10;
 const paths=geographicRoutePaths(n).filter(p=>p.lineId===line.id&&p.patternId===line.patterns[0].id);
 assert.ok(paths.length>1);assert.ok(paths.every(p=>!p.sourced&&p.points.length===2));
 const changed=structuredClone(network);changed.lines[0].patterns[0].stops.reverse();
 assert.ok(geographicRoutePaths(changed).filter(p=>p.lineId===changed.lines[0].id&&p.patternId===changed.lines[0].patterns[0].id).every(p=>!p.sourced));
});
