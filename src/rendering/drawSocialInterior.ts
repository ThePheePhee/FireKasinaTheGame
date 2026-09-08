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

const shelfThemes:Record<string,{label:string;cloth:string;thread:string}>={
 'fire-kasina-shelves':{label:'FIRE KASINA',cloth:'#643b32',thread:'#d29252'},
 'meditation-shelves':{label:'MEDITATION',cloth:'#334f47',thread:'#b4b87a'},
 'magick-shelves':{label:'MAGICK',cloth:'#464060',thread:'#b7a5cb'},
};

function drawReadingRug(ctx:CanvasRenderingContext2D,x:number,y:number,width:number,height:number,cloth:string,thread:string){
 const left=Math.round(x-width/2),top=Math.round(y-height/2);
 ctx.fillStyle='#241e1c';ctx.fillRect(left+5,top+5,width,height);
 ctx.fillStyle=cloth;ctx.fillRect(left,top,width,height);
 ctx.strokeStyle=thread;ctx.lineWidth=2;ctx.strokeRect(left+7,top+7,width-14,height-14);ctx.strokeRect(left+12,top+12,width-24,height-24);
 // Woven dashes and stepped diamonds keep the cloth in the same pixel grid as the floor.
 ctx.fillStyle=thread;
 for(let along=22;along<width-18;along+=24){ctx.fillRect(left+along,top+18,8,2);ctx.fillRect(left+along,top+height-20,8,2)}
 for(let along=14;along<width-12;along+=12){ctx.fillRect(left+along,top-4,3,4);ctx.fillRect(left+along,top+height,3,4)}
 for(const side of [-1,1]){const dx=Math.round(x+side*(width/2-24));ctx.fillRect(dx-2,y-7,4,14);ctx.fillRect(dx-5,y-3,10,6)}
}

function drawLibraryApproach(ctx:CanvasRenderingContext2D,floor:InteriorFloor){
 const shelves=floor.zones.filter(zone=>shelfThemes[zone.id]).sort((a,b)=>a.x-b.x);
 if(!shelves.length)return;
 // One continuous T-shaped runner joins the entrance and all three reading bays.
 const first=shelves[0].x,last=shelves[shelves.length-1].x,crossY=598,runner='#524131',edge='#a58555';
 ctx.fillStyle='#2c241d';ctx.fillRect(first-49,crossY-38,last-first+106,85);ctx.fillRect(floor.spawn[0]-44,crossY,96,floor.spawn[1]-crossY+10);
 ctx.fillStyle=runner;ctx.fillRect(first-52,crossY-42,last-first+104,84);ctx.fillRect(floor.spawn[0]-48,crossY,96,floor.spawn[1]-crossY+10);
 ctx.fillStyle=edge;ctx.fillRect(first-48,crossY-36,last-first+96,2);ctx.fillRect(first-48,crossY+34,last-first+96,2);
 for(const side of [-1,1])ctx.fillRect(floor.spawn[0]+side*40,crossY+42,2,floor.spawn[1]-crossY-38);
 // Cover the seam where the entrance runner meets the cross aisle.
 ctx.fillStyle=runner;ctx.fillRect(floor.spawn[0]-38,crossY-4,76,50);
 for(const zone of shelves){
  const theme=shelfThemes[zone.id];
  drawReadingRug(ctx,zone.x,zone.y+182,258,178,theme.cloth,theme.thread);
 }
 drawReadingRug(ctx,480,790,248,178,'#3d4940','#92876a');
 drawReadingRug(ctx,1430,699,218,196,'#424052','#a39176');
 // A small embroidered open book points up the clear central aisle.
 const x=floor.spawn[0],y=floor.spawn[1]-80;
 ctx.fillStyle='#c2a777';ctx.fillRect(x-17,y-9,15,20);ctx.fillRect(x+2,y-9,15,20);ctx.fillRect(x-12,y+11,24,3);
 ctx.fillStyle='#745c3e';for(const side of [-1,1])for(let line=0;line<3;line++)ctx.fillRect(x+(side<0?-14:5),y-5+line*5,9,2);
}

