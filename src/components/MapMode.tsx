import {useEffect,useRef,useState} from 'react';
import {mapRegions,type Region} from '../data/mapRegions';
import {fitMap,constrainMap,worldToScreen,zoomMap,type ScreenSize} from '../engine/mapViewport';
import {regionExtent} from '../engine/regionGeometry';
import type {View} from '../engine/camera';
import {drawMap} from '../rendering/drawMap';
import {drawVignette} from '../rendering/drawUI';
import {onPixelArtReady} from '../rendering/pixelArtAssets';
import './MapMode.css';

type Gesture={kind:'idle'|'possible-tap'|'pan'|'pinch';points:Map<number,{x:number;y:number}>;startPoint:{x:number;y:number};startView:View|null;startDistance:number;anchorWorld:{x:number;y:number}};
const idleGesture=():Gesture=>({kind:'idle',points:new Map(),startPoint:{x:0,y:0},startView:null,startDistance:0,anchorWorld:{x:0,y:0}});

export default function MapMode({onSelect}:{onSelect:(region:Region|null)=>void}){
 const containerRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),gesture=useRef<Gesture>(idleGesture()),suppressClick=useRef(false);
 const [size,setSize]=useState<ScreenSize>({width:1,height:1}),[viewport,setViewport]=useState<View>({x:0,y:0,scale:1}),[artRevision,setArtRevision]=useState(0);

 useEffect(()=>{const container=containerRef.current;if(!container)return;const observer=new ResizeObserver(([entry])=>{const width=entry.contentRect.width,height=entry.contentRect.height;if(width&&height){const next={width,height};setSize(next);setViewport(fitMap(next))}});observer.observe(container);return()=>observer.disconnect()},[]);
 useEffect(()=>onPixelArtReady(()=>setArtRevision(revision=>revision+1)),[]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas||size.width<=1)return;const d=devicePixelRatio||1;canvas.width=Math.round(size.width*d);canvas.height=Math.round(size.height*d);const ctx=canvas.getContext('2d')!;ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,size.width,size.height);ctx.save();ctx.scale(viewport.scale,viewport.scale);ctx.translate(-viewport.x,-viewport.y);drawMap(ctx,true);ctx.restore();drawVignette(ctx,size.width,size.height)},[size,viewport,artRevision]);

 const localPoint=(clientX:number,clientY:number)=>{const rect=containerRef.current!.getBoundingClientRect();return{x:clientX-rect.left,y:clientY-rect.top}};
 const onPointerDown=(event:React.PointerEvent<HTMLDivElement>)=>{if((event.target as HTMLElement).closest('.map-tools'))return;const point=localPoint(event.clientX,event.clientY),state=gesture.current;state.points.set(event.pointerId,point);if(state.points.size===1){state.kind='possible-tap';state.startPoint=point;state.startView={...viewport};suppressClick.current=false}else if(state.points.size===2){for(const id of state.points.keys())event.currentTarget.setPointerCapture(id);const [a,b]=[...state.points.values()],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};state.kind='pinch';state.startView={...viewport};state.startDistance=Math.hypot(a.x-b.x,a.y-b.y);state.anchorWorld={x:viewport.x+center.x/viewport.scale,y:viewport.y+center.y/viewport.scale};suppressClick.current=true}};
 const onPointerMove=(event:React.PointerEvent<HTMLDivElement>)=>{const state=gesture.current;if(!state.points.has(event.pointerId))return;const point=localPoint(event.clientX,event.clientY);state.points.set(event.pointerId,point);if(state.kind==='possible-tap'&&Math.hypot(point.x-state.startPoint.x,point.y-state.startPoint.y)>10){state.kind='pan';event.currentTarget.setPointerCapture(event.pointerId);suppressClick.current=true}if(state.kind==='pan'&&state.startView){setViewport(constrainMap({...state.startView,x:state.startView.x-(point.x-state.startPoint.x)/state.startView.scale,y:state.startView.y-(point.y-state.startPoint.y)/state.startView.scale},size))}else if(state.kind==='pinch'&&state.startView&&state.points.size===2){const [a,b]=[...state.points.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(state.startDistance>0){const scale=state.startView.scale*distance/state.startDistance;setViewport(constrainMap({x:state.anchorWorld.x-center.x/scale,y:state.anchorWorld.y-center.y/scale,scale},size))}}};
 const finishPointer=(event:React.PointerEvent<HTMLDivElement>)=>{const state=gesture.current;if(!state.points.has(event.pointerId))return;state.points.delete(event.pointerId);if(state.kind!=='possible-tap')suppressClick.current=true;if(state.points.size===0){gesture.current=idleGesture();window.setTimeout(()=>{suppressClick.current=false},0)}};
 const selectRegion=(event:React.MouseEvent,region:Region)=>{event.stopPropagation();if(!suppressClick.current)onSelect(region)};
 const changeZoom=(factor:number)=>setViewport(current=>zoomMap(current,factor,size.width/2,size.height/2,size));

 return <div ref={containerRef} className="map-mode" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishPointer} onPointerCancel={finishPointer} onClick={event=>{if(!suppressClick.current&&(event.target===event.currentTarget||event.target===canvasRef.current))onSelect(null)}}>
  <canvas ref={canvasRef}/>
  <div className="path-legend" aria-label="Path families"><span><i className="generation"/>GENERATION</span><span><i className="deconstruction"/>DECONSTRUCTION</span><span><i className="balance"/>BALANCE / EXPLORATION</span></div>
  <div className="region-layer" aria-label="Map regions">{mapRegions.map(region=>{const point=worldToScreen(viewport,region.x,region.y),extent=regionExtent(region),diameter=Math.max(44,extent*2*viewport.scale),clipPath=region.shape.kind==='polygon'?`polygon(${region.shape.points.map(([x,y])=>`${(x/extent+1)*50}% ${(y/extent+1)*50}%`).join(',')})`:undefined;return <button key={region.id} className="map-region-hit" style={{left:point.x,top:point.y,width:diameter,height:diameter,zIndex:region.layer*1000+1000-Math.round(extent),clipPath}} aria-label={`Open ${region.name}`} title={region.name} onClick={event=>selectRegion(event,region)}/>})}</div>
  <div className="map-tools" aria-label="Map zoom controls"><button aria-label="Zoom in" onClick={()=>changeZoom(1.5)}>+</button><button aria-label="Zoom out" onClick={()=>changeZoom(1/1.5)}>−</button><button aria-label="Reset map view" onClick={()=>setViewport(fitMap(size))}>⌂</button></div>
 </div>;
}
