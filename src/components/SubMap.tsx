import {useEffect,useRef,useState} from 'react';
import type {InteriorMap,InteriorZone} from '../data/interiorMaps';
import {drawIntegratedFloor} from './InteriorMode';
import './SubMap.css';

interface Layout {width:number;height:number;scale:number;left:number;top:number}
export default function SubMap({map,onExit}:{map:InteriorMap;onExit:()=>void}){
 const containerRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null);
 const [floorIndex,setFloorIndex]=useState(0),[selected,setSelected]=useState<InteriorZone|null>(null),[layout,setLayout]=useState<Layout>({width:1,height:1,scale:1,left:0,top:0}),[assets,setAssets]=useState<{landmarks:HTMLImageElement|null;tiles:HTMLImageElement|null;special:HTMLImageElement|null;legacy:HTMLImageElement|null}>({landmarks:null,tiles:null,special:null,legacy:null});
 const floor=map.floors[floorIndex];
 useEffect(()=>{setFloorIndex(0);setSelected(null)},[map]);
 useEffect(()=>{const load=(file:string,key:keyof typeof assets)=>{const image=new Image();image.onload=()=>setAssets(current=>({...current,[key]:image}));image.src=`${import.meta.env.BASE_URL}assets/${file}`};load('interior-landmarks-v2.png','landmarks');load('environment-tiles-v3.png','tiles');load('healing-jhana-landmarks.png','special');load('submaps-atlas.png','legacy')},[]);
 useEffect(()=>{const container=containerRef.current;if(!container)return;const observer=new ResizeObserver(([entry])=>{const width=entry.contentRect.width,height=entry.contentRect.height,scale=Math.min((width-30)/floor.width,(height-30)/floor.height),left=(width-floor.width*scale)/2,top=(height-floor.height*scale)/2;setLayout({width,height,scale,left,top})});observer.observe(container);return()=>observer.disconnect()},[floor]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas||layout.width<=1)return;const d=devicePixelRatio||1;canvas.width=Math.round(layout.width*d);canvas.height=Math.round(layout.height*d);const ctx=canvas.getContext('2d')!;ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,layout.width,layout.height);ctx.save();ctx.translate(layout.left,layout.top);ctx.scale(layout.scale,layout.scale);drawIntegratedFloor(ctx,map,floor,assets.landmarks,assets.tiles,performance.now(),floorIndex,assets.special,assets.legacy);ctx.restore()},[assets,floor,floorIndex,layout,map]);
 return <section className={`submap submap-${map.theme}`} aria-label={`${map.name} map`}>
  <div className="submap-header"><button type="button" onClick={onExit}>← MAIN MAP</button><div><small>AREA MAP</small><h1>{map.name}</h1></div><span>{floorIndex+1}/{map.floors.length}</span></div>
  <nav className="floor-tabs" aria-label="Area levels">{map.floors.map((item,index)=><button type="button" key={item.id} className={index===floorIndex?'active':''} onClick={()=>{setFloorIndex(index);setSelected(null)}}>{item.name}</button>)}</nav>
  <div ref={containerRef} className="submap-map"><canvas ref={canvasRef}/><div className="submap-zone-layer">{floor.zones.map(zone=><button type="button" key={zone.id} aria-label={`Open ${zone.name}`} title={zone.name} className={selected?.id===zone.id?'active':''} style={{left:layout.left+zone.x*layout.scale,top:layout.top+zone.y*layout.scale,width:Math.max(42,zone.w*layout.scale),height:Math.max(42,zone.h*layout.scale)}} onClick={()=>setSelected(zone)}/>)}</div></div>
  {selected&&<aside className="submap-lore" role="dialog" aria-label={selected.name}><button type="button" onClick={()=>setSelected(null)} aria-label="Close lore">×</button><p>MAP LORE</p><h2>{selected.name}</h2><div/><span>◆ {selected.copy}</span></aside>}
  <button type="button" className="submap-exit" onClick={onExit}>← MAIN MAP</button>
 </section>
}
