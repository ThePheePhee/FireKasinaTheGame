import type {View} from './camera';
import {constrainMap,mapScale,type MapBounds,type ScreenSize} from './mapViewport';

export interface MapPoint{x:number;y:number}

/** Pointer gestures own tap activation; a browser's delayed click cannot reopen lore. */
export class MapGesture{
 readonly points=new Map<number,MapPoint>();
 kind:'idle'|'tap'|'pan'|'pinch'='idle';
 private startPoint:MapPoint={x:0,y:0};
 private startView:View={x:0,y:0,scale:1};
 private distance=1;
 private anchor:MapPoint={x:0,y:0};
 private target:string|null=null;

 private rebase(view:View){
  this.startView={...view};
  const [a,b]=[...this.points.values()];
  if(b){this.kind='pinch';this.distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));this.anchor={x:view.x+(a.x+b.x)/(2*view.scale),y:view.y+(a.y+b.y)/(2*view.scale)}}
  else if(a){this.kind='pan';this.startPoint=a}
 }
 down(id:number,point:MapPoint,view:View,target:string|null){
  this.points.set(id,point);
  if(this.points.size===1){this.kind='tap';this.startPoint=point;this.startView={...view};this.target=target}
  else{this.target=null;this.rebase(view)}
 }
 move(id:number,point:MapPoint,size:ScreenSize,bounds:MapBounds):View|null{
  if(!this.points.has(id))return null;
  this.points.set(id,point);
  if(this.kind==='tap'&&Math.hypot(point.x-this.startPoint.x,point.y-this.startPoint.y)>10){this.kind='pan';this.target=null}
  if(this.kind==='pan')return constrainMap({...this.startView,x:this.startView.x-(point.x-this.startPoint.x)/this.startView.scale,y:this.startView.y-(point.y-this.startPoint.y)/this.startView.scale},size,bounds);
  if(this.kind==='pinch'){
   const [a,b]=[...this.points.values()];if(!b)return null;
   const scale=mapScale(this.startView.scale*Math.hypot(a.x-b.x,a.y-b.y)/this.distance,size,bounds);
   return constrainMap({x:this.anchor.x-(a.x+b.x)/(2*scale),y:this.anchor.y-(a.y+b.y)/(2*scale),scale},size,bounds);
  }
  return null;
 }
 up(id:number,view:View,cancel=false){
  if(!this.points.has(id))return null;
  const target=!cancel&&this.kind==='tap'?this.target:null;
  this.points.delete(id);this.target=null;
  if(this.points.size)this.rebase(view);else this.kind='idle';
  return target;
 }
 cancel(){this.points.clear();this.target=null;this.kind='idle'}
}
