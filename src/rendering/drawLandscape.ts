import {mapRegions} from '../data/mapRegions';
import {expandPoint,MAP_SPACING,WORLD} from '../data/mapScale';
import {regionVisuals} from '../data/regionVisuals';
import {routes} from '../data/routes';
import {hashNoise} from '../engine/terrainEffects';
import type {Country} from '../game/worldProgression';
import {clearForScenery,countryCellAt,countryGrid,distanceToRoad,LANDSCAPE_TILE} from './landscapeModel';

// A deliberately low-resolution terrain language: broad fields, stepped banks,
// grouped trees, and quiet landmark courts. No atlas wallpaper or region disks.
const ground:Record<Country,readonly string[]>={
 home:['#7d9f4b','#80a14d','#7b9d49','#83a34f'],
 fairy:['#52824e','#54844f','#50814d','#568650'],
 mist:['#53635d','#55655f','#52625c','#576761'],
};
const pixel=(value:number)=>Math.round(value/2)*2;
function rect(ctx:CanvasRenderingContext2D,color:string,x:number,y:number,w:number,h:number){ctx.fillStyle=color;ctx.fillRect(pixel(x),pixel(y),pixel(w),pixel(h))}
function grass(ctx:CanvasRenderingContext2D,x:number,y:number,color:string){
 rect(ctx,color,x,y,2,4);rect(ctx,color,x-2,y-2,2,2);rect(ctx,color,x+2,y,2,2);
}

function fields(ctx:CanvasRenderingContext2D){
 const grid=countryGrid(),tile=LANDSCAPE_TILE;
 for(let row=0;row<grid.rows;row++)for(let column=0;column<grid.columns;column++){
  const x=column*tile,y=row*tile,country=grid.cells[row*grid.columns+column];
  // Large, nearly imperceptible patches hold together at the whole-map scale.
  const patch=(Math.sin(column*.11+Math.sin(row*.13)*2)+Math.cos(row*.14+Math.cos(column*.09)))*.24+.5;
  ctx.fillStyle=ground[country][patch>.82?3:patch>.56?1:patch<.16?2:0];ctx.fillRect(x,y,tile,tile);
  if(country!==countryCellAt(x+8,y-8))rect(ctx,country==='home'?'#b4bf70':country==='mist'?'#798776':'#789759',x,y,tile,2);
  if(country!==countryCellAt(x-8,y+8))rect(ctx,country==='home'?'#a8b665':country==='mist'?'#69796b':'#68874f',x,y,2,tile);
  const seed=hashNoise(column+101,row+217);
  if(seed>.90)grass(ctx,x+4+Math.floor(seed*5)*2%8,y+6,country==='home'?'#a8bd67':country==='fairy'?'#7caa63':'#778378');
  else if(seed<.035)rect(ctx,country==='mist'?'#465750':'#436c44',x+4,y+10,4,2);
 }
}

type Court={id:string;w:number;h:number;base:string;light:string;dark:string;stone?:boolean;natural?:boolean;offset?:readonly[number,number]};
const courts:Court[]=[
 {id:'house',w:104,h:76,base:'#b3a06a',light:'#cbb980',dark:'#918559',stone:true,offset:[0,22]},
 {id:'library',w:130,h:88,base:'#a79c7f',light:'#c1b494',dark:'#89866e',stone:true,offset:[0,22]},
 {id:'fortification-tavern',w:132,h:92,base:'#b49a65',light:'#c9af77',dark:'#958454',stone:true,offset:[16,30]},
 {id:'red-dot',w:122,h:106,base:'#b29754',light:'#c1a863',dark:'#9b884b',offset:[0,22]},
 {id:'inn',w:164,h:108,base:'#8b8061',light:'#a3946b',dark:'#716d52',stone:true,offset:[0,20]},
 {id:'tower',w:176,h:126,base:'#9a9b85',light:'#b7b59b',dark:'#7e8475',stone:true,offset:[0,18]},
 {id:'magical',w:176,h:128,base:'#777783',light:'#92919c',dark:'#626674',stone:true,offset:[0,18]},
 {id:'celestial',w:208,h:126,base:'#bfbd95',light:'#d4d1aa',dark:'#9d9f7e',stone:true,offset:[0,24]},
 {id:'healing',w:162,h:106,base:'#83a65f',light:'#acc380',dark:'#7f965c',natural:true,offset:[0,22]},
 {id:'life-recall',w:172,h:106,base:'#92968b',light:'#aaac9f',dark:'#797e79',stone:true,offset:[0,20]},
 {id:'trauma',w:174,h:126,base:'#626965',light:'#787b70',dark:'#4b5550',natural:true,offset:[0,18]},
 {id:'counterfeit-crags',w:136,h:92,base:'#8a9084',light:'#aab39b',dark:'#737d73',natural:true,offset:[0,20]},
 {id:'credulous-circuit',w:124,h:88,base:'#727b68',light:'#8f957b',dark:'#5d6c5b',natural:true,offset:[-16,0]},
 {id:'fireworks',w:190,h:138,base:'#76695d',light:'#8d7d64',dark:'#5b5e52',natural:true,offset:[0,18]},
 {id:'jhana',w:232,h:144,base:'#769458',light:'#92ad6b',dark:'#607e4b',natural:true,offset:[0,22]},
 {id:'formless',w:218,h:156,base:'#4d5a67',light:'#667782',dark:'#3b4a55',natural:true,offset:[0,22]},
];

