import type {InteriorFloor,InteriorMap,InteriorNpc} from '../data/interiorMaps';
import {getAtlas} from './pixelArtAssets';

const cell=(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,w:number,h=w)=>{
 const cw=image.naturalWidth/4,ch=image.naturalHeight/4;
 ctx.drawImage(image,column*cw,row*ch,cw,ch,Math.round(x-w/2),Math.round(y-h/2),Math.round(w),Math.round(h));
};

export function drawSocialInterior(ctx:CanvasRenderingContext2D,map:InteriorMap,floor:InteriorFloor,time:number){
 const library=floor.environment==='library',atlas=getAtlas(library?'library-interior':'tavern-interior');
 const floorColor=library?'#38291f':'#4a2e1d',wallColor=library?'#191715':'#21150f';
 ctx.fillStyle=wallColor;ctx.fillRect(0,0,floor.width,floor.height);
 ctx.fillStyle=floorColor;ctx.fillRect(70,150,floor.width-140,floor.height-205);
 if(atlas){
  for(let y=185;y<floor.height-70;y+=120)for(let x=105;x<floor.width-70;x+=120)cell(ctx,atlas,0,0,x,y,126,126);
  for(let x=95;x<floor.width-70;x+=180)cell(ctx,atlas,1,0,x,85,190,150);
  if(library){
   [[330,350,0],[825,350,1],[1320,350,2]].forEach(([x,y,column])=>cell(ctx,atlas,column,1,x,y,285,285));
   [[170,690,2,0],[1480,690,3,0],[570,680,3,3],[1080,690,0,3],[825,590,2,3]].forEach(([x,y,c,r])=>cell(ctx,atlas,c,r,x,y,125));
  }else{
   cell(ctx,atlas,2,0,825,150,520,210);cell(ctx,atlas,0,1,150,250,190);cell(ctx,atlas,1,0,255,430,150);
   [[340,465],[825,465],[1310,465]].forEach(([x,y])=>cell(ctx,atlas,3,0,x,y,230));
   [[160,760],[1490,760]].forEach(([x,y])=>cell(ctx,atlas,1,1,x,y,170));
   cell(ctx,atlas,3,1,825,805,145);cell(ctx,atlas,0,3,560,520,95);cell(ctx,atlas,1,3,1040,510,95);
  }
 }
 const glow=ctx.createRadialGradient(825,library?520:175,10,825,library?520:175,330);glow.addColorStop(0,`rgba(255,202,104,${.14+Math.sin(time/260)*.02})`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(450,0,750,700);
 ctx.strokeStyle=library?'#a47b48':'#9b6738';ctx.lineWidth=8;ctx.strokeRect(55,55,floor.width-110,floor.height-110);
 ctx.fillStyle='#121017dd';ctx.fillRect(floor.spawn[0]-72,floor.height-65,144,65);ctx.fillStyle='#ffe0a0';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('MAIN MAP',floor.spawn[0],floor.height-27);
}

export function drawInteriorNpc(ctx:CanvasRenderingContext2D,npc:InteriorNpc,x:number,y:number,time:number){
 const atlas=getAtlas(npc.atlas);if(!atlas)return;
 const bob=Math.sin(time/420+npc.x)*1.5;cell(ctx,atlas,npc.art[0],npc.art[1],x,y-11+bob,72,72);
 ctx.fillStyle='#151019d9';ctx.font='bold 11px monospace';ctx.textAlign='center';const width=Math.min(210,ctx.measureText(npc.name).width+16);ctx.fillRect(x-width/2,y+33,width,22);ctx.fillStyle='#fff0bd';ctx.fillText(npc.name,x,y+48);
}
