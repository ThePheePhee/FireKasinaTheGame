import {useCallback,useEffect,useRef,useState} from 'react';
import {clampMeter,type GameStats} from '../game/gameState';
import {activityKey,createOutcomeReceipt} from '../game/activitySession';
import {chasmOutcomeReward,type ChasmOutcome} from '../game/chasmRules';
import {useMinigameSession,useMinigameStats} from '../game/useMinigameSession';
import MinigameSessionControls from './MinigameSessionControls';
import './ChasmDespairMinigame.css';

type Phase='balance'|'falling'|'climb'|'complete';
type Hand='left'|'right';
const disturbances=[['ALL OR NOTHING',1],['THE FUTURE CLOSES',-1],['NOTHING MEANS ANYTHING',1],['AN OLD FAILURE RETURNS',-1],['EVERY ROAD VANISHES',1],['THE ABYSS SOUNDS CERTAIN',-1],['ONE SLIP MEANS FOREVER',1],['NO ONE COULD UNDERSTAND',-1]] as const;
const holds=Array.from({length:14},(_,index)=>({side:(index%2?'right':'left') as Hand,top:91-index*6.5,left:index%2?61+(index%3)*4:34-(index%3)*4}));
const bridgePlanks=Array.from({length:16},(_,index)=><i key={index} style={{left:`${index*6.25}%`}}/>);

