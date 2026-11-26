import {parseNetwork,type Network} from './model';
import data from './research-network.json';
// Stop facts and marker identities only. No source distances, times or designs.
export const researchNetwork=parseNetwork(data);
export function defaultTrip(network:Network){return {from:network.stops[0].id,to:network.stops.find(s=>s.name==='Fleeca Field Metro Station'||s.id==='bayside')?.id??network.stops.at(-1)!.id};}
