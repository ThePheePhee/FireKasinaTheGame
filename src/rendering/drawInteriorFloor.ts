import type {InteriorFloor,InteriorMap} from '../data/interiorMaps';
import {downStairs as downPoint,upStairs as upPoint} from '../engine/interiorNavigation';
import {getAtlas} from './pixelArtAssets';
import {drawSocialInterior} from './drawSocialInterior';

const palette={tower:['#111827','#28364b','#63718a','#d7c281'],fireworks:['#170d18','#481724','#96352e','#ffae38'],magick:['#11142b','#282954','#665b91','#c990df'],jhana:['#102126','#24464a','#64826d','#d2c981'],divine:['#252d49','#655b85','#a783a7','#f3db9a'],formless:['#03050d','#0d1228','#282a54','#8189c8'],healing:['#183229','#315c43','#70a66b','#d7d68e'],recall:['#21182a','#4b3b56','#86738e','#e2c589'],tavern:['#201710','#493322','#8a5a31','#efbd68'],library:['#171411','#3b2c22','#8b693f','#efce82']} as const;
const themeColumn={tower:0,fireworks:3,magick:2,jhana:4,divine:5,formless:5,healing:4,recall:0,tavern:3,library:0};
const atlasCell=(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number,alpha=1)=>{const w=image.naturalWidth/6,h=image.naturalHeight/4;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,column*w,row*h,w,h,x-size/2,y-size/2,size,size);ctx.restore()};
const recallCell=(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,x:number,y:number,size:number,alpha=1)=>{const w=image.naturalWidth/4,h=image.naturalHeight;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,column*w,0,w,h,x-size/2,y-size/2,size,size);ctx.restore()};
export function drawAtmosphere(ctx:CanvasRenderingContext2D,theme:InteriorMap['theme'],width:number,height:number,time:number){const colors=palette[theme];ctx.save();ctx.globalAlpha=theme==='formless'?.5:.28;for(let i=0;i<32;i++){const x=(i*347+83)%width,y=(i*193+Math.sin(time/1700+i)*18+height)%height,s=2+(i%4);ctx.fillStyle=i%3?colors[3]:colors[2];ctx.beginPath();if(theme==='divine'||theme==='healing'){ctx.ellipse(x,y,s*1.8,s*.75,i*.7,0,Math.PI*2)}else if(theme==='magick'){ctx.arc(x,y,s*1.5,0,Math.PI*2);ctx.moveTo(x-s*3,y);ctx.lineTo(x+s*3,y);ctx.moveTo(x,y-s*3);ctx.lineTo(x,y+s*3);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}else if(theme==='tower'){ctx.rect(x-s,y-s,s*2,s*2)}else if(theme==='fireworks'){ctx.moveTo(x,y-s*3);ctx.lineTo(x+s,y+s);ctx.lineTo(x-s,y+s)}else if(theme==='jhana'){ctx.arc(x,y,s*2,Math.PI,Math.PI*2)}else{ctx.moveTo(x,y-s*2);ctx.lineTo(x+s,y);ctx.lineTo(x,y+s*2);ctx.lineTo(x-s,y)}ctx.fill()}ctx.restore()}

function drawFloorGround(ctx:CanvasRenderingContext2D,theme:InteriorMap['theme'],width:number,height:number){
 const colors=palette[theme],garden=['jhana','healing','recall'].includes(theme),open=theme==='formless';
 ctx.fillStyle=colors[0];ctx.fillRect(0,0,width,height);
 ctx.fillStyle=colors[1];ctx.fillRect(32,32,width-64,height-64);
 for(let y=32,row=0;y<height-32;y+=48,row++)for(let x=32;x<width-32;x+=48){
  const n=((x*13+y*7)%97)/97;
  if(garden){ctx.fillStyle=n>.6?colors[2]:colors[0];ctx.globalAlpha=.4;ctx.fillRect(x+14,y+19,3,8);ctx.fillRect(x+9,y+15,3,8);ctx.fillRect(x+19,y+15,3,8);if(n>.84){ctx.fillStyle=colors[3];ctx.fillRect(x+31,y+33,3,3)}}
  else if(open){ctx.globalAlpha=n>.7?.6:.2;ctx.fillStyle=colors[3];ctx.fillRect(x+11+n*16,y+20,2,2)}
  else{const shift=row%2?24:0;ctx.globalAlpha=.38;ctx.fillStyle=colors[0];ctx.fillRect(x,y,48,2);ctx.fillRect(x+shift,y,2,48);ctx.globalAlpha=.17;ctx.fillStyle=colors[2];ctx.fillRect(x+shift+4,y+4,40,2);if(n>.7){ctx.fillRect(x+12,y+34,8,2);ctx.fillRect(x+20,y+32,2,4)}}
 }
 ctx.globalAlpha=1;
}

