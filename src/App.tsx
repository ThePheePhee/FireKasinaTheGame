import {useEffect,useRef,useState} from 'react';
import type {Region} from './data/mapRegions';
import {presentationContent} from './data/presentationContent';
import type {Player} from './engine/movement';
import MapMode from './components/MapMode';
import PlayerMode from './components/PlayerMode';

type Mode='player'|'presentation';
const startPlayer:Player={x:915,y:510,direction:'down',moving:false,step:0};

export default function App(){
 const [started,setStarted]=useState(false),[mode,setMode]=useState<Mode>('player'),[selected,setSelected]=useState<Region|null>(null);
 const player=useRef<Player>({...startPlayer});
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setSelected(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);

 if(!started)return <main className="title-screen"><div className="embers"/><section className="title-card"><div className="flame">◆</div><p className="eyebrow">AN INTERACTIVE FIRE KASINA MAP</p><h1>FIRE KASINA <span>is about to have an adventure called</span> YOU</h1><p className="subtitle">Beyond the garden, the wilderness of mind is waiting.</p><button onClick={()=>setStarted(true)}>BEGIN THE ADVENTURE</button><small>WASD / ARROW KEYS · TAP TO EXPLORE</small></section></main>;

 return <main className="game">
  {mode==='player'
   ?<PlayerMode player={player} dialogue={selected} onDiscover={setSelected}/>
   :<MapMode onSelect={setSelected}/>
  }
  <header><div><b>FIRE KASINA</b><span>THE MAP OF YOU</span></div><nav aria-label="Game mode"><button className={mode==='player'?'active':''} onClick={()=>{setMode('player');setSelected(null)}}>♟ PLAYER</button><button className={mode==='presentation'?'active':''} onClick={()=>{setMode('presentation');setSelected(null)}}>⌖ MAP</button></nav></header>
  <aside className="help">{mode==='player'?<>MOVE <kbd>WASD</kbd> <kbd>↑↓←→</kbd></>:<>TAP · DRAG · PINCH TO EXPLORE</>}</aside>
  {selected&&<section className="bubble dialogue" role="dialog" aria-live="polite" aria-label={selected.name}><button aria-label="Close dialogue" onClick={()=>setSelected(null)}>×</button><p>{mode==='player'?'AREA DISCOVERED':'MAP LORE'}</p><h2>{selected.name}</h2><div className="rule"/><p className="copy"><span className="dialogue-gem">◆</span>{presentationContent[selected.id]}</p><small className="dialogue-hint">{mode==='player'?'CLOSE TO CONTINUE':'TAP OUTSIDE OR × TO CLOSE'}</small></section>}
 </main>;
}