function court(ctx:CanvasRenderingContext2D,c:Court){
 const region=mapRegions.find(region=>region.id===c.id)!;
 const cx=region.x+(c.offset?.[0]??0),cy=region.y+(c.offset?.[1]??0),left=pixel(cx-c.w/2),top=pixel(cy-c.h/2);
 // Chamfered plazas have explicit steps instead of thick circular boundaries.
 for(let y=0;y<c.h;y+=8)for(let x=0;x<c.w;x+=8){
  if(c.natural){
   const edge=((x-c.w/2)/(c.w/2))**2+((y-c.h/2)/(c.h/2))**2;
   if(edge>.86+hashNoise(x+left,y+top)*.2)continue;
  }else if((x<16||x>=c.w-16)&&(y<16||y>=c.h-16))continue;
  rect(ctx,c.base,left+x,top+y,8,8);
  if(c.stone){
   if(y%16===0)rect(ctx,c.dark,left+x,top+y,8,2);
   if((x+(Math.floor(y/16)%2)*16)%32===0)rect(ctx,c.dark,left+x,top+y,2,8);
   if(y%16===2)rect(ctx,c.light,left+x+2,top+y,6,2);
  }else if(hashNoise(x+left,y+top)>.87)rect(ctx,c.light,left+x+2,top+y+4,4,2);
 }
 if(c.stone){
  rect(ctx,c.dark,left+16,top+c.h,c.w-32,4);
  rect(ctx,c.light,cx-22,top+c.h,44,4);rect(ctx,c.dark,cx-24,top+c.h+4,48,2);
  rect(ctx,c.light,cx-26,top+c.h+6,52,4);
 }
}

const lagoon=mapRegions.find(region=>region.id==='booboo')!;
function waterAt(x:number,y:number){
 const dx=(x-lagoon.x)/150,dy=(y-lagoon.y-2)/112;
 return dx*dx+dy*dy<1;
}
function lagoonWater(ctx:CanvasRenderingContext2D){
 const tile=8;
 for(let y=Math.floor((lagoon.y-124)/tile)*tile;y<lagoon.y+124;y+=tile)for(let x=Math.floor((lagoon.x-160)/tile)*tile;x<lagoon.x+160;x+=tile){
  if(!waterAt(x+4,y+4))continue;
  const shore=!waterAt(x+4,y-4)||!waterAt(x-4,y+4)||!waterAt(x+12,y+4)||!waterAt(x+4,y+12);
  rect(ctx,shore?'#779887':'#315e66',x,y,tile,tile);
  if(!shore&&hashNoise(x,y)>.85)rect(ctx,'#528185',x,y+4,6,2);
 }
}

export function drawLandscapeBridges(ctx:CanvasRenderingContext2D){
 // Roads that meet the lagoon have tangible boardwalks, not paths painted on water.
 const seen=new Set<string>();
 for(const route of routes)for(let index=1;index<route.points.length;index++){
  const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
  for(let step=0;step<=length;step+=6){
   const x=ax+dx*step/length,y=ay+dy*step/length;if(!waterAt(x,y))continue;
   const key=`${Math.round(x/5)},${Math.round(y/5)}`;if(seen.has(key))continue;seen.add(key);
   ctx.save();ctx.translate(pixel(x),pixel(y));ctx.rotate(Math.atan2(dy,dx));
   rect(ctx,'#594d3d',-4,-20,8,40);rect(ctx,'#b39965',-2,-17,4,34);rect(ctx,'#d0b47b',-2,-17,4,2);ctx.restore();
   for(const side of [-1,1])rect(ctx,'#dec592',x+nx*19*side-2,y+ny*19*side-2,4,4);
  }
 }
}

