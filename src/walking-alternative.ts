import {findJourney,type Journey,type Mode,type Network} from './model';
import {validWalkDistance} from './units';

export type WalkingAlternative={journey:Journey;originalSegments:number;originalTransfers:number;segments:number;savedSegments:number;walkingMetres:number};
export const rideSegments=(journey:Journey)=>journey.legs.filter(l=>l.kind!=='walk').reduce((sum,l)=>sum+l.stops.length-1,0);
const substantial=(before:number,after:number)=>before-after>=3&&(before-after)/before>=.25;

export function findWalkingAlternative(network:Network,original:Journey|null,allowed:Mode[],maxDistance:number):WalkingAlternative|null {
 if(!original||original.legs.some(l=>l.kind==='walk')||!validWalkDistance(maxDistance))return null;
 const originalSegments=rideSegments(original);
 if(originalSegments<4)return null;
 // Keep automatic suggestions short, even if the optional walking search was
 // previously configured for a much longer distance. No routing data is changed.
 const limit=Math.min(maxDistance,500);
 const journey=findJourney(network,original.from,original.to,allowed,'stops',{enabled:true,maxDistance:limit});
 if(!journey||!journey.legs.some(l=>l.kind==='walk'))return null;
 const walkingMetres=journey.legs.reduce((sum,l)=>sum+(l.kind==='walk'?(l.distance??0):0),0);
 const segments=rideSegments(journey);
 if(walkingMetres<=0||walkingMetres>limit||!substantial(originalSegments,segments))return null;
 // A change of preference alone must not be presented as a benefit of walking.
 const shortestWithoutWalking=original.strategy==='stops'?original:findJourney(network,original.from,original.to,allowed,'stops');
 if(!shortestWithoutWalking||!substantial(rideSegments(shortestWithoutWalking),segments))return null;
 return {journey,originalSegments,originalTransfers:original.transfers,segments,savedSegments:originalSegments-segments,walkingMetres};
}
