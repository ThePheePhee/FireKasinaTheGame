import {buildRoadSections,type RoadSection,type Route,type RouteFamily} from '../data/routes';
import {WORLD} from '../data/mapScale';

export const roadWidths:Record<RouteFamily,number>={generation:28,deconstruction:26,balance:24,connection:16};
const materials:Record<RouteFamily,{edge:string;stone:string;light:string;groove:string}>={
 generation:{edge:'#786041',stone:'#c7a36b',light:'#ebca8d',groove:'#a58352'},
 deconstruction:{edge:'#514a66',stone:'#978bac',light:'#c4b7db',groove:'#756889'},
 balance:{edge:'#52664b',stone:'#b1bd85',light:'#d8dda6',groove:'#839767'},
 connection:{edge:'#645f4a',stone:'#a19c7c',light:'#c6bd98',groove:'#837b5f'},
};

interface PathSample{x:number;y:number;nx:number;ny:number;distance:number}
function samples(section:RoadSection):PathSample[]{
 const [ax,ay]=section.a,[bx,by]=section.b,dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(length/2));
 return Array.from({length:steps+1},(_,index)=>{const t=index/steps;return{x:Math.round((ax+dx*t)/2),y:Math.round((ay+dy*t)/2),nx:-dy/length,ny:dx/length,distance:length*t}});
}

export function drawRoutes(ctx:CanvasRenderingContext2D,routes:Route[]){
 const roads=buildRoadSections(routes),paths=roads.map(road=>({road,points:samples(road),material:materials[road.family]}));
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(WORLD.width/2);canvas.height=Math.ceil(WORLD.height/2);const layer=canvas.getContext('2d')!;
 const brush=(point:PathSample,width:number)=>layer.fillRect(Math.round(point.x-width/2),Math.round(point.y-width/2),width,width);
 // Build a single opaque pixel surface. Family-colored paving and narrow
 // stepped edges give major roads definition without doubled vector strokes.
 for(const {road,points,material} of paths){layer.fillStyle=material.edge;for(const point of points)brush(point,roadWidths[road.family]/2)}
 for(const {road,points,material} of paths){layer.fillStyle=material.stone;for(const point of points)brush(point,roadWidths[road.family]/2-3)}
 for(const {road,points,material} of paths){
  const half=roadWidths[road.family]/4-2;let last=-1;
  for(const point of points){
   const index=Math.floor(point.distance/(road.family==='connection'?20:14));if(index===last)continue;last=index;
   layer.fillStyle=material.groove;
   if(road.family==='deconstruction'||road.kind==='bridge'){
    for(let cross=-half;cross<=half;cross++)layer.fillRect(Math.round(point.x+point.nx*cross),Math.round(point.y+point.ny*cross),1,1);
   }else{const cross=index%2?half/2:-half/2;layer.fillRect(Math.round(point.x+point.nx*cross),Math.round(point.y+point.ny*cross),2,1)}
   const side=index%2?-1:1;layer.fillStyle=material.light;layer.fillRect(Math.round(point.x+point.nx*side*2),Math.round(point.y+point.ny*side*2)-1,2,1);
   if(road.family==='balance'&&index%3===0){layer.fillStyle=material.edge;layer.fillRect(Math.round(point.x+point.nx*(half+1)),Math.round(point.y+point.ny*(half+1)),1,2)}
  }
 }
 // Shared intersections are small tiled landings instead of a pile of strokes.
 const junctions=new Map<string,{x:number;y:number;degree:number}>();
 for(const road of roads)for(const [x,y] of [road.a,road.b]){const key=`${x.toFixed(3)},${y.toFixed(3)}`,old=junctions.get(key);if(old)old.degree++;else junctions.set(key,{x,y,degree:1})}
 for(const point of junctions.values())if(point.degree>=3){const x=Math.round(point.x/2),y=Math.round(point.y/2);layer.fillStyle='#786f56';layer.fillRect(x-6,y-6,12,12);for(let row=0;row<3;row++)for(let column=0;column<3;column++){layer.fillStyle=(row+column)%2?'#c2b88e':'#aea47f';layer.fillRect(x-5+column*4,y-5+row*4,3,3)}}
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(canvas,0,0,WORLD.width,WORLD.height);ctx.restore();
}

export function drawRouteLabels(ctx:CanvasRenderingContext2D,routes:Route[]){
 ctx.save();ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 for(const route of routes){const [x,y]=route.labelAt,width=ctx.measureText(route.name).width+12;ctx.fillStyle='#161219e8';ctx.fillRect(x-width/2,y-10,width,20);ctx.fillStyle=materials[route.family].light;ctx.fillText(route.name,x,y)}
 ctx.restore();
}
