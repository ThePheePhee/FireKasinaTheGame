import type {InteriorFloor,InteriorMap,InteriorNpc} from '../data/interiorMaps';
import type {View} from '../engine/camera';
import {downStairs,upStairs} from '../engine/interiorNavigation';
import {worldToScreen,type MapBounds,type ScreenSize} from '../engine/mapViewport';

export interface InteriorCaption {id:string;name:string;x:number;y:number;kind:'place'|'traveller'|'stairs'|'exit';art?:CaptionExclusion}
export interface InteriorCaptionBox {caption:InteriorCaption;x:number;y:number;width:number;height:number;lines:string[];fontSize:number;lineHeight:number;anchor:{x:number;y:number}}
export interface CaptionNpc {data:InteriorNpc;x:number;y:number}
export interface CaptionExclusion {x:number;y:number;width:number;height:number}

/** Keep captions out of cached artwork: the same world anchor serves walking and fit-map views. */
export function interiorCaptions(map:InteriorMap,floor:InteriorFloor,floorIndex:number,npcs?:CaptionNpc[]):InteriorCaption[]{
 const result:InteriorCaption[]=floor.zones.map(zone=>{
  const size=floor.environment==='library'?285:floor.environment==='tavern'?205:Math.min(zone.w,zone.h)*.78;
  return{id:zone.id,name:zone.name,x:zone.x,y:floor.environment==='library'?zone.y+158:zone.y+zone.h*.42,kind:'place',art:{x:zone.x-size/2,y:zone.y-size/2-(floor.environment?0:10),width:size,height:size}};
 });
 for(const npc of npcs??(floor.npcs??[]).map(data=>({data,x:data.x,y:data.y})))result.push({id:`npc-${npc.data.id}`,name:npc.data.name,x:npc.x,y:npc.y+44,kind:'traveller',art:{x:npc.x-36,y:npc.y-49,width:72,height:76}});
 if(floorIndex===0)result.push({id:'exit',name:'MAIN MAP',x:floor.spawn[0],y:floor.height-35,kind:'exit'});
 else{const [x,y]=downStairs(floor);result.push({id:'stairs-down',name:'▼ PREVIOUS FLOOR',x,y:y+80,kind:'stairs',art:{x:x-63,y:y-63,width:126,height:126}})}
 if(floorIndex<map.floors.length-1){const [x,y]=upStairs(floor);result.push({id:'stairs-up',name:'▲ NEXT FLOOR',x,y:y+80,kind:'stairs',art:{x:x-63,y:y-63,width:126,height:126}})}
 return result;
}

function wrapName(name:string,maxCharacters:number):string[]{
 const lines:string[]=[];let line='';
 for(const word of name.split(/\s+/)){
  if(line&&line.length+1+word.length>maxCharacters){lines.push(line);line=word}
  else line=line?`${line} ${word}`:word;
 }
 if(line)lines.push(line);
 return lines;
}
const overlaps=(a:CaptionExclusion,b:CaptionExclusion,padding=3)=>a.x<b.x+b.width+padding&&a.x+a.width+padding>b.x&&a.y<b.y+b.height+padding&&a.y+a.height+padding>b.y;

