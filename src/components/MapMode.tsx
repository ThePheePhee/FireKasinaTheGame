import {useEffect,useRef,useState} from 'react';
import {mapRegions,WORLD,type Region} from '../data/mapRegions';
import {routes,type Route} from '../data/routes';
import {mapProps,type MapProp} from '../data/mapProps';
import {regionVisuals} from '../data/regionVisuals';
import {worldToScreen} from '../engine/mapViewport';
import {useMapNavigation} from '../engine/useMapNavigation';
import {regionExtent} from '../engine/regionGeometry';
import {drawMap} from '../rendering/drawMap';
import {drawVignette} from '../rendering/drawUI';
import {onPixelArtReady} from '../rendering/pixelArtAssets';
import './MapMode.css';

export default function MapMode({onSelectRegion,onSelectRoute,onSelectProp,onClear}:{onSelectRegion:(region:Region)=>void;onSelectRoute:(route:Route)=>void;onSelectProp:(prop:MapProp)=>void;onClear:()=>void}){
 const containerRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null);
 const [artRevision,setArtRevision]=useState(0);
 const activate=(target:string)=>{
  const [kind,id]=target.split(':');
  if(kind==='region'){const region=mapRegions.find(item=>item.id===id);if(region)onSelectRegion(region)}
  else if(kind==='route'){const route=routes.find(item=>item.id===id);if(route)onSelectRoute(route)}
  else if(kind==='prop'){const prop=mapProps.find(item=>item.id===id);if(prop)onSelectProp(prop)}
  else onClear();
 };
 const {size,viewport,bindings,zoom,reset}=useMapNavigation(containerRef,WORLD,activate);
 useEffect(()=>onPixelArtReady(()=>setArtRevision(revision=>revision+1)),[]);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas||size.width<=1)return;
  const d=Math.min(devicePixelRatio||1,2),width=Math.round(size.width*d),height=Math.round(size.height*d);
  if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
  const ctx=canvas.getContext('2d')!;ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,size.width,size.height);
  ctx.save();ctx.scale(viewport.scale,viewport.scale);ctx.translate(-viewport.x,-viewport.y);drawMap(ctx,true);ctx.restore();drawVignette(ctx,size.width,size.height);
 },[size,viewport,artRevision]);

 return <div ref={containerRef} className="map-mode" {...bindings}>
  <canvas ref={canvasRef} aria-hidden="true"/>
  <div className="path-legend" aria-label="Path families"><span><i className="generation"/>GENERATION</span><span><i className="deconstruction"/>DECONSTRUCTION</span><span><i className="balance"/>BALANCE / EXPLORATION</span></div>
  <div className="region-layer" aria-label="Map regions">{mapRegions.map(region=>{
   const point=worldToScreen(viewport,region.x,region.y),extent=regionExtent(region),diameter=Math.max(44,extent*2*viewport.scale);
   const polygon=region.shape.kind==='polygon',clipPath=region.shape.kind==='polygon'?`polygon(${region.shape.points.map(([x,y])=>`${(x/extent+1)*50}% ${(y/extent+1)*50}%`).join(',')})`:undefined;
   return <button type="button" key={region.id} data-map-target={`region:${region.id}`} className="map-region-hit" style={{left:point.x,top:point.y,width:diameter,height:diameter,zIndex:region.layer*1000+Math.max(1,1000-Math.round(extent)),clipPath,borderRadius:polygon?0:undefined}} aria-label={`Open ${region.name}`} title={region.name} onClick={()=>onSelectRegion(region)}/>;
  })}</div>
  <div className="map-label-layer" aria-hidden="true">{mapRegions.map(region=>{const visual=regionVisuals[region.id],lines=visual?.labelLines??[region.name],[offsetX,offsetY]=visual?.labelOffset??[0,75],point=worldToScreen(viewport,region.x+offsetX,region.y+offsetY),width=(Math.max(...lines.map(line=>line.length))*(visual?.labelSize??16)*.62+8)*viewport.scale,height=lines.length*18*viewport.scale;return <button type="button" key={region.id} tabIndex={-1} data-map-target={`region:${region.id}`} className="map-label-hit" title={region.name} style={{left:point.x,top:point.y+height/2,width:Math.max(32,width),height:Math.max(18,height)}} onClick={()=>onSelectRegion(region)}/>})}</div>
  <div className="route-layer" aria-label="Map paths">{routes.map(route=>{const point=worldToScreen(viewport,...route.labelAt);return <button type="button" key={route.id} data-map-target={`route:${route.id}`} data-route-name={route.name} className={`map-route-hit ${route.family}`} style={{left:point.x,top:point.y}} aria-label={`Open ${route.name}`} onClick={()=>onSelectRoute(route)}>{route.name}</button>})}</div>
  <div className="prop-layer" aria-label="Curious map objects">{mapProps.map(prop=>{const point=worldToScreen(viewport,prop.x,prop.y),hitSize=Math.max(44,prop.size*viewport.scale);return <button type="button" key={prop.id} data-map-target={`prop:${prop.id}`} className="map-prop-hit" style={{left:point.x,top:point.y,width:hitSize,height:hitSize}} aria-label={`Inspect ${prop.name}`} title={prop.name} onClick={()=>onSelectProp(prop)}/>})}</div>
  <div className="map-tools" aria-label="Map zoom controls"><button type="button" aria-label="Zoom in" onClick={()=>zoom(1.5)}>+</button><button type="button" aria-label="Zoom out" onClick={()=>zoom(1/1.5)}>−</button><button type="button" aria-label="Reset map view" onClick={reset}>⌂</button></div>
 </div>;
}
