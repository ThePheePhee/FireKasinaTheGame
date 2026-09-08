import {useEffect,useRef,useState} from 'react';
import type {InteriorMap,InteriorZone} from '../data/interiorMaps';
import {drawIntegratedFloor} from './InteriorMode';
import {drawInteriorNpc,drawInteriorNpcLabel,drawSocialForeground} from '../rendering/drawSocialInterior';
import {onPixelArtReady} from '../rendering/pixelArtAssets';
import {useMapNavigation} from '../engine/useMapNavigation';
import {worldToScreen} from '../engine/mapViewport';
import LoreDialog from './LoreDialog';
import './SubMap.css';

export default function SubMap({map,onExit}:{map:InteriorMap;onExit:()=>void}){
 const containerRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),scene=useRef<HTMLCanvasElement|null>(null);
 const [floorIndex,setFloorIndex]=useState(0),[selected,setSelected]=useState<InteriorZone|null>(null),[artRevision,setArtRevision]=useState(0);
 const [assets,setAssets]=useState<{landmarks:HTMLImageElement|null;tiles:HTMLImageElement|null;special:HTMLImageElement|null;legacy:HTMLImageElement|null}>({landmarks:null,tiles:null,special:null,legacy:null});
 const floor=map.floors[floorIndex]??map.floors[0];
 const clickables:InteriorZone[]=[...floor.zones,...(floor.npcs??[]).map(npc=>({id:`npc-${npc.id}`,name:npc.name,copy:npc.copy,x:npc.x,y:npc.y,w:90,h:90,shape:'circle' as const,art:[0,0] as [number,number],references:npc.references}))];
 const {size,viewport,bindings,zoom,reset}=useMapNavigation(containerRef,floor,target=>setSelected(clickables.find(zone=>zone.id===target)??null));
 useEffect(()=>{setFloorIndex(0);setSelected(null)},[map]);
 useEffect(()=>{reset()},[floor.id]);
 useEffect(()=>onPixelArtReady(()=>setArtRevision(value=>value+1)),[]);
 useEffect(()=>{
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
  drawSocialForeground(ctx,floor);for(const npc of floor.npcs??[])drawInteriorNpcLabel(ctx,npc,npc.x,npc.y);
  scene.current=surface;
 },[artRevision,assets,floor,floorIndex,map]);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas||size.width<=1||!scene.current)return;
  const d=Math.min(devicePixelRatio||1,2),width=Math.round(size.width*d),height=Math.round(size.height*d);
  if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
  const ctx=canvas.getContext('2d')!;ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,size.width,size.height);
  ctx.save();ctx.scale(viewport.scale,viewport.scale);ctx.translate(-viewport.x,-viewport.y);ctx.drawImage(scene.current,0,0);ctx.restore();
 },[artRevision,assets,floor,floorIndex,map,size,viewport]);
 return <section className={`submap submap-${map.theme}`} aria-label={`${map.name} map`}>
  <div className="submap-header"><button type="button" onClick={onExit}>← MAIN MAP</button><div><small>AREA MAP</small><h1>{map.name}</h1></div><span>{floorIndex+1}/{map.floors.length}</span></div>
  <nav className="floor-tabs" aria-label="Area levels">{map.floors.map((item,index)=><button type="button" key={item.id} aria-current={index===floorIndex?'page':undefined} className={index===floorIndex?'active':''} onClick={()=>{setFloorIndex(index);setSelected(null)}}>{item.name}</button>)}</nav>
  <div ref={containerRef} className="submap-map" {...bindings}>
   <canvas ref={canvasRef} aria-hidden="true"/>
   <div className="submap-zone-layer">{clickables.map(zone=>{const point=worldToScreen(viewport,zone.x,zone.y);return <button type="button" key={zone.id} data-map-target={zone.id} aria-label={`Open ${zone.name}`} title={zone.name} style={{left:point.x,top:point.y,width:Math.max(44,zone.w*viewport.scale),height:Math.max(44,zone.h*viewport.scale)}} onClick={()=>setSelected(zone)}/>})}</div>
   <div className="map-tools" aria-label="Area map zoom controls"><button type="button" aria-label="Zoom in" onClick={()=>zoom(1.5)}>+</button><button type="button" aria-label="Zoom out" onClick={()=>zoom(1/1.5)}>−</button><button type="button" aria-label="Show whole area" onClick={reset}>⌂</button></div>
  </div>
  {selected&&<LoreDialog title={selected.name} eyebrow={selected.id.startsWith('npc-')?'TRAVELLER SAYS':'MAP LORE'} onClose={()=>setSelected(null)}>
   <p className="copy">◆ {selected.copy}</p><nav className="lore-links">{(selected.references??(selected.reference?[selected.reference]:[])).map(link=><a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</nav>
  </LoreDialog>}
  <button type="button" className="submap-exit" onClick={onExit}>← MAIN MAP</button>
 </section>;
}
