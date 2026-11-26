import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchNetwork as network} from '../src/research-data.ts';
import {boardingPatternIndex,directionMarkers,directionStopIds} from '../src/directions.ts';
import {geographicRoutePaths,projectGeographic} from '../src/geography.ts';
import {findJourney} from '../src/model.ts';
import {uniqueCalls,callNeighbours} from '../src/schematic.ts';
import review from '../src/direction-audit.json';

test('1618 preserves the observed P to S northbound segment and the separately listed Q to O direction',()=>{
 const line=network.lines.find(l=>l.id==='1618')!;
 const cw=line.patterns.find(p=>p.id==='cw')!,ccw=line.patterns.find(p=>p.id==='ccw')!;
 assert.equal(boardingPatternIndex(line,'catalan-blvd-p'),line.patterns.indexOf(cw));
 assert.equal(boardingPatternIndex(line,'catalan-blvd-q'),line.patterns.indexOf(ccw));
 assert.equal(cw.stops[cw.stops.indexOf('catalan-blvd-p')+1],'catalan-blvd-s');
 assert.equal(ccw.stops[ccw.stops.indexOf('catalan-blvd-q')+1],'catalan-blvd-o');
 assert.ok(!ccw.stops.includes('catalan-blvd-p'));assert.ok(!cw.stops.includes('catalan-blvd-q'));
 for(const [pattern,from,to] of [[cw,'catalan-blvd-p','catalan-blvd-s'],[ccw,'catalan-blvd-q','catalan-blvd-o']] as const){
  const journey=findJourney({...network,lines:[{...line,patterns:[pattern]}]},from,to,['bus'],'stops')!;
  assert.deepEqual(journey.legs[0].stops,[from,to]);assert.equal(journey.legs.length,1);
 }
 const p=network.stops.find(s=>s.id==='catalan-blvd-p')!.position!,s=network.stops.find(s=>s.id==='catalan-blvd-s')!.position!;
 assert.ok(projectGeographic(s.x,s.y).y<projectGeographic(p.x,p.y).y);
});

test('Every direction-specific boarding stop selects a direction that actually serves it',()=>{
 for(const line of network.lines)for(const stopId of new Set(line.patterns.flatMap(p=>p.stops.slice(0,-1)))){
  assert.ok(line.patterns[boardingPatternIndex(line,stopId)].stops.slice(0,-1).includes(stopId));
 }
});

test('Selected geographic directions filter both track paths and stops, including opposite platforms',()=>{
 for(const line of network.lines)for(const pattern of line.patterns){
  const selection={lineId:line.id,patternId:pattern.id};
  const paths=geographicRoutePaths(network,selection);
  assert.ok(paths.length);assert.ok(paths.every(p=>p.lineId===line.id&&p.patternId===pattern.id));
  assert.deepEqual([...directionStopIds(network,[line.id],selection)].sort(),[...new Set(pattern.stops)].sort());
 }
 const cw=directionStopIds(network,['1618'],{lineId:'1618',patternId:'cw'});
 assert.ok(cw.has('catalan-blvd-p'));assert.ok(!cw.has('catalan-blvd-q'));assert.ok(!cw.has('catalan-blvd-o'));
});

test('Direction markers follow ordered segments through turns rather than alphabetic endpoint order',()=>{
 assert.deepEqual(directionMarkers([{x:0,y:100},{x:0,y:0},{x:100,y:0}],50),[
  {x:0,y:75,angle:-90},{x:0,y:25,angle:-90},{x:25,y:0,angle:0},{x:75,y:0,angle:0}]);
 assert.deepEqual(directionMarkers([{x:0,y:0}],100),[]);
});

test('All audited calls retain their source direction and exact successor without inferring reverse service',()=>{
 assert.equal(review.directions.length,25);assert.equal(review.explicitDirectionCount,12);
 for(const row of review.directions){
  const line=network.lines.find(l=>l.id===row.lineId)!,pattern=line.patterns.find(p=>p.id===row.patternId)!;
  const calls=uniqueCalls(pattern);
  assert.deepEqual(calls,row.calls);
  if(row.sourceDirection)assert.equal(pattern.id,row.sourceDirection==='acw'?'ccw':'cw');
  const isolated={...network,lines:[{...line,patterns:[pattern]}]};
  for(let i=0;i<calls.length;i++){
   const to=calls[(i+1)%calls.length];
   assert.equal(callNeighbours(pattern,i+1).next,to);
   assert.deepEqual(findJourney(isolated,calls[i],to,[line.mode],'stops')!.legs[0].stops,[calls[i],to]);
  }
 }
});
