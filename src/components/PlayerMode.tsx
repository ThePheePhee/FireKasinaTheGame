import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {mapRegions,WORLD,type Region} from '../data/mapRegions';
import {mapProps,type MapProp} from '../data/mapProps';
import {playerCamera} from '../engine/camera';
import {movePlayer,type Player} from '../engine/movement';
import {regionContains,regionExtent} from '../engine/regionGeometry';
import {clampMeter,FAIRY_ENTRY_CLARITY,FAIRY_ENTRY_CONCENTRATION,MIST_ENTRY_CONCENTRATION,type DiscoveryPoint,type GameStats} from '../game/gameState';
import {drawFogOfWar,drawMistVeil} from '../rendering/drawFogOfWar';
import {drawMap} from '../rendering/drawMap';
import {drawPlayer} from '../rendering/drawPlayer';
import {drawVignette} from '../rendering/drawUI';
import './PlayerMode.css';
import type {DynamicWorld} from '../game/dynamicWorld';
import {drawDynamicScreen} from '../rendering/drawDynamicScreen';

export interface GameRules {
 stats:GameStats;discovery:MutableRefObject<DiscoveryPoint[]>;
 onStatsChange:(stats:GameStats)=>void;onPractice:()=>void;world?:DynamicWorld;onRegionEnter?:(regionId:string)=>void;onRegionReveal?:(regionId:string)=>void;
}
interface PlayerModeProps {
 player:MutableRefObject<Player>;dialogue:boolean;discoveredRegions:MutableRefObject<Set<string>>;
 onDiscover:(region:Region)=>void;onDiscoverProp:(prop:MapProp)=>void;game?:GameRules;
}

const mist=mapRegions.find(region=>region.id==='mist')!;
const safeIds=new Set(['house','garden','red-dot','library','fortification-tavern']);
const confusionRates:Record<string,number>={booboo:2.8,trauma:2.2,chasm:3.2,'counterfeit-crags':1.7,'credulous-circuit':2.1,inn:.9,mist:.7};
const isMistCountry=(region:Region|null,x:number,y:number)=>regionContains(mist,x,y)&&!safeIds.has(region?.id??'');

