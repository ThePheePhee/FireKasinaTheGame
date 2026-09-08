import {roadFamilyPriority,routes,type Route} from '../data/routes';

const ENTRY_DISTANCE=28;
const EXIT_DISTANCE=38;
const SHARED_ROAD_BAND=8;

/** Distance to the authored centreline, including its finite endpoints. */
export function distanceToRoute(route:Route,x:number,y:number):number {
 if(!Number.isFinite(x)||!Number.isFinite(y))return Infinity;
 let closest=Infinity;
 for(let index=1;index<route.points.length;index++){
  const [ax,ay]=route.points[index-1],[bx,by]=route.points[index];
  const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;
  closest=Math.min(closest,Math.hypot(x-ax-dx*t,y-ay-dy*t));
 }
 return closest;
}

/**
 * The roads under the traveller's feet, not distant destinations on those roads.
 * Shared surfaces expose every authored route. A small exit margin and primary
 * preference keep the name steady while walking a verge or crossing a junction.
 * All state remains with the caller; discovering a road never reveals terrain.
 */
export function nearbyRoutes(x:number,y:number,previousId?:string|null):Route[] {
 if(!Number.isFinite(x)||!Number.isFinite(y))return [];
 const distances=routes.map((route,index)=>({route,index,distance:distanceToRoute(route,x,y)}));
 const nearest=Math.min(...distances.map(item=>item.distance));
 const previous=distances.find(item=>item.route.id===previousId);
 const retained=previous!==undefined&&previous.distance<=EXIT_DISTANCE&&previous.distance<=nearest+SHARED_ROAD_BAND;
 if(nearest>ENTRY_DISTANCE&&!retained)return [];
 const limit=retained?EXIT_DISTANCE:ENTRY_DISTANCE;
 return distances
  .filter(item=>item.distance<=limit&&item.distance<=nearest+SHARED_ROAD_BAND)
  .sort((a,b)=>{
   if(retained){if(a.route.id===previousId)return -1;if(b.route.id===previousId)return 1}
   return roadFamilyPriority[b.route.family]-roadFamilyPriority[a.route.family]||a.distance-b.distance||a.index-b.index;
  })
  .map(item=>item.route);
}
