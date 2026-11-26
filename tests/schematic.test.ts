import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchNetwork as network} from '../src/research-data.ts';
import audit from '../src/route-audit.json';
import {networkSchematic} from '../src/schematic-cache.ts';
import {callNeighbours,makeCallDiagram,pathCollisions,projectGame,repeatedCalls,schematicSignature,shortStopLabel,uniqueCalls} from '../src/schematic.ts';
import {findJourney} from '../src/model.ts';
const layout=networkSchematic(network);

test('All 25 directions retain audited source call order and an explicitly declared closed loop',()=>{
 assert.equal(audit.independentRouteVerification,false);assert.equal(audit.directions.length,25);
 for(const row of audit.directions){const p=network.lines.find(l=>l.id===row.lineId)!.patterns.find(p=>p.id===row.patternId)!;
  assert.equal(row.sourceLoop,true);assert.equal(row.geometryClosed,true);assert.deepEqual(uniqueCalls(p),row.calls);
  assert.equal(p.stops[0],p.stops.at(-1));assert.equal(p.minutes.length,p.stops.length-1);
 }
});
test('Every source-declared loop can continue from its last listed call back to its first call',()=>{
 for(const line of network.lines)for(const pattern of line.patterns){
  const calls=uniqueCalls(pattern),last=calls.at(-1)!,first=calls[0];
  const n={...network,lines:[{...line,patterns:[pattern]}]};
  const journey=findJourney(n,last,first,[line.mode],'stops')!;
  assert.ok(journey);assert.equal(journey.legs.length,1);assert.deepEqual(journey.legs[0].stops,[last,first]);
 }
});
test('420 visits Little Cuba I twice in a fixed order through the northern loop, not a free four-way branch',()=>{
 const p=network.lines.find(l=>l.id==='420')!.patterns[0];
 assert.deepEqual(p.stops.slice(12,19),['nw-4th-ave-g','nw-4th-ave-i','northbrook-dr-b','northbrook-dr-c','rialto-cswy-a','nw-4th-ave-i','nw-4th-ave-f']);
 assert.deepEqual(repeatedCalls(p).find(r=>r.stopId==='nw-4th-ave-i')?.calls,[14,18]);
 assert.deepEqual(callNeighbours(p,14),{previous:'nw-4th-ave-g',next:'northbrook-dr-b'});
 assert.deepEqual(callNeighbours(p,18),{previous:'rialto-cswy-a',next:'nw-4th-ave-f'});
 const j=findJourney({...network,lines:network.lines.filter(l=>l.id==='420')},'nw-4th-ave-g','nw-4th-ave-f',['bus'],'transfers')!;
 assert.equal(j.legs.length,1);assert.deepEqual(j.legs[0].stops,p.stops.slice(12,19));
});
test('Each rendered call in every direction has one predecessor and successor; repeat calls have distinct symbols',()=>{
 for(const line of network.lines)for(const p of line.patterns){
  const diagram=makeCallDiagram(p,layout.nodes);
  assert.equal(diagram.calls.length,uniqueCalls(p).length);assert.equal(diagram.edges.length,diagram.calls.length);
  for(const call of diagram.calls){assert.equal(diagram.edges.filter(e=>e.from.id===call.id).length,1);assert.equal(diagram.edges.filter(e=>e.to.id===call.id).length,1);}
  for(const repeat of diagram.repeats){const symbols=diagram.calls.filter(c=>c.stopId===repeat.stopId);assert.equal(new Set(symbols.map(s=>`${s.x},${s.y}`)).size,symbols.length);}
 }
});
test('Selected-route tracks do not run through unrelated call symbols and use horizontal, vertical or 45-degree segments',()=>{
 for(const line of network.lines)for(const p of line.patterns){const diagram=makeCallDiagram(p,layout.nodes);
  for(const edge of diagram.edges){assert.equal(pathCollisions(edge.points,diagram.calls.filter(c=>c.id!==edge.from.id&&c.id!==edge.to.id),8),0);
   for(let i=1;i<edge.points.length;i++){const dx=Math.abs(edge.points[i].x-edge.points[i-1].x),dy=Math.abs(edge.points[i].y-edge.points[i-1].y);assert.ok(dx<.01||dy<.01||Math.abs(dx-dy)<.01);}
  }
 }
});
test('Schematic placement preserves broad geographic orientation and never changes physical positions',()=>{
 const before=JSON.stringify(network);assert.ok(projectGame(1000,5000).x>projectGame(-6000,5000).x);assert.ok(projectGame(0,8000).y<projectGame(0,-6000).y);
 assert.equal(layout.nodes.size,340);assert.equal(new Set([...layout.nodes.values()].map(p=>`${p.x},${p.y}`)).size,340);
 networkSchematic(network);assert.equal(JSON.stringify(network),before);
 const changed=structuredClone(network);changed.stops[0].position!.x+=50;assert.notEqual(schematicSignature(changed),schematicSignature(network));
});
test('Map labels retain stop letters and districts rather than truncating them into identical street labels',()=>{
 for(const letter of ['A','B','F','I'])assert.deepEqual(shortStopLabel({id:letter,name:`NW 4th Ave, Little Cuba (Stop ${letter})`,x:0,y:0}),[`NW 4th Ave · ${letter}`,'Little Cuba']);
});
