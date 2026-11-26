import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findJourney,parseNetwork,type Network} from '../src/model.ts';
import {findWalkingAlternative,rideSegments} from '../src/walking-alternative.ts';
import {researchNetwork} from '../src/research-data.ts';

function fixture(count=10):Network{
 const ids=Array.from({length:count+1},(_,i)=>`a${i}`);
 return parseNetwork({schemaVersion:1,id:'alternative-test',name:'Alternative fixture',status:'demo',source:{name:'Synthetic fixture',url:'https://example.org',license:'CC0',checkedAt:'2026-11-26'},sources:[{id:'test',name:'Synthetic coordinates',url:'https://example.org',checkedAt:'2026-11-26',scope:'Test only'}],stops:[...ids.map((id,i)=>({id,name:`Test ${id}`,x:100+i*20,y:200,position:{x:i===0?0:i*1000,y:0,system:'game',sourceId:'test'}})),{id:'b',name:'Test boarding stop',x:150,y:250,position:{x:100,y:0,system:'game',sourceId:'test'}}],lines:[{id:'LONG',name:'Long route',mode:'bus',color:'#ffc45e',patterns:[{id:'out',headsign:'End',stops:ids}]},{id:'SHORT',name:'Short route',mode:'bus',color:'#20ead7',patterns:[{id:'out',headsign:'End',stops:['b',ids.at(-1)]}]}]});
}
const baseline=(n:Network)=>findJourney(n,'a0',n.lines[0].patterns[0].stops.at(-1)!,['bus'],'transfers')!;

test('A short walk offers a substantially shorter route without altering the original choice or data',()=>{
 const n=fixture(),original=baseline(n),before=JSON.stringify({n,original});
 const suggestion=findWalkingAlternative(n,original,['bus'],300)!;
 assert.ok(suggestion);assert.equal(suggestion.originalSegments,10);assert.equal(suggestion.segments,1);assert.equal(suggestion.savedSegments,9);assert.equal(suggestion.walkingMetres,100);
 assert.deepEqual(suggestion.journey.legs.map(l=>l.lineId),['__walk__','SHORT']);
 assert.equal(suggestion.journey.from,original.from);assert.equal(suggestion.journey.to,original.to);
 assert.equal(JSON.stringify({n,original}),before);
});
test('Small savings, missing journeys and walking journeys do not produce another suggestion',()=>{
 const n=fixture(3);assert.equal(findWalkingAlternative(n,baseline(n),['bus'],300),null);
 assert.equal(findWalkingAlternative(n,null,['bus'],300),null);
 const m=fixture(),walk=findJourney(m,'a0','a10',['bus'],'stops',{enabled:true,maxDistance:300})!;
 assert.equal(findWalkingAlternative(m,walk,['bus'],300),null);
});
test('The chosen transport modes, distance limit and missing coordinates are respected',()=>{
 const n=fixture(),original=baseline(n);
 n.lines[1].mode='rail';assert.equal(findWalkingAlternative(n,original,['bus'],300),null);
 assert.equal(findWalkingAlternative(n,original,['bus','rail'],50),null);
 assert.equal(findWalkingAlternative(n,original,['bus','rail'],0),null);
 n.stops.forEach(s=>delete s.position);assert.equal(findWalkingAlternative(n,original,['bus','rail'],300),null);
});
test('Automatic suggestions cap total walking at 500 metres rather than using a long custom radius',()=>{
 const n=fixture();n.stops.find(s=>s.id==='b')!.position={x:600,y:600,system:'game',sourceId:'test'};
 assert.equal(findWalkingAlternative(n,baseline(n),['bus'],10000),null);
});
test('A shorter route available without walking is not attributed to walking',()=>{
 const n=fixture();
 n.lines.push({id:'OTHER',name:'Already short',mode:'bus',color:'#ffffff',patterns:[{id:'out',headsign:'Change',stops:['a0','a8'],minutes:[null]}]});
 n.lines.push({id:'CONNECT',name:'Connection',mode:'bus',color:'#ffffff',patterns:[{id:'out',headsign:'End',stops:['a8','a9','a10'],minutes:[null,null]}]});
 const original=findJourney(n,'a0','a10',['bus'],'transfers')!;
 assert.equal(rideSegments(original),10);
 assert.equal(rideSegments(findJourney(n,'a0','a10',['bus'],'stops')!),3);
 assert.equal(findWalkingAlternative(n,original,['bus'],300),null);
});
test('Three saved segments are suppressed if the percentage improvement is still small',()=>{
 const n=fixture(20),p=n.lines[1].patterns[0];
 p.stops=['b',...n.lines[0].patterns[0].stops.slice(4)];p.minutes=p.stops.slice(1).map(()=>null);
 assert.equal(findWalkingAlternative(n,baseline(n),['bus'],300),null);
});
test('The reported Catalan P scenario keeps the normal loop and separately offers Q with five ride segments',()=>{
 const original=findJourney(researchNetwork,'catalan-blvd-p','catalan-blvd-g',['bus'],'transfers')!;
 assert.equal(rideSegments(original),15);assert.equal(original.legs[0].patternId,'cw');
 const suggestion=findWalkingAlternative(researchNetwork,original,['bus'],300)!;
 assert.ok(suggestion);assert.equal(suggestion.segments,5);assert.equal(suggestion.savedSegments,10);
 assert.deepEqual(suggestion.journey.legs[0].stops,['catalan-blvd-p','catalan-blvd-q']);
 assert.equal(suggestion.journey.legs[1].patternId,'ccw');assert.ok(Math.abs(suggestion.walkingMetres-41)<1);
 assert.deepEqual(original.legs[0].stops.slice(0,2),['catalan-blvd-p','catalan-blvd-s']);
});
