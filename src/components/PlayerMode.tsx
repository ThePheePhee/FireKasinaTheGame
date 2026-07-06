import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {mapRegions,WORLD,type Region} from '../data/mapRegions';
import {mapProps,type MapProp} from '../data/mapProps';
import {playerCamera} from '../engine/camera';
import {movePlayer,type Player} from '../engine/movement';
import {regionContains,regionExtent} from '../engine/regionGeometry';
import {drawMap} from '../rendering/drawMap';
import {drawPlayer} from '../rendering/drawPlayer';
import {drawVignette} from '../rendering/drawUI';
import './PlayerMode.css';

interface PlayerModeProps {
 player:MutableRefObject<Player>; dialogue:boolean; discoveredRegions:MutableRefObject<Set<string>>;
 onDiscover:(region:Region)=>void; onDiscoverProp:(prop:MapProp)=>void;
}

export default function PlayerMode({player,dialogue,discoveredRegions,onDiscover,onDiscoverProp}:PlayerModeProps){
 const canvasRef=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>()),activeRegion=useRef<string|null>(null),activeProp=useRef<string|null>(null);
 const [notice,setNotice]=useState<Region|null>(null),[currentRegion,setCurrentRegion]=useState<Region|null>(null);
 const resize=useCallback(()=>{const canvas=canvasRef.current;if(!canvas)return;const d=devicePixelRatio||1,box=canvas.getBoundingClientRect();canvas.width=Math.round(box.width*d);canvas.height=Math.round(box.height*d)},[]);
 useEffect(()=>{resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[resize]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(current=>current?.id===notice.id?null:current),6000);return()=>clearTimeout(timer)},[notice]);
 useEffect(()=>{const down=(event:KeyboardEvent)=>{const key=event.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){event.preventDefault();keys.current.add(key.startsWith('arrow')?event.key:key)}if(event.key==='Escape'&&dialogue)keys.current.clear()};const up=(event:KeyboardEvent)=>keys.current.delete(event.key.toLowerCase().startsWith('arrow')?event.key:event.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[dialogue]);
 useEffect(()=>{let frame=0,last=performance.now();const tick=(now:number)=>{const canvas=canvasRef.current;if(!canvas)return;const dt=Math.min((now-last)/1000,.04);last=now;const d=devicePixelRatio||1,width=canvas.width/d,height=canvas.height/d,ctx=canvas.getContext('2d')!;if(!dialogue)player.current=movePlayer(player.current,keys.current,dt,WORLD.width,WORLD.height);const entered=mapRegions.filter(region=>regionContains(region,player.current.x,player.current.y)).sort((a,b)=>regionExtent(a)-regionExtent(b))[0]??null;if(entered?.id!==(activeRegion.current??undefined)){activeRegion.current=entered?.id??null;setCurrentRegion(entered);setNotice(null);if(entered){if(discoveredRegions.current.has(entered.id))setNotice(entered);else{discoveredRegions.current.add(entered.id);onDiscover(entered)}}}const foundProp=mapProps.find(prop=>Math.hypot(player.current.x-prop.x,player.current.y-prop.y)<Math.max(34,prop.size*.45))??null;if(foundProp?.id!==(activeProp.current??undefined)){activeProp.current=foundProp?.id??null;if(foundProp)onDiscoverProp(foundProp)}const camera=playerCamera(player.current.x,player.current.y,width,height,WORLD.width,WORLD.height);ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(-camera.x,-camera.y);const nearby=mapRegions.some(region=>Math.hypot(player.current.x-region.x,player.current.y-region.y)<regionExtent(region)+100);drawMap(ctx,nearby);drawPlayer(ctx,player.current);ctx.restore();drawVignette(ctx,width,height);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[dialogue,discoveredRegions,onDiscover,onDiscoverProp,player]);
 const virtualKey=(key:string,pressed:boolean)=>{if(pressed)keys.current.add(key);else keys.current.delete(key)};
 const openLore=(region:Region)=>{setNotice(null);keys.current.clear();onDiscover(region)};
 return <div className="player-mode"><canvas ref={canvasRef} tabIndex={0}/><div className="dpad" aria-label="Touch movement controls">{(['up','left','down','right'] as const).map(direction=>{const key=direction==='up'?'w':direction==='left'?'a':direction==='down'?'s':'d';return <button key={direction} className={direction} aria-label={`Move ${direction}`} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);virtualKey(key,true)}} onPointerUp={()=>virtualKey(key,false)} onPointerCancel={()=>virtualKey(key,false)}>{direction==='up'?'▲':direction==='left'?'◀':direction==='down'?'▼':'▶'}</button>})}</div>{notice&&!dialogue&&<button type="button" className="area-notice" aria-label={`Open lore for ${notice.name}`} onPointerUp={()=>openLore(notice)}><small>AREA REVISITED</small><b>{notice.name}</b><span>TAP FOR LORE →</span></button>}{currentRegion&&!notice&&!dialogue&&<button type="button" className="lore-journal" onClick={()=>openLore(currentRegion)}>◆ AREA LORE</button>}</div>;
}
