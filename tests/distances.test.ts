import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatDistance,fromDisplayDistance,toDisplayDistance,validWalkDistance} from '../src/units.ts';
import {researchNetwork} from '../src/research-data.ts';
import {exportNetwork,parseNetwork} from '../src/model.ts';
import {placeLabels} from '../src/schematic.ts';

test('Imperial conversion preserves the physical radius and formats feet and miles',()=>{
 assert.equal(fromDisplayDistance(1000,'imperial'),304.8);
 assert.equal(toDisplayDistance(304.8,'imperial'),1000);
 for(const n of [1,150,300,777.25,10000])assert.ok(Math.abs(fromDisplayDistance(toDisplayDistance(n,'imperial'),'imperial')-n)<1e-9);
 assert.equal(formatDistance(304.8,'imperial','en'),'1,000 ft');
 assert.equal(formatDistance(1609.344,'imperial','en'),'1 mi');
 assert.equal(formatDistance(1250,'metric','de'),'1,3 km');
 for(const n of [1,300,777,10000])assert.ok(validWalkDistance(n));
 for(const n of [NaN,Infinity,0,-1,10001])assert.equal(validWalkDistance(n),false);
});
test('Every segment exports a derived straight line, including loop closure, without using schematic coordinates',()=>{
 const network=structuredClone(researchNetwork);const positions=new Map(network.stops.map(s=>[s.id,s.position!]));
 let count=0;
 for(const line of network.lines)for(const p of line.patterns){
  assert.equal(p.airDistancesMetres!.length,p.stops.length-1);
  p.stops.slice(1).forEach((id,i)=>{const a=positions.get(p.stops[i])!,b=positions.get(id)!;assert.equal(p.airDistancesMetres![i],Math.hypot(a.x-b.x,a.y-b.y));count++;});
 }
 assert.ok(count>300);
 network.stops.forEach(s=>{s.x=100;s.y=100;});
 assert.deepEqual(parseNetwork(exportNetwork(network)),network);
 const p=network.lines[0].patterns[0],distance=p.airDistancesMetres![0];p.airDistancesMetres![0]=0;
 assert.equal(parseNetwork(network).lines[0].patterns[0].airDistancesMetres![0],distance);
 p.airDistancesMetres=[];assert.throws(()=>parseNetwork(network),/Luftlinien/);
});
test('Label gap and type retain screen size across zoom levels',()=>{
 for(const scale of [.3,1,3,10]){
  const point={x:500,y:500};const label=placeLabels([{id:'s',point,rows:['Demo'],priority:1}],{x:0,y:0,width:1000,height:1000},13/scale,[point])[0];
  assert.ok(label);assert.ok(Math.abs(Math.abs(label.x-point.x)*scale-10)<1e-9);
  assert.ok(Math.abs(label.box.height*scale-15.6)<1e-9);
 }
});
