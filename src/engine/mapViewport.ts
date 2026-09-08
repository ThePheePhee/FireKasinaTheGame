import {WORLD} from '../data/mapRegions';
import type {View} from './camera';

export interface ScreenSize{width:number;height:number}
export interface MapBounds{width:number;height:number}

export function fitMap(size:ScreenSize,bounds:MapBounds=WORLD):View{
 const width=Math.max(1,size.width),height=Math.max(1,size.height),scale=Math.min(width/bounds.width,height/bounds.height);
 return{x:(bounds.width-width/scale)/2,y:(bounds.height-height/scale)/2,scale};
}

export function mapScale(scale:number,size:ScreenSize,bounds:MapBounds=WORLD){const minimum=fitMap(size,bounds).scale;return Math.max(minimum,Math.min(minimum*5,scale))}

export function constrainMap(view:View,size:ScreenSize,bounds:MapBounds=WORLD):View{
 const scale=mapScale(view.scale,size,bounds);
 const visibleWidth=size.width/scale,visibleHeight=size.height/scale;
 return{x:visibleWidth>=bounds.width?(bounds.width-visibleWidth)/2:Math.max(0,Math.min(bounds.width-visibleWidth,view.x)),y:visibleHeight>=bounds.height?(bounds.height-visibleHeight)/2:Math.max(0,Math.min(bounds.height-visibleHeight,view.y)),scale};
}

export function zoomMap(view:View,factor:number,anchorX:number,anchorY:number,size:ScreenSize,bounds:MapBounds=WORLD){
 const worldX=view.x+anchorX/view.scale,worldY=view.y+anchorY/view.scale,nextScale=mapScale(view.scale*factor,size,bounds);
 return constrainMap({x:worldX-anchorX/nextScale,y:worldY-anchorY/nextScale,scale:nextScale},size,bounds);
}

export function resizeMap(view:View,previous:ScreenSize,next:ScreenSize,bounds:MapBounds=WORLD):View{
 if(previous.width<=1||previous.height<=1)return fitMap(next,bounds);
 const scale=mapScale(view.scale/fitMap(previous,bounds).scale*fitMap(next,bounds).scale,next,bounds);
 return constrainMap({x:view.x+previous.width/(2*view.scale)-next.width/(2*scale),y:view.y+previous.height/(2*view.scale)-next.height/(2*scale),scale},next,bounds);
}

export function worldToScreen(view:View,x:number,y:number){return{x:(x-view.x)*view.scale,y:(y-view.y)*view.scale}}
