import type {Route} from '../data/routes';
import type {Region} from '../data/mapRegions';
import type {RegionVisual} from '../data/regionVisuals';
import type {View} from './camera';
import {worldToScreen, type MapBounds, type ScreenSize} from './mapViewport';

export interface LabelBox {x:number;y:number;width:number;height:number}
export interface RouteLabel extends LabelBox {route:Route;lines:string[];anchor:{x:number;y:number};stem:{x:number;y:number}}
export interface LocationLabel extends LabelBox {region:Region;lines:string[];fontSize:number;lineHeight:number;broad:boolean}
export const PRIMARY_ROUTE_IDS = ['kindling', 'unmaking', 'middle'];
const northernRoads=new Set(['artificer','ascent','healers-light']);
const compactNames:Record<string,string[]>={
 'fairy-playground':['Fairy Playground'],mist:['Mists of','Purification'],house:['Home'],garden:['Garden'],'red-dot':['Dot Range'],library:['Library'],'fortification-tavern':['Fortification','Tavern'],
 fireworks:['Fireworks Peak'],magical:['Magick Grounds'],healing:['Healing Meadows'],celestial:['Divine Abodes'],tower:['Insight Tower'],jhana:['Jhana Range'],formless:['Formless Beyond'],
 'life-recall':['Life Recall'],'counterfeit-crags':['Counterfeit','Crags'],'credulous-circuit':['Clarity','Circuit'],trauma:['Trauma Tunnels'],booboo:['Boohoo Lagoon'],chasm:['Despair Chasm'],inn:['Quarrelsome Inn'],
};
// The three crowded clearings need concise map captions at a short desktop
// overview too. Their full authored names remain on the hit targets and in lore.
const closeClearingNames:Record<string,string[]>={library:['Lantern','Library'],'counterfeit-crags':['Counterfeit','Crags'],'credulous-circuit':['Clarity','Circuit']};

function splitMapName(name:string,limit:number):string[]{
  if(name.length<=limit)return[name];
  const words=name.split(' ');
  let best=[name],cost=Infinity;
  for(let cut=1;cut<words.length;cut++){
    const lines=[words.slice(0,cut).join(' '),words.slice(cut).join(' ')];
    const score=Math.max(...lines.map(line=>line.length))*2+Math.abs(lines[0].length-lines[1].length);
    if(score<cost){cost=score;best=lines}
  }
  return best;
}

export function splitRouteName(name:string):string[]{return splitMapName(name,18)}

/** Locations are the primary captions; they stay readable as the terrain zooms out. */
export function layoutLocationLabels(regions:Region[],visuals:Record<string,RegionVisual>,view:View,reserved:LabelBox[]=[],screen?:ScreenSize):LocationLabel[]{
  const compact=view.scale<.32;
  const art=regions.flatMap(region=>{
    const visual=visuals[region.id],size=(visual?.artSize??0)*view.scale;if(!size)return[];
    const [dx,dy]=visual?.artOffset??[0,0],point=worldToScreen(view,region.x+dx,region.y+dy);
    return[{x:point.x-size/2,y:point.y-size/2,width:size,height:size}];
  });
  const candidates=regions.map(region=>{
    const visual=visuals[region.id]??{},lines=compact?(compactNames[region.id]??splitMapName(region.name,16)):view.scale<.55&&closeClearingNames[region.id]?closeClearingNames[region.id]:region.id==='credulous-circuit'?['Credulous','Clarity','Circuit']:visual.labelLines??splitMapName(region.name,22),[dx,dy]=visual.labelOffset??[0,75];
    const broad=region.id==='mist'||region.id==='fairy-playground',sourceSize=visual.labelSize??16;
    const snugHome=!compact&&view.scale<.52&&['house','library','red-dot'].includes(region.id);
    const fontSize=Math.min(14,Math.max(view.scale<.3?9:snugHome?10:11,sourceSize*view.scale))*(sourceSize<16?.9:1);
    const lineHeight=Math.ceil(fontSize*(snugHome?1.16:1.23)),width=Math.ceil(Math.max(...lines.map(line=>line.length))*fontSize*.62)+6,height=lines.length*lineHeight,point=worldToScreen(view,region.x+dx,region.y+dy);
    return{region,lines,fontSize,lineHeight,broad,x:point.x-width/2,y:point.y,width,height};
  });
  const placed:LocationLabel[]=[],exclusions=[...art,...reserved];
  const familiar=['house','red-dot','library','garden','fortification-tavern'];
  const priority=(label:LocationLabel)=>label.broad?20:familiar.includes(label.region.id)?familiar.indexOf(label.region.id)-10:label.region.layer;
  for(const label of [...candidates].sort((a,b)=>priority(a)-priority(b))){
    let best:LocationLabel|undefined,cost=Infinity;
    for(const dy of [0,-1,1,-2,2,-3,3,4,-4,6,-6,8,-8,12,-12,24,-14,-28,36,-40,48,-52])for(const dx of [0,-2,2,-4,4,-8,8,-12,12,-24,24,-36,36,-48,48,-60,60]){
      const candidate={...label,x:label.x+dx,y:label.y+dy},nextCost=Math.abs(dx)*1.15+Math.abs(dy);
      if(screen&&(candidate.x<4||candidate.x+candidate.width>screen.width-4||candidate.y<4||candidate.y+candidate.height>screen.height-4))continue;
      if(nextCost>=cost||exclusions.some(box=>boxesOverlap(candidate,box,2))||placed.some(box=>boxesOverlap(candidate,box,3)))continue;
      best=candidate;cost=nextCost;
    }
    // Crowded captions reappear when zooming reveals room, instead of covering their neighbours.
    if(best)placed.push(best);
  }
  return placed;
}