// Pixel stamps: broad three-shade canopies with a visible trunk and a grounded
// shadow. Their footprint is checked against ALL paths, labels, and story props.
function tree(ctx:CanvasRenderingContext2D,x:number,y:number,country:Country,pine:boolean){
 const palette=country==='mist'?['#354b46','#425e51','#648069']:country==='home'?['#385d39','#528342','#86a64c']:['#315d42','#477f4b','#75a35b'];
 rect(ctx,'#40573f',x-18,y+17,36,8);rect(ctx,'#604f35',x-4,y+3,8,24);rect(ctx,'#987349',x,y+8,4,16);
 if(pine){
  for(let row=0;row<5;row++){
   const w=12+row*8,top=y-31+row*10;
   rect(ctx,palette[0],x-w/2,top,w,14);rect(ctx,palette[1],x-w/2+4,top,w-8,10);rect(ctx,palette[2],x-w/2+4,top,Math.max(4,w/3),4);
  }
 }else{
  rect(ctx,palette[0],x-16,y-31,32,48);rect(ctx,palette[0],x-24,y-23,48,32);
  rect(ctx,palette[1],x-20,y-25,36,34);rect(ctx,palette[1],x-12,y-33,24,42);
  rect(ctx,palette[2],x-12,y-31,20,6);rect(ctx,palette[2],x-20,y-23,12,8);rect(ctx,palette[2],x-16,y-15,8,4);
  rect(ctx,palette[0],x+10,y-11,6,12);rect(ctx,palette[0],x-4,y+7,12,6);
  rect(ctx,palette[2],x-6,y-19,8,4);rect(ctx,palette[2],x+4,y-25,4,4);rect(ctx,palette[2],x-18,y-5,6,4);
  rect(ctx,palette[0],x+6,y-3,8,4);rect(ctx,palette[0],x-12,y+5,6,4);rect(ctx,palette[1],x+18,y-17,4,10);
 }
}
function rock(ctx:CanvasRenderingContext2D,x:number,y:number,mist:boolean){
 rect(ctx,'#3e5647',x-12,y+5,26,6);rect(ctx,mist?'#687870':'#7f8a74',x-12,y-7,24,14);
 rect(ctx,mist?'#7e8d7d':'#a3a889',x-8,y-13,16,8);rect(ctx,'#596c60',x+4,y-5,8,12);rect(ctx,'#b0b397',x-6,y-11,8,2);
}
function flowers(ctx:CanvasRenderingContext2D,x:number,y:number,mist:boolean,seed:number){
 for(let i=0;i<3;i++){
  const ox=Math.floor(hashNoise(seed,i)*16)*2-16,oy=Math.floor(hashNoise(i,seed)*10)*2-10;
  rect(ctx,mist?'#7b9079':'#3e6d42',x+ox,y+oy,2,6);
  const color=mist?'#9c9aaf':seed%3===0?'#e2c968':seed%3===1?'#e4b8ac':'#b1cba2';
  rect(ctx,color,x+ox-2,y+oy-2,6,4);rect(ctx,'#eee1a8',x+ox,y+oy,2,2);
 }
}
const groves=[
 [320,250,130],[425,420,95],[575,285,110],[720,160,85],[1110,360,100],
 [1205,640,100],[1085,855,130],[755,730,80],[350,820,85],[1305,790,160],
 [1250,1000,95],[925,62,95],[850,970,90],[1520,600,100],[85,750,80],
 [450,45,85],[1305,85,75],[1240,220,60],[80,485,90],[610,610,70],
].map(([x,y,r])=>{const [px,py]=expandPoint([x,y]);return [px,py,r*MAP_SPACING]});

function scenery(ctx:CanvasRenderingContext2D){
 for(let row=0,y=38;y<WORLD.height-25;row++,y+=44)for(let column=0,x=30;x<WORLD.width-25;column++,x+=48){
  const seed=hashNoise(column+919,row+271),px=pixel(x+(hashNoise(row,column)-.5)*20),py=pixel(y+(seed-.5)*14);
  if(waterAt(px,py)||!clearForScenery(px,py,52,64))continue;
  const country=countryCellAt(px,py);
  const cluster=Math.max(0,...groves.map(([gx,gy,r])=>1-Math.hypot(px-gx,py-gy)/r));
  const edge=Math.min(px,py,WORLD.width-px,WORLD.height-py)<62;
  if((cluster>.12&&seed<.38+cluster*.6)||(edge&&seed<.58))tree(ctx,px,py,country,country==='mist'||seed>.85);
  else if(seed>.945)rock(ctx,px,py,country==='mist');
  else if(seed<.12&&distanceToRoad(px,py)>35)flowers(ctx,px,py,country==='mist',row*119+column);
 }
}

function gardenBeds(ctx:CanvasRenderingContext2D){
 const garden=mapRegions.find(region=>region.id==='garden')!,visual=regionVisuals.garden,[ox,oy]=visual.artOffset??[0,0],x=garden.x+ox,y=garden.y+oy;
 // The garden's ground follows its actual fenced sprite, not the homestead's
 // shared logical hit area, which is much larger and intentionally overlaps home.
 rect(ctx,'#708947',x-72,y-52,144,114);
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const px=x+side*80,py=y-32+i*22;if(distanceToRoad(px,py)<25)continue;
  rect(ctx,'#6b6039',px-6,py-6,12,12);grass(ctx,px-2,py-2,'#9cbe54');
 }
}

export function drawLandscape(ctx:CanvasRenderingContext2D){
 ctx.save();ctx.imageSmoothingEnabled=false;fields(ctx);lagoonWater(ctx);
 for(const plaza of courts)court(ctx,plaza);
 gardenBeds(ctx);scenery(ctx);ctx.restore();
}
