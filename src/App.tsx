import {useEffect,useRef,useState} from 'react';
import type {Region} from './data/mapRegions';
import type {Route} from './data/routes';
import {pathContent} from './data/pathContent';
import {presentationContent} from './data/presentationContent';
import {presentationReferences} from './data/presentationReferences';
import {getSubMap,type SubMapDefinition} from './data/subMaps';
import type {Player} from './engine/movement';
import MapMode from './components/MapMode';
import PlayerMode from './components/PlayerMode';
import SubMap from './components/SubMap';
import './DialogueExtras.css';

type Mode='player'|'presentation';
type Selection={kind:'region';region:Region}|{kind:'route';route:Route}|null;
const startPlayer:Player={x:800,y:550,direction:'down',moving:false,step:0};

export default function App(){
 const [started,setStarted]=useState(false),[mode,setMode]=useState<Mode>('player'),[selection,setSelection]=useState<Selection>(null),[activeSubMap,setActiveSubMap]=useState<SubMapDefinition|null>(null);
 const player=useRef<Player>({...startPlayer});
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){if(activeSubMap)setActiveSubMap(null);else setSelection(null)}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[activeSubMap]);
 const selectRegion=(region:Region|null)=>setSelection(region?{kind:'region',region}:null);
 const region=selection?.kind==='region'?selection.region:null,route=selection?.kind==='route'?selection.route:null,lore=route?pathContent[route.id]:null,subMap=region?getSubMap(region.id):undefined;
 if(!started)return <main className="title-screen"><div className="embers"/><section className="title-card"><div className="flame">◆</div><p className="eyebrow">AN INTERACTIVE FIRE KASINA MAP</p><h1>FIRE KASINA <span>is about to have an adventure called</span> YOU</h1><p className="subtitle">Beyond the garden, the wilderness of mind is waiting.</p><button onClick={()=>setStarted(true)}>BEGIN THE ADVENTURE</button><small>WASD / ARROW KEYS · TAP TO EXPLORE</small></section></main>;
 return <main className="game">
  {mode==='player'
   ?<PlayerMode player={player} dialogue={region} onDiscover={selectRegion}/>
   :<MapMode onSelectRegion={region=>setSelection({kind:'region',region})} onSelectRoute={route=>setSelection({kind:'route',route})} onClear={()=>setSelection(null)}/>
  }
  <header><div><b>FIRE KASINA</b><span>THE MAP OF YOU</span></div><nav aria-label="Game mode"><button className={mode==='player'?'active':''} onClick={()=>{setMode('player');setSelection(null)}}>♟ PLAYER</button><button className={mode==='presentation'?'active':''} onClick={()=>{setMode('presentation');setSelection(null)}}>⌖ MAP</button></nav></header>
  <aside className="help">{mode==='player'?<>MOVE <kbd>WASD</kbd> <kbd>↑↓←→</kbd></>:<>TAP REGIONS & PATHS · DRAG · PINCH</>}</aside>
  {region&&<section className="bubble dialogue" role="dialog" aria-live="polite" aria-label={region.name}><button aria-label="Close dialogue" onClick={()=>setSelection(null)}>×</button><p>{mode==='player'?'AREA DISCOVERED':'MAP LORE'}</p><h2>{region.name}</h2><div className="rule"/><p className="copy"><span className="dialogue-gem">◆</span>{presentationContent[region.id]}</p>{subMap&&<button className="enter-area" onClick={()=>setActiveSubMap(subMap)}>ENTER AREA MAP →</button>}{presentationReferences[region.id]&&<div className="lore-links"><span>FIELD GUIDE</span>{presentationReferences[region.id]!.map(reference=><a key={reference.label} href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a>)}</div>}<small className="dialogue-hint">{mode==='player'?'CLOSE TO CONTINUE':'TAP OUTSIDE OR × TO CLOSE'}</small></section>}
  {route&&lore&&<section className={`bubble dialogue path-dialogue ${lore.family}`} role="dialog" aria-live="polite" aria-label={lore.title}><button aria-label="Close dialogue" onClick={()=>setSelection(null)}>×</button><p>PATH DISCOVERED · {lore.family.toUpperCase()}</p><h2>{lore.title}</h2><div className="rule"/><p className="copy"><span className="dialogue-gem">◆</span>{lore.copy}</p>{lore.reference&&<div className="lore-links"><span>FIELD GUIDE</span><a href={lore.reference.url} target="_blank" rel="noreferrer">{lore.reference.label} ↗</a></div>}<small className="dialogue-hint">TAP OUTSIDE OR × TO CLOSE</small></section>}
  {activeSubMap&&
   <SubMap map={activeSubMap} onExit={()=>setActiveSubMap(null)}/>
  }
 </main>;
}