export function boxesOverlap(a:LabelBox,b:LabelBox,padding=0){
  return a.x<b.x+b.width+padding&&a.x+a.width+padding>b.x&&a.y<b.y+b.height+padding&&a.y+a.height+padding>b.y;
}

function roadSamples(route:Route):[number,number][]{
  const segments=route.points.slice(1).map((point,index)=>({a:route.points[index],b:point,length:Math.hypot(point[0]-route.points[index][0],point[1]-route.points[index][1])}));
  const total=segments.reduce((sum,segment)=>sum+segment.length,0),samples:[number,number][]=[route.labelAt,...route.points];
  if(!total)return samples;
  const sampleCount=northernRoads.has(route.id)?64:32;
  for(let sample=1;sample<sampleCount;sample++){
    let distance=total*sample/sampleCount;
    for(const segment of segments){
      if(distance<=segment.length){const t=distance/(segment.length||1);samples.push([segment.a[0]+(segment.b[0]-segment.a[0])*t,segment.a[1]+(segment.b[1]-segment.a[1])*t]);break}
      distance-=segment.length;
    }
  }
  return samples;
}

/** Place fixed-size road signs in the available landscape, with a short stem to the real road. */
export function layoutRouteLabels(routes:Route[],view:View,size:ScreenSize,obstacles:LabelBox[],compact=false,selectedId:string|null=null,bounds?:MapBounds):RouteLabel[]{
  if(size.width<80||size.height<80)return[];
  const worldStart=bounds?worldToScreen(view,0,0):{x:0,y:0},worldEnd=bounds?worldToScreen(view,bounds.width,bounds.height):{x:size.width,y:size.height};
  const margin=compact?-40:4;
  const limits={left:Math.max(10,worldStart.x+margin),top:Math.max(10,worldStart.y+margin),right:Math.min(size.width-10,worldEnd.x-margin),bottom:Math.min(size.height-10,worldEnd.y-margin)};
  const rank=(route:Route)=>route.id===selectedId?-3:PRIMARY_ROUTE_IDS.includes(route.id)?-2:northernRoads.has(route.id)?-1:route.family==='connection'?1:0;
  const ordered=routes.filter(route=>!compact||PRIMARY_ROUTE_IDS.includes(route.id)||route.id===selectedId).map((route,index)=>({route,index})).sort((a,b)=>rank(a.route)-rank(b.route)||a.index-b.index);
  const placed:RouteLabel[]=[];
  for(const {route} of ordered){
    const lines=splitRouteName(route.name),width=Math.max(...lines.map(line=>line.length))*6.5+10,height=lines.length*13+6;
    const preferred=worldToScreen(view,...route.labelAt);
    let best:RouteLabel|undefined,bestCost=Infinity;
    for(const sample of roadSamples(route)){
      const anchor=worldToScreen(view,...sample);
      if(anchor.x<0||anchor.y<0||anchor.x>size.width||anchor.y>size.height)continue;
      const offsets=[[0,-height/2-4],[0,height/2+4],[width/2+4,0],[-width/2-4,0],[width*.35,-height/2-8],[-width*.35,-height/2-8],[width*.35,height/2+8],[-width*.35,height/2+8]];
      for(const distance of [16,30])for(const sideways of [0,width*.35,-width*.35])offsets.push([sideways,-height/2-distance],[sideways,height/2+distance]);
      for(const [dx,dy] of offsets){
        const box={x:Math.round(anchor.x+dx-width/2),y:Math.round(anchor.y+dy-height/2),width,height};
        if(box.x<limits.left||box.y<limits.top||box.x+width>limits.right||box.y+height>limits.bottom)continue;
        if(obstacles.some(other=>boxesOverlap(box,other,5))||placed.some(other=>boxesOverlap(box,other,8)))continue;
        const stem={x:Math.max(box.x,Math.min(box.x+width,anchor.x)),y:Math.max(box.y,Math.min(box.y+height,anchor.y))};
        if(Math.abs(stem.x-anchor.x)+Math.abs(stem.y-anchor.y)>35)continue;
        const cost=Math.hypot(anchor.x-preferred.x,anchor.y-preferred.y)+Math.hypot(dx,dy)*.55;
        if(cost<bestCost){
          bestCost=cost;best={...box,route,lines,anchor,stem};
        }
      }
    }
    if(best)placed.push(best);
  }
  return placed;
}
