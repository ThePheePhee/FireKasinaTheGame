import type {InteriorFloor,InteriorObstacle} from '../data/interiorMaps';
import type {Player} from './movement';

export const STAIR_ART_SIZE=126;
function stairPosition(floor:InteriorFloor,up:boolean):[number,number]{
 const zone=up?floor.zones[floor.zones.length-1]:floor.zones[0],half=STAIR_ART_SIZE/2;
 const distance=Math.min(zone.w,zone.h)*.39+half+24,cy=zone.y-10;
 // Start/end of the same itinerary, but clear the actual landmark footprint.
 // If the preferred landing runs into the wall, use a side landing instead.
 const candidates:[number,number][]=[[zone.x,cy+(up?-distance:distance)],[zone.x-distance,cy],[zone.x+distance,cy],[zone.x,cy+(up?distance:-distance)]];
 const clear=(x:number,y:number)=>x-half>=31&&x+half<=floor.width-31&&y-half>=22&&y+half<=floor.height-27&&!floor.zones.some(other=>{
  const r=Math.min(other.w,other.h)*.39;
  return x+half+12>other.x-r&&x-half-12<other.x+r&&y+half+12>other.y-10-r&&y-half-12<other.y-10+r;
 })&&!floor.obstacles.some(o=>x+half>o.x&&x-half<o.x+o.w&&y+half>o.y&&y-half<o.y+o.h);
 return candidates.find(([x,y])=>clear(x,y))??[zone.x,Math.max(85,Math.min(floor.height-90,cy+(up?-distance:distance)))];
}
export function upStairs(floor:InteriorFloor):[number,number]{return stairPosition(floor,true)}
export function downStairs(floor:InteriorFloor):[number,number]{return stairPosition(floor,false)}
export function interiorArrival(floor:InteriorFloor,from:'outside'|'below'|'above'):[number,number]{
 if(from==='outside')return [...floor.spawn];
 const stairs=from==='below'?downStairs(floor):upStairs(floor);
 return[stairs[0],Math.min(floor.height-20,stairs[1]+65)];
}

export function slideAlongObstacles(before:Player,next:Player,obstacles:InteriorObstacle[],radius=14):Player{
 const blocked=(x:number,y:number)=>obstacles.some(o=>x+radius>o.x&&x-radius<o.x+o.w&&y+radius>o.y&&y-radius<o.y+o.h);
 if(!blocked(next.x,next.y))return next;
 if(!blocked(next.x,before.y))return{...next,y:before.y,moving:next.x!==before.x};
 if(!blocked(before.x,next.y))return{...next,x:before.x,moving:next.y!==before.y};
 return{...before,direction:next.direction,moving:false};
}
