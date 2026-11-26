import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchNetwork} from '../src/research-data.ts';
import {findJourney,parseNetwork,startRide,advanceRide,exportNetwork} from '../src/model.ts';
import {nearbyStops,sharedStops,servicesAtStop} from '../src/transfers.ts';
import {readRide,saveLocal} from '../src/storage.ts';

const walkingNetwork=parseNetwork({schemaVersion:1,id:'walking-test',name:'Walking test',status:'demo',source:{name:'Synthetic test',url:'https://example.org',license:'CC0',checkedAt:'2026-11-26'},sources:[{id:'fixture',name:'Synthetic positions',url:'https://example.org',checkedAt:'2026-11-26',scope:'Test fixture'}],stops:[['a',-900],['b',0],['c',100],['d',900]].map(([id,x],i)=>({id,name:`Demo ${id}`,x:100+i*100,y:200,position:{x,y:0,system:'game',sourceId:'fixture'}})),lines:[{id:'ONE',name:'Demo One',mode:'bus',color:'#ffc45e',patterns:[{id:'out',headsign:'Demo b',stops:['a','b']}]},{id:'TWO',name:'Demo Two',mode:'bus',color:'#20ead7',patterns:[{id:'out',headsign:'Demo d',stops:['c','d']}]}]});

test('N02 and 1618 share five stop identities and route between both lines without walking',()=>{
 const stops=sharedStops(researchNetwork,'N02','1618');
 assert.equal(stops.length,5);assert.ok(stops.some(s=>s.id==='catalan-blvd-g'));
 assert.ok(servicesAtStop(researchNetwork,'catalan-blvd-h').some(s=>s.line.id==='1618'&&s.boarding.some(p=>p.id==='cw')));
 const n={...researchNetwork,lines:researchNetwork.lines.filter(l=>['N02','1618'].includes(l.id))};
 const j=findJourney(n,'vcia-circular-a','koko-blvd-a',['bus'],'transfers')!;
 assert.ok(j);assert.deepEqual(j.legs.map(l=>l.lineId),['N02','1618']);assert.equal(j.transfers,1);
 assert.equal(j.legs[0].stops.at(-1),j.legs[1].stops[0]);assert.ok(stops.some(s=>s.id===j.legs[1].stops[0]));
});
test('Every multi-line stop exposes all serving lines and boardable directions across the whole network',()=>{
 let busHubs=0;
 for(const stop of researchNetwork.stops){
  const expected=researchNetwork.lines.filter(l=>l.patterns.some(p=>p.stops.includes(stop.id)));
  const actual=servicesAtStop(researchNetwork,stop.id);
  assert.deepEqual(actual.map(s=>s.line.id),expected.map(l=>l.id));
  for(const service of actual)assert.deepEqual(service.boarding.map(p=>p.id),service.line.patterns.filter(p=>p.stops.slice(0,-1).includes(stop.id)).map(p=>p.id));
  if(expected.filter(l=>l.mode==='bus').length>1)busHubs++;
  for(const a of expected)for(const b of expected)if(a.id!==b.id)assert.ok(sharedStops(researchNetwork,a.id,b.id).some(s=>s.id===stop.id));
 }
 assert.ok(busHubs>20);
});
test('Nearby boarding stops use sourced game positions and the selected radius, never schematic coordinates',()=>{
 assert.deepEqual(nearbyStops(walkingNetwork,'b',99),[]);
 const near=nearbyStops(walkingNetwork,'b',100);assert.equal(near[0].stop.id,'c');assert.equal(near[0].distance,100);
 const n=structuredClone(walkingNetwork);n.stops[1].x=970;n.stops[2].x=30;
 assert.equal(nearbyStops(n,'b',100)[0].distance,100);
 delete n.stops[1].position;assert.deepEqual(nearbyStops(n,'b',500),[]);
 assert.ok(nearbyStops(walkingNetwork,'b',1000).length);
 assert.deepEqual(nearbyStops(walkingNetwork,'b',10001),[]);
});
test('Direct and walking interchanges work across bus, metro and regional rail, respecting selected modes',()=>{
 for(const [first,second] of [['rail','bus'],['metro','bus'],['rail','metro']] as const){
  const n=structuredClone(walkingNetwork);n.lines[0].mode=first;n.lines[1].mode=second;
  let j=findJourney(n,'a','d',[first,second],'transfers',{enabled:true,maxDistance:150})!;
  assert.ok(j);assert.equal(j.legs[1].kind,'walk');assert.equal(j.transfers,1);
  assert.equal(findJourney(n,'a','d',[first],'transfers',{enabled:true,maxDistance:150}),null);
  n.lines[1].patterns[0].stops=['b','d'];
  j=findJourney(n,'a','d',[first,second],'transfers')!;
  assert.deepEqual(j.legs.map(l=>l.lineId),['ONE','TWO']);assert.equal(j.transfers,1);
  assert.deepEqual(servicesAtStop(n,'b').map(s=>s.line.mode),[first,second]);
 }
});
test('Walking is opt-in, constrained by radius, and reconstructed as a separate manual leg',()=>{
 assert.equal(findJourney(walkingNetwork,'a','d'),null);
 assert.equal(findJourney(walkingNetwork,'a','d',['bus'],'transfers',{enabled:true,maxDistance:99}),null);
 const j=findJourney(walkingNetwork,'a','d',['bus'],'transfers',{enabled:true,maxDistance:150})!;
 assert.deepEqual(j.legs.map(l=>l.kind??'transit'),['transit','walk','transit']);assert.equal(j.legs[1].distance,100);
 assert.equal(j.transfers,1);assert.equal(j.minutes,null);
 let r=startRide(walkingNetwork.id,j);r=advanceRide(advanceRide(r));assert.equal(r.leg,1);assert.equal(r.phase,'transfer');
 const stored=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{value:{getItem:(k:string)=>stored.get(k)??null,setItem:(k:string,v:string)=>stored.set(k,v),removeItem:(k:string)=>stored.delete(k)},configurable:true});
 saveLocal('vct-ride',r);assert.deepEqual(readRide(walkingNetwork),r);
 r=advanceRide(advanceRide(r));assert.equal(r.leg,2);assert.equal(r.phase,'transfer');
 r=advanceRide(advanceRide(r));assert.equal(r.phase,'arrived');
 const bad=structuredClone(j);bad.legs[1].distance=999;saveLocal('vct-ride',startRide(walkingNetwork.id,bad));assert.equal(readRide(walkingNetwork),null);
});
test('Walking candidates cannot chain across an unserved gap or create invented arrival links',()=>{
 const n=structuredClone(walkingNetwork);n.stops[2].position!.x=800;
 assert.equal(findJourney(n,'a','d',['bus'],'transfers',{enabled:true,maxDistance:500}),null);
 assert.equal(findJourney(walkingNetwork,'b','c',['bus'],'stops',{enabled:true,maxDistance:150}),null);
});
test('Sourced positions survive stop-only exports and reject malformed provenance',()=>{
 assert.deepEqual(parseNetwork(exportNetwork(researchNetwork)),researchNetwork);
 const n=structuredClone(researchNetwork);n.stops[0].position!.sourceId='missing';assert.throws(()=>parseNetwork(n),/unbekannte Quelle/);
});
