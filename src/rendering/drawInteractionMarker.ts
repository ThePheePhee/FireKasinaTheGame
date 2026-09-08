import type {InteriorFloor, InteriorZone} from '../data/interiorMaps';
import {interactionAnchor, interactionKind} from '../engine/interiorInteraction';

// Small, hard-edged world signs. The active sign becomes a real touch button.
export function drawInteractionMarker(ctx: CanvasRenderingContext2D, zone: InteriorZone, environment?: InteriorFloor['environment']) {
  const [x,y]=interactionAnchor(zone,environment),kind=interactionKind(zone);
  ctx.save();ctx.translate(Math.round(x),Math.round(y));
  ctx.fillStyle='#15121dd9';ctx.fillRect(-15,-13,30,27);
  ctx.strokeStyle='#aa8955';ctx.lineWidth=2;ctx.strokeRect(-15,-13,30,27);
  ctx.fillStyle='#e0bd78';ctx.fillRect(-2,15,4,4);
  if(kind==='book'){
    ctx.fillStyle='#ecd6a3';ctx.fillRect(-10,-8,9,17);ctx.fillRect(1,-8,9,17);
    ctx.fillStyle='#967249';for(const yy of [-4,0,4]){ctx.fillRect(-8,yy,5,1);ctx.fillRect(3,yy,5,1)}
  }else if(kind==='talk'){
    ctx.fillStyle='#ecd6a3';ctx.fillRect(-10,-7,20,12);ctx.fillRect(-6,5,4,4);
    ctx.fillStyle='#674b39';for(const xx of [-6,-1,4])ctx.fillRect(xx,-2,2,2);
  }else{
    ctx.fillStyle='#edce85';ctx.fillRect(-3,-8,6,16);ctx.fillRect(-6,-4,12,8);ctx.fillStyle='#fff2c3';ctx.fillRect(-2,-5,3,5);
  }
  ctx.restore();
}
