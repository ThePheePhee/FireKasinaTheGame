import {useEffect,useId,useRef} from 'react';
import type {MinigameSession} from '../game/useMinigameSession';
import './MinigameSessionControls.css';

export default function MinigameSessionControls({session,title,instructions,meaning,onLeave,onBegin}: {
 session:MinigameSession;title:string;instructions:string;meaning:string;onLeave:()=>void;onBegin?:()=>void;
}){
 const ref=useRef<HTMLDivElement>(null),titleId=useId(),overlay=session.status==='ready'||session.status==='paused';
 useEffect(()=>{
  if(!overlay)return;
  const element=ref.current,previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const siblings=Array.from(element?.parentElement?.children??[]).filter(child=>child!==element) as HTMLElement[];
  const before=siblings.map(child=>child.inert);siblings.forEach(child=>{child.inert=true});
  element?.querySelector<HTMLElement>('.session-primary')?.focus({preventScroll:true});
  const trap=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const buttons=Array.from(element?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]),index=buttons.indexOf(document.activeElement as HTMLButtonElement);
   if(event.shiftKey&&index<=0){event.preventDefault();buttons[buttons.length-1]?.focus()}
   else if(!event.shiftKey&&(index<0||index===buttons.length-1)){event.preventDefault();buttons[0]?.focus()}
  };
  window.addEventListener('keydown',trap,true);
  return()=>{siblings.forEach((child,index)=>{child.inert=before[index]});window.removeEventListener('keydown',trap,true);if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[overlay,session.status]);
 if(session.status==='done'||session.status==='closed')return null;
 return <div ref={ref} className={`minigame-session ${overlay?'session-overlay':'session-toolbar'}`}>
  {overlay?<section className="session-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
   <small>{session.status==='ready'?'AT THE THRESHOLD':'THE GAME IS PAUSED'}</small><h2 id={titleId}>{title}</h2>
   <p>{session.status==='ready'?instructions:'Nothing moves and no concentration is spent while you rest. Resume when you are ready.'}</p>
   <p className="session-meaning">{meaning}</p>
   <div><button type="button" className="session-primary" onClick={()=>{const firstStep=session.status==='ready';session.begin();if(firstStep)onBegin?.()}}>{session.status==='ready'?'BEGIN':'RESUME'}</button><button type="button" onClick={onLeave}>LEAVE THIS ENCOUNTER</button></div>
   <small>ESC / P · PAUSE OR RESUME<br/>CHANGING TABS PAUSES THE GAME</small>
  </section>:<button type="button" className="session-pause" onClick={session.pause}>Ⅱ PAUSE <span>ESC / P</span></button>}
 </div>;
}
