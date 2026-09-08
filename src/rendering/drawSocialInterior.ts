import type {InteriorFloor,InteriorMap,InteriorNpc} from '../data/interiorMaps';
import {getAtlas} from './pixelArtAssets';

const cell=(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,w:number,h=w)=>{
 const cw=image.naturalWidth/4,ch=image.naturalHeight/4;
 ctx.drawImage(image,column*cw,row*ch,cw,ch,Math.round(x-w/2),Math.round(y-h/2),Math.round(w),Math.round(h));
};

function drawWoodFloor(ctx:CanvasRenderingContext2D,width:number,height:number,library:boolean){
 const boards=library?['#493627','#503b2a','#57412e','#4d3929']:['#593b28','#63412c','#6b4730','#60402b'];
 const left=70,top=150,right=width-70,bottom=height-55,boardWidth=144,boardHeight=26;
 ctx.save();ctx.beginPath();ctx.rect(left,top,right-left,bottom-top);ctx.clip();
 for(let y=top,row=0;y<bottom;y+=boardHeight,row++){
  const offset=(row%3)*48;
  for(let x=left-offset,column=0;x<right;x+=boardWidth,column++){
   const grain=(row*17+column*29)%13;
   ctx.fillStyle=boards[(row*7+column*3)%boards.length];ctx.fillRect(x,y,boardWidth,boardHeight);
   // Narrow staggered seams, rather than the transparent gutters in the atlas.
   ctx.fillStyle=library?'#35271c':'#402919';ctx.fillRect(x,y,boardWidth,1);ctx.fillRect(x,y,1,boardHeight);
   ctx.fillStyle=library?'#695039':'#7e5538';ctx.fillRect(x+2,y+1,boardWidth-3,1);
   ctx.globalAlpha=.4;ctx.fillRect(x+18+grain,y+7,25+grain*3,1);ctx.fillRect(x+67-grain,y+18,31+grain*2,1);
   ctx.fillStyle=library?'#30241b':'#40291c';ctx.fillRect(x+41+grain,y+12,28,1);
   ctx.globalAlpha=.7;ctx.fillRect(x+5,y+5,2,2);ctx.fillRect(x+boardWidth-7,y+boardHeight-6,2,2);ctx.globalAlpha=1;
  }
 }
 ctx.restore();
}

export function drawSocialInterior(ctx:CanvasRenderingContext2D,map:InteriorMap,floor:InteriorFloor,time:number){
 const library=floor.environment==='library',atlas=getAtlas(library?'library-interior':'tavern-interior');
 const floorColor=library?'#38291f':'#4a2e1d',wallColor=library?'#191715':'#21150f';
 ctx.fillStyle=wallColor;ctx.fillRect(0,0,floor.width,floor.height);
 ctx.fillStyle=floorColor;ctx.fillRect(70,150,floor.width-140,floor.height-205);
 drawWoodFloor(ctx,floor.width,floor.height,library);
 if(atlas){
  for(let x=95;x<floor.width-70;x+=180)cell(ctx,atlas,1,0,x,85,190,150);
  if(library){
   [[330,350,0],[825,350,1],[1320,350,2]].forEach(([x,y,column])=>cell(ctx,atlas,column,1,x,y,285,285));
   [[170,690,2,0],[1480,690,3,0],[570,680,3,3],[1080,690,0,3],[825,590,2,3]].forEach(([x,y,c,r])=>cell(ctx,atlas,c,r,x,y,125));
  }else{
   cell(ctx,atlas,0,1,175,235,205);cell(ctx,atlas,2,1,1375,225,155);cell(ctx,atlas,1,1,1490,735,175);cell(ctx,atlas,1,1,160,760,155);
   cell(ctx,atlas,3,1,825,735,300);cell(ctx,atlas,3,3,1460,470,95);cell(ctx,atlas,2,3,450,450,92);cell(ctx,atlas,2,3,825,520,92);cell(ctx,atlas,2,3,1200,450,92);
  }
 }
 const glow=ctx.createRadialGradient(825,library?520:175,10,825,library?520:175,330);glow.addColorStop(0,`rgba(255,202,104,${.14+Math.sin(time/260)*.02})`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(450,0,750,700);
 ctx.strokeStyle=library?'#a47b48':'#9b6738';ctx.lineWidth=8;ctx.strokeRect(55,55,floor.width-110,floor.height-110);
 ctx.fillStyle='#121017dd';ctx.fillRect(floor.spawn[0]-72,floor.height-65,144,65);ctx.fillStyle='#ffe0a0';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('MAIN MAP',floor.spawn[0],floor.height-27);
}

export function drawSocialForeground(ctx:CanvasRenderingContext2D,floor:InteriorFloor,playerY=Infinity,layer:'all'|'behind'|'ahead'='all'){
 if(floor.environment!=='tavern')return;const atlas=getAtlas('tavern-interior');if(!atlas)return;
 const visible=(footY:number)=>layer==='all'||(layer==='behind'?footY<=playerY:footY>playerY);
 if(visible(300))cell(ctx,atlas,2,0,825,225,560,230);
 const tables:[[number,number],[number,number],[number,number]]=[[450,510],[825,580],[1200,510]];
 tables.forEach(([x,y],index)=>{if(!visible(y+55))return;cell(ctx,atlas,3,0,x,y,240);cell(ctx,atlas,index===0?0:1,3,x,y-(index?5:0),index===0?104:index===1?92:82)});
}

export function drawInteriorNpc(ctx:CanvasRenderingContext2D,npc:InteriorNpc,x:number,y:number,time:number,showLabel=true){
 const atlas=getAtlas(npc.atlas);if(!atlas)return;
 const bob=Math.sin(time/420+npc.x)*1.5;cell(ctx,atlas,npc.art[0],npc.art[1],x,y-11+bob,72,72);
 if(showLabel)drawInteriorNpcLabel(ctx,npc,x,y);
}

export function drawInteriorNpcLabel(ctx:CanvasRenderingContext2D,npc:InteriorNpc,x:number,y:number){
 ctx.fillStyle='#151019d9';ctx.font='bold 11px monospace';ctx.textAlign='center';const width=Math.min(210,ctx.measureText(npc.name).width+16);ctx.fillRect(x-width/2,y+33,width,22);ctx.fillStyle='#fff0bd';ctx.fillText(npc.name,x,y+48);
}
