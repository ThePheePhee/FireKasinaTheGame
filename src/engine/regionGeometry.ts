import type {Region} from '../data/mapRegions';

export function regionExtent(region:Region){
 return region.shape.kind==='circle'?region.shape.radius:Math.max(...region.shape.points.map(([x,y])=>Math.hypot(x,y)),1);
}

export function regionContains(region:Region,x:number,y:number){
 const localX=x-region.x,localY=y-region.y;
 if(region.shape.kind==='circle')return Math.hypot(localX,localY)<=region.shape.radius;
 let inside=false;const points=region.shape.points;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [xi,yi]=points[i],[xj,yj]=points[j];
  if((yi>localY)!==(yj>localY)&&localX<(xj-xi)*(localY-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}
