import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {researchNetwork} from '../src/research-data.ts';
import {makeSchematic,schematicSignature} from '../src/schematic.ts';
const target=fileURLToPath(new URL('../src/schematic-cache.json',import.meta.url));
const signature=schematicSignature(researchNetwork);
if(existsSync(target)&&JSON.parse(readFileSync(target,'utf8')).signature===signature){
 console.log('Schematic layout: current');
}else{
 const layout=makeSchematic(researchNetwork,true);
 writeFileSync(target,JSON.stringify({signature,nodes:[...layout.nodes.values()],edges:layout.edges,geographic:layout.geographic})+'\n');
 console.log(`Schematic layout: ${layout.nodes.size} stops, ${layout.edges.length} route segments`);
}
