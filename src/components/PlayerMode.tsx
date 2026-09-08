import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {mapRegions,WORLD,type Region} from '../data/mapRegions';
import {mapProps,type MapProp} from '../data/mapProps';
import type {Route} from '../data/routes';
import {nearbyRoutes} from '../engine/nearbyRoutes';
import {playerCamera} from '../engine/camera';
import {movePlayer,type Player} from '../engine/movement';
import {regionExtent} from '../engine/regionGeometry';
import {applyExplorationAssists,clampMeter,FAIRY_ENTRY_CLARITY,FAIRY_ENTRY_CONCENTRATION,MIST_ENTRY_CONCENTRATION,type DiscoveryPoint,type ExplorationAssists,type GameStats} from '../game/gameState';
import {countryAt,regionAt,worldEntryBarrier} from '../game/worldProgression';
import {drawFogOfWar,drawMistVeil} from '../rendering/drawFogOfWar';
import {drawMap} from '../rendering/drawMap';
import {drawPlayer} from '../rendering/drawPlayer';
import {drawVignette} from '../rendering/drawUI';
import './PlayerMode.css';
import InteractionPrompt from './InteractionPrompt';
import RoadsideSign from './RoadsideSign';

export interface GameRules {
 stats:GameStats;discovery:MutableRefObject<DiscoveryPoint[]>;
 onStatsChange:(stats:GameStats)=>void;onPractice:()=>void;
 explorationAssists?:ExplorationAssists;
}
interface PlayerModeProps {
 player:MutableRefObject<Player>;dialogue:boolean;discoveredRegions:MutableRefObject<Set<string>>;
 onDiscover:(region:Region)=>void;onDiscoverProp:(prop:MapProp)=>void;onReadRoute:(route:Route)=>void;game?:GameRules;
}

const range=mapRegions.find(region=>region.id==='red-dot')!;
const confusionRates:Record<string,number>={booboo:2.8,trauma:2.2,chasm:3.2,'counterfeit-crags':1.7,'credulous-circuit':2.1,inn:.9,mist:.7};
const noAssists:ExplorationAssists={mist:false,fairy:false};

