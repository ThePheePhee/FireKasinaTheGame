import {useCallback,useEffect,useRef,useState} from 'react';
import type {Region} from './data/mapRegions';
import type {Route} from './data/routes';
import {pathContent} from './data/pathContent';
import {presentationContent} from './data/presentationContent';
import {presentationReferences} from './data/presentationReferences';
import {getInteriorMap,type InteriorMap} from './data/interiorMaps';
import type {Player} from './engine/movement';
import {initialDiscovery,initialGameStats,type GameStats} from './game/gameState';
import MapMode from './components/MapMode';
import PlayerMode from './components/PlayerMode';
import InteriorMode from './components/InteriorMode';
import SubMap from './components/SubMap';
import GameHud from './components/GameHud';
import RedDotMinigame from './components/RedDotMinigame';
import './DialogueExtras.css';
import type {MapProp} from './data/mapProps';

type Experience='game'|'sandbox';
type SandboxView='player'|'presentation';
type Selection={kind:'region';region:Region}|{kind:'route';route:Route}|{kind:'prop';prop:MapProp}|null;
const startPlayer:Player={x:740,y:500,direction:'down',moving:false,step:0};

export default function App(){
 const [experience,setExperience]=useState<Experience|null>(null),[sandboxView,setSandboxView]=useState<SandboxView>('player'),[selection,setSelection]=useState<Selection>(null),[interior,setInterior]=useState<InteriorMap|null>(null),[overview,setOverview]=useState<InteriorMap|null>(null),[gameStats,setGameStats]=useState<GameStats>(initialGameStats),[practicing,setPracticing]=useState(false);
 const sandboxPlayer=useRef<Player>({...startPlayer}),gamePlayer=useRef<Player>({...startPlayer}),sandboxDiscovered=useRef(new Set<string>()),gameDiscovered=useRef(new Set(['house','garden','red-dot'])),gameDiscovery=useRef(initialDiscovery.map(point=>({...point})));
 const onGameStatsChange=useCallback((stats:GameStats)=>setGameStats(stats),[]);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key!=='Escape')return;if(overview)setOverview(null);else if(!interior)setSelection(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[interior,overview]);
 const selectRegion=(region:Region|null)=>setSelection(region?{kind:'region',region}:null);
 const region=selection?.kind==='region'?selection.region:null,route=selection?.kind==='route'?selection.route:null,prop=selection?.kind==='prop'?selection.prop:null,lore=route?pathContent[route.id]:null,interiorEntrance=region?getInteriorMap(region.id):undefined,isGame=experience==='game',view=isGame?'player':sandboxView;
 if(!experience)return <main className="title-screen"><div className="embers"/><section className="title-card"><div className="flame">◆</div><p className="eyebrow">AN INTERACTIVE FIRE KASINA ADVENTURE</p><h1>FIRE KASINA <span>is about to have an adventure called</span> YOU</h1><p className="subtitle">Beyond the garden, the wilderness of mind is waiting.</p><p className="provenance">AN ADVENTURE BASED ON DISCUSSION IN THE QUARRELSOME INN OVER X-MAS 2025</p><div className="title-actions"><button onClick={()=>setExperience('game')}>BEGIN GAME MODE<small>FOG · METERS · PROGRESSION</small></button><button className="sandbox-choice" onClick={()=>setExperience('sandbox')}>ENTER SANDBOX<small>FREE EXPLORATION · FULL MAP</small></button></div><small>WASD / ARROW KEYS · MOBILE CONTROLS INCLUDED</small></section></main>;
 return <main className={`game experience-${experience}`}>
  {view==='player'?<PlayerMode player={isGame?gamePlayer:sandboxPlayer} dialogue={!!selection||practicing} discoveredRegions={isGame?gameDiscovered:sandboxDiscovered} onDiscover={selectRegion} onDiscoverProp={found=>setSelection({kind:'prop',prop:found})} game={isGame?{stats:gameStats,discovery:gameDiscovery,onStatsChange:onGameStatsChange,onPractice:()=>setPracticing(true)}:undefined}/>:<MapMode onSelectRegion={found=>setSelection({kind:'region',region:found})} onSelectRoute={found=>setSelection({kind:'route',route:found})} onSelectProp={found=>setSelection({kind:'prop',prop:found})} onClear={()=>setSelection(null)}/>}
  <header><div><b>FIRE KASINA</b><span>{isGame?'GAME MODE · THE MAP MUST BE EARNED':'SANDBOX · THE MAP OF YOU'}</span></div>{isGame?<nav aria-label="Game mode"><button className="active">♟ GAME</button></nav>:<nav aria-label="Sandbox view"><button className={sandboxView==='player'?'active':''} onClick={()=>{setSandboxView('player');setSelection(null)}}>♟ PLAYER</button><button className={sandboxView==='presentation'?'active':''} onClick={()=>{setSandboxView('presentation');setSelection(null)}}>⌖ MAP</button></nav>}</header>
  {isGame&&<GameHud stats={gameStats}/>}<aside className="help">{view==='player'?<>MOVE <kbd>WASD</kbd> <kbd>↑↓←→</kbd></>:<>TAP REGIONS & PATHS · DRAG · PINCH</>}</aside>
  {region&&<section className="bubble dialogue" role="dialog" aria-live="polite" aria-label={region.name}><button aria-label="Close dialogue" onClick={()=>setSelection(null)}>×</button><p>{view==='player'?'AREA DISCOVERED':'MAP LORE'}</p><h2>{region.name}</h2><div className="rule"/><p className="copy"><span className="dialogue-gem">◆</span>{presentationContent[region.id]}</p>{isGame&&region.id==='red-dot'&&<button className="enter-area practice-red-dot" onClick={()=>{setPracticing(true);setSelection(null)}}>PRACTISE WITH THE RED DOT →</button>}{view==='player'&&interiorEntrance&&<button className="enter-area" onClick={()=>{setInterior(interiorEntrance);setSelection(null)}}>ENTER THIS AREA →</button>}{view==='presentation'&&interiorEntrance&&<button className="enter-area" onClick={()=>{setOverview(interiorEntrance);setSelection(null)}}>OPEN AREA MAP →</button>}{view==='presentation'&&interiorEntrance&&<button className="enter-area secondary" onClick={()=>{setInterior(interiorEntrance);setSelection(null)}}>PLAY THIS AREA →</button>}{presentationReferences[region.id]&&<div className="lore-links"><span>FIELD GUIDE</span>{presentationReferences[region.id]!.map(reference=><a key={reference.label} href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a>)}</div>}<small className="dialogue-hint">{view==='player'?'CLOSE TO CONTINUE':'TAP OUTSIDE OR × TO CLOSE'}</small></section>}
  {route&&lore&&<section className={`bubble dialogue path-dialogue ${lore.family}`} role="dialog" aria-live="polite" aria-label={lore.title}><button aria-label="Close dialogue" onClick={()=>setSelection(null)}>×</button><p>PATH DISCOVERED · {lore.family.toUpperCase()}</p><h2>{lore.title}</h2><div className="rule"/><p className="copy"><span className="dialogue-gem">◆</span>{lore.copy}</p>{lore.reference&&<div className="lore-links"><span>FIELD GUIDE</span><a href={lore.reference.url} target="_blank" rel="noreferrer">{lore.reference.label} ↗</a></div>}<small className="dialogue-hint">TAP OUTSIDE OR × TO CLOSE</small></section>}
  {prop&&<section className="bubble dialogue prop-dialogue" role="dialog" aria-live="polite" aria-label={prop.name}><button aria-label="Close dialogue" onClick={()=>setSelection(null)}>×</button><p>{view==='player'?'CURIOUS OBJECT FOUND':'TERRAIN SECRET'}</p><h2>{prop.name}</h2><div className="rule"/><p className="copy"><span className="dialogue-gem">◆</span>{prop.copy}</p><div className="lore-links"><span>TRAVELER’S NOTE</span><a href={prop.reference.url} target="_blank" rel="noreferrer">{prop.reference.label} ↗</a></div><small className="dialogue-hint">TAP OUTSIDE OR × TO CLOSE</small></section>}
  {interior&&<InteriorMode map={interior} onExit={()=>setInterior(null)}/>} {overview&&<SubMap map={overview} onExit={()=>setOverview(null)}/>} {practicing&&<RedDotMinigame stats={gameStats} onChange={onGameStatsChange} onExit={()=>setPracticing(false)}/>}
 </main>;
}
