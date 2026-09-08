import type {InteriorFloor,InteriorObstacle} from '../data/interiorMaps';
import type {Player} from './movement';

export function upStairs(floor:InteriorFloor):[number,number]{const zone=floor.zones[floor.zones.length-1];return[zone.x,Math.max(85,zone.y-145)]}
export function downStairs(floor:InteriorFloor):[number,number]{const zone=floor.zones[0];return[zone.x,Math.min(floor.height-90,zone.y+145)]}
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
