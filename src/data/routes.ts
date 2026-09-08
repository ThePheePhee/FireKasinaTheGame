export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export type RouteFamily='generation'|'deconstruction'|'balance'|'connection';
export interface Route {id:string;name:string;family:RouteFamily;kind:RouteKind;points:[number,number][];labelAt:[number,number];}

const baseRoutes:Route[]=[
 {id:'kindling',name:'The Kindling Road',family:'generation',kind:'tram',points:[[500,570],[380,330],[175,120]],labelAt:[340,285]},
 {id:'artificer',name:"The Artificer's Causeway",family:'generation',kind:'bridge',points:[[175,120],[400,55],[650,95]],labelAt:[400,48]},
 {id:'ascent',name:'The Luminous Ascent',family:'generation',kind:'rail',points:[[650,95],[1040,95],[1415,155]],labelAt:[835,48]},
 {id:'unmaking',name:'The Unmaking Way',family:'deconstruction',kind:'tunnel',points:[[870,625],[1000,630],[1120,565],[1040,700],[940,760],[650,860],[430,940]],labelAt:[1080,735]},
 {id:'vanishing',name:'The Vanishing Road',family:'deconstruction',kind:'bridge',points:[[430,940],[930,1010],[1480,970]],labelAt:[950,970]},
 {id:'middle',name:"The Wayfarer's Middle Path",family:'balance',kind:'tram',points:[[175,620],[330,700],[560,710],[700,630],[800,550]],labelAt:[450,730]},
 {id:'clarity',name:'Clarity Ridge',family:'connection',kind:'bridge',points:[[175,120],[120,350],[175,620]],labelAt:[105,360]},
 {id:'reality',name:'The Reality-Testing Road',family:'connection',kind:'rail',points:[[650,95],[400,350],[175,620]],labelAt:[475,245]},
 {id:'integration',name:'The Integration Crossing',family:'balance',kind:'tram',points:[[175,620],[300,420],[650,250],[900,220],[1080,250],[1040,95]],labelAt:[690,225]},
 {id:'mending',name:'The Mending Way',family:'balance',kind:'tram',points:[[1120,565],[1080,250],[1040,95]],labelAt:[1150,420]},
 {id:'healers-light',name:"The Healer's Light",family:'connection',kind:'bridge',points:[[650,95],[1040,95],[1415,155]],labelAt:[1215,55]},
 {id:'siddhi',name:'The Siddhi Pass',family:'connection',kind:'rail',points:[[430,940],[250,800],[175,620],[300,420],[470,260],[650,95]],labelAt:[330,455]},
 {id:'contemplative',name:'The Contemplative Loop',family:'connection',kind:'rail',points:[[430,940],[250,800],[175,620]],labelAt:[265,820]},
 {id:'return',name:'The Gentle Return',family:'connection',kind:'rail',points:[[1040,95],[1080,250],[1120,565],[760,790],[430,940]],labelAt:[820,760]},
 {id:'reappearance',name:'The Road of Splendid Reappearance',family:'generation',kind:'bridge',points:[[1480,970],[1530,790],[1515,590],[1490,370],[1415,155]],labelAt:[1435,520]},
 {id:'credulous-loop',name:'The Credulous Clarity Circuit',family:'connection',kind:'rail',points:[[850,320],[920,335],[975,390],[1015,420],[970,440],[900,415],[835,375],[850,320]],labelAt:[900,205]},
 {id:'library-lane',name:'The Lantern Lane',family:'connection',kind:'tram',points:[[740,500],[680,550],[650,450]],labelAt:[690,430]},
 {id:'fortification-road',name:'The Fortification Road',family:'balance',kind:'tram',points:[[920,510],[970,480],[1030,450]],labelAt:[1010,420]}
];
interface MapBox{x:number;y:number;w:number;h:number}
const signExclusions:MapBox[]=mapRegions.flatMap(region=>{
 const visual=regionVisuals[region.id]??{},[ax,ay]=visual.artOffset??[0,0],[lx,ly]=visual.labelOffset??[0,75],lines=visual.labelLines??[region.name];
 const width=Math.max(...lines.map(line=>line.length))*(visual.labelSize??16)*.62+8,size=visual.artSize??0;
 return[{x:region.x+lx-width/2,y:region.y+ly-2,w:width,h:lines.length*18+4},...(size?[{x:region.x+ax-size/2,y:region.y+ay-size/2,w:size,h:size}]:[])];
});
for(const prop of [...mapProps,...ambientProps,...fairyDecorations])signExclusions.push({x:prop.x-prop.size/2,y:prop.y-prop.size/2,w:prop.size,h:prop.size});

function placeRoadMarker(route:Route,placed:[number,number][]):[number,number]{
 let best:[number,number]=route.points[0],score=Infinity;
 for(let index=1;index<route.points.length;index++){
  const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],length=Math.hypot(bx-ax,by-ay),steps=Math.max(1,Math.ceil(length/8));
  for(let step=0;step<=steps;step++){
   const t=step/steps,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;
   const obscured=signExclusions.some(box=>x>box.x-8&&x<box.x+box.w+8&&y>box.y-8&&y<box.y+box.h+8),crowded=placed.some(([px,py])=>Math.hypot(x-px,y-py)<34);
   const cost=Math.hypot(x-route.labelAt[0],y-route.labelAt[1])+(obscured?100000:0)+(crowded?10000:0);
   if(cost<score){score=cost;best=[x,y]}
  }
 }
 return best;
}

const placedMarkers:[number,number][]=[];
export const routes:Route[]=baseRoutes.map(source=>{
 const route={...source,points:source.points.map(expandPoint),labelAt:expandPoint(source.labelAt)};
 route.labelAt=placeRoadMarker(route,placedMarkers);placedMarkers.push(route.labelAt);return route;
});
import {expandPoint} from './mapScale';
import {mapRegions} from './mapRegions';
import {fairyDecorations,regionVisuals} from './regionVisuals';
import {mapProps,ambientProps} from './mapProps';