export function drawIntegratedFloor(ctx:CanvasRenderingContext2D,map:InteriorMap,floor:InteriorFloor,landmarks:HTMLImageElement|null,tiles:HTMLImageElement|null,time:number,floorIndex:number,special:HTMLImageElement|null=null,legacy:HTMLImageElement|null=null,states:HTMLImageElement|null=null,rupa:HTMLImageElement|null=null,animate=true){
 if(floor.environment){drawSocialInterior(ctx,map,floor,time);return}
 if(map.theme==='tavern')landmarks=getAtlas('settlements');
 const colors=palette[map.theme],column=themeColumn[map.theme],recallTiles=map.theme==='recall'?getAtlas('recall'):null,up=upPoint(floor),down=downPoint(floor),pathStart=floorIndex?down:floor.spawn,path=[pathStart,...floor.zones.map(z=>[z.x,z.y] as [number,number])];if(floorIndex<map.floors.length-1)path.push(up);
 drawFloorGround(ctx,map.theme,floor.width,floor.height);if(animate)drawAtmosphere(ctx,map.theme,floor.width,floor.height,time);
 const gardenPath=['jhana','healing','recall'].includes(map.theme);ctx.strokeStyle=gardenPath?'#c7b08028':`${colors[3]}14`;ctx.lineWidth=gardenPath?136:148;ctx.lineJoin='bevel';ctx.lineCap='square';ctx.beginPath();path.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
 floor.zones.forEach(z=>{const image=z.artAtlas==='special'?special:z.artAtlas==='legacy'?legacy:z.artAtlas==='states'?(states??getAtlas('states')):z.artAtlas==='rupa'?(rupa??getAtlas('rupa')):z.artAtlas==='luminous'?getAtlas('luminous'):z.artAtlas==='divine'?getAtlas('divine'):landmarks;if(image){const columns=z.artAtlas==='luminous'||z.artAtlas==='divine'?3:z.artAtlas==='states'||z.artAtlas==='special'||z.artAtlas==='rupa'?4:5,rows=z.artAtlas==='luminous'||z.artAtlas==='divine'||z.artAtlas==='special'?2:z.artAtlas==='states'?3:z.artAtlas==='rupa'?1:z.artAtlas==='legacy'?5:4,size=Math.min(z.w,z.h)*.78,cellW=image.naturalWidth/columns,cellH=image.naturalHeight/rows;ctx.drawImage(image,z.art[0]*cellW,z.art[1]*cellH,cellW,cellH,z.x-size/2,z.y-size/2-10,size,size)}});
 floor.obstacles.forEach(o=>{if(recallTiles)recallCell(ctx,recallTiles,2,o.x+o.w/2,o.y+o.h/2,Math.max(o.w,o.h)*1.35);else if(tiles)atlasCell(ctx,tiles,column,2,o.x+o.w/2,o.y+o.h/2,Math.max(o.w,o.h)*1.35);else{ctx.fillStyle=colors[2];ctx.fillRect(o.x,o.y,o.w,o.h)}});
 if(floorIndex===0){if(recallTiles)recallCell(ctx,recallTiles,3,floor.spawn[0],floor.height-70,145);drawExit(ctx,floor.spawn[0],floor.height-35,colors[3])}else drawStairs(ctx,tiles,down[0],down[1],false,colors[3],map.theme);if(floorIndex<map.floors.length-1)drawStairs(ctx,tiles,up[0],up[1],true,colors[3],map.theme);
 ctx.strokeStyle=`${colors[2]}88`;ctx.lineWidth=6;ctx.strokeRect(22,22,floor.width-44,floor.height-44);ctx.strokeStyle=`${colors[3]}66`;ctx.lineWidth=2;ctx.strokeRect(31,31,floor.width-62,floor.height-62);
}
function drawStairs(ctx:CanvasRenderingContext2D,tiles:HTMLImageElement|null,x:number,y:number,up:boolean,color:string,theme:InteriorMap['theme']){if(tiles){const column=theme==='divine'?4:theme==='formless'?5:up?0:1;atlasCell(ctx,tiles,column,3,x,y,126)}else{ctx.fillStyle='#17141d';ctx.fillRect(x-48,y-48,96,96);for(let i=0;i<6;i++){ctx.fillStyle=i%2?color:'#625b62';ctx.fillRect(x-34+i*5,y-31+i*10,68-i*10,7)}}}
function drawExit(ctx:CanvasRenderingContext2D,x:number,y:number,color:string){ctx.fillStyle='#121019';ctx.fillRect(x-74,y-36,148,72);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.strokeRect(x-74,y-36,148,72);}
