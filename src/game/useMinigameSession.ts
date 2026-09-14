import {useCallback,useEffect,useRef,useState} from 'react';
import {activityKey,createActivitySession} from './activitySession';
import type {GameStats} from './gameState';

export function useMinigameSession(clearInput:()=>void){
 const [controller]=useState(createActivitySession),[status,setStatus]=useState(controller.phase);
 const clear=useRef(clearInput);clear.current=clearInput;
 const begin=useCallback(()=>setStatus(controller.begin()),[controller]);
 const pause=useCallback(()=>{clear.current();setStatus(controller.pause())},[controller]);
 const complete=useCallback(()=>{clear.current();setStatus(controller.complete())},[controller]);
 const retry=useCallback(()=>{clear.current();setStatus(controller.retry())},[controller]);
 const exit=useCallback((leave:()=>void)=>{if(!controller.close())return;clear.current();setStatus(controller.phase);leave()},[controller]);
 useEffect(()=>{
  const key=(event:KeyboardEvent)=>{
   const pressed=activityKey(event);
   if(event.repeat||!['Escape','p'].includes(pressed??'')||controller.phase==='done'||controller.phase==='closed')return;
   event.preventDefault();event.stopImmediatePropagation();
   if(controller.running)pause();else if(controller.phase==='paused')begin();
  };
  const hidden=()=>{if(document.hidden)pause()};
  window.addEventListener('keydown',key,true);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',hidden);
  return()=>{window.removeEventListener('keydown',key,true);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',hidden);clear.current()};
 },[begin,controller,pause]);
 return {controller,status,begin,pause,complete,retry,exit};
}
export type MinigameSession=ReturnType<typeof useMinigameSession>;

/** Keep sub-frame progress when a parent echoes our last published snapshot. */
export function useMinigameStats(stats:GameStats,onChange:(stats:GameStats)=>void){
 const latest=useRef({...stats}),incoming=useRef(stats),published=useRef<GameStats|null>(null),callback=useRef(onChange);
 callback.current=onChange;
 if(incoming.current!==stats){
  incoming.current=stats;
  if(!published.current||Object.keys(stats).some(key=>stats[key as keyof GameStats]!==published.current![key as keyof GameStats]))latest.current={...stats};
 }
 const publish=useCallback(()=>{const next={...latest.current};published.current=next;callback.current(next)},[]);
 return {latest,publish};
}
