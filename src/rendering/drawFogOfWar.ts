import {WORLD} from '../data/mapRegions';
import type {DiscoveryPoint} from '../game/gameState';

export function drawFogOfWar(ctx:CanvasRenderingContext2D,discovery:DiscoveryPoint[],playerX:number,playerY:number,inMist:boolean,time:number){
 ctx.save();ctx.beginPath();ctx.rect(-20,-20,WORLD.width+40,WORLD.height+40);
 for(const point of discovery){ctx.moveTo(point.x+point.radius,point.y);ctx.arc(point.x,point.y,point.radius,0,Math.PI*2,true)}
 const sight=inMist?82:145;ctx.moveTo(playerX+sight,playerY);ctx.arc(playerX,playerY,sight,0,Math.PI*2,true);
 ctx.fillStyle='rgba(8,10,16,.94)';ctx.fill('evenodd');
 ctx.globalAlpha=.38;ctx.fillStyle='#bbc7ca';
 for(let i=0;i<90;i++){const x=(i*233+Math.sin(time/1600+i)*34+WORLD.width)%WORLD.width,y=(i*137+Math.cos(time/1900+i)*28+WORLD.height)%WORLD.height;ctx.fillRect(x,y,2+(i%4),2)}
 ctx.restore();
}

export function drawMistVeil(ctx:CanvasRenderingContext2D,width:number,height:number,time:number,confusion:number){
 ctx.save();ctx.fillStyle=`rgba(160,174,181,${.08+confusion/900})`;ctx.fillRect(0,0,width,height);ctx.globalAlpha=.12+confusion/700;
 for(let i=0;i<18;i++){const x=(i*127+time*.018*(i%2?1:-1)+width)%width,y=(i*79+Math.sin(time/900+i)*35+height)%height,r=55+(i%5)*18,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(225,230,224,.55)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 ctx.restore();
}
