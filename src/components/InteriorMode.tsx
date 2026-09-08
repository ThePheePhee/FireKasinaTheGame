import {useCallback,useEffect,useRef,useState} from 'react';
import type {InteriorFloor,InteriorMap,InteriorNpc,InteriorZone} from '../data/interiorMaps';
import {movePlayer,type Player} from '../engine/movement';
import {drawPlayer} from '../rendering/drawPlayer';
import {drawVignette} from '../rendering/drawUI';
import {playerCamera} from '../engine/camera';
import {downStairs as downPoint,upStairs as upPoint,interiorArrival,slideAlongObstacles} from '../engine/interiorNavigation';
import LoreDialog from './LoreDialog';
import LoreLinks from './LoreLinks';
import InteractionPrompt,{InteractionIcon} from './InteractionPrompt';
import {interiorEntry,nearbyInteriorZone,interactionAnchor,interactionKind} from '../engine/interiorInteraction';
import {drawInteractionMarker} from '../rendering/drawInteractionMarker';
import './InteriorMode.css';
import './InteriorHeaderFix.css';
import './SocialInteriors.css';
import {getAtlas,onPixelArtReady} from '../rendering/pixelArtAssets';
import {drawInteriorNpc,drawInteriorNpcLabel,drawSocialForeground,drawSocialInterior} from '../rendering/drawSocialInterior';

