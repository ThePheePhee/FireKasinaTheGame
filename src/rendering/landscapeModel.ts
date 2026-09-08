import {mapRegions} from '../data/mapRegions';
import {WORLD} from '../data/mapScale';
import {routes} from '../data/routes';
import {ambientProps,mapProps} from '../data/mapProps';
import {fairyDecorations,regionVisuals} from '../data/regionVisuals';
import {countryAt,type Country} from '../game/worldProgression';

export const LANDSCAPE_TILE=16;
const ROAD_CLEARANCE=26;
const EDGE_CLEARANCE=12;

export interface CountryGrid {
 readonly columns:number;
 readonly rows:number;
 readonly cells:readonly Country[];
}
export interface SceneryExclusion {
 readonly x:number;readonly y:number;readonly w:number;readonly h:number;
 readonly kind:'landmark'|'label'|'prop'|'ambient'|'fairy';
 readonly id:string;
}
interface RoadSegment {ax:number;ay:number;bx:number;by:number}
interface Box {x:number;y:number;w:number;h:number}
let cachedGrid:CountryGrid|undefined;
let cachedExclusions:readonly SceneryExclusion[]|undefined;
let cachedSegments:readonly RoadSegment[]|undefined;

// Logical countries remain the source of truth for the painted terrain.
// The final, shallow row is sampled inside the world rather than beyond its edge.
export function countryGrid():CountryGrid {
 if(cachedGrid)return cachedGrid;
 const columns=Math.ceil(WORLD.width/LANDSCAPE_TILE),rows=Math.ceil(WORLD.height/LANDSCAPE_TILE),cells:Country[]=[];
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const left=column*LANDSCAPE_TILE,top=row*LANDSCAPE_TILE;
  cells.push(countryAt((left+Math.min(WORLD.width,left+LANDSCAPE_TILE))/2,(top+Math.min(WORLD.height,top+LANDSCAPE_TILE))/2));
 }
 cachedGrid=Object.freeze({columns,rows,cells:Object.freeze(cells)});return cachedGrid;
}

/** The country of a world-space tile; off-map neighbours clamp to the map edge. */
export function countryCellAt(x:number,y:number):Country {
 const grid=countryGrid();
 const column=Math.max(0,Math.min(grid.columns-1,Math.floor((Number.isFinite(x)?x:0)/LANDSCAPE_TILE)));
 const row=Math.max(0,Math.min(grid.rows-1,Math.floor((Number.isFinite(y)?y:0)/LANDSCAPE_TILE)));
 return grid.cells[row*grid.columns+column];
}

function roadSegments():readonly RoadSegment[] {
 if(!cachedSegments)cachedSegments=Object.freeze(routes.flatMap(route=>route.points.slice(1).map(([bx,by],index)=>Object.freeze({ax:route.points[index][0],ay:route.points[index][1],bx,by}))));
 return cachedSegments;
}

function segmentDistanceSquared(x:number,y:number,segment:RoadSegment):number {
 const dx=segment.bx-segment.ax,dy=segment.by-segment.ay,length=dx*dx+dy*dy;
 const t=length?Math.max(0,Math.min(1,((x-segment.ax)*dx+(y-segment.ay)*dy)/length)):0;
 return (x-segment.ax-dx*t)**2+(y-segment.ay-dy*t)**2;
}

export function distanceToRoad(x:number,y:number):number {
 if(!Number.isFinite(x)||!Number.isFinite(y))return Infinity;
 let distance=Infinity;
 for(const segment of roadSegments())distance=Math.min(distance,segmentDistanceSquared(x,y,segment));
 return Math.sqrt(distance);
}

export function sceneryExclusions():readonly SceneryExclusion[] {
 if(cachedExclusions)return cachedExclusions;
 const result:SceneryExclusion[]=[];
 for(const region of mapRegions){
  const visual=regionVisuals[region.id]??{},[ax,ay]=visual.artOffset??[0,0],[lx,ly]=visual.labelOffset??[0,75],lines=visual.labelLines??[region.name];
  if(visual.artSize){const size=visual.artSize;result.push({id:region.id,kind:'landmark',x:region.x+ax-size/2-6,y:region.y+ay-size/2-6,w:size+12,h:size+12})}
  const width=Math.max(...lines.map(line=>line.length))*(visual.labelSize??16)*.62+16;
  result.push({id:region.id,kind:'label',x:region.x+lx-width/2,y:region.y+ly-5,w:width,h:lines.length*18+10});
 }
 const addProps=(props:readonly {x:number;y:number;size:number;id?:string}[],kind:SceneryExclusion['kind'])=>{
  props.forEach((prop,index)=>result.push({id:prop.id??`${kind}-${index}`,kind,x:prop.x-prop.size/2-4,y:prop.y-prop.size/2-4,w:prop.size+8,h:prop.size+8}));
 };
 addProps(mapProps,'prop');addProps(ambientProps,'ambient');addProps(fairyDecorations,'fairy');
 cachedExclusions=Object.freeze(result.map(box=>Object.freeze(box)));return cachedExclusions;
}

function overlaps(a:Box,b:Box):boolean {
 return a.x<=b.x+b.w&&a.x+a.w>=b.x&&a.y<=b.y+b.h&&a.y+a.h>=b.y;
}
function segmentIntersectsBox(segment:RoadSegment,box:Box):boolean {
 let enter=0,exit=1;
 for(const [origin,delta,minimum,maximum] of [[segment.ax,segment.bx-segment.ax,box.x,box.x+box.w],[segment.ay,segment.by-segment.ay,box.y,box.y+box.h]]){
  if(delta===0){if(origin<minimum||origin>maximum)return false;continue}
  const a=(minimum-origin)/delta,b=(maximum-origin)/delta;
  enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
  if(enter>exit)return false;
 }
 return true;
}
function segmentBoxDistanceSquared(segment:RoadSegment,box:Box):number {
 if(segmentIntersectsBox(segment,box))return 0;
 const pointBoxDistance=(x:number,y:number)=>Math.max(box.x-x,0,x-box.x-box.w)**2+Math.max(box.y-y,0,y-box.y-box.h)**2;
 return Math.min(pointBoxDistance(segment.ax,segment.ay),pointBoxDistance(segment.bx,segment.by),
  segmentDistanceSquared(box.x,box.y,segment),segmentDistanceSquared(box.x+box.w,box.y,segment),
  segmentDistanceSquared(box.x,box.y+box.h,segment),segmentDistanceSquared(box.x+box.w,box.y+box.h,segment));
}

/** x/y are the scenery footprint's centre, not its upper-left corner. */
export function clearForScenery(x:number,y:number,width:number,height:number):boolean {
 if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0)return false;
 const box={x:x-width/2,y:y-height/2,w:width,h:height};
 if(box.x<EDGE_CLEARANCE||box.y<EDGE_CLEARANCE||box.x+width>WORLD.width-EDGE_CLEARANCE||box.y+height>WORLD.height-EDGE_CLEARANCE)return false;
 if(sceneryExclusions().some(exclusion=>overlaps(box,exclusion)))return false;
 for(const segment of roadSegments()){
  const roadBounds={x:Math.min(segment.ax,segment.bx)-ROAD_CLEARANCE,y:Math.min(segment.ay,segment.by)-ROAD_CLEARANCE,w:Math.abs(segment.bx-segment.ax)+ROAD_CLEARANCE*2,h:Math.abs(segment.by-segment.ay)+ROAD_CLEARANCE*2};
  if(overlaps(box,roadBounds)&&segmentBoxDistanceSquared(segment,box)<=ROAD_CLEARANCE**2)return false;
 }
 return true;
}
