import {useCallback,useEffect,useRef,useState} from 'react';
import {clampMeter,type GameStats} from '../game/gameState';
import './GameMode.css';

const maze=[
 '###############',
 '#S#.....#.....#',
 '#.#.###.#.###.#',
 '#...#...#...#.#',
 '###.#.#####.#.#',
 '#...#.....#.#.#',
 '#.#######.#.#.#',
 '#.....#...#...#',
 '#.###.#.#####.#',
 '#...#........E#',
 '###############'
];
const symbols=new Map(['3,1','⚡','7,3','◐','11,3','⌁','1,5','♢','9,5','⛓','5,7','☂','11,7','◒','7,9','✧'].reduce<[string,string][]>((all,item,index,array)=>index%2?all:(all.push([item,array[index+1]]),all),[]));
const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]} as const;

export default function TraumaLabyrinth({stats,onChange,onExit}:{stats:GameStats;onChange:(stats:GameStats)=>void;onExit:()=>void}){
 const latest=useRef(stats),[position,setPosition]=useState({x:1,y:1}),[complete,setComplete]=useState(false);latest.current=stats;
 useEffect(()=>{if(complete)return;const timer=window.setInterval(()=>{const next={...latest.current,concentration:clampMeter(latest.current.concentration-.45)};latest.current=next;onChange(next)},1000);return()=>clearInterval(timer)},[complete,onChange]);
 const move=useCallback((key:keyof typeof directions)=>{if(complete)return;const [dx,dy]=directions[key],x=position.x+dx,y=position.y+dy;if(maze[y]?.[x]==='#')return;const nextStats={...latest.current,concentration:clampMeter(latest.current.concentration-.65)};latest.current=nextStats;onChange(nextStats);setPosition({x,y});if(maze[y]?.[x]==='E'){const reward={...nextStats,clarity:clampMeter(nextStats.clarity+18)};latest.current=reward;onChange(reward);setComplete(true)}},[complete,onChange,position]);
 useEffect(()=>{const down=(event:KeyboardEvent)=>{const key=(event.key.length===1?event.key.toLowerCase():event.key) as keyof typeof directions;if(key in directions){event.preventDefault();move(key)}};addEventListener('keydown',down);return()=>removeEventListener('keydown',down)},[move]);
 return <section className="trauma-game" role="dialog" aria-label="Trauma Tunnels Labyrinth"><header><small>THE TRAUMA TUNNELS</small><h2>THE LABYRINTH OF ECHOES</h2><p>Find the lantern-door. Each step spends Concentration; reaching it earns Clarity.</p></header><div className="trauma-layout"><div className="maze" style={{gridTemplateColumns:`repeat(${maze[0].length},1fr)`}}>{maze.flatMap((row,y)=>[...row].map((cell,x)=>{const symbol=symbols.get(`${x},${y}`),here=position.x===x&&position.y===y;return <div key={`${x}-${y}`} className={`maze-cell ${cell==='#'?'wall':'floor'} ${cell==='E'?'exit':''}`}>{symbol&&<span>{symbol}</span>}{cell==='E'&&<b>◇</b>}{here&&<i>◆</i>}</div>}))}</div><aside className="trauma-symbols"><b>ECHOES IN THE STONE</b><span>⚡ The sudden alarm</span><span>◐ The face half-hidden</span><span>⛓ The old binding</span><span>☂ The shelter that failed</span><span>✧ The piece that survived</span></aside></div><div className="trauma-readout"><span>CONCENTRATION</span><div><i style={{width:`${latest.current.concentration}%`}}/></div><b>{Math.round(latest.current.concentration)}</b></div><div className="trauma-controls">{([['up','ArrowUp','▲'],['left','ArrowLeft','◀'],['down','ArrowDown','▼'],['right','ArrowRight','▶']] as const).map(([direction,key,label])=><button key={direction} className={direction} onClick={()=>move(key)}>{label}</button>)}</div>{complete?<div className="labyrinth-complete"><b>THE LANTERN-DOOR OPENS</b><span>Clarity +18</span><button onClick={onExit}>LEAVE THE LABYRINTH</button></div>:<button className="leave-practice" onClick={onExit}>RETREAT TO THE TUNNEL MOUTH</button>}</section>
}