const palette={tower:['#111827','#28364b','#63718a','#d7c281'],fireworks:['#170d18','#481724','#96352e','#ffae38'],magick:['#11142b','#282954','#665b91','#c990df'],jhana:['#102126','#24464a','#64826d','#d2c981'],divine:['#252d49','#655b85','#a783a7','#f3db9a'],formless:['#03050d','#0d1228','#282a54','#8189c8'],healing:['#183229','#315c43','#70a66b','#d7d68e'],recall:['#21182a','#4b3b56','#86738e','#e2c589'],tavern:['#201710','#493322','#8a5a31','#efbd68'],library:['#171411','#3b2c22','#8b693f','#efce82']} as const;
const themeColumn={tower:0,fireworks:3,magick:2,jhana:4,divine:5,formless:5,healing:4,recall:0,tavern:3,library:0};
const atlasCell=(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number,alpha=1)=>{const w=image.naturalWidth/6,h=image.naturalHeight/4;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,column*w,row*h,w,h,x-size/2,y-size/2,size,size);ctx.restore()};
const recallCell=(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,x:number,y:number,size:number,alpha=1)=>{const w=image.naturalWidth/4,h=image.naturalHeight;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,column*w,0,w,h,x-size/2,y-size/2,size,size);ctx.restore()};
function drawAtmosphere(ctx:CanvasRenderingContext2D,theme:InteriorMap['theme'],width:number,height:number,time:number){const colors=palette[theme];ctx.save();ctx.globalAlpha=theme==='formless'?.5:.28;for(let i=0;i<32;i++){const x=(i*347+83)%width,y=(i*193+Math.sin(time/1700+i)*18+height)%height,s=2+(i%4);ctx.fillStyle=i%3?colors[3]:colors[2];ctx.beginPath();if(theme==='divine'||theme==='healing'){ctx.ellipse(x,y,s*1.8,s*.75,i*.7,0,Math.PI*2)}else if(theme==='magick'){ctx.arc(x,y,s*1.5,0,Math.PI*2);ctx.moveTo(x-s*3,y);ctx.lineTo(x+s*3,y);ctx.moveTo(x,y-s*3);ctx.lineTo(x,y+s*3);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}else if(theme==='tower'){ctx.rect(x-s,y-s,s*2,s*2)}else if(theme==='fireworks'){ctx.moveTo(x,y-s*3);ctx.lineTo(x+s,y+s);ctx.lineTo(x-s,y+s)}else if(theme==='jhana'){ctx.arc(x,y,s*2,Math.PI,Math.PI*2)}else{ctx.moveTo(x,y-s*2);ctx.lineTo(x+s,y);ctx.lineTo(x,y+s*2);ctx.lineTo(x-s,y)}ctx.fill()}ctx.restore()}

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
 floor.zones.forEach(z=>{const image=z.artAtlas==='special'?special:z.artAtlas==='legacy'?legacy:z.artAtlas==='states'?(states??getAtlas('states')):z.artAtlas==='rupa'?(rupa??getAtlas('rupa')):z.artAtlas==='luminous'?getAtlas('luminous'):z.artAtlas==='divine'?getAtlas('divine'):landmarks;if(image){const columns=z.artAtlas==='luminous'||z.artAtlas==='divine'?3:z.artAtlas==='states'||z.artAtlas==='special'||z.artAtlas==='rupa'?4:5,rows=z.artAtlas==='luminous'||z.artAtlas==='divine'||z.artAtlas==='special'?2:z.artAtlas==='states'?3:z.artAtlas==='rupa'?1:z.artAtlas==='legacy'?5:4,size=Math.min(z.w,z.h)*.78,cellW=image.naturalWidth/columns,cellH=image.naturalHeight/rows;ctx.drawImage(image,z.art[0]*cellW,z.art[1]*cellH,cellW,cellH,z.x-size/2,z.y-size/2-10,size,size)}ctx.font='bold 13px monospace';ctx.textAlign='center';const label=ctx.measureText(z.name).width+18;ctx.fillStyle='#11111abb';ctx.fillRect(z.x-label/2,z.y+z.h*.42-12,label,24);ctx.fillStyle='#fff0bd';ctx.fillText(z.name,z.x,z.y+z.h*.42+5)});
 floor.obstacles.forEach(o=>{if(recallTiles)recallCell(ctx,recallTiles,2,o.x+o.w/2,o.y+o.h/2,Math.max(o.w,o.h)*1.35);else if(tiles)atlasCell(ctx,tiles,column,2,o.x+o.w/2,o.y+o.h/2,Math.max(o.w,o.h)*1.35);else{ctx.fillStyle=colors[2];ctx.fillRect(o.x,o.y,o.w,o.h)}});
 if(floorIndex===0){if(recallTiles)recallCell(ctx,recallTiles,3,floor.spawn[0],floor.height-70,145);drawExit(ctx,floor.spawn[0],floor.height-35,colors[3])}else drawStairs(ctx,tiles,down[0],down[1],false,colors[3],map.theme);if(floorIndex<map.floors.length-1)drawStairs(ctx,tiles,up[0],up[1],true,colors[3],map.theme);
 ctx.strokeStyle=`${colors[2]}88`;ctx.lineWidth=6;ctx.strokeRect(22,22,floor.width-44,floor.height-44);ctx.strokeStyle=`${colors[3]}66`;ctx.lineWidth=2;ctx.strokeRect(31,31,floor.width-62,floor.height-62);
}
function drawStairs(ctx:CanvasRenderingContext2D,tiles:HTMLImageElement|null,x:number,y:number,up:boolean,color:string,theme:InteriorMap['theme']){if(tiles){const column=theme==='divine'?4:theme==='formless'?5:up?0:1;atlasCell(ctx,tiles,column,3,x,y,126)}else{ctx.fillStyle='#17141d';ctx.fillRect(x-48,y-48,96,96);for(let i=0;i<6;i++){ctx.fillStyle=i%2?color:'#625b62';ctx.fillRect(x-34+i*5,y-31+i*10,68-i*10,7)}}ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillStyle='#11111add';ctx.fillRect(x-61,y+49,122,20);ctx.fillStyle=color;ctx.fillText(up?'▲ NEXT FLOOR':'▼ PREVIOUS FLOOR',x,y+63)}
function drawExit(ctx:CanvasRenderingContext2D,x:number,y:number,color:string){ctx.fillStyle='#121019';ctx.fillRect(x-74,y-36,148,72);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.strokeRect(x-74,y-36,148,72);ctx.fillStyle='#fff0bd';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('MAIN MAP',x,y+5)}