export default function PlayerMode({player,dialogue,discoveredRegions,onDiscover,onDiscoverProp,onReadRoute,game}:PlayerModeProps){
 const canvasRef=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>()),activeRegion=useRef<string|null>(null),activeProp=useRef<string|null>(null);
 const gameRef=useRef(game),statsRef=useRef(game?{...game.stats}:undefined),lastPublish=useRef(0),warpRemaining=useRef(12),lastDiscoveryPosition=useRef({x:player.current.x,y:player.current.y});
 const [notice,setNotice]=useState<Region|null>(null),[currentProp,setCurrentProp]=useState<MapProp|null>(null),[currentRegion,setCurrentRegion]=useState<Region|null>(null),[warning,setWarning]=useState<string|null>(null);
 const currentRoads=useRef<Route[]>(nearbyRoutes(player.current.x,player.current.y)),[roadNames,setRoadNames]=useState(currentRoads.current);
 gameRef.current=game;
 useEffect(()=>{statsRef.current=game?{...game.stats}:undefined},[game?.stats]);
 const resize=useCallback(()=>{const canvas=canvasRef.current;if(!canvas)return;const d=Math.min(devicePixelRatio||1,2),box=canvas.getBoundingClientRect();canvas.width=Math.round(box.width*d);canvas.height=Math.round(box.height*d)},[]);
 useEffect(()=>{resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[resize]);
 useEffect(()=>{if(!warning)return;const timer=window.setTimeout(()=>setWarning(null),4200);return()=>clearTimeout(timer)},[warning]);
 useEffect(()=>{if(dialogue)keys.current.clear()},[dialogue]);
 useEffect(()=>{
  const normalize=(key:string)=>key.toLowerCase().startsWith('arrow')?key:key.toLowerCase();
  const down=(event:KeyboardEvent)=>{if(dialogue||event.ctrlKey||event.metaKey||event.altKey||(event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))return;const key=normalize(event.key);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)){event.preventDefault();keys.current.add(key)}else if(key==='e'&&!event.repeat){event.preventDefault();keys.current.clear();if(currentProp)onDiscoverProp(currentProp);else if(currentRegion)onDiscover(currentRegion)}else if(key==='r'&&!event.repeat&&currentRoads.current[0]){event.preventDefault();keys.current.clear();onReadRoute(currentRoads.current[0])}};
  const up=(event:KeyboardEvent)=>keys.current.delete(normalize(event.key));
  const clear=()=>keys.current.clear();
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear)};
 },[dialogue,currentProp,currentRegion,onDiscover,onDiscoverProp,onReadRoute]);
 useEffect(()=>{
  let frame=0,last=performance.now();
  const tick=(now:number)=>{
   const canvas=canvasRef.current;if(!canvas)return;
   const dt=document.hidden?0:Math.min((now-last)/1000,.04);last=now;
   const d=Math.min(devicePixelRatio||1,2),width=canvas.width/d,height=canvas.height/d,ctx=canvas.getContext('2d');if(!ctx)return;
   const rules=gameRef.current,paused=dialogue||document.hidden;
   if(rules&&statsRef.current)statsRef.current=applyExplorationAssists(statsRef.current,rules.explorationAssists??noAssists);
   if(!paused){
    const before=player.current,beforeCountry=countryAt(before.x,before.y);
    let next=movePlayer(before,keys.current,dt,WORLD.width,WORLD.height);
    if(rules&&statsRef.current&&beforeCountry==='mist'){
     const concentration=statsRef.current.concentration,pull=Math.max(0,Math.min(1,(MIST_ENTRY_CONCENTRATION-concentration)/25));
     if(next.moving&&pull>0){const homeX=range.x-before.x,homeY=range.y-before.y,homeDistance=Math.hypot(homeX,homeY)||1,speed=190*dt;next.x=before.x+(next.x-before.x)*(1-pull)+homeX/homeDistance*speed*pull;next.y=before.y+(next.y-before.y)*(1-pull)+homeY/homeDistance*speed*pull;
      if(pull>.75)next.direction=Math.abs(homeX)>Math.abs(homeY)?homeX<0?'left':'right':homeY<0?'up':'down';
     }
     if(next.moving){const wobble=statsRef.current.confusion/100*38*dt;next.x=Math.max(12,Math.min(WORLD.width-12,next.x+(Math.random()-.5)*wobble));next.y=Math.max(12,Math.min(WORLD.height-12,next.y+(Math.random()-.5)*wobble))}
    }
    const barrier=rules&&statsRef.current?worldEntryBarrier(before,next,statsRef.current):null;
    if(barrier==='mist'){next={...before,moving:false};setWarning(`THE MISTS TURN YOU BACK · ${MIST_ENTRY_CONCENTRATION} CONCENTRATION REQUIRED`)}
    else if(barrier==='fairy'){next={...before,moving:false};setWarning(`THE FAIRY PLAYGROUND REMAINS VEILED · ${FAIRY_ENTRY_CONCENTRATION} CONCENTRATION + ${FAIRY_ENTRY_CLARITY} CLARITY`)}
    player.current=next;
   }
   let entered=regionAt(player.current.x,player.current.y),country=countryAt(player.current.x,player.current.y,entered);
   if(country==='home'&&entered?.id==='mist')entered=null;
   if(rules&&country==='mist'&&statsRef.current&&!paused){
    warpRemaining.current-=dt;
    if(warpRemaining.current<=0){warpRemaining.current=11+Math.random()*11;
     // Once the lantern is weak, let the homeward pull actually carry the player home.
     if(statsRef.current.concentration>=15&&statsRef.current.confusion>8&&Math.random()<.25+statsRef.current.confusion/180){const target=mapRegions.find(region=>region.id===(Math.random()<.52?'booboo':'trauma'))!;player.current={...player.current,x:target.x+(Math.random()-.5)*70,y:target.y+(Math.random()-.5)*70,moving:false};entered=target;country='mist';setWarning(`THE MISTS FOLD THE ROAD · ${target.name.toUpperCase()}`)}
    }
   }
   const inMist=country==='mist';
   // Resolve roads after gates and warps. This reads only the ground beneath
   // the player: no distant names, fog discovery, stat rewards, or auto-dialogue.
   if(!paused){const roads=nearbyRoutes(player.current.x,player.current.y,currentRoads.current[0]?.id);if(roads.map(route=>route.id).join('|')!==currentRoads.current.map(route=>route.id).join('|')){currentRoads.current=roads;setRoadNames(roads)}}
   if(rules&&statsRef.current&&!paused){
    const stats=statsRef.current;
    if(inMist){stats.concentration=clampMeter(stats.concentration-dt*1.15);stats.confusion=clampMeter(stats.confusion+dt*(confusionRates[entered?.id??'mist']??1.15))}else stats.confusion=clampMeter(stats.confusion-dt*.28);
    statsRef.current=applyExplorationAssists(stats,rules.explorationAssists??noAssists);
    const points=rules.discovery.current,spacing=inMist?58:88;
    if(Math.hypot(player.current.x-lastDiscoveryPosition.current.x,player.current.y-lastDiscoveryPosition.current.y)>spacing){lastDiscoveryPosition.current={x:player.current.x,y:player.current.y};if(!points.some(point=>Math.hypot(player.current.x-point.x,player.current.y-point.y)<Math.min(spacing,point.radius*.7)))points.push({x:player.current.x,y:player.current.y,radius:inMist?55:112})}
    if(now-lastPublish.current>220){lastPublish.current=now;rules.onStatsChange({...statsRef.current})}
   }
   let openedRegion=false;
   if(!paused&&entered?.id!==(activeRegion.current??undefined)){
    activeRegion.current=entered?.id??null;setCurrentRegion(entered);setNotice(null);
    if(entered){if(discoveredRegions.current.has(entered.id))setNotice(entered);else{
     discoveredRegions.current.add(entered.id);
     if(rules&&inMist&&statsRef.current){statsRef.current.clarity=clampMeter(statsRef.current.clarity+(entered.id==='mist'?3:8));rules.discovery.current.push({x:entered.x,y:entered.y,radius:Math.min(105,regionExtent(entered)+35)});rules.onStatsChange({...statsRef.current})}
     keys.current.clear();onDiscover(entered);openedRegion=true;
    }}
   }
   if(!paused&&!openedRegion){const found=mapProps.find(prop=>Math.hypot(player.current.x-prop.x,player.current.y-prop.y)<Math.max(34,prop.size*.45))??null;
    if(found?.id!==(activeProp.current??undefined)){activeProp.current=found?.id??null;setCurrentProp(found);if(found){const id=`prop:${found.id}`;if(!discoveredRegions.current.has(id)){discoveredRegions.current.add(id);keys.current.clear();onDiscoverProp(found)}}}
   }
   const camera=playerCamera(player.current.x,player.current.y,width,height,WORLD.width,WORLD.height);
   ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(-camera.x,-camera.y);
   const nearby=mapRegions.some(region=>region.id!=='fairy-playground'&&Math.hypot(player.current.x-region.x,player.current.y-region.y)<regionExtent(region)+100);
   drawMap(ctx,nearby);drawPlayer(ctx,player.current);ctx.restore();
   if(rules)drawFogOfWar(ctx,width,height,camera.x,camera.y,rules.discovery.current,player.current.x,player.current.y,inMist,now);
   if(rules&&inMist)drawMistVeil(ctx,width,height,now,statsRef.current?.confusion??0);drawVignette(ctx,width,height,.24);frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[dialogue,discoveredRegions,onDiscover,onDiscoverProp,player]);
 const virtualKey=(key:string,pressed:boolean)=>{if(pressed&&!dialogue)keys.current.add(key);else keys.current.delete(key)};
 const openLore=(region:Region)=>{setNotice(null);keys.current.clear();onDiscover(region)};
 return <div className="player-mode"><canvas ref={canvasRef} tabIndex={0} aria-label="Explore the landscape with arrow keys or the movement buttons"/><div className="dpad" aria-label="Touch movement controls">{(['up','left','down','right'] as const).map(direction=>{const key=direction==='up'?'w':direction==='left'?'a':direction==='down'?'s':'d';return <button key={direction} className={direction} aria-label={`Move ${direction}`} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);virtualKey(key,true)}} onPointerUp={()=>virtualKey(key,false)} onPointerCancel={()=>virtualKey(key,false)} onLostPointerCapture={()=>virtualKey(key,false)}>{direction==='up'?'▲':direction==='left'?'◀':direction==='down'?'▼':'▶'}</button>})}</div>
  {!dialogue&&(currentProp?<InteractionPrompt title={currentProp.name} eyebrow="A CURIOUS FIND" action="EXAMINE" onActivate={()=>{keys.current.clear();onDiscoverProp(currentProp)}}/>:currentRegion&&<InteractionPrompt title={currentRegion.name} eyebrow={notice?'AREA REVISITED':'YOU ARE HERE'} kind={currentRegion.id==='library'?'book':'lore'} action="EXPLORE THIS PLACE" onActivate={()=>openLore(currentRegion)}/>)}
  {!dialogue&&roadNames.length>0&&<RoadsideSign key={roadNames.map(route=>route.id).join('|')} routes={roadNames} onRead={route=>{keys.current.clear();onReadRoute(route)}}/>}
  {warning&&!dialogue&&<div className="mist-warning" role="status">{warning}</div>}
 </div>;
}