/** Screen-pixel typography never shrinks with the floor atlas or inherits a world painter's baseline. */
export function layoutInteriorCaptions(captions:InteriorCaption[],view:View,size:ScreenSize,reserved:CaptionExclusion[]=[],bounds?:MapBounds):InteriorCaptionBox[]{
 if(size.width<80||size.height<80||!Number.isFinite(view.scale)||view.scale<=0)return[];
 const compact=size.width<700,fontSize=compact?12:13,lineHeight=fontSize+5,charWidth=fontSize*.63,padding=6;
 const start=bounds?worldToScreen(view,0,0):{x:0,y:0},end=bounds?worldToScreen(view,bounds.width,bounds.height):{x:size.width,y:size.height};
 const limits={left:Math.max(4,start.x+4),top:Math.max(4,start.y+4),right:Math.min(size.width-4,end.x-4),bottom:Math.min(size.height-4,end.y-4)};
 const maximumDrift=compact&&view.scale<.6?40:112;
 const anchors=captions.map(caption=>({caption,anchor:worldToScreen(view,caption.x,caption.y)}));
 const art=captions.flatMap(caption=>{if(!caption.art)return[];const point=worldToScreen(view,caption.art.x,caption.art.y);return[{x:point.x,y:point.y,width:caption.art.width*view.scale,height:caption.art.height*view.scale}]});
 const placed:InteriorCaptionBox[]=[];
 for(const {caption,anchor} of anchors){
  if(anchor.x<0||anchor.x>size.width||anchor.y<0||anchor.y>size.height)continue;
  const neighbour=anchors.reduce((distance,other)=>other.caption.id!==caption.id&&Math.abs(other.anchor.y-anchor.y)<lineHeight*3?Math.min(distance,Math.abs(other.anchor.x-anchor.x)||Infinity):distance,Infinity);
  const availableWidth=Math.max(90,Math.min(compact?150:244,neighbour-8,2*Math.min(anchor.x-limits.left,limits.right-anchor.x)-8,limits.right-limits.left));
  const lines=wrapName(caption.name,Math.max(14,Math.floor((availableWidth-padding*2)/charWidth)));
  const width=Math.max(compact?44:0,Math.ceil(Math.max(...lines.map(line=>line.length))*charWidth)+padding*2),height=Math.max(compact?44:0,lines.length*lineHeight+8);
  let best:InteriorCaptionBox|undefined,bestCost=Infinity;
  for(const dy of [0,4,-4,8,-8,12,-12,18,-18,24,-24,30,-30,36,-36,48,-48,60,-60,72,-72,90,-90,108,-108])for(const dx of [0,8,-8,16,-16,24,-24,40,-40,64,-64,80,-80,96,-96,112,-112]){
   const x=Math.round(Math.max(limits.left,Math.min(limits.right-width,anchor.x-width/2+dx))),y=Math.round(Math.max(limits.top,Math.min(limits.bottom-height,anchor.y-height/2+dy)));
   const candidate={caption,anchor,x,y,width,height,lines,fontSize,lineHeight};
   const distance=Math.hypot(x+width/2-anchor.x,y+height/2-anchor.y);
   if(x<limits.left-.5||y<limits.top-.5||x+width>limits.right+.5||y+height>limits.bottom+.5||distance>maximumDrift||reserved.some(box=>overlaps(candidate,box))||art.some(box=>overlaps(candidate,box,2))||placed.some(box=>overlaps(candidate,box)))continue;
   const cost=distance+Math.abs(dx)*.3+Math.max(0,anchor.y-y-height/2)*.5;
   if(cost<bestCost){best=candidate;bestCost=cost}
  }
  // In dense overview floors, zooming reveals a caption that cannot fit without covering another.
  if(best)placed.push(best);
 }
 return placed;
}

/** A spare lore badge must never cover the caption of the next landmark. */
export function showInteriorCaptionMarker(id:string,anchor:{x:number;y:number},labels:InteriorCaptionBox[]):boolean{
 const marker={x:anchor.x-22,y:anchor.y-22,width:44,height:44};
 return !labels.some(label=>label.caption.id===id||overlaps(label,marker,2));
}

export function drawInteriorCaptions(ctx:CanvasRenderingContext2D,labels:InteriorCaptionBox[]){
 ctx.save();ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='alphabetic';
 for(const label of labels){
  const {x,y,width,height,fontSize,lineHeight}=label;
  const stemX=Math.max(x,Math.min(x+width,label.anchor.x)),stemY=Math.max(y,Math.min(y+height,label.anchor.y));
  if(Math.hypot(stemX-label.anchor.x,stemY-label.anchor.y)>8){
   ctx.strokeStyle='#aa956b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Math.round(label.anchor.x),Math.round(label.anchor.y));ctx.lineTo(Math.round(stemX),Math.round(label.anchor.y));ctx.lineTo(Math.round(stemX),Math.round(stemY));ctx.stroke();
  }
  ctx.fillStyle='#17141de8';ctx.fillRect(x,y,width,height);
  ctx.fillStyle=label.caption.kind==='stairs'||label.caption.kind==='exit'?'#bca06a':'#81734f';ctx.fillRect(x,y,width,1);ctx.fillRect(x,y+height-1,width,1);
  ctx.fillStyle='#fff0bd';ctx.font=`bold ${fontSize}px monospace`;
  const metrics=ctx.measureText('Mg'),ascent=metrics.actualBoundingBoxAscent||fontSize*.8,descent=metrics.actualBoundingBoxDescent||fontSize*.2;
  // Position the actual ink inside each generously padded row, including descenders.
  const topPadding=(height-label.lines.length*lineHeight)/2;
  label.lines.forEach((line,index)=>ctx.fillText(line,x+width/2,Math.round(y+topPadding+index*lineHeight+(lineHeight-ascent-descent)/2+ascent)));
 }
 ctx.restore();
}
