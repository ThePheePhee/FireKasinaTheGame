import {useCallback,useEffect,useRef,useState} from 'react';
import {clampMeter,type GameStats} from '../game/gameState';
import {lagoonReward} from '../game/practiceDynamics';
import './BoohooLagoonMinigame.css';
import MinigameSessionControls from './MinigameSessionControls';
import {useMinigameSession,useMinigameStats} from '../game/useMinigameSession';
import {activityKey,createOutcomeReceipt} from '../game/activitySession';

type ShadowTheme={name:string;whispers:[string,string,string];glyph:string};
type MindShadow={id:number;x:number;gapRatio:number;phase:number;theme:ShadowTheme;passed:boolean;lightTaken:boolean};

const themes:ShadowTheme[]=[
 {name:'THE OLD GRIEF',whispers:['it is still here','nothing really changes','remember again'],glyph:'◒'},
 {name:'RETREAT DOUBT',whispers:['everyone else gets it','this is going nowhere','perhaps I cannot'],glyph:'?'},
 {name:'THE FARAWAY HOME',whispers:['the garden needs me','what if they need me?','I should be elsewhere'],glyph:'⌂'},
 {name:'HEAVY WEATHER',whispers:['the body is stone','too tired to begin','sink and be still'],glyph:'◡'},
 {name:'THE OLD GOODBYE',whispers:['one more replay','the words unsaid','if only…'],glyph:'◇'},
 {name:'BORROWED PROGRESS',whispers:['their light is brighter','I should be further','compare again'],glyph:'⇅'},
 {name:'THE FOREVER STORY',whispers:['this mood is the truth','the whole sky is dark','it will always be so'],glyph:'∞'}
];

const birdX=142,shadowWidth=112;
const makeShadow=(id:number,x:number):MindShadow=>({id,x,gapRatio:.31+Math.random()*.38,phase:Math.random()*Math.PI*2,theme:themes[id%themes.length],passed:false,lightTaken:false});
const lobes=Array.from({length:7},(_,index)=><i key={index}/>);

