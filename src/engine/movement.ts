export type Player={x:number;y:number;direction:'up'|'down'|'left'|'right';moving:boolean;step:number};
export function movePlayer(p:Player,keys:Set<string>,dt:number,w:number,h:number):Player{
 let dx=0,dy=0; if(keys.has('ArrowLeft')||keys.has('a'))dx--; if(keys.has('ArrowRight')||keys.has('d'))dx++;
 if(keys.has('ArrowUp')||keys.has('w'))dy--; if(keys.has('ArrowDown')||keys.has('s'))dy++;
 const length=Math.hypot(dx,dy)||1,speed=190; let direction=p.direction;
 if(Math.abs(dx)>Math.abs(dy)) direction=dx<0?'left':'right'; else if(dy) direction=dy<0?'up':'down';
 return {x:Math.max(12,Math.min(w-12,p.x+dx/length*speed*dt)),y:Math.max(12,Math.min(h-12,p.y+dy/length*speed*dt)),direction,moving:!!(dx||dy),step:p.step+(dx||dy?dt*9:0)};
}
