import type {Route,RouteFamily} from '../data/routes';
import {WORLD} from '../data/mapScale';

const materials:Record<RouteFamily,{earth:string;stone:string;light:string;shade:string}>={
 generation:{earth:'#816644',stone:'#b5945d',light:'#dfb370',shade:'#987640'},
 deconstruction:{earth:'#65606d',stone:'#938699',light:'#b7a2c5',shade:'#766c83'},
 balance:{earth:'#667257',stone:'#9caa7e',light:'#c0cea0',shade:'#7a8d69'},
 connection:{earth:'#776d55',stone:'#aaa07e',light:'#cec09a',shade:'#928768'},
};

interface PathSample{x:number;y:number;nx:number;ny:number;distance:number}
function samples(route:Route):PathSample[]{
 const result:PathSample[]=[];let distance=0;
 for(let index=1;index<route.points.length;index++){
  const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);
  if(!length)continue;
  const steps=Math.ceil(length/2);
  for(let step=0;step<steps;step++){const t=step/steps;result.push({x:Math.round((ax+dx*t)/2)*2,y:Math.round((ay+dy*t)/2)*2,nx:-dy/length,ny:dx/length,distance:distance+length*t})}
  distance+=length;
 }
 return result;
}

export function drawRoutes(ctx:CanvasRenderingContext2D,routes:Route[]){
 // Several teachings share the same road. Draw that road once rather than
 // stacking two heavy lines over each other; both lore markers remain present.
 const unique=new Map<string,Route>();
 for(const route of routes){const forward=JSON.stringify(route.points),backward=JSON.stringify([...route.points].reverse()),key=forward<backward?forward:backward,old=unique.get(key);if(!old||old.family==='connection')unique.set(key,route)}
 const paths=[...unique.values()].map(route=>({route,points:samples(route),material:materials[route.family]}));
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(WORLD.width/2);canvas.height=Math.ceil(WORLD.height/2);const layer=canvas.getContext('2d')!;
 ctx.save();ctx.imageSmoothingEnabled=false;
 // Two-pixel stamps provide an actual coarse pixel grid with no vector halos.
 // Composite each complete layer once, so overlapping stamps and junctions
 // do not gradually turn transparent earth into an opaque dark outline.
 for(const {points,material} of paths){layer.fillStyle=material.earth;for(const point of points)layer.fillRect(point.x/2-4,point.y/2-4,8,8)}
 ctx.globalAlpha=.42;ctx.drawImage(canvas,0,0,WORLD.width,WORLD.height);layer.clearRect(0,0,canvas.width,canvas.height);
 for(const {route,points,material} of paths){
  layer.fillStyle=material.stone;
  for(const point of points){if(route.kind==='tunnel'&&point.distance%24>17)continue;layer.fillRect(point.x/2-2,point.y/2-2,4,4)}
 }
 ctx.globalAlpha=.9;ctx.drawImage(canvas,0,0,WORLD.width,WORLD.height);
 for(const {route,points,material} of paths){
  let lastStone=-1;
  for(const point of points){
   const stone=Math.floor(point.distance/16);if(stone===lastStone)continue;lastStone=stone;
   ctx.globalAlpha=.7;ctx.fillStyle=stone%3?material.shade:material.light;
   if(route.kind==='bridge'){
    for(let across=-3;across<=3;across+=2)ctx.fillRect(Math.round((point.x+point.nx*across)/2)*2,Math.round((point.y+point.ny*across)/2)*2,2,2);
   }else{const side=stone%2?2:-2;ctx.fillRect(point.x+side,point.y-2,2+(stone%2)*2,2)}
   if(stone%3===1){ctx.globalAlpha=.32;ctx.fillStyle=material.light;ctx.fillRect(Math.round((point.x+point.nx*10)/2)*2,Math.round((point.y+point.ny*10)/2)*2,2,2)}
  }
 }
 ctx.restore();
}

export function drawRouteLabels(ctx:CanvasRenderingContext2D,routes:Route[]){
 ctx.save();ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 for(const route of routes){const [x,y]=route.labelAt,width=ctx.measureText(route.name).width+12;ctx.fillStyle='#161219d9';ctx.fillRect(x-width/2,y-10,width,20);ctx.fillStyle=materials[route.family].light;ctx.fillText(route.name,x,y)}
 ctx.restore();
}