export default function ChasmDespairMinigame({stats,onChange,onExit}:{stats:GameStats;onChange:(stats:GameStats)=>void;onExit:()=>void}){
 const {latest,publish}=useMinigameStats(stats,onChange),lastPublish=useRef(0),exhaustedRef=useRef(stats.concentration<=0),[exhausted,setExhausted]=useState(stats.concentration<=0);
 const startedRef=useRef(false),[started,setStarted]=useState(false),held=useRef(new Set<string>()),clock=useRef(0),fallElapsed=useRef(0),lastGrab=useRef(-Infinity),pendingGust=useRef<{at:number;force:number}|null>(null);
 const [phase,setPhase]=useState<Phase>('balance'),[lean,setLean]=useState(0),[crossing,setCrossing]=useState(0),[disturbance,setDisturbance]=useState('THE BRIDGE BREATHES'),[shockId,setShockId]=useState(0),[climb,setClimb]=useState(0),[grip,setGrip]=useState(72),[expected,setExpected]=useState<Hand>('left'),[climbMessage,setClimbMessage]=useState('FIND THE FIRST HOLD'),[setbacks,setSetbacks]=useState(0),[outcome,setOutcome]=useState<ChasmOutcome|null>(null);
 const leanRef=useRef(0),crossRef=useRef(0),input=useRef(0),impulse=useRef(0),nextShock=useRef(1400),frame=useRef(0),last=useRef(performance.now()),phaseRef=useRef<Phase>('balance'),climbRef=useRef(0),gripRef=useRef(72),expectedRef=useRef<Hand>('left'),receipt=useRef(createOutcomeReceipt());
 const session=useMinigameSession(()=>{held.current.clear();input.current=0});
 const updateInput=()=>{input.current=Number(['arrowright','d','touch-right'].some(key=>held.current.has(key)))-Number(['arrowleft','a','touch-left'].some(key=>held.current.has(key)))};
 const finish=()=>session.exit(()=>{publish();onExit()});
 const complete=useCallback((result:ChasmOutcome)=>{
  if(phaseRef.current==='complete')return;
  phaseRef.current='complete';setOutcome(result);setPhase('complete');
  const next=receipt.current(latest.current,chasmOutcomeReward(result));if(next){latest.current=next;publish()}
  session.complete();
 },[latest,publish,session.complete]);
 const beginClimb=useCallback(()=>{phaseRef.current='climb';setPhase('climb');setClimbMessage('THE BOTTOM IS NOT THE END')},[]);
 const grabRef=useRef<(hand:Hand)=>void>(()=>{});
 useEffect(()=>{if(exhaustedRef.current)session.complete()},[session.complete]);
 useEffect(()=>{
  const down=(event:KeyboardEvent)=>{
   const pressed=activityKey(event),key=pressed?.toLowerCase();
   if(!key||!['arrowleft','arrowright','a','d'].includes(key)||!session.controller.running)return;
   event.preventDefault();if(exhaustedRef.current)return;
   if(phaseRef.current==='balance'){held.current.add(key);updateInput()}
   else if(phaseRef.current==='climb'&&!event.repeat)grabRef.current(key==='a'||key==='arrowleft'?'left':'right');
  };
  const up=(event:KeyboardEvent)=>{held.current.delete(event.key.toLowerCase());updateInput()};
  addEventListener('keydown',down);addEventListener('keyup',up);
  return()=>{removeEventListener('keydown',down);removeEventListener('keyup',up)};
 },[session.controller]);
 useEffect(()=>{
  if(!session.controller.running)return;
  last.current=performance.now();
  const tick=(realNow:number)=>{
   const dt=Math.min(.034,(realNow-last.current)/1000);last.current=realNow;
   if(document.hidden||!session.controller.running||exhaustedRef.current){frame.current=requestAnimationFrame(tick);return}
   if(startedRef.current&&phaseRef.current!=='complete'){
    latest.current.concentration=clampMeter(latest.current.concentration-dt*(phaseRef.current==='climb'?.55:.45));
    if(realNow-lastPublish.current>500||latest.current.concentration<=0){lastPublish.current=realNow;publish()}
    if(latest.current.concentration<=0){exhaustedRef.current=true;setExhausted(true);session.complete();frame.current=requestAnimationFrame(tick);return}
   }
   if(startedRef.current)clock.current+=dt*1000;const now=clock.current;
   if(phaseRef.current==='balance'&&startedRef.current){
    if(now>nextShock.current&&!pendingGust.current){const event=disturbances[Math.floor(Math.random()*disturbances.length)];pendingGust.current={at:now+550,force:event[1]*(1.25+Math.random()*.55)};setDisturbance(`${event[1]>0?'→':'←'} ${event[0]}`);setShockId(value=>value+1)}
    if(pendingGust.current&&now>=pendingGust.current.at){impulse.current+=pendingGust.current.force;pendingGust.current=null;nextShock.current=now+1050+Math.random()*1300}
    impulse.current*=Math.pow(.31,dt);leanRef.current+=(input.current*2.1+impulse.current+Math.sin(now/430)*.105)*dt;leanRef.current*=Math.pow(.72,dt);
    const tilt=Math.abs(leanRef.current),progressRate=tilt<.24?8.2:tilt<.52?5.4:tilt<.78?2.1:-2.8;crossRef.current=Math.max(0,crossRef.current+dt*progressRate);setLean(leanRef.current);setCrossing(crossRef.current);
    if(tilt>1.02){phaseRef.current='falling';setPhase('falling');fallElapsed.current=0;input.current=0;held.current.clear()}
    else if(crossRef.current>=100)complete('crossed');
   }else if(phaseRef.current==='falling'){fallElapsed.current+=dt;if(fallElapsed.current>=1.3)beginClimb()}
   else if(phaseRef.current==='climb'){gripRef.current=Math.max(0,gripRef.current-dt*(2.05+setbacks*.12));if(gripRef.current<=0){gripRef.current=42;climbRef.current=Math.max(0,climbRef.current-16);setSetbacks(value=>value+1);setClimbMessage('YOU SLIP—BUT A LOWER HOLD REMAINS')}setGrip(gripRef.current);setClimb(climbRef.current)}
   frame.current=requestAnimationFrame(tick);
  };
  frame.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame.current);
 },[beginClimb,complete,latest,publish,session.complete,session.controller,session.status,setbacks]);
 const steer=(direction:Hand,pressed:boolean)=>{
  const token='touch-'+direction;
  if(pressed&&session.controller.running&&!exhaustedRef.current&&phaseRef.current==='balance')held.current.add(token);else held.current.delete(token);
  updateInput();
 };
 const grab=(hand:Hand)=>{
  if(!session.controller.running||phaseRef.current!=='climb'||document.hidden||exhaustedRef.current)return;
  const now=clock.current;
  if(now-lastGrab.current<280){setClimbMessage('LET YOUR WEIGHT SETTLE BEFORE THE NEXT HOLD');return}
  lastGrab.current=now;
  if(hand===expectedRef.current){climbRef.current=Math.min(100,climbRef.current+7.7);gripRef.current=Math.min(100,gripRef.current+7);const next=hand==='left'?'right':'left';expectedRef.current=next;setExpected(next);setClimbMessage(climbRef.current>84?'REACH FOR THE RIM':climbRef.current>60?'REST WEIGHT ON WHAT HOLDS':climbRef.current>30?'ONE HOLD, THEN ANOTHER':'WEIGHT · GRIP · BREATH')}
  else{gripRef.current=Math.max(0,gripRef.current-14);climbRef.current=Math.max(0,climbRef.current-3);setClimbMessage('PANIC GRABS THE SAME SIDE—TRANSFER YOUR WEIGHT')}
  setGrip(gripRef.current);setClimb(climbRef.current);if(climbRef.current>=100)complete('recovered');
 };grabRef.current=grab;
 const begin=()=>{startedRef.current=true;setStarted(true)};
 const leanButton=(side:Hand)=>({
  onPointerDown:(event:React.PointerEvent<HTMLButtonElement>)=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);steer(side,true)},
  onPointerUp:()=>steer(side,false),onPointerCancel:()=>steer(side,false),onLostPointerCapture:()=>steer(side,false),onBlur:()=>steer(side,false),
  onKeyDown:(event:React.KeyboardEvent<HTMLButtonElement>)=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();steer(side,true)}},
  onKeyUp:(event:React.KeyboardEvent<HTMLButtonElement>)=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();steer(side,false)}},
  onClick:(event:React.MouseEvent<HTMLButtonElement>)=>{if(event.detail===0&&session.controller.running&&phaseRef.current==='balance')leanRef.current+=side==='left'?-.12:.12},
 });
 const gustDirection=pendingGust.current?.force??impulse.current;
 const steadiness=Math.max(0,Math.round(100-Math.abs(lean)*100)),edge=Math.abs(lean)>.76;
 if(exhausted)return <section className="chasm-minigame"><div className="chasm-result"><small>THE LANTERN NEEDS REST</small><h2>RETURN TO THE CANDLE</h2><p>The flame is spent. A sensible retreat is one more way of finding your footing. Gather concentration at the Red Dot Range; the next small step can wait.</p><button onClick={finish}>RETURN TO THE CHASM’S EDGE</button></div></section>;
 return <section className={`chasm-minigame phase-${phase} ${edge?'near-edge':''}`} data-activity-paused={!session.controller.running}><MinigameSessionControls session={session} title="THE CHASM OF DESPAIR" instructions="Hold ← / → or A / D to lean against the gusts; release to recover your balance. The buttons work the same way. If you fall, alternate left and right holds to climb out." meaning="A fall begins the recovery game, not a verdict on the traveler. Crossing and climbing use concentration; either completed journey brings learning." onLeave={finish} onBegin={begin}/><header><small>THE CHASM OF DESPAIR · {phase==='balance'?'THE CROSSING':phase==='climb'?'THE RETURN':'THE DEPTHS'}</small><h1>{phase==='climb'?'THE LONG WAY BACK':phase==='complete'?'THE FAR SIDE':'THE RICKETY BRIDGE'}</h1><p>{phase==='balance'?'The bridge need not be still. Answer each shove, then release the answer. Progress comes while balance is usable.':phase==='falling'?'The edge gives way. The story says this is forever. The story is wrong.':phase==='climb'?'Recovery is weight, rhythm, and the next available hold—not one heroic leap.':'The Chasm remains deep. It is no longer the whole map.'}</p></header>{phase==='balance'&&<><div className="chasm-crossing"><div className="chasm-sky"><i/><i/><i/></div><div className="chasm-wall left"/><div className="chasm-wall right"/><div className="despair-depth"><i/><i/><i/><b>NO BOTTOM<br/>VISIBLE</b></div><div className={`thought-gust ${gustDirection>0?'from-left':'from-right'}`} key={shockId}><i/><i/><i/></div><div className={`rope-span ${edge?'straining':''}`} style={{transform:`rotate(${lean*4.5}deg)`}}>{bridgePlanks}<div className="bridge-wizard" style={{left:`${8+crossing*.84}%`,transform:`translate(-50%,-60%) rotate(${lean*24}deg)`}}><i/><b/></div></div><div className={`disturbance ${gustDirection>0?'from-left':'from-right'}`} key={`words-${shockId}`}>{started?disturbance:'← / → · TAKE A FIRST STEP WHEN READY'}</div><div className="far-lantern">✦<span>FAR ANCHOR</span></div></div><div className="balance-status"><span>LEFT EDGE</span><div><em>USABLE BALANCE</em><i style={{left:`${50+lean*46}%`}}/></div><span>RIGHT EDGE</span></div><div className="crossing-readout"><div className="crossing-progress"><i style={{width:`${Math.min(100,crossing)}%`}}/><b>{Math.floor(Math.min(100,crossing))}% ACROSS</b></div><span className={edge?'danger':''}>{edge?'THE BRIDGE IS LOSING GROUND':steadiness>75?'BALANCE IS USABLE':steadiness>45?'ANSWER THE SHOVE':'RETURN TOWARD CENTRE'}</span></div><div className="chasm-controls"><button {...leanButton('left')}>◀ LEAN LEFT</button><button {...leanButton('right')}>LEAN RIGHT ▶</button></div></>}{phase==='falling'&&<div className="chasm-fall"><div className="falling-wizard"><i/><b/></div><span>THE BRIDGE SHRINKS ABOVE</span><i/><i/><i/><b>FALLING IS AN EVENT.<br/>“NO RETURN” IS A THOUGHT.</b></div>}{phase==='climb'&&<><div className="pit-climb"><div className="rim-light">THE WORLD ABOVE</div>{holds.map((hold,index)=><i key={index} className={`${hold.side} ${Math.abs(index-climb/7.7)<1.3?'next':''}`} style={{top:`${hold.top}%`,left:`${hold.left}%`}}><b/></i>)}<div className="climbing-wizard" style={{bottom:`${4+climb*.78}%`}}><i className={expected==='left'?'reach-left':'reach-right'}/><b/><em/></div><div className="despair-echo">{climbMessage}</div></div><div className="climb-hud"><span>GRIP</span><div><i style={{width:`${grip}%`}}/></div><b>{Math.round(climb)}% UP · {setbacks} SLIPS</b></div><div className="climb-controls"><button className={expected==='left'?'needed':''} onClick={()=>grab('left')}>A / ◀ · LEFT HOLD</button><button className={expected==='right'?'needed':''} onClick={()=>grab('right')}>RIGHT HOLD · ▶ / D</button></div></>}{phase==='complete'&&<div className="chasm-result"><small>{outcome==='recovered'?'RECOVERY COMPLETE':'CROSSING COMPLETE'}</small><h2>{outcome==='recovered'?'THE PIT RETURNS YOU TO THE MAP':'BALANCE FINDS THE FAR ANCHOR'}</h2><p>{outcome==='recovered'?'You did not escape in one glorious leap. You returned by finding one hold, transferring weight, and trusting the next small action.':'The disturbances never stopped. You crossed by answering each shove without becoming it.'}</p><button onClick={finish}>STEP BACK INTO THE MISTS</button></div>}<div className="activity-resource"><span>CONCENTRATION</span><meter min="0" max="100" value={latest.current.concentration}/><b>{Math.floor(latest.current.concentration)}</b></div><button className="leave-chasm" onClick={()=>{onChange({...latest.current});onExit()}}>RETREAT FROM THE CHASM</button></section>;
}
