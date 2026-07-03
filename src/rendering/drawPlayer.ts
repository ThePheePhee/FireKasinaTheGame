import type {Player} from '../engine/movement';
export function drawPlayer(ctx:CanvasRenderingContext2D,p:Player){
 const bob=p.moving?Math.round(Math.sin(p.step)*2):0,leg=Math.sin(p.step)>0?2:-2;ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y+bob));
 ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-9,11,18,5);ctx.fillStyle='#572f23';ctx.fillRect(-7+leg,7,5,8);ctx.fillRect(2-leg,7,5,8);
 ctx.fillStyle='#f4c85c';ctx.fillRect(-8,-8,16,17);ctx.fillStyle='#e45a35';ctx.fillRect(-9,-12,18,7);ctx.fillStyle='#69372a';ctx.fillRect(-6,-5,12,8);
 ctx.fillStyle='#fff3c4';if(p.direction==='left')ctx.fillRect(-7,-3,3,3);else if(p.direction==='right')ctx.fillRect(4,-3,3,3);else {ctx.fillRect(-5,-3,3,3);ctx.fillRect(2,-3,3,3);}ctx.restore();
}
