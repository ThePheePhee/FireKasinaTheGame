import {useEffect,useMemo,useRef,useState} from 'react';
import type {InteriorMap,InteriorZone} from '../data/interiorMaps';
import {drawIntegratedFloor} from '../rendering/drawInteriorFloor';
import {drawInteriorNpc,drawSocialForeground} from '../rendering/drawSocialInterior';
import {drawPlayer} from '../rendering/drawPlayer';
import {drawInteriorCaptions,interiorCaptions,layoutInteriorCaptions,showInteriorCaptionMarker} from '../rendering/drawInteriorCaptions';
import {onPixelArtReady} from '../rendering/pixelArtAssets';
import {useMapNavigation} from '../engine/useMapNavigation';
import {fitMap,worldToScreen} from '../engine/mapViewport';
import LoreDialog from './LoreDialog';
import LoreLinks from './LoreLinks';
import {InteractionIcon} from './InteractionPrompt';
import {interiorEntry,interiorLoreEntryId,interactionAnchor,interactionKind} from '../engine/interiorInteraction';
import './SubMap.css';

export interface SubMapProps {map:InteriorMap;onExit:()=>void;exitLabel?:string;initialFloorIndex?:number;position?:{x:number;y:number;floorIndex:number};onReadEntry?:(id:string)=>void}
export default function SubMap({map,onExit,exitLabel='MAIN MAP',initialFloorIndex=0,position,onReadEntry}:SubMapProps){
 const containerRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),scene=useRef<HTMLCanvasElement|null>(null),tabs=useRef<HTMLElement>(null),exitButton=useRef<HTMLButtonElement>(null);
 const [floorIndex,setFloorIndex]=useState(()=>Math.max(0,Math.min(map.floors.length-1,initialFloorIndex))),[selected,setSelected]=useState<InteriorZone|null>(null),[focusedId,setFocusedId]=useState<string|null>(null),[artRevision,setArtRevision]=useState(0);
 const [assets,setAssets]=useState<{landmarks:HTMLImageElement|null;tiles:HTMLImageElement|null;special:HTMLImageElement|null;legacy:HTMLImageElement|null}>({landmarks:null,tiles:null,special:null,legacy:null});
 const floor=map.floors[floorIndex]??map.floors[0];
 const clickables:InteriorZone[]=[...floor.zones,...(floor.npcs??[]).map(npc=>({id:`npc-${npc.id}`,name:npc.name,copy:npc.copy,x:npc.x,y:npc.y,w:90,h:90,shape:'circle' as const,art:[0,0] as [number,number],references:npc.references}))];
 const openLore=(zone:InteriorZone)=>{setSelected(zone);setFocusedId(zone.id);onReadEntry?.(interiorLoreEntryId(map,floor,zone))};
 const {size,viewport,bindings,zoom,reset,focus}=useMapNavigation(containerRef,floor,target=>{const zone=clickables.find(zone=>zone.id===target);if(zone)openLore(zone)},!selected);
 const locate=(zone:InteriorZone)=>{setFocusedId(zone.id);focus({x:zone.x,y:zone.y+zone.h*.12,width:Math.max(260,zone.w),height:Math.max(240,zone.h+70)})};
 const currentPosition=position?.floorIndex===floorIndex?position:null,wholeFloor=viewport.scale<=fitMap(size,floor).scale*1.05;
 const captions=useMemo(()=>layoutInteriorCaptions(interiorCaptions(map,floor,floorIndex),viewport,size,[{x:size.width-65,y:size.height-118,width:65,height:118}],floor),[map,floor,floorIndex,viewport,size]);
 useEffect(()=>{const before=document.activeElement instanceof HTMLElement?document.activeElement:null;exitButton.current?.focus({preventScroll:true});return()=>{if(before?.isConnected)before.focus({preventScroll:true})}},[]);
 useEffect(()=>{setFloorIndex(Math.max(0,Math.min(map.floors.length-1,initialFloorIndex)));setSelected(null);setFocusedId(null)},[map,initialFloorIndex]);
 useEffect(()=>{reset();setFocusedId(null)},[floor.id]);
 useEffect(()=>{tabs.current?.querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest',inline:'nearest'})},[floor.id,size.width]);
 useEffect(()=>onPixelArtReady(()=>setArtRevision(value=>value+1)),[]);
 useEffect(()=>{
  if(map.floors.every(floor=>floor.environment))return;
  let active=true;
  const load=(file:string,key:keyof typeof assets)=>{const image=new Image();image.onload=()=>{if(active)setAssets(current=>({...current,[key]:image}))};image.src=`${import.meta.env.BASE_URL}assets/${file}`};
  load('interior-landmarks-v2.png','landmarks');load('environment-tiles-v3.png','tiles');load('healing-jhana-landmarks.png','special');load('submaps-atlas.png','legacy');
  return()=>{active=false};
 },[]);
 useEffect(()=>{const down=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!selected){event.preventDefault();onExit()}};window.addEventListener('keydown',down);return()=>window.removeEventListener('keydown',down)},[onExit,selected]);
 useEffect(()=>{
  const surface=document.createElement('canvas');surface.width=floor.width;surface.height=floor.height;
  const ctx=surface.getContext('2d')!;ctx.imageSmoothingEnabled=false;const now=performance.now();
  drawIntegratedFloor(ctx,map,floor,assets.landmarks,assets.tiles,now,floorIndex,assets.special,assets.legacy,null,null);
  for(const npc of floor.npcs??[])drawInteriorNpc(ctx,npc,npc.x,npc.y,now,false);
  drawSocialForeground(ctx,floor);
  scene.current=surface;
 },[artRevision,assets,floor,floorIndex,map]);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas||size.width<=1||!scene.current)return;
  const d=Math.min(devicePixelRatio||1,2),width=Math.round(size.width*d),height=Math.round(size.height*d);
  if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
  const ctx=canvas.getContext('2d')!;ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,size.width,size.height);
  ctx.save();ctx.scale(viewport.scale,viewport.scale);ctx.translate(-viewport.x,-viewport.y);ctx.drawImage(scene.current,0,0);if(currentPosition)drawPlayer(ctx,{...currentPosition,direction:'down',moving:false,step:0});ctx.restore();
  drawInteriorCaptions(ctx,captions);
 },[artRevision,assets,captions,currentPosition,floor,floorIndex,map,size,viewport]);
 return <section className={`submap submap-${map.theme}`} aria-label={`${map.name} map`}>
  <div className="submap-header" inert={!!selected}><button ref={exitButton} type="button" onClick={onExit}>← {exitLabel}</button><div><small>AREA ATLAS</small><h1>{map.name}</h1></div><span>{floorIndex+1}/{map.floors.length}</span></div>
  <nav ref={tabs} className="floor-tabs" aria-label="Area levels" inert={!!selected}>{map.floors.map((item,index)=><button type="button" key={item.id} aria-current={index===floorIndex?'page':undefined} className={index===floorIndex?'active':''} onClick={()=>{setFloorIndex(index);setSelected(null)}}><b>{index+1}</b>{item.name}</button>)}</nav>
  <div className="submap-content" inert={!!selected}><div className="submap-map-column">
  <div className="area-view-controls"><span>{wholeFloor?'WHOLE FLOOR':'DETAIL VIEW'}{currentPosition?' · YOU ARE HERE':''}</span><button type="button" onClick={()=>{reset();setFocusedId(null)}} aria-pressed={wholeFloor}>Show whole floor</button></div>
  <div ref={containerRef} className="submap-map" {...bindings}>
   <canvas ref={canvasRef} aria-hidden="true"/>
   <div className="submap-zone-layer">{clickables.map(zone=>{const point=worldToScreen(viewport,zone.x,zone.y),anchor=interactionAnchor(zone,floor.environment);return <button type="button" key={zone.id} data-map-target={zone.id} aria-label={`Open ${zone.name}`} title={zone.name} className={focusedId===zone.id?'located':undefined} style={{left:point.x,top:point.y,width:Math.max(44,zone.w*viewport.scale),height:Math.max(44,zone.h*viewport.scale)}} onClick={()=>openLore(zone)}>{showInteriorCaptionMarker(zone.id,worldToScreen(viewport,...anchor),captions)&&<span className="submap-lore-mark" style={{left:`calc(50% + ${(anchor[0]-zone.x)*viewport.scale}px)`,top:`calc(50% + ${(anchor[1]-zone.y)*viewport.scale}px)`}}><InteractionIcon kind={interactionKind(zone)}/></span>}</button>})}</div>
   <div className="submap-caption-layer">{captions.filter(label=>label.caption.kind==='place'||label.caption.kind==='traveller').map(label=><button type="button" key={label.caption.id} data-map-target={label.caption.id} aria-label={`Read ${label.caption.name}`} style={{left:label.x,top:label.y,width:label.width,height:label.height}} onClick={()=>{const zone=clickables.find(zone=>zone.id===label.caption.id);if(zone)openLore(zone)}}/>)}</div>
   <div className="map-tools" aria-label="Area map zoom controls"><button type="button" aria-label="Zoom in" onClick={()=>zoom(1.5)}>+</button><button type="button" aria-label="Zoom out" onClick={()=>zoom(1/1.5)}>−</button></div>
  </div></div>
  <aside className="area-directory" aria-label="Places on this floor">
   <header><div><small>ON THIS FLOOR</small><h2>{clickables.length} places to explore</h2></div><button type="button" onClick={()=>openLore(interiorEntry(map,floor))}>Floor notes</button></header>
   <p>Locate a place to see it close up. Read opens its field notes.</p>
   <ol>{clickables.map((zone,index)=><li key={zone.id} className={focusedId===zone.id?'located':''}>
    <button type="button" className="area-locate" aria-label={`Locate ${zone.name}`} aria-pressed={focusedId===zone.id} onClick={()=>locate(zone)}><b aria-hidden="true">{String(index+1).padStart(2,'0')}</b><span>{zone.name}</span><i aria-hidden="true">⌖</i></button>
    <button type="button" className="area-read" aria-label={`Read notes: ${zone.name}`} onClick={()=>openLore(zone)}>{zone.id.startsWith('npc-')?'Talk':'Read'}</button>
   </li>)}</ol>
   <footer><span>{wholeFloor?'Tap the map, or choose a place above.':'Drag to look around · Pinch or use + / −'}</span>{currentPosition&&<button type="button" onClick={()=>focus({x:currentPosition.x,y:currentPosition.y,width:320,height:280})}>Locate your wizard</button>}</footer>
  </aside></div>
  {selected&&<LoreDialog title={selected.name} eyebrow={selected.id.startsWith('npc-')?'TRAVELLER SAYS':'MAP LORE'} onClose={()=>setSelected(null)}>
   <p className="copy">◆ {selected.copy}</p><LoreLinks links={selected.references??(selected.reference?[selected.reference]:[])} title={floor.environment==='library'?'CHOOSE A VOLUME':'FIELD NOTES'}/>
  </LoreDialog>}
 </section>;
}
