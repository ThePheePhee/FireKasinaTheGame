import {WORLD} from '../data/mapRegions';
import type {View} from './camera';

export interface ScreenSize{width:number;height:number}

export function fitMap(size:ScreenSize):View{
 const scale=Math.min(size.width/WORLD.width,size.height/WORLD.height);
 return{x:(WORLD.width-size.width/scale)/2,y:(WORLD.height-size.height/scale)/2,scale};
}

export function constrainMap(view:View,size:ScreenSize):View{
 const minimum=fitMap(size).scale,scale=Math.max(minimum,Math.min(minimum*5,view.scale));
 const visibleWidth=size.width/scale,visibleHeight=size.height/scale;
 return{x:visibleWidth>=WORLD.width?(WORLD.width-visibleWidth)/2:Math.max(0,Math.min(WORLD.width-visibleWidth,view.x)),y:visibleHeight>=WORLD.height?(WORLD.height-visibleHeight)/2:Math.max(0,Math.min(WORLD.height-visibleHeight,view.y)),scale};
}

export function zoomMap(view:View,factor:number,anchorX:number,anchorY:number,size:ScreenSize){
 const worldX=view.x+anchorX/view.scale,worldY=view.y+anchorY/view.scale,nextScale=view.scale*factor;
 return constrainMap({x:worldX-anchorX/nextScale,y:worldY-anchorY/nextScale,scale:nextScale},size);
}

export function worldToScreen(view:View,x:number,y:number){return{x:(x-view.x)*view.scale,y:(y-view.y)*view.scale}}