function drawLibraryShelfSigns(ctx:CanvasRenderingContext2D,floor:InteriorFloor){
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 17px monospace';
 for(const zone of floor.zones){
  const theme=shelfThemes[zone.id];if(!theme)continue;
  const y=zone.y+158,w=258,h=40,x=zone.x;
  // The book interaction badge sits at y=446; these permanent nameplates sit below it.
  ctx.fillStyle='#211912';ctx.fillRect(x-w/2+4,y-h/2+4,w,h);
  ctx.fillStyle='#654a2d';ctx.fillRect(x-w/2,y-h/2,w,h);
  ctx.fillStyle='#d2af73';ctx.fillRect(x-w/2+2,y-h/2+2,w-4,2);ctx.fillRect(x-w/2+2,y+h/2-4,w-4,2);
  ctx.fillStyle='#2b241f';ctx.fillRect(x-w/2+6,y-h/2+6,w-12,h-12);
  ctx.fillStyle=theme.thread;ctx.fillRect(x-w/2+16,y-9,11,18);ctx.fillRect(x-w/2+29,y-9,11,18);ctx.fillRect(x-w/2+21,y+9,14,2);
  ctx.fillStyle='#f3e2ad';ctx.fillText(theme.label,x+17,y+1);
  ctx.fillStyle='#b7925c';for(const side of [-1,1])ctx.fillRect(x+side*(w/2-5)-1,y-1,2,2);
 }
 ctx.restore();
}

export function drawSocialInterior(ctx:CanvasRenderingContext2D,map:InteriorMap,floor:InteriorFloor,time:number){
 const library=floor.environment==='library',atlas=getAtlas(library?'library-interior':'tavern-interior');
 const floorColor=library?'#38291f':'#4a2e1d',wallColor=library?'#191715':'#21150f';
 ctx.fillStyle=wallColor;ctx.fillRect(0,0,floor.width,floor.height);
 ctx.fillStyle=floorColor;ctx.fillRect(70,150,floor.width-140,floor.height-205);
 drawWoodFloor(ctx,floor.width,floor.height,library);
 if(library)drawLibraryApproach(ctx,floor);
 if(atlas){
  for(let x=95;x<floor.width-70;x+=180)cell(ctx,atlas,1,0,x,85,190,150);
  if(library){
   floor.zones.filter(zone=>shelfThemes[zone.id]).forEach(zone=>cell(ctx,atlas,zone.art[0],zone.art[1],zone.x,zone.y,285,285));
   // Reading furniture stays to the sides of the runner; desk lamps belong on desks.
   cell(ctx,atlas,2,0,155,670,165);cell(ctx,atlas,3,0,480,776,178);cell(ctx,atlas,3,0,1430,684,178);
   cell(ctx,atlas,2,3,452,748,48);cell(ctx,atlas,2,3,1453,654,48);cell(ctx,atlas,1,3,500,750,52);
   cell(ctx,atlas,3,3,606,752,104);cell(ctx,atlas,0,3,1100,753,130);
  }else{
   cell(ctx,atlas,0,1,175,235,205);cell(ctx,atlas,2,1,1375,225,155);cell(ctx,atlas,1,1,1490,735,175);cell(ctx,atlas,1,1,160,760,155);
   cell(ctx,atlas,3,1,825,735,300);cell(ctx,atlas,3,3,1460,470,95);cell(ctx,atlas,2,3,450,450,92);cell(ctx,atlas,2,3,825,520,92);cell(ctx,atlas,2,3,1200,450,92);
  }
 }
 if(library)drawLibraryShelfSigns(ctx,floor);
 else{const glow=ctx.createRadialGradient(825,175,10,825,175,330);glow.addColorStop(0,`rgba(255,202,104,${.14+Math.sin(time/260)*.02})`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(450,0,750,700)}
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