export default function BoohooLagoonMinigame({stats,onChange,onExit}:{stats:GameStats;onChange:(stats:GameStats)=>void;onExit:()=>void}){

 const {latest,publish}=useMinigameStats(stats,onChange);
 const session=useMinigameSession(()=>{}),receipt=useRef(createOutcomeReceipt());
 const fieldRef=useRef<HTMLDivElement>(null),fieldHeight=useRef(380),elapsedRef=useRef(0),lastPublish=useRef(0),lightUntil=useRef(0);
 const velocity=useRef(0),birdRef=useRef(190),scoreRef=useRef(0),lightsRef=useRef(0),nextId=useRef(2),startedRef=useRef(false),failedRef=useRef(stats.concentration<=0);
 const shadowsRef=useRef<MindShadow[]>([makeShadow(0,575),makeShadow(1,890)]);
 const [started,setStarted]=useState(false),[exhausted,setExhausted]=useState(stats.concentration<=0),[bird,setBird]=useState(190),[shadows,setShadows]=useState(shadowsRef.current),[score,setScore]=useState(0),[breathLights,setBreathLights]=useState(0),[distance,setDistance]=useState(0),[failed,setFailed]=useState(stats.concentration<=0),[bestSpeed,setBestSpeed]=useState(128),[nearMiss,setNearMiss]=useState(false);
 const settleFlight=useCallback(()=>{
  const reward=lagoonReward(scoreRef.current,lightsRef.current);
  const next=receipt.current(latest.current,{clarity:reward.clarity,confusion:-reward.confusion,equanimity:reward.equanimity});
  if(next){latest.current=next;publish()}
 },[latest,publish]);
 const finish=()=>session.exit(()=>{settleFlight();publish();onExit()});
 const flap=useCallback(()=>{
  if(!session.controller.running||failedRef.current)return;
  if(latest.current.concentration<=0){failedRef.current=true;setFailed(true);setExhausted(true);settleFlight();session.complete();return}
  startedRef.current=true;setStarted(true);velocity.current=-238;
 },[latest,session.controller,session.complete,settleFlight]);
 useEffect(()=>{if(failedRef.current)session.complete()},[session.complete]);
 useEffect(()=>{const field=fieldRef.current;if(!field)return;const measure=()=>{const height=field.clientHeight||380;birdRef.current=Math.max(30,Math.min(height-30,birdRef.current*height/fieldHeight.current));fieldHeight.current=height;setBird(birdRef.current)};measure();const observer=new ResizeObserver(measure);observer.observe(field);return()=>observer.disconnect()},[]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{const pressed=activityKey(event);if(pressed===' '||pressed==='ArrowUp'){if(!session.controller.running)return;event.preventDefault();if(!event.repeat)flap()}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[flap,session.controller]);
 useEffect(()=>{
  if(!session.controller.running)return;
  let frame=0,last=performance.now();
  const tick=(realNow:number)=>{
   const dt=Math.min(.034,(realNow-last)/1000);last=realNow;
   if(session.controller.running&&!failedRef.current&&startedRef.current&&!document.hidden){
    elapsedRef.current+=dt;const elapsed=elapsedRef.current,now=elapsed*1000,height=fieldHeight.current,speed=Math.min(350,128+elapsed*6.2),gapSize=Math.max(124,Math.min(158,height*(.405-elapsed*.00065)));
    latest.current.concentration=clampMeter(latest.current.concentration-.18*dt);
    velocity.current+=650*dt;const nextY=birdRef.current+velocity.current*dt;
    let next=shadowsRef.current.map(item=>({...item,x:item.x-speed*dt}));
    const tail=next[next.length-1];if(tail&&tail.x<560)next.push(makeShadow(nextId.current++,tail.x+305));next=next.filter(item=>item.x>-shadowWidth-30);
    let passed=scoreRef.current,lights=lightsRef.current;
    next=next.map(item=>{
     const gapCenter=(item.gapRatio+Math.sin(now/1050+item.phase)*.025)*height;let updated=item;
     if(!item.lightTaken&&item.x+shadowWidth*.52<birdX+18){updated={...updated,lightTaken:true};if(Math.abs(nextY-gapCenter)<38)lights++}
     if(!item.passed&&item.x+shadowWidth<birdX-19){passed++;updated={...updated,passed:true}}return updated;
    });
    if(lights!==lightsRef.current)lightUntil.current=now+500;
    scoreRef.current=passed;lightsRef.current=lights;
    const hit=nextY<17||nextY>height-29||next.some(item=>{const gapCenter=(item.gapRatio+Math.sin(now/1050+item.phase)*.025)*height;return item.x<birdX+25&&item.x+shadowWidth>birdX-20&&(nextY-16<gapCenter-gapSize/2||nextY+16>gapCenter+gapSize/2)});
    birdRef.current=Math.max(0,Math.min(height,nextY));shadowsRef.current=next;
    setBird(birdRef.current);setShadows(next);setScore(passed);setBreathLights(lights);setDistance(elapsed);setBestSpeed(speed);setNearMiss(now<lightUntil.current);
    if(hit||latest.current.concentration<=0){failedRef.current=true;setFailed(true);setExhausted(latest.current.concentration<=0);settleFlight();session.complete()}
    else if(realNow-lastPublish.current>500){lastPublish.current=realNow;publish()}
   }
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[latest,publish,session.controller,session.complete,session.status,settleFlight]);
 const retry=()=>{
  if(session.controller.phase!=='done'||latest.current.concentration<=0)return;
  settleFlight();receipt.current=createOutcomeReceipt();
  const fresh=[makeShadow(0,575),makeShadow(1,890)];
  velocity.current=0;birdRef.current=fieldHeight.current/2;shadowsRef.current=fresh;scoreRef.current=0;lightsRef.current=0;failedRef.current=false;elapsedRef.current=0;startedRef.current=false;nextId.current=2;lightUntil.current=0;
  setStarted(false);setBird(birdRef.current);setShadows(fresh);setScore(0);setBreathLights(0);setDistance(0);setBestSpeed(128);setFailed(false);setNearMiss(false);setExhausted(false);session.retry();
 };
 const rank=score>=12?'THE FAR SHORE GLIMMERS':score>=7?'YOU FLEW WITH THE WEATHER':score>=3?'DAMP, BUT AIRBORNE':'THE LAGOON HAS AN UNDERTOW';
 return <section className="boohoo-minigame" data-activity-paused={!session.controller.running}><MinigameSessionControls session={session} title="A LITTLE ROOM TO FLY" instructions="Space, Up, or a tap lifts the little flame; release and it falls. Pass through the gaps in each mind-shadow. The sky gradually quickens. Small breath-lights reward a centred passage." meaning="Sadness is weather in this retreat metaphor, not an enemy to defeat. Each flight costs concentration. What you learned is kept even if you retry or leave early." onBegin={flap} onLeave={finish}/><header><small>BOOHOO LAGOON · A RETREAT SKY</small><h1>FLY BETWEEN THE SADNESSES</h1><p>Feelings gather into weather. Find the breathing-space without pretending the clouds are not there.</p></header><div ref={fieldRef} className={`boohoo-flight ${failed?'failed':''} ${nearMiss?'light-taken':''}`} role="button" tabIndex={0} aria-label={started?'Flap upward through the sadnesses':'Begin flying through the lagoon'} onClick={flap} onKeyDown={event=>{if(event.key==='Enter'||event.code==='Space'){event.preventDefault();if(!event.repeat)flap()}}}>
   <div className="lagoon-moon"><i/></div><div className="lagoon-stars"/><div className="retreat-ridge"><i/><i/><i/><b/></div><div className="distant-shore"/>
   {shadows.map(item=>{const height=fieldHeight.current,gapSize=Math.max(124,Math.min(158,height*(.405-distance*.00065))),gapCenter=(item.gapRatio+Math.sin(distance*1000/1050+item.phase)*.025)*height;return <div className={`sadness-obstacle theme-${item.id%3}`} key={item.id} style={{left:`${item.x}px`}}><div className="mind-shadow upper" style={{height:`${Math.max(12,gapCenter-gapSize/2)}px`}}>{lobes}<span>{item.theme.glyph}</span><b>{item.theme.name}</b><em>{item.theme.whispers[0]}</em></div>{!item.lightTaken&&<div className="breath-light" aria-hidden="true" style={{top:`${gapCenter}px`}}>✦</div>}<div className="mind-shadow lower" style={{top:`${gapCenter+gapSize/2}px`}}>{lobes}<span>{item.theme.glyph}</span><b>{item.theme.name}</b><em>{item.theme.whispers[1+item.id%2]}</em></div></div>})}
   <div className="lagoon-familiar" style={{transform:`translate(${birdX}px,${bird}px) rotate(${Math.max(-22,Math.min(62,velocity.current/9))}deg)`}}><span/><i/><b/><em/></div><div className="waterline"/><div className="flight-readout"><span>SHADOWS PASSED {score}</span><span>BREATH-LIGHTS {breathLights}</span><span>PACE ×{(bestSpeed/128).toFixed(1)}</span></div>{!failed&&<div className="flight-whisper">{started?'THE WEATHER QUICKENS…':'SPACE / ↑ / TAP · TAKE WING WHEN READY'}</div>}
  </div>{failed?<div className="lagoon-result"><small>{exhausted?'THE LANTERN NEEDS REST':'THE WINGS TOUCH DARK WATER'}</small><h2>{exhausted?'RETURN TO THE CANDLE':rank}</h2><p>You passed <b>{score}</b> mind-shadow{score===1?'':'s'} and found <b>{breathLights}</b> breathing-space{breathLights===1?'':'s'}. The shadows were not the whole sky. The learning from this flight has already been kept.{exhausted?' Your concentration is spent; the Red Dot Range can kindle the flame again.':''}</p><div>{!exhausted&&<button onClick={retry}>TRY THE SKY AGAIN</button>}<button onClick={finish}>RETURN TO THE SHORE</button></div></div>:<button type="button" className="lagoon-flap" onClick={flap}>{started?'RISE THROUGH THE WEATHER':'TAKE WING · SPACE / ↑ / TAP'}</button>}<div className="activity-resource"><span>CONCENTRATION</span><meter min={0} max={100} value={latest.current.concentration} aria-label="Concentration"/><b>{Math.round(latest.current.concentration)}</b></div><button className="leave-lagoon" onClick={finish}>RETREAT TO THE SHORE</button></section>;
}
