import {useEffect,useMemo,useRef,useState} from 'react';
import {mapRegions,WORLD,type Region} from '../data/mapRegions';
import {routes,type Route,type RouteFamily} from '../data/routes';
import {pathContent} from '../data/pathContent';
import {mapProps,type MapProp} from '../data/mapProps';
import {regionVisuals} from '../data/regionVisuals';
import {worldToScreen} from '../engine/mapViewport';
import {useMapNavigation} from '../engine/useMapNavigation';
import {regionExtent} from '../engine/regionGeometry';
import {isCompactRouteOverview,layoutLocationLabels,layoutRouteLabels,type LabelBox} from '../engine/routeLabels';
import {drawMap} from '../rendering/drawMap';
import {drawVignette} from '../rendering/drawUI';
import {onPixelArtReady} from '../rendering/pixelArtAssets';
import './MapMode.css';

const families:Array<{id:RouteFamily;name:string;hint:string}>=[
 {id:'generation',name:'Generation',hint:'Light, form & intention'},
 {id:'deconstruction',name:'Deconstruction',hint:'Unmaking & stillness'},
 {id:'balance',name:'Balance & exploration',hint:'Care, company & the middle way'},
 {id:'connection',name:'Connecting roads',hint:'Passages between discoveries'},
];

export default function MapMode({onSelectRegion,onSelectRoute,onSelectProp,onClear,selectedRouteId}:{onSelectRegion:(region:Region)=>void;onSelectRoute:(route:Route)=>void;onSelectProp:(prop:MapProp)=>void;onClear:()=>void;selectedRouteId?:string|null}){
 const containerRef=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),guideToggleRef=useRef<HTMLButtonElement>(null),guideCloseRef=useRef<HTMLButtonElement>(null);
 const [artRevision,setArtRevision]=useState(0),[showNames,setShowNames]=useState(true),[indexOpen,setIndexOpen]=useState(false),[localRoute,setLocalRoute]=useState<string|null>(null);
 const selectedId=selectedRouteId===undefined?localRoute:selectedRouteId;
 const chooseRoute=(route:Route)=>{setLocalRoute(route.id);setIndexOpen(false);onSelectRoute(route)};
 const activate=(target:string)=>{
  const [kind,id]=target.split(':');
  if(kind==='region'){const region=mapRegions.find(item=>item.id===id);if(region){setLocalRoute(null);onSelectRegion(region)}}
  else if(kind==='route'){const route=routes.find(item=>item.id===id);if(route)chooseRoute(route)}
  else if(kind==='prop'){const prop=mapProps.find(item=>item.id===id);if(prop){setLocalRoute(null);onSelectProp(prop)}}
  else{setLocalRoute(null);onClear()}
 };
 const {size,viewport,bindings,zoom,reset}=useMapNavigation(containerRef,WORLD,activate);
 const compact=size.width<760;
 const overview=isCompactRouteOverview(viewport,size,compact,WORLD);
 const closeGuide=()=>{setIndexOpen(false);guideToggleRef.current?.focus()};
 const propLabelBounds=useMemo(()=>mapProps.map(prop=>{const point=worldToScreen(viewport,prop.x,prop.y),width=prop.size*viewport.scale;return{x:point.x-width/2,y:point.y-width/2,width,height:width}}),[viewport]);
 const locationLabels=useMemo(()=>layoutLocationLabels(mapRegions,regionVisuals,viewport,propLabelBounds,size),[viewport,propLabelBounds,size]);
 const labels=useMemo(()=>{
  if(!showNames)return[];
  const obstacles:LabelBox[]=mapRegions.flatMap(region=>{
   const visual=regionVisuals[region.id]??{},[ax,ay]=visual.artOffset??[0,0],artSize=(visual.artSize??0)*viewport.scale;
   const art=worldToScreen(viewport,region.x+ax,region.y+ay);
   return artSize?[{x:art.x-artSize/2,y:art.y-artSize/2,width:artSize,height:artSize}]:[];
  });
  obstacles.push(...locationLabels);
  obstacles.push(...propLabelBounds);
  obstacles.push({x:0,y:size.height-100,width:compact?240:365,height:100},{x:size.width-76,y:size.height-194,width:76,height:194});
  return layoutRouteLabels(routes,viewport,size,obstacles,compact,selectedId,WORLD);
 },[showNames,viewport,size,compact,selectedId,locationLabels,propLabelBounds]);

 useEffect(()=>onPixelArtReady(()=>setArtRevision(revision=>revision+1)),[]);
 useEffect(()=>{
  if(!indexOpen)return;
  guideCloseRef.current?.focus();
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeGuide()}};
  window.addEventListener('keydown',close,true);return()=>window.removeEventListener('keydown',close,true);
 },[indexOpen]);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas||size.width<=1)return;
  const d=Math.min(devicePixelRatio||1,2),width=Math.round(size.width*d),height=Math.round(size.height*d);
  if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
  const ctx=canvas.getContext('2d')!;ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,size.width,size.height);
  ctx.save();ctx.scale(viewport.scale,viewport.scale);ctx.translate(-viewport.x,-viewport.y);drawMap(ctx,false);
  const selected=routes.find(route=>route.id===selectedId);
  if(selected){ctx.save();ctx.lineWidth=3/viewport.scale;ctx.strokeStyle='#fff0a8';ctx.globalAlpha=.85;ctx.setLineDash([5/viewport.scale,7/viewport.scale]);ctx.lineJoin='round';ctx.beginPath();selected.points.forEach(([x,y],index)=>index?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore()}
  ctx.restore();drawVignette(ctx,size.width,size.height,.14);
 },[size,viewport,artRevision,selectedId]);

 return <div className="map-explorer">
  <div ref={containerRef} className="map-mode" {...bindings}>
   <canvas ref={canvasRef} aria-hidden="true"/>
   <div className="region-layer" aria-label="Map regions">{mapRegions.map(region=>{
    const point=worldToScreen(viewport,region.x,region.y),extent=regionExtent(region),diameter=Math.max(44,extent*2*viewport.scale);
    const polygon=region.shape.kind==='polygon',clipPath=region.shape.kind==='polygon'?`polygon(${region.shape.points.map(([x,y])=>`${(x/extent+1)*50}% ${(y/extent+1)*50}%`).join(',')})`:undefined;
    return <button type="button" key={region.id} data-map-target={`region:${region.id}`} className="map-region-hit" style={{left:point.x,top:point.y,width:diameter,height:diameter,zIndex:region.layer*1000+Math.max(1,1000-Math.round(extent)),clipPath,borderRadius:polygon?0:undefined}} aria-label={`Open ${region.name}`} title={region.name} onClick={()=>activate(`region:${region.id}`)}/>;
   })}</div>
   <div className="map-label-layer" aria-hidden="true">{locationLabels.map(label=><button type="button" key={label.region.id} tabIndex={-1} data-map-target={`region:${label.region.id}`} className={`map-location-label ${label.broad?'broad':''}`} title={label.region.name} style={{left:label.x,top:label.y,width:label.width,height:label.height,fontSize:label.fontSize,lineHeight:`${label.lineHeight}px`}} onClick={()=>activate(`region:${label.region.id}`)}>{label.lines.map((line,index)=><span key={index}>{line}</span>)}</button>)}</div>
   <div className="route-layer" aria-label="Named map paths">
    <svg className="route-sign-stems" width={size.width} height={size.height} aria-hidden="true">{labels.map(label=><g key={label.route.id}><path d={`M ${label.anchor.x} ${label.anchor.y} H ${label.stem.x} V ${label.stem.y}`}/><rect x={label.anchor.x-2} y={label.anchor.y-2} width="4" height="4"/></g>)}</svg>
    {labels.map(label=><button type="button" key={label.route.id} data-map-target={`route:${label.route.id}`} className={`map-road-sign ${label.route.family} ${selectedId===label.route.id?'selected':''}`} style={{left:label.x,top:label.y,width:label.width,height:label.height}} aria-label={`Read about ${label.route.name}`} onClick={()=>chooseRoute(label.route)}>{label.lines.map((line,index)=><span key={index}>{line}</span>)}</button>)}
   </div>
   <div className="prop-layer" aria-label="Curious map objects">{mapProps.map(prop=>{const point=worldToScreen(viewport,prop.x,prop.y),hitSize=Math.max(44,prop.size*viewport.scale);return <button type="button" key={prop.id} data-map-target={`prop:${prop.id}`} className="map-prop-hit" style={{left:point.x,top:point.y,width:hitSize,height:hitSize}} aria-label={`Inspect ${prop.name}`} title={prop.name} onClick={()=>activate(`prop:${prop.id}`)}/>})}</div>
   <div className="map-tools" aria-label="Map zoom controls"><button type="button" aria-label="Zoom in" onClick={()=>zoom(1.5)}>+</button><button type="button" aria-label="Zoom out" onClick={()=>zoom(1/1.5)}>−</button><button type="button" aria-label="Reset map view" onClick={reset}>⌂</button></div>
  </div>
  <div className="map-route-guide">
   {compact&&<p className="map-explore-hint">{!showNames?'Path labels hidden · All names below':overview?'Zoom in for more path names':'Tap a path name to read its story'}</p>}
   {indexOpen&&<section className="map-route-index" id="map-route-index" aria-labelledby="map-route-index-title">
    <header><div><small>THE WAYFARER’S GUIDE</small><h2 id="map-route-index-title">All {routes.length} named paths</h2></div><button ref={guideCloseRef} type="button" aria-label="Close named paths" onClick={closeGuide}>×</button></header>
    <p>Every road is here, even when its sign is hidden. Choose a name to trace the path and read its story.</p>
    <div className="route-index-scroll">{families.map(family=><section key={family.id} className={family.id}><h3><i/>{family.name}</h3><p>{family.hint}</p>{routes.filter(route=>route.family===family.id).map(route=><button type="button" key={route.id} aria-current={selectedId===route.id?'true':undefined} onClick={()=>{reset();setShowNames(true);chooseRoute(route)}}><span><strong>{route.name}</strong><small>{pathContent[route.id]?.journey}</small></span><b aria-hidden="true">↗</b></button>)}</section>)}</div>
   </section>}
   <div className="route-guide-controls"><button ref={guideToggleRef} type="button" className="route-guide-toggle" aria-label={`Named paths: browse all ${routes.length} roads`} aria-expanded={indexOpen} aria-controls="map-route-index" onClick={()=>setIndexOpen(value=>!value)}><span aria-hidden="true">☷</span> NAMED PATHS <b>{routes.length}</b><span aria-hidden="true">{indexOpen?'▾':'▴'}</span></button><button type="button" className="route-names-toggle" aria-label="Show path names on the map" aria-pressed={showNames} onClick={()=>setShowNames(value=>!value)}>LABELS {showNames?'ON':'OFF'}</button></div>
   <div className="path-legend" aria-label="Path families"><span><i className="generation"/>Generation</span><span><i className="deconstruction"/>Deconstruction</span><span><i className="balance"/>Balance</span></div>
  </div>
 </div>;
}