interface RuntimeNpc {data:InteriorNpc;x:number;y:number;angle:number;changeAt:number}
const npcZone=(runtime:RuntimeNpc):InteriorZone=>({id:`npc-${runtime.data.id}`,name:runtime.data.name,copy:runtime.data.copy,x:runtime.x,y:runtime.y,w:90,h:90,shape:'circle',art:[0,0],references:runtime.data.references});

export default function InteriorMode({map,onExit}:{map:InteriorMap;onExit:()=>void}){
 const canvasRef=useRef<HTMLCanvasElement>(null),scene=useRef<HTMLCanvasElement|null>(null),keys=useRef(new Set<string>()),markerViewport=useRef<HTMLDivElement>(null),markerSpace=useRef<HTMLDivElement>(null),markerButton=useRef<HTMLButtonElement>(null);
 const player=useRef<Player>({x:map.floors[0].spawn[0],y:map.floors[0].spawn[1],direction:'up',moving:false,step:0});
 const activeZone=useRef<string|null>(null),transitionLock=useRef(0),npcs=useRef<RuntimeNpc[]>([]),arrival=useRef<'outside'|'below'|'above'>('outside');
 const [floorIndex,setFloorIndex]=useState(0),[dialogue,setDialogue]=useState<InteriorZone|null>(null),[notice,setNotice]=useState<InteriorZone|null>(()=>interiorEntry(map,map.floors[0])),[lastDiscovery,setLastDiscovery]=useState<InteriorZone|null>(null),[nearby,setNearby]=useState<InteriorZone|null>(null);
 const [landmarks,setLandmarks]=useState<HTMLImageElement|null>(null),[tiles,setTiles]=useState<HTMLImageElement|null>(null),[special,setSpecial]=useState<HTMLImageElement|null>(null),[legacy,setLegacy]=useState<HTMLImageElement|null>(null),[artRevision,setArtRevision]=useState(0);
 const floor=map.floors[floorIndex]??map.floors[0];
 const resize=useCallback(()=>{const c=canvasRef.current;if(!c)return;const headerHeight=c.parentElement?.querySelector('header')?.getBoundingClientRect().height??76;c.style.top=`${headerHeight}px`;c.style.height=`calc(100% - ${headerHeight}px)`;if(markerViewport.current)markerViewport.current.style.top=`${headerHeight}px`;const d=Math.min(devicePixelRatio||1,2),b=c.getBoundingClientRect();c.width=Math.round(b.width*d);c.height=Math.round(b.height*d)},[]);
 const openLore=useCallback((zone:InteriorZone)=>{keys.current.clear();setDialogue(zone);setNotice(null)},[]);
 useEffect(()=>{
  let active=true;
  const load=(file:string,setter:(image:HTMLImageElement)=>void)=>{const image=new Image();image.onload=()=>{if(active)setter(image)};image.src=`${import.meta.env.BASE_URL}assets/${file}`};
  load('interior-landmarks-v2.png',setLandmarks);load('environment-tiles-v3.png',setTiles);load('healing-jhana-landmarks.png',setSpecial);load('submaps-atlas.png',setLegacy);
  return()=>{active=false};
 },[]);
 useEffect(()=>onPixelArtReady(()=>setArtRevision(value=>value+1)),[]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const observer=new ResizeObserver(resize);observer.observe(canvas);const header=canvas.parentElement?.querySelector('header');if(header)observer.observe(header);resize();return()=>observer.disconnect()},[resize]);
 useEffect(()=>{
  const down=(event:KeyboardEvent)=>{
   if(dialogue||event.altKey||event.ctrlKey||event.metaKey||(event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))return;
   const key=event.key.toLowerCase();
   if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){event.preventDefault();keys.current.add(key.startsWith('arrow')?event.key:key)}
   if(key==='e'&&!event.repeat&&(nearby??lastDiscovery)){event.preventDefault();openLore((nearby??lastDiscovery)!)}
   if(event.key==='Escape'){event.preventDefault();onExit()}
  };
  const up=(event:KeyboardEvent)=>keys.current.delete(event.key.toLowerCase().startsWith('arrow')?event.key:event.key.toLowerCase());
  const clear=()=>keys.current.clear();
  addEventListener('keydown',down);addEventListener('keyup',up);addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  return()=>{removeEventListener('keydown',down);removeEventListener('keyup',up);removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear)};
 },[dialogue,lastDiscovery,nearby,onExit,openLore]);
 useEffect(()=>{
  const start=interiorArrival(floor,arrival.current),entry=interiorEntry(map,floor);
  player.current={x:start[0],y:start[1],direction:'up',moving:false,step:0};
  npcs.current=(floor.npcs??[]).map((data,index)=>({data,x:data.x,y:data.y,angle:index*1.7,changeAt:performance.now()+900+index*370}));
  activeZone.current=null;keys.current.clear();setNearby(null);setNotice(entry);setLastDiscovery(entry);transitionLock.current=performance.now()+850;
 },[floor,map]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(current=>current?.id===notice.id?null:current),6500);return()=>clearTimeout(timer)},[notice]);
 useEffect(()=>{
  const surface=document.createElement('canvas');surface.width=floor.width;surface.height=floor.height;
  const context=surface.getContext('2d')!;context.imageSmoothingEnabled=false;
  drawIntegratedFloor(context,map,floor,landmarks,tiles,0,floorIndex,special,legacy,null,null,false);
  scene.current=surface;
  return()=>{if(scene.current===surface)scene.current=null};
 },[artRevision,floor,floorIndex,landmarks,legacy,map,special,tiles]);
 useEffect(()=>{
  let frame=0,last=performance.now();
  const tick=(now:number)=>{
   const c=canvasRef.current;if(!c)return;
   const dt=Math.min((now-last)/1000,.04);last=now;
   if(!dialogue&&!document.hidden){const before=player.current;player.current=slideAlongObstacles(before,movePlayer(before,keys.current,dt,floor.width,floor.height),floor.obstacles)}
   for(const npc of npcs.current){
    if(now>npc.changeAt){npc.angle+=1.1+Math.random()*2.8;npc.changeAt=now+1200+Math.random()*2200}
    const speed=dialogue?0:11,tx=npc.x+Math.cos(npc.angle)*speed*dt,ty=npc.y+Math.sin(npc.angle)*speed*dt;
    const blocked=Math.hypot(tx-npc.data.x,ty-npc.data.y)>npc.data.wander||floor.obstacles.some(o=>tx+18>o.x&&tx-18<o.x+o.w&&ty+18>o.y&&ty-18<o.y+o.h);
    if(blocked){npc.angle+=Math.PI*.8;npc.changeAt=now+700}else{npc.x=tx;npc.y=ty}
   }
   const p=player.current,nearNpc=npcs.current.filter(npc=>Math.hypot(p.x-npc.x,p.y-npc.y)<185).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];
   const entered=nearNpc?npcZone(nearNpc):nearbyInteriorZone(floor.zones,p.x,p.y);
   if(!dialogue&&entered?.id!==(activeZone.current??undefined)){activeZone.current=entered?.id??null;setNearby(entered);setNotice(null);if(entered)setLastDiscovery(entered)}
   if(now>transitionLock.current&&!dialogue){
    const up=upPoint(floor),down=downPoint(floor);
    if(Math.hypot(p.x-up[0],p.y-up[1])<48&&floorIndex<map.floors.length-1){transitionLock.current=now+1000;arrival.current='below';setFloorIndex(index=>index+1)}
    else if(Math.hypot(p.x-down[0],p.y-down[1])<48&&floorIndex>0){transitionLock.current=now+1000;arrival.current='above';setFloorIndex(index=>index-1)}
    else if(floorIndex===0&&p.y>floor.height-55&&Math.abs(p.x-floor.spawn[0])<78){transitionLock.current=now+1000;onExit()}
   }
   const d=Math.min(devicePixelRatio||1,2),w=c.width/d,h=c.height/d,camera=playerCamera(p.x,p.y,w,h,floor.width,floor.height),ctx=c.getContext('2d')!;
   ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(-camera.x,-camera.y);
   if(scene.current)ctx.drawImage(scene.current,0,0);
   if(!floor.environment)drawAtmosphere(ctx,map.theme,floor.width,floor.height,now);
   for(const npc of npcs.current)drawInteriorNpc(ctx,npc.data,npc.x,npc.y,now,false);
   drawSocialForeground(ctx,floor,p.y,'behind');drawPlayer(ctx,p);drawSocialForeground(ctx,floor,p.y,'ahead');
   for(const npc of npcs.current)drawInteriorNpcLabel(ctx,npc.data,npc.x,npc.y);
   if(!dialogue){for(const zone of floor.zones)if(zone.id!==entered?.id)drawInteractionMarker(ctx,zone,floor.environment);for(const npc of npcs.current){const zone=npcZone(npc);if(zone.id!==entered?.id)drawInteractionMarker(ctx,zone,floor.environment)}}
   if(markerSpace.current)markerSpace.current.style.transform=`translate(${-camera.x}px,${-camera.y}px)`;
   if(markerButton.current&&entered){const [x,y]=interactionAnchor(entered,floor.environment);markerButton.current.style.left=`${x}px`;markerButton.current.style.top=`${y}px`}
   ctx.restore();drawVignette(ctx,w,h);frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[dialogue,floor,floorIndex,map,onExit]);
 const virtualKey=(key:string,pressed:boolean)=>pressed?keys.current.add(key):keys.current.delete(key);
 const links=dialogue?.references??(dialogue?.reference?[dialogue.reference]:[]);
 const prompt=nearby??notice??lastDiscovery,kind=prompt?interactionKind(prompt):'lore',action=kind==='talk'?'TALK':nearby&&floor.environment==='library'?'BROWSE SHELVES':nearby?'READ FIELD NOTES':'READ JOURNAL';
 return <section className={`interior-mode theme-${map.theme}`}>
  <canvas ref={canvasRef} tabIndex={0} aria-label={`${floor.name}. Move with arrow keys or WASD; press E for nearby lore.`}/>
  <div ref={markerViewport} className="world-interaction-viewport"><div ref={markerSpace} className="world-interaction-space">{nearby&&!dialogue&&<button ref={markerButton} type="button" className="world-interaction-badge" aria-label={`${action}: ${nearby.name}`} onClick={()=>openLore(nearby)}><InteractionIcon kind={kind}/><span>{kind==='talk'?'TALK':'READ'}</span><kbd>E</kbd></button>}</div></div>
  <header><button type="button" onClick={onExit}>← MAIN MAP</button><div><small>{map.name}</small><b>{floor.name}</b><span>{floor.subtitle}</span></div><em>{floorIndex+1}/{map.floors.length}</em></header>
  <div className="interior-dpad" aria-label="Touch movement controls">{(['up','left','down','right'] as const).map(direction=>{
   const key=direction==='up'?'w':direction==='left'?'a':direction==='down'?'s':'d';
   return <button type="button" key={direction} className={direction} aria-label={`Move ${direction}`} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);virtualKey(key,true)}} onPointerUp={()=>virtualKey(key,false)} onPointerCancel={()=>virtualKey(key,false)} onLostPointerCapture={()=>virtualKey(key,false)}>{direction==='up'?'▲':direction==='left'?'◀':direction==='down'?'▼':'▶'}</button>;
  })}</div>
  {prompt&&!dialogue&&<InteractionPrompt title={prompt.name} kind={kind} action={action} eyebrow={nearby?kind==='talk'?'TRAVELLER NEARBY':floor.environment==='library'?'READING SHELF':'A PLACE TO EXPLORE':notice?'NEW AREA ENTERED':'TRAVELLER’S JOURNAL'} remembered={!nearby&&!notice} onActivate={()=>openLore(prompt)}/>}
  {dialogue&&<LoreDialog title={dialogue.name} eyebrow={dialogue.id.startsWith('npc-')?'TRAVELLER SAYS':'PLACE LORE'} onClose={()=>setDialogue(null)}>
   <p className="copy">◆ {dialogue.copy}</p><LoreLinks links={links} title={floor.environment==='library'?'CHOOSE A VOLUME':'FIELD NOTES'}/>
  </LoreDialog>}
 </section>;
}
