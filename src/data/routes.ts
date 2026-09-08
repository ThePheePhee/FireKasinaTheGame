export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export type RouteFamily='generation'|'deconstruction'|'balance'|'connection';
export interface Route {id:string;name:string;family:RouteFamily;kind:RouteKind;points:[number,number][];labelAt:[number,number];}
export interface RoadSection {a:[number,number];b:[number,number];family:RouteFamily;kind:RouteKind;routeIds:string[]}
export const roadFamilyPriority:Record<RouteFamily,number>={generation:4,deconstruction:3,balance:2,connection:1};

/** Give shared corridors one physical surface, including partial overlaps. */
export function buildRoadSections(routeList:Route[]):RoadSection[]{
 const vertices=routeList.flatMap(route=>route.points),sections=new Map<string,RoadSection>();
 for(const route of routeList)for(let index=1;index<route.points.length;index++){
  const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;if(!length)continue;
  const stops=[0,1];
  for(const [x,y] of vertices){const t=((x-ax)*dx+(y-ay)*dy)/length;if(t>0&&t<1&&Math.hypot(x-ax-dx*t,y-ay-dy*t)<.001)stops.push(t)}
  const ordered=stops.sort((a,b)=>a-b).filter((t,i,all)=>!i||t-all[i-1]>.000001);
  for(let part=1;part<ordered.length;part++){
   const a:[number,number]=[ax+dx*ordered[part-1],ay+dy*ordered[part-1]],b:[number,number]=[ax+dx*ordered[part],ay+dy*ordered[part]];
   const first=a.map(value=>value.toFixed(3)).join(','),last=b.map(value=>value.toFixed(3)).join(','),key=first<last?`${first}|${last}`:`${last}|${first}`,existing=sections.get(key);
   if(existing){if(!existing.routeIds.includes(route.id))existing.routeIds.push(route.id);if(roadFamilyPriority[route.family]>roadFamilyPriority[existing.family]){existing.family=route.family;existing.kind=route.kind}}
   else sections.set(key,{a,b,family:route.family,kind:route.kind,routeIds:[route.id]});
  }
 }
 return [...sections.values()].sort((a,b)=>roadFamilyPriority[a.family]-roadFamilyPriority[b.family]);
}

const baseRoutes:Route[]=[
 {id:'kindling',name:'The Kindling Road',family:'generation',kind:'tram',points:[[920,510],[920,575],[870,625],[870,680],[845,705],[500,705],[500,570],[425,570],[340,485],[340,400],[225,400],[175,350],[175,120]],labelAt:[340,285]},
 {id:'artificer',name:"The Artificer's Causeway",family:'generation',kind:'bridge',points:[[175,120],[250,45],[600,45],[650,95]],labelAt:[400,48]},
 {id:'ascent',name:'The Luminous Ascent',family:'generation',kind:'rail',points:[[650,95],[1040,95],[1100,155],[1415,155]],labelAt:[835,48]},
 {id:'unmaking',name:'The Unmaking Way',family:'deconstruction',kind:'tunnel',points:[[870,625],[1060,625],[1120,565],[1120,650],[1010,760],[940,760],[910,790],[650,790],[580,860],[430,860],[430,940]],labelAt:[1080,735]},
 {id:'vanishing',name:'The Vanishing Road',family:'deconstruction',kind:'bridge',points:[[430,940],[500,1010],[1440,1010],[1480,970]],labelAt:[950,970]},
 {id:'middle',name:"The Wayfarer's Middle Path",family:'balance',kind:'tram',points:[[175,620],[260,705],[620,705],[685,640],[685,550],[690,550],[740,500]],labelAt:[450,730]},
 {id:'clarity',name:'Clarity Ridge',family:'connection',kind:'bridge',points:[[175,120],[175,620]],labelAt:[105,360]},
 {id:'reality',name:'The Reality-Testing Road',family:'connection',kind:'rail',points:[[650,95],[650,200],[465,200],[340,325],[340,400],[225,400],[175,350],[175,620]],labelAt:[475,245]},
 {id:'integration',name:'The Integration Crossing',family:'balance',kind:'tram',points:[[175,620],[175,350],[225,400],[340,400],[340,325],[465,200],[1030,200],[1080,250],[1080,135],[1040,95]],labelAt:[690,225]},
 {id:'mending',name:'The Mending Way',family:'balance',kind:'tram',points:[[1120,565],[1200,485],[1200,370],[1080,250],[1080,135],[1040,95]],labelAt:[1150,420]},
 {id:'healers-light',name:"The Healer's Light",family:'connection',kind:'bridge',points:[[650,95],[1040,95],[1100,155],[1415,155]],labelAt:[1215,55]},
 {id:'siddhi',name:'The Siddhi Pass',family:'connection',kind:'rail',points:[[430,940],[375,940],[175,740],[175,620],[175,350],[225,400],[340,400],[340,325],[465,200],[650,200],[650,95]],labelAt:[330,455]},
 {id:'contemplative',name:'The Contemplative Passage',family:'connection',kind:'rail',points:[[430,940],[375,940],[175,740],[175,620]],labelAt:[265,820]},
 {id:'return',name:'The Renewal Road',family:'connection',kind:'rail',points:[[1040,95],[1080,135],[1080,250],[1200,370],[1200,485],[1120,565],[1120,650],[1010,760],[940,760],[910,790],[650,790],[580,860],[430,860],[430,940]],labelAt:[820,760]},
 {id:'reappearance',name:'The Road of Splendid Reappearance',family:'generation',kind:'bridge',points:[[1480,970],[1510,940],[1510,250],[1415,155]],labelAt:[1435,520]},
 {id:'credulous-loop',name:'The Credulous Clarity Circuit',family:'connection',kind:'rail',points:[[850,320],[905,320],[975,390],[975,415],[960,430],[895,430],[850,385],[850,320]],labelAt:[900,205]},
 {id:'library-lane',name:'The Lantern-Lit Lane',family:'connection',kind:'tram',points:[[740,500],[690,550],[650,550],[650,450]],labelAt:[690,430]},
 {id:'fortification-road',name:'The Fortification Road',family:'balance',kind:'tram',points:[[920,510],[950,480],[1000,480],[1030,450]],labelAt:[1010,420]}
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
