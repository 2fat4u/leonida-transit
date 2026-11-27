import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import review from '../src/stop-name-review.json';
import {researchNetwork as network} from '../src/research-data.ts';

test('Name review keeps uncertain evidence separate and refers to existing stop identities',()=>{
 const stops=new Map(network.stops.map(s=>[s.id,s])),lines=new Set(network.lines.map(l=>l.id));
 assert.equal(review.independentGameVerification,false);
 assert.deepEqual(review.renamedStops,[]);
 for(const issue of review.issues){for(const id of issue.stopIds)assert.ok(stops.has(id),id);for(const id of issue.lineIds)assert.ok(lines.has(id),id);}
 for(const row of review.busNameComparisons)assert.equal(row.name,stops.get(row.stopId)?.name);
 const uncertain=review.issues.find(i=>i.id==='1029-ne-1st-b-or-c')!;
 assert.equal(uncertain.status,'unresolved-user-observation');
 assert.equal(stops.get('ne-1st-ave-b')?.name,'NE 1st Ave, Crosstown (Stop B)');
 assert.equal(stops.has('ne-1st-ave-c'),false);
});

test('Downloadable offline name review is identical to the review shown in the app',()=>{
 const download=JSON.parse(readFileSync(new URL('../public/stop-name-review.json',import.meta.url),'utf8'));
 assert.deepEqual(download,review);
});
