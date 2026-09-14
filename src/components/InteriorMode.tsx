import {useCallback,useEffect,useRef,useState} from 'react';
import type {InteriorMap,InteriorNpc,InteriorZone} from '../data/interiorMaps';
import {movePlayer,type Player} from '../engine/movement';
import {createMovementInput} from '../engine/movementInput';
import {drawPlayer} from '../rendering/drawPlayer';
import {drawVignette} from '../rendering/drawUI';
import {playerCamera} from '../engine/camera';
import {downStairs as downPoint,upStairs as upPoint,interiorArrival,slideAlongObstacles} from '../engine/interiorNavigation';
import LoreDialog from './LoreDialog';
import LoreLinks from './LoreLinks';
import SubMap from './SubMap';
import InteractionPrompt,{InteractionIcon} from './InteractionPrompt';
import {interiorEntry,interiorLoreEntryId,nearbyInteriorZone,interactionAnchor,interactionKind} from '../engine/interiorInteraction';
import {drawInteractionMarker} from '../rendering/drawInteractionMarker';
import './InteriorMode.css';
import './InteriorHeaderFix.css';
import './SocialInteriors.css';
import {onPixelArtReady} from '../rendering/pixelArtAssets';
import {drawInteriorNpc,drawSocialForeground} from '../rendering/drawSocialInterior';
import {drawIntegratedFloor,drawAtmosphere} from '../rendering/drawInteriorFloor';
import {drawInteriorCaptions,interiorCaptions,layoutInteriorCaptions} from '../rendering/drawInteriorCaptions';


interface RuntimeNpc {data:InteriorNpc;x:number;y:number;angle:number;changeAt:number}
const npcZone=(runtime:RuntimeNpc):InteriorZone=>({id:`npc-${runtime.data.id}`,name:runtime.data.name,copy:runtime.data.copy,x:runtime.x,y:runtime.y,w:90,h:90,shape:'circle',art:[0,0],references:runtime.data.references});

