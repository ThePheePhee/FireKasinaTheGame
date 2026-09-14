import {useCallback,useEffect,useRef,useState} from 'react';
import {clampMeter,type GameStats} from '../game/gameState';
import {directions,keyOf,maze,phaseOpen,stepLabyrinth,symbols,initialLabyrinthState} from '../game/traumaMaze';
import './GameMode.css';
import './TraumaLabyrinth.css';
import MinigameSessionControls from './MinigameSessionControls';
import {useMinigameSession,useMinigameStats} from '../game/useMinigameSession';
import {activityKey} from '../game/activitySession';


export default function TraumaLabyrinth({stats,onChange,onExit}:{stats:GameStats;onChange:(stats:GameStats)=>void;onExit:()=>void}){

 const {latest,publish}=useMinigameStats(stats,onChange);
 const session=useMinigameSession(()=>{}),mazeRef=useRef({...initialLabyrinthState}),reverseMoves=useRef(0);
 const [mazeState,setMazeState]=useState(mazeRef.current),[visited,setVisited]=useState(()=>new Set(['1,1'])),[message,setMessage]=useState('The lantern shows only the next few stones. The symbols are rules, not decorations.'),[messageTone,setMessageTone]=useState<'quiet'|'danger'|'shelter'>('quiet'),[steps,setSteps]=useState(0);
 const {position,grounded,shifted,complete}=mazeState;
 const leave=()=>session.exit(()=>{publish();onExit()});
 useEffect(()=>{
  if(!session.controller.running)return;
  let frame=0,last=performance.now(),sincePublish=0;
  const tick=(now:number)=>{const dt=Math.min(.04,(now-last)/1000);last=now;
   if(session.controller.running&&!document.hidden&&!mazeRef.current.complete){
    latest.current.concentration=clampMeter(latest.current.concentration-.38*dt);sincePublish+=dt;
    if(sincePublish>=.5||latest.current.concentration<=0){sincePublish=0;publish()}
    if(latest.current.concentration<=0)session.complete();
   }
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[latest,publish,session.controller,session.complete,session.status]);
 useEffect(()=>{if(latest.current.concentration<=0)session.complete()},[latest,session.complete]);
 const move=useCallback((raw:keyof typeof directions)=>{
  if(!session.controller.running||document.hidden||latest.current.concentration<=0)return;
  const result=stepLabyrinth(mazeRef.current,raw);
  if(result.message){setMessage(result.message);setMessageTone(result.tone)}
  if(!result.moved)return;
  const next=result.state;mazeRef.current=next;reverseMoves.current=next.reverseMoves;
  setMazeState(next);setSteps(value=>value+1);setVisited(previous=>new Set([...previous,result.entered,keyOf(next.position.x,next.position.y)]));
  latest.current={...latest.current,concentration:clampMeter(latest.current.concentration-.52)};
  if(next.complete){latest.current.clarity=clampMeter(latest.current.clarity+18);latest.current.integration=clampMeter(latest.current.integration+4);session.complete()}
  else if(latest.current.concentration<=0)session.complete();
  publish();
 },[latest,publish,session.controller,session.complete]);
 useEffect(()=>{const down=(event:KeyboardEvent)=>{const key=activityKey(event);if(key&&key in directions&&session.controller.running){event.preventDefault();move(key as keyof typeof directions)}};addEventListener('keydown',down);return()=>removeEventListener('keydown',down)},[move,session.controller]);
 const openCells=phaseOpen[shifted?1:0],objective=grounded?'REACH THE LANTERN-DOOR':'FIND THE GROUNDING STAR';
 return <section className="trauma-game trauma-labyrinth" role="dialog" aria-label="Trauma Tunnels Labyrinth" data-activity-paused={!session.controller.running}><MinigameSessionControls session={session} title="THE LABYRINTH OF ECHOES" instructions="Move with arrows, WASD, or the direction buttons. Find the grounding star, then the lantern-door. False doors return you to the entrance; shelter switches move walls; echo knots reverse eight successful steps. Both walking and time in the tunnels spend concentration." meaning="This is a puzzle about disorientation and finding support, not a model of trauma treatment. Retreat costs no extra penalty. The tunnel can wait." onLeave={leave}/><header className={messageTone}><small>THE TRAUMA TUNNELS · PATTERN {shifted?'B':'A'}</small><h2>THE LABYRINTH OF ECHOES</h2><p>{message}</p></header><div className="trauma-objective"><span>{objective}</span><i>{grounded?'STAR HELD':'STAR UNFOUND'}</i><b>{reverseMoves.current>0?`DIRECTIONS REVERSED · ${reverseMoves.current}`:`${steps} STEPS REMEMBERED`}</b></div><div className="trauma-layout"><div className="maze-frame"><div className="tunnel-torch left"/><div className="tunnel-torch right"/><div className="maze" style={{gridTemplateColumns:`repeat(${maze[0].length},1fr)`}}>{maze.flatMap((row,y)=>[...row].map((cell,x)=>{const key=keyOf(x,y),symbol=symbols.get(key),here=position.x===x&&position.y===y,isOpen=openCells.has(key),wall=cell==='#'&&!isOpen,locked=key==='7,9'&&!grounded,distance=Math.hypot(position.x-x,position.y-y),seen=visited.has(key),visible=distance<3.2||seen||cell==='S';return <div key={key} title={symbol?.name} className={`maze-cell ${wall?'wall':'floor'} ${isOpen?'shift-passage':''} ${cell==='E'?'exit':''} ${locked?'locked':''} ${visible?'revealed':'unseen'} ${seen?'visited':''}`}>{visible&&symbol&&<span aria-label={symbol.name}>{symbol.glyph}</span>}{cell==='E'&&visible&&<b>◇</b>}{here&&<div className="tunnel-wizard"><i/><b/></div>}</div>}))}</div></div><aside className="trauma-symbols"><b>THE TUNNEL’S GRAMMAR</b><span><i>♢</i> False Door <em>returns to beginning</em></span><span><i>⚡</i> Flashback <em>tears away the route</em></span><span><i>◐</i> Half-Seen Face <em>blocks what looked open</em></span><span><i>⌁</i> Echo Knot <em>reverses direction</em></span><span><i>☂</i> Shelter Switch <em>changes the walls</em></span><span><i>✧</i> Grounding Star <em>opens old bindings</em></span><span><i>◒</i> Repeating Scene <em>returns to shelter</em></span><span><i>⛓</i> Old Bindings <em>yield to grounding</em></span></aside></div><div className="trauma-readout"><span>CONCENTRATION</span><div><i style={{width:`${latest.current.concentration}%`}}/></div><b>{Math.round(latest.current.concentration)}</b></div><div className="trauma-controls">{([['up','ArrowUp','▲'],['left','ArrowLeft','◀'],['down','ArrowDown','▼'],['right','ArrowRight','▶']] as const).map(([direction,key,label])=><button key={direction} className={direction} aria-label={`Walk ${direction}`} onClick={()=>move(key)}>{label}</button>)}</div>{!complete&&latest.current.concentration<=0&&<div className="labyrinth-complete"><small>THE LANTERN RESTS</small><b>RETURN TO THE CANDLE</b><span>The flame is spent. The tunnel can wait while you gather concentration.</span><button onClick={leave}>RETURN TO THE TUNNEL MOUTH</button></div>}{complete?<div className="labyrinth-complete"><small>THE PRESENT HOLDS</small><b>THE LANTERN-DOOR OPENS</b><span>Clarity +18 · Integration +4</span><button onClick={leave}>LEAVE THE LABYRINTH</button></div>:<button className="leave-practice" onClick={leave}>RETREAT TO THE TUNNEL MOUTH</button>}</section>;
}
