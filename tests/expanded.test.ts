import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchNetwork as network} from '../src/research-data.ts';
import {exportNetwork,parseNetwork,findJourney} from '../src/model.ts';
import {setLanguage,readLanguage,t} from '../src/i18n.ts';

test('Stop-only export round-trips all directions and evidence without requiring times',()=>{
 const exported=exportNetwork(network);
 assert.ok(exported.lines.every(l=>l.patterns.every(p=>!('minutes' in p))));
 assert.deepEqual(parseNetwork(JSON.parse(JSON.stringify(exported))),network);
});
test('Unnamed shelters retain isolated occurrence identities rather than creating false interchanges',()=>{
 const shelters=network.stops.filter(s=>s.id.startsWith('unknown-'));
 assert.equal(shelters.length,41);
 for(const stop of shelters){assert.equal(network.lines.filter(l=>l.patterns.some(p=>p.stops.includes(stop.id))).length,1);assert.equal(stop.evidence?.level,'single-source');}
 assert.equal(network.lines.find(l=>l.id==='N02')?.mode,'bus');
 assert.ok(!network.lines.some(l=>l.id==='FR'));
});
test('Expanded routes reconstruct only explicitly directed segments, including ring boundaries',()=>{
 for(const line of network.lines)for(const p of line.patterns){
  const j=findJourney(network,p.stops[0],p.stops[Math.floor(p.stops.length/2)],undefined,'transfers');
  assert.ok(j);assert.equal(j.minutes,null);
  for(const leg of j.legs){const pattern=network.lines.find(l=>l.id===leg.lineId)!.patterns.find(p=>p.id===leg.patternId)!;
   for(let i=1;i<leg.stops.length;i++)assert.ok(pattern.stops.some((s,k)=>s===leg.stops[i-1]&&pattern.stops[k+1]===leg.stops[i]));
  }
 }
});
test('Language switch persists, translates metadata and validation, and leaves stop names intact',()=>{
 const stored=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{value:{getItem:(k:string)=>stored.get(k)??null,setItem:(k:string,v:string)=>stored.set(k,v)},configurable:true});
 setLanguage('en');assert.equal(readLanguage(),'en');
 assert.equal(t('Weil du zu arm bist für eine richtige Karre.'),'Because you are too poor to afford a real ride.');
 assert.equal(t('Zuletzt bestätigt: {0}','Fleeca Field Metro Station'),'Last confirmed: Fleeca Field Metro Station');
 assert.equal(t('Haltestellen: 2–500 Einträge erwartet.'),'stops: expected 2–500 entries.');
 assert.equal(t('Fleeca Field Metro Station'),'Fleeca Field Metro Station');
 setLanguage('de');assert.equal(readLanguage(),'de');assert.equal(t('Clockwise'),'Uhrzeigersinn');
 assert.match(t(network.notes![0]),/^Vorläufiges Fan-Netz/);
});