export default function InteriorMode({map,onExit,onReadEntry}:{map:InteriorMap;onExit:()=>void;onReadEntry?:(id:string)=>void}){
 const [movementInput]=useState(createMovementInput);
 const canvasRef=useRef<HTMLCanvasElement>(null),scene=useRef<HTMLCanvasElement|null>(null),keys=useRef(movementInput.held),markerViewport=useRef<HTMLDivElement>(null),markerSpace=useRef<HTMLDivElement>(null),markerButton=useRef<HTMLButtonElement>(null);
 const player=useRef<Player>({x:map.floors[0].spawn[0],y:map.floors[0].spawn[1],direction:'up',moving:false,step:0});
 const activeZone=useRef<string|null>(null),transitionLock=useRef(0),npcs=useRef<RuntimeNpc[]>([]),arrival=useRef<'outside'|'below'|'above'>('outside');
 const [floorIndex,setFloorIndex]=useState(0),[dialogue,setDialogue]=useState<InteriorZone|null>(null),[notice,setNotice]=useState<InteriorZone|null>(()=>interiorEntry(map,map.floors[0])),[lastDiscovery,setLastDiscovery]=useState<InteriorZone|null>(null),[nearby,setNearby]=useState<InteriorZone|null>(null);
 const [areaMapOpen,setAreaMapOpen]=useState(false),[mapPosition,setMapPosition]=useState<{x:number;y:number;floorIndex:number}|undefined>();
 const [paused,setPaused]=useState(false),inputBlocked=useRef(false);
 inputBlocked.current=paused||areaMapOpen||!!dialogue;
 const [landmarks,setLandmarks]=useState<HTMLImageElement|null>(null),[tiles,setTiles]=useState<HTMLImageElement|null>(null),[special,setSpecial]=useState<HTMLImageElement|null>(null),[legacy,setLegacy]=useState<HTMLImageElement|null>(null),[artRevision,setArtRevision]=useState(0);
 const floor=map.floors[floorIndex]??map.floors[0];
 const resize=useCallback(()=>{const c=canvasRef.current;if(!c)return;const headerHeight=c.parentElement?.querySelector('header')?.getBoundingClientRect().height??76;c.style.top=`${headerHeight}px`;c.style.height=`calc(100% - ${headerHeight}px)`;if(markerViewport.current)markerViewport.current.style.top=`${headerHeight}px`;const d=Math.min(devicePixelRatio||1,2),b=c.getBoundingClientRect();c.width=Math.round(b.width*d);c.height=Math.round(b.height*d)},[]);
 const openLore=useCallback((zone:InteriorZone)=>{inputBlocked.current=true;movementInput.clear();setDialogue(zone);setNotice(null);onReadEntry?.(interiorLoreEntryId(map,floor,zone))},[map,floor,onReadEntry]);
 const openAreaMap=useCallback(()=>{inputBlocked.current=true;movementInput.clear();setPaused(false);setMapPosition({x:player.current.x,y:player.current.y,floorIndex});setAreaMapOpen(true)},[floorIndex]);
 const closeAreaMap=useCallback(()=>{movementInput.clear();transitionLock.current=performance.now()+350;setAreaMapOpen(false);canvasRef.current?.focus()},[]);
 const pauseInterior=useCallback(()=>{inputBlocked.current=true;movementInput.clear();setPaused(true)},[]);
 const resumeInterior=useCallback(()=>{movementInput.clear();transitionLock.current=performance.now()+350;setPaused(false);canvasRef.current?.focus()},[]);
 useEffect(()=>{if(!inputBlocked.current)canvasRef.current?.focus({preventScroll:true})},[paused,areaMapOpen,dialogue]);
 useEffect(()=>{
  if(map.floors.every(floor=>floor.environment))return;
  let active=true;
  const load=(file:string,setter:(image:HTMLImageElement)=>void)=>{const image=new Image();image.onload=()=>{if(active)setter(image)};image.src=`${import.meta.env.BASE_URL}assets/${file}`};
  load('interior-landmarks-v2.png',setLandmarks);load('environment-tiles-v3.png',setTiles);load('healing-jhana-landmarks.png',setSpecial);load('submaps-atlas.png',setLegacy);
  return()=>{active=false};
 },[]);
 useEffect(()=>onPixelArtReady(()=>setArtRevision(value=>value+1)),[]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const observer=new ResizeObserver(resize);observer.observe(canvas);const header=canvas.parentElement?.querySelector('header');if(header)observer.observe(header);resize();return()=>observer.disconnect()},[resize]);
 useEffect(()=>{
  const down=(event:KeyboardEvent)=>{
   if(inputBlocked.current||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||(event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))return;
   const key=event.key.toLowerCase();
   if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){event.preventDefault();keys.current.add(key.startsWith('arrow')?event.key:key)}
   if(key==='e'&&!event.repeat&&(nearby??lastDiscovery)){event.preventDefault();openLore((nearby??lastDiscovery)!)}
   if(key==='m'&&!event.repeat){event.preventDefault();openAreaMap()}
   if(event.key==='Escape'){event.preventDefault();pauseInterior()}
  };
  const up=(event:KeyboardEvent)=>keys.current.delete(event.key.toLowerCase().startsWith('arrow')?event.key:event.key.toLowerCase());
  const clear=()=>movementInput.clear();
  addEventListener('keydown',down);addEventListener('keyup',up);addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  return()=>{removeEventListener('keydown',down);removeEventListener('keyup',up);removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear)};
 },[areaMapOpen,dialogue,lastDiscovery,nearby,onExit,openAreaMap,openLore,pauseInterior]);
 useEffect(()=>{
  const pause=()=>{movementInput.clear();if(!dialogue&&!areaMapOpen)pauseInterior()};
  const hidden=()=>{if(document.hidden)pause()};
  window.addEventListener('blur',pause);document.addEventListener('visibilitychange',hidden);
  return()=>{window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',hidden)};
 },[areaMapOpen,dialogue,pauseInterior]);
 useEffect(()=>{
  const start=interiorArrival(floor,arrival.current),entry=interiorEntry(map,floor);
  player.current={x:start[0],y:start[1],direction:'up',moving:false,step:0};
  npcs.current=(floor.npcs??[]).map((data,index)=>({data,x:data.x,y:data.y,angle:index*1.7,changeAt:performance.now()+900+index*370}));
  activeZone.current=null;movementInput.clear();setNearby(null);setNotice(entry);setLastDiscovery(entry);transitionLock.current=performance.now()+850;
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
  if(areaMapOpen||paused||dialogue)return;
  let frame=0,last=performance.now(),captionKey='';
  let captions:ReturnType<typeof layoutInteriorCaptions>=[];
  const staticCaptions=interiorCaptions(map,floor,floorIndex,[]);
  const tick=(now:number)=>{
   const c=canvasRef.current;if(!c)return;
   if(inputBlocked.current){frame=requestAnimationFrame(tick);return}
   const dt=Math.min((now-last)/1000,.04);last=now;
   if(!dialogue&&!document.hidden){const before=player.current,movement=movementInput.frame(dt);player.current=slideAlongObstacles(before,movePlayer(before,movement.keys,movement.dt,floor.width,floor.height),floor.obstacles)}
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
   const captionView={x:Math.round(camera.x),y:Math.round(camera.y),scale:1};
   const nextCaptionKey=[captionView.x,captionView.y,w,h,entered?.id??'',...npcs.current.flatMap(npc=>[Math.round(npc.x),Math.round(npc.y)])].join('/');
   if(nextCaptionKey!==captionKey){
    captionKey=nextCaptionKey;
    const captionExclusions=[{x:0,y:h-170,width:176,height:170}];
    if(!dialogue){const promptWidth=w<700?Math.max(0,w-166):Math.min(370,w-190);captionExclusions.push({x:w-promptWidth-32,y:h-220,width:promptWidth+32,height:220})}
    if(entered&&!dialogue){const [x,y]=interactionAnchor(entered,floor.environment);captionExclusions.push({x:x-captionView.x-75,y:y-captionView.y-30,width:150,height:66})}
    captions=layoutInteriorCaptions(npcs.current.length?interiorCaptions(map,floor,floorIndex,npcs.current):staticCaptions,captionView,{width:w,height:h},captionExclusions,floor);
   }
   ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(-camera.x,-camera.y);
   if(scene.current)ctx.drawImage(scene.current,0,0);
   if(!floor.environment)drawAtmosphere(ctx,map.theme,floor.width,floor.height,now);
   for(const npc of npcs.current)drawInteriorNpc(ctx,npc.data,npc.x,npc.y,now,false);
   drawSocialForeground(ctx,floor,p.y,'behind');drawPlayer(ctx,p);drawSocialForeground(ctx,floor,p.y,'ahead');
   if(!dialogue){for(const zone of floor.zones)if(zone.id!==entered?.id&&!captions.some(label=>label.caption.id===zone.id))drawInteractionMarker(ctx,zone,floor.environment);for(const npc of npcs.current){const zone=npcZone(npc);if(zone.id!==entered?.id&&!captions.some(label=>label.caption.id===zone.id))drawInteractionMarker(ctx,zone,floor.environment)}}
   if(markerSpace.current)markerSpace.current.style.transform=`translate(${-camera.x}px,${-camera.y}px)`;
   if(markerButton.current&&entered){const [x,y]=interactionAnchor(entered,floor.environment);markerButton.current.style.left=`${x}px`;markerButton.current.style.top=`${y}px`}
   ctx.restore();drawVignette(ctx,w,h);
   drawInteriorCaptions(ctx,captions);
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[areaMapOpen,dialogue,floor,floorIndex,map,onExit,paused]);
 const virtualKey=(key:string,pressed:boolean)=>movementInput.setVirtual(key,pressed&&!inputBlocked.current&&!document.hidden);
 const links=dialogue?.references??(dialogue?.reference?[dialogue.reference]:[]);
 const prompt=nearby??notice??lastDiscovery,kind=prompt?interactionKind(prompt):'lore',action=kind==='talk'?'TALK':nearby&&floor.environment==='library'?'BROWSE SHELVES':'READ FIELD NOTES';
 return <section className={`interior-mode theme-${map.theme}`}>
  <canvas ref={canvasRef} tabIndex={inputBlocked.current?-1:0} aria-hidden={inputBlocked.current||undefined} aria-label={`${floor.name}. Move with arrow keys or WASD; press E for nearby lore, M for the area map.`}/>
  <div ref={markerViewport} className="world-interaction-viewport" inert={inputBlocked.current}><div ref={markerSpace} className="world-interaction-space">{nearby&&!inputBlocked.current&&<button ref={markerButton} type="button" className="world-interaction-badge" aria-label={`${action}: ${nearby.name}`} onClick={()=>openLore(nearby)}><InteractionIcon kind={kind}/><span>{kind==='talk'?'TALK':'READ'}</span><kbd>E</kbd></button>}</div></div>
  <header inert={paused||areaMapOpen||!!dialogue}><div className="interior-header-actions"><button type="button" onClick={onExit}>← Main map</button><button type="button" onClick={openAreaMap}>Area map <kbd>M</kbd></button></div><div className="interior-floor-title"><small>{map.name}</small><b>{floor.name}</b><span>{floor.subtitle}</span></div><button type="button" className="interior-pause-button" aria-label={`Pause. Floor ${floorIndex+1} of ${map.floors.length}`} onClick={pauseInterior}>Ⅱ<small>{floorIndex+1}/{map.floors.length}</small></button></header>
  <div className="interior-dpad" inert={paused||areaMapOpen||!!dialogue} aria-label="Touch movement controls">{(['up','left','down','right'] as const).map(direction=>{
   const key=direction==='up'?'w':direction==='left'?'a':direction==='down'?'s':'d';
   return <button type="button" key={direction} className={direction} aria-label={`Move ${direction}`} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);virtualKey(key,true)}} onPointerUp={()=>virtualKey(key,false)} onPointerCancel={()=>virtualKey(key,false)} onLostPointerCapture={()=>virtualKey(key,false)} onBlur={()=>virtualKey(key,false)} onKeyDown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();virtualKey(key,true)}}} onKeyUp={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();virtualKey(key,false)}}} onClick={event=>{if(event.detail===0&&!inputBlocked.current&&!document.hidden)movementInput.nudge(key)}}>{direction==='up'?'▲':direction==='left'?'◀':direction==='down'?'▼':'▶'}</button>;
  })}</div>
  {prompt&&!dialogue&&!areaMapOpen&&!paused&&<InteractionPrompt title={prompt.name} kind={kind} action={action} eyebrow={nearby?kind==='talk'?'TRAVELLER NEARBY':floor.environment==='library'?'READING SHELF':'A PLACE TO EXPLORE':notice?'NEW AREA ENTERED':'LAST DISCOVERY'} remembered={!nearby&&!notice} onActivate={()=>openLore(prompt)}/>}
  {dialogue&&<LoreDialog title={dialogue.name} eyebrow={dialogue.id.startsWith('npc-')?'TRAVELLER SAYS':'PLACE LORE'} onClose={()=>setDialogue(null)}>
   <p className="copy">◆ {dialogue.copy}</p><LoreLinks links={links} title={floor.environment==='library'?'CHOOSE A VOLUME':'FIELD NOTES'}/>
  </LoreDialog>}
  {areaMapOpen&&<SubMap map={map} initialFloorIndex={floorIndex} position={mapPosition} exitLabel="BACK TO WALKING" onExit={closeAreaMap} onReadEntry={onReadEntry}/>}
  {paused&&!areaMapOpen&&<LoreDialog title="REST A MOMENT" eyebrow="AREA EXPLORATION PAUSED" onClose={resumeInterior}>
   <p className="copy">Your wizard stays here while you take a breath. The floor, its stairs, and its company can wait.</p>
   <div className="interior-pause-actions"><button type="button" onClick={resumeInterior}>CONTINUE WALKING</button><button type="button" onClick={openAreaMap}>CONSULT THE AREA MAP</button><button type="button" onClick={onExit}>RETURN TO MAIN MAP</button></div>
  </LoreDialog>}
 </section>;
}
