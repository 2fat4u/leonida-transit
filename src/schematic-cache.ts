import cached from './schematic-cache.json';
import type {Network} from './model';
import {makeSchematic,schematicSignature,type StationPoint} from './schematic';
export function networkSchematic(network:Network){
 if(cached.signature===schematicSignature(network))return {nodes:new Map<string,StationPoint>(cached.nodes.map(n=>[n.id,n])),edges:cached.edges,geographic:cached.geographic};
 return makeSchematic(network);
}