export default function PlayerMode({player,dialogue,discoveredRegions,onDiscover,onDiscoverProp,game}:PlayerModeProps){
 const canvasRef=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>()),activeRegion=useRef<string|null>(null),activeProp=useRef<string|null>(null),gameRef=useRef(game),statsRef=useRef(game?.stats),nextWarp=useRef(performance.now()+12000),lastPublish=useRef(0),revealedRegions=useRef(new Set(safeIds));
 const [notice,setNotice]=useState<Region|null>(null),[currentRegion,setCurrentRegion]=useState<Region|null>(null),[warning,setWarning]=useState<string|null>(null);
 gameRef.current=game;if(game&&!statsRef.current)statsRef.current=game.stats;
 const world=game?.world,visibleRegions=world?.regions??mapRegions,visibleRoutes=world?.routes;
 useEffect(()=>{if(game)statsRef.current={...game.stats}},[game?.stats]);
 useEffect(()=>{if(!world)return;const current=world.regions.find(region=>region.id===world.currentRegionId);if(current){if(activeRegion.current===null)activeRegion.current=current.id;setCurrentRegion(current);setWarning(`THE WORLD REFORMS · ${world.reason.toUpperCase()}`)}},[world?.signature]);
 const resize=useCallback(()=>{const canvas=canvasRef.current;if(!canvas)return;const d=devicePixelRatio||1,box=canvas.getBoundingClientRect();canvas.width=Math.round(box.width*d);canvas.height=Math.round(box.height*d)},[]);
 useEffect(()=>{resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[resize]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(current=>current?.id===notice.id?null:current),6000);return()=>clearTimeout(timer)},[notice]);
 useEffect(()=>{if(!warning)return;const timer=window.setTimeout(()=>setWarning(null),4200);return()=>clearTimeout(timer)},[warning]);
 useEffect(()=>{const down=(event:KeyboardEvent)=>{const key=event.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){event.preventDefault();keys.current.add(key.startsWith('arrow')?event.key:key)}if(event.key==='Escape'&&dialogue)keys.current.clear()};const up=(event:KeyboardEvent)=>keys.current.delete(event.key.toLowerCase().startsWith('arrow')?event.key:event.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[dialogue]);
 useEffect(()=>{let frame=0,last=performance.now();const tick=(now:number)=>{
  const canvas=canvasRef.current;if(!canvas)return;const dt=Math.min((now-last)/1000,.04);last=now;const d=devicePixelRatio||1,width=canvas.width/d,height=canvas.height/d,ctx=canvas.getContext('2d')!,rules=gameRef.current;
  const regions=rules?.world?.regions??mapRegions;
  if(!dialogue){const before=player.current;let next=movePlayer(before,keys.current,dt,WORLD.width,WORLD.height);let nextRegion=regions.filter(region=>region.id!=='fairy-playground'&&regionContains(region,next.x,next.y)).sort((a,b)=>regionExtent(a)-regionExtent(b))[0]??null;const beforeRegion=regions.filter(region=>region.id!=='fairy-playground'&&regionContains(region,before.x,before.y)).sort((a,b)=>regionExtent(a)-regionExtent(b))[0]??null,wasInMist=isMistCountry(beforeRegion,before.x,before.y),enteringMist=isMistCountry(nextRegion,next.x,next.y);
   if(rules&&enteringMist&&!wasInMist&&(statsRef.current?.concentration??0)<MIST_ENTRY_CONCENTRATION){next={...before,moving:false};nextRegion=regions.filter(region=>regionContains(region,next.x,next.y)).sort((a,b)=>regionExtent(a)-regionExtent(b))[0]??null;setWarning(`THE MISTS TURN YOU BACK · ${MIST_ENTRY_CONCENTRATION} CONCENTRATION REQUIRED`)}
   else if(rules&&wasInMist&&!enteringMist&&!safeIds.has(nextRegion?.id??'')&&((statsRef.current?.concentration??0)<FAIRY_ENTRY_CONCENTRATION||(statsRef.current?.clarity??0)<FAIRY_ENTRY_CLARITY)){next={...before,moving:false};nextRegion=regions.filter(region=>regionContains(region,next.x,next.y)).sort((a,b)=>regionExtent(a)-regionExtent(b))[0]??null;setWarning(`THE FAIRY PLAYGROUND REMAINS VEILED · ${FAIRY_ENTRY_CONCENTRATION} CONCENTRATION + ${FAIRY_ENTRY_CLARITY} CLARITY`)}
   else if(rules&&enteringMist&&statsRef.current){const concentration=statsRef.current.concentration,pull=Math.max(0,Math.min(1,(MIST_ENTRY_CONCENTRATION-concentration)/25)),moved=Math.hypot(next.x-before.x,next.y-before.y),range=mapRegions.find(region=>region.id==='red-dot')!;if(moved&&pull>0){const homeX=range.x-before.x,homeY=range.y-before.y,homeDistance=Math.hypot(homeX,homeY)||1,speed=190*dt;next.x=before.x+(next.x-before.x)*(1-pull)+homeX/homeDistance*speed*pull;next.y=before.y+(next.y-before.y)*(1-pull)+homeY/homeDistance*speed*pull}const wobble=(statsRef.current.confusion/100)*38*dt;next.x=Math.max(12,Math.min(WORLD.width-12,next.x+(Math.random()-.5)*wobble));next.y=Math.max(12,Math.min(WORLD.height-12,next.y+(Math.random()-.5)*wobble))}
   player.current=next;
  }
  let entered=regions.filter(region=>region.id!=='fairy-playground'&&regionContains(region,player.current.x,player.current.y)).sort((a,b)=>regionExtent(a)-regionExtent(b))[0]??null;let inMist=isMistCountry(entered,player.current.x,player.current.y);
  if(rules&&inMist&&statsRef.current&&statsRef.current.confusion>8&&now>nextWarp.current){nextWarp.current=now+11000+Math.random()*11000;if(Math.random()<.25+statsRef.current.confusion/180){const target=regions.find(region=>region.id===(Math.random()<.52?'booboo':'trauma'));if(target){player.current={...player.current,x:target.x+(Math.random()-.5)*70,y:target.y+(Math.random()-.5)*70,moving:false};entered=target;inMist=true;setWarning(`THE MISTS FOLD THE ROAD · ${target.name.toUpperCase()}`)}}}
  if(rules&&statsRef.current&&!dialogue){const stats=statsRef.current;if(inMist){stats.concentration=clampMeter(stats.concentration-dt*1.15);stats.confusion=clampMeter(stats.confusion+dt*(confusionRates[entered?.id??'mist']??1.15))}else stats.confusion=clampMeter(stats.confusion-dt*.28);const points=rules.discovery.current,lastPoint=points[points.length-1],distance=lastPoint?Math.hypot(player.current.x-lastPoint.x,player.current.y-lastPoint.y):999;if(distance>(inMist?68:95))points.push({x:player.current.x,y:player.current.y,radius:inMist?55:112});if(now-lastPublish.current>220){lastPublish.current=now;rules.onStatsChange({...stats})}}
  if(rules?.world)for(const region of regions){if(region.id==='fairy-playground'||region.id==='mist'||revealedRegions.current.has(region.id))continue;if(Math.hypot(player.current.x-region.x,player.current.y-region.y)<regionExtent(region)+112){revealedRegions.current.add(region.id);rules.onRegionReveal?.(region.id)}}
  if(entered?.id!==(activeRegion.current??undefined)){activeRegion.current=entered?.id??null;setCurrentRegion(entered);setNotice(null);if(entered){rules?.onRegionEnter?.(entered.id);if(discoveredRegions.current.has(entered.id))setNotice(entered);else{discoveredRegions.current.add(entered.id);if(rules&&inMist&&statsRef.current){statsRef.current.clarity=clampMeter(statsRef.current.clarity+(entered.id==='mist'?3:8));rules.discovery.current.push({x:entered.x,y:entered.y,radius:Math.min(105,regionExtent(entered)+35)});rules.onStatsChange({...statsRef.current})}onDiscover(entered)}}}
  const foundProp=mapProps.find(prop=>Math.hypot(player.current.x-prop.x,player.current.y-prop.y)<Math.max(34,prop.size*.45))??null;if(foundProp?.id!==(activeProp.current??undefined)){activeProp.current=foundProp?.id??null;if(foundProp)onDiscoverProp(foundProp)}
  const camera=playerCamera(player.current.x,player.current.y,width,height,WORLD.width,WORLD.height);ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(-camera.x,-camera.y);const nearby=regions.some(region=>region.id!=='fairy-playground'&&Math.hypot(player.current.x-region.x,player.current.y-region.y)<regionExtent(region)+100);drawMap(ctx,nearby,regions,rules?.world?.routes??visibleRoutes);drawPlayer(ctx,player.current);ctx.restore();if(rules)drawFogOfWar(ctx,width,height,camera.x,camera.y,rules.discovery.current,player.current.x,player.current.y,inMist,now);if(rules&&inMist)drawMistVeil(ctx,width,height,now,statsRef.current?.confusion??0);if(rules?.world)drawDynamicScreen(ctx,width,height,rules.world.screenMode,now);drawVignette(ctx,width,height);frame=requestAnimationFrame(tick)
 };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[dialogue,discoveredRegions,onDiscover,onDiscoverProp,player,visibleRegions,visibleRoutes,world?.signature]);
 const virtualKey=(key:string,pressed:boolean)=>{if(pressed)keys.current.add(key);else keys.current.delete(key)};
 const openLore=(region:Region)=>{setNotice(null);keys.current.clear();onDiscover(region)};
 return <div className="player-mode"><canvas ref={canvasRef} tabIndex={0}/><div className="dpad" aria-label="Touch movement controls">{(['up','left','down','right'] as const).map(direction=>{const key=direction==='up'?'w':direction==='left'?'a':direction==='down'?'s':'d';return <button key={direction} className={direction} aria-label={`Move ${direction}`} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);virtualKey(key,true)}} onPointerUp={()=>virtualKey(key,false)} onPointerCancel={()=>virtualKey(key,false)}>{direction==='up'?'▲':direction==='left'?'◀':direction==='down'?'▼':'▶'}</button>})}</div>{notice&&!dialogue&&<button type="button" className="area-notice" aria-label={`Open lore for ${notice.name}`} onPointerUp={()=>openLore(notice)}><small>AREA REVISITED</small><b>{notice.name}</b><span>TAP FOR LORE →</span></button>}{currentRegion&&!notice&&!dialogue&&<button type="button" className="lore-journal" onClick={()=>openLore(currentRegion)}>◆ AREA LORE</button>}{warning&&<div className="mist-warning" role="status">{warning}</div>}</div>;
}
