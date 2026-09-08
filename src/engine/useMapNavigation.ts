import {useEffect,useRef,useState,type RefObject,type PointerEvent as ReactPointerEvent,type MouseEvent as ReactMouseEvent} from 'react';
import type {View} from './camera';
import {MapGesture} from './mapGestures';
import {fitMap,resizeMap,zoomMap,type MapBounds,type ScreenSize} from './mapViewport';

export function useMapNavigation(container:RefObject<HTMLDivElement|null>,bounds:MapBounds,onActivate:(target:string)=>void){
 const [size,setSize]=useState<ScreenSize>({width:1,height:1}),[viewport,setViewport]=useState<View>({x:0,y:0,scale:1});
 const current=useRef({size,viewport,bounds,onActivate}),gesture=useRef(new MapGesture());
 current.current={size,viewport,bounds,onActivate};
 const update=(view:View)=>{current.current.viewport=view;setViewport(view)};
 useEffect(()=>{
  const element=container.current;if(!element)return;
  const observer=new ResizeObserver(([entry])=>{const next={width:entry.contentRect.width,height:entry.contentRect.height};if(next.width<=0||next.height<=0)return;const state=current.current;const view=resizeMap(state.viewport,state.size,next,state.bounds);current.current={...state,size:next,viewport:view};setSize(next);setViewport(view);gesture.current.cancel()});
  observer.observe(element);
  const wheel=(event:WheelEvent)=>{if((event.target as HTMLElement).closest('.map-tools'))return;event.preventDefault();const rect=element.getBoundingClientRect(),state=current.current,delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?state.size.height:1);update(zoomMap(state.viewport,Math.exp(-Math.max(-150,Math.min(150,delta))*.002),event.clientX-rect.left,event.clientY-rect.top,state.size,state.bounds))};
  const cancel=()=>gesture.current.cancel();
  element.addEventListener('wheel',wheel,{passive:false});window.addEventListener('blur',cancel);
  return()=>{observer.disconnect();element.removeEventListener('wheel',wheel);window.removeEventListener('blur',cancel)};
 },[container,bounds.width,bounds.height]);
 const local=(event:ReactPointerEvent)=>{const rect=container.current!.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top}};
 const finish=(event:ReactPointerEvent<HTMLDivElement>,cancel=false)=>{
  const state=current.current;
  // Apply the final position even when the browser coalesces the last move.
  if(!cancel){const view=gesture.current.move(event.pointerId,local(event),state.size,state.bounds);if(view)update(view)}
  const target=gesture.current.up(event.pointerId,current.current.viewport,cancel);
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  if(target)current.current.onActivate(target);
 };
 return{size,viewport,reset:()=>update(fitMap(current.current.size,current.current.bounds)),zoom:(factor:number)=>{const state=current.current;update(zoomMap(state.viewport,factor,state.size.width/2,state.size.height/2,state.size,state.bounds))},bindings:{
  onPointerDown:(event:ReactPointerEvent<HTMLDivElement>)=>{if(event.button!==0||(event.target as HTMLElement).closest('.map-tools'))return;const target=(event.target as HTMLElement).closest<HTMLElement>('[data-map-target]')?.dataset.mapTarget??'clear';gesture.current.down(event.pointerId,local(event),current.current.viewport,target);event.currentTarget.setPointerCapture(event.pointerId)},
  onPointerMove:(event:ReactPointerEvent<HTMLDivElement>)=>{const state=current.current,view=gesture.current.move(event.pointerId,local(event),state.size,state.bounds);if(view)update(view)},
  onPointerUp:(event:ReactPointerEvent<HTMLDivElement>)=>finish(event),
  onPointerCancel:(event:ReactPointerEvent<HTMLDivElement>)=>finish(event,true),
  onLostPointerCapture:(event:ReactPointerEvent<HTMLDivElement>)=>gesture.current.up(event.pointerId,current.current.viewport,true),
  onClickCapture:(event:ReactMouseEvent<HTMLDivElement>)=>{if(event.detail>0&&!(event.target as HTMLElement).closest('.map-tools')){event.preventDefault();event.stopPropagation()}},
 }};
}
