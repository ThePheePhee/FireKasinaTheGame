import test from 'node:test';
import assert from 'node:assert/strict';
import {MapGesture} from '../src/engine/mapGestures.ts';
import {fitMap,zoomMap,resizeMap,worldToScreen} from '../src/engine/mapViewport.ts';
import {playerCamera} from '../src/engine/camera.ts';
import {interiorArrival,upStairs,downStairs,slideAlongObstacles} from '../src/engine/interiorNavigation.ts';
import {interiorMaps} from '../src/data/interiorMaps.ts';
import {mapRegions} from '../src/data/mapRegions.ts';
import {fairyDecorations,regionVisuals} from '../src/data/regionVisuals.ts';
import {mapProps,ambientProps} from '../src/data/mapProps.ts';
import {routes} from '../src/data/routes.ts';

const bounds={width:1000,height:1000},screen={width:400,height:400};
const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} should equal ${expected}`);

test('zoom buttons keep the anchor fixed and cannot scan around at the limit',()=>{
 const view={x:300,y:350,scale:1};
 const next=zoomMap(view,1.5,137,83,screen,bounds);
 const anchor=worldToScreen(next,view.x+137/view.scale,view.y+83/view.scale);
 close(anchor.x,137);close(anchor.y,83);
 const maximum={x:400,y:300,scale:2};
 assert.deepEqual(zoomMap(maximum,1.5,200,200,screen,bounds),maximum);
 const minimum=fitMap(screen,bounds);
 assert.deepEqual(zoomMap(minimum,1/1.5,200,200,screen,bounds),minimum);
});

test('a tap tolerates slight finger movement; dragging never activates lore',()=>{
 const gesture=new MapGesture(),view={x:250,y:250,scale:.8};
 gesture.down(1,{x:100,y:100},view,'region:tower');
 assert.equal(gesture.move(1,{x:104,y:106},screen,bounds),null);
 assert.equal(gesture.up(1,view),'region:tower');
 gesture.down(2,{x:100,y:100},view,'region:tower');
 const moved=gesture.move(2,{x:130,y:110},screen,bounds);
 assert(moved);assert.equal(gesture.up(2,moved),null);
});

test('a pinch zooms, continues as a pan after one finger lifts, and never taps',()=>{
 const gesture=new MapGesture();let view={x:250,y:250,scale:.8};
 gesture.down(1,{x:100,y:200},view,'region:tower');
 gesture.down(2,{x:300,y:200},view,'region:tower');
 view=gesture.move(2,{x:400,y:200},screen,bounds);
 close(view.scale,1.2);assert.equal(gesture.up(2,view),null);
 const pan=gesture.move(1,{x:148,y:200},screen,bounds);
 close(pan.x,view.x-40);close(pan.scale,view.scale);
 assert.equal(gesture.up(1,pan),null);
 gesture.down(3,{x:100,y:100},pan,'region:house');
 assert.equal(gesture.up(3,pan),'region:house');
});

test('cancelled pointers do not activate a region or retain a stuck gesture',()=>{
 const gesture=new MapGesture(),view=fitMap(screen,bounds);
 gesture.down(1,{x:100,y:100},view,'region:tower');
 assert.equal(gesture.up(1,view,true),null);assert.equal(gesture.kind,'idle');
 gesture.down(2,{x:100,y:100},view,'region:tower');gesture.cancel();
 assert.equal(gesture.points.size,0);assert.equal(gesture.up(2,view),null);
});

test('screen rotation preserves map center and relative zoom',()=>{
 const view={x:250,y:250,scale:.8},next=resizeMap(view,screen,{width:600,height:400},bounds);
 close(next.x+600/(2*next.scale),500);close(next.y+400/(2*next.scale),500);
 close(next.scale/fitMap({width:600,height:400},bounds).scale,2);
 assert(Number.isFinite(fitMap({width:0,height:0},bounds).scale));
});

test('small interiors are centered in a larger browser window',()=>{
 assert.deepEqual(playerCamera(300,300,1400,1000,1000,800),{x:-200,y:-100,scale:1});
});

test('all stair arrivals are reachable, clear of obstacles, and outside their trigger',()=>{
 for(const map of interiorMaps)for(const [index,floor] of map.floors.entries()){
  const entrances=[...(index===0?['outside']:['below']),...(index<map.floors.length-1?['above']:[])];
  for(const direction of entrances){
   const [x,y]=interiorArrival(floor,direction);
   assert(x>=12&&x<=floor.width-12&&y>=12&&y<=floor.height-12,`${map.name}/${floor.name}/${direction}: outside floor`);
   assert(!floor.obstacles.some(o=>x+14>o.x&&x-14<o.x+o.w&&y+14>o.y&&y-14<o.y+o.h),`${map.name}/${floor.name}/${direction}: blocked arrival`);
   if(direction!=='outside'){const stairs=direction==='below'?downStairs(floor):upStairs(floor);assert(Math.hypot(x-stairs[0],y-stairs[1])>=48,'arrival must not bounce straight back')}
  }
 }
});

test('ascending starts at the first insight stage; descending returns to the upper stairs',()=>{
 const tower=interiorMaps.find(map=>map.regionId==='tower'),progress=tower.floors[1];
 const first=progress.zones[0],last=progress.zones.at(-1),start=interiorArrival(progress,'below');
 assert(Math.hypot(start[0]-first.x,start[1]-first.y)<Math.hypot(start[0]-last.x,start[1]-last.y));
 const returned=interiorArrival(progress,'above');
 assert.equal(returned[0],upStairs(progress)[0]);
 assert.notDeepEqual(returned,start);
});

test('diagonal movement slides along furniture instead of sticking',()=>{
 const before={x:85,y:160,direction:'down',moving:false,step:0};
 const next={...before,x:95,y:165,moving:true};
 const result=slideAlongObstacles(before,next,[{x:100,y:100,w:80,h:100}]);
 assert.equal(result.x,85);assert.equal(result.y,165);assert.equal(result.moving,true);
});

test('map labels and landmark sprites have separate space across the shared landscape',()=>{
 const boxes=[];
 for(const region of mapRegions){
  const visual=regionVisuals[region.id]??{},[ax,ay]=visual.artOffset??[0,0],[lx,ly]=visual.labelOffset??[0,75];
  const lines=visual.labelLines??[region.name],size=visual.artSize??0;
  // Conservative monospace advance plus room for the four-pixel text outline.
  const width=Math.max(...lines.map(line=>line.length))*(visual.labelSize??16)*.62+8;
  boxes.push({id:region.id,kind:'label',x:region.x+lx-width/2,y:region.y+ly-2,w:width,h:lines.length*18+4});
  if(size)boxes.push({id:region.id,kind:'sprite',x:region.x+ax-size/2,y:region.y+ay-size/2,w:size,h:size});
 }
 for(const prop of [...mapProps,...ambientProps,...fairyDecorations])boxes.push({id:prop.id??`ambient-${prop.x}`,kind:'prop',x:prop.x-prop.size/2,y:prop.y-prop.size/2,w:prop.size,h:prop.size});
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j];if(a.id===b.id)continue;
  assert(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),`${a.id} ${a.kind} overlaps ${b.id} ${b.kind}`);
 }
});

test('each route marker sits on its actual road and remains clear of map artwork',()=>{
 const excluded=[];
 for(const region of mapRegions){
  const visual=regionVisuals[region.id]??{},[ax,ay]=visual.artOffset??[0,0],[lx,ly]=visual.labelOffset??[0,75],size=visual.artSize??0,lines=visual.labelLines??[region.name];
  const width=Math.max(...lines.map(line=>line.length))*(visual.labelSize??16)*.62+8;
  excluded.push({x:region.x+lx-width/2,y:region.y+ly-2,w:width,h:lines.length*18+4});
  if(size)excluded.push({x:region.x+ax-size/2,y:region.y+ay-size/2,w:size,h:size});
 }
 for(const prop of [...mapProps,...ambientProps,...fairyDecorations])excluded.push({x:prop.x-prop.size/2,y:prop.y-prop.size/2,w:prop.size,h:prop.size});
 for(const route of routes){
  const [x,y]=route.labelAt;
  const onRoad=route.points.slice(1).some(([bx,by],index)=>{const [ax,ay]=route.points[index],dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(length||1)));return Math.hypot(x-ax-dx*t,y-ay-dy*t)<.01});
  assert(onRoad,`${route.name} marker floats away from its road`);
  assert(!excluded.some(box=>x>box.x-4&&x<box.x+box.w+4&&y>box.y-4&&y<box.y+box.h+4),`${route.name} marker covers a landmark or label`);
 }
});

test('presentation changes preserve the requested destination and homestead connections',()=>{
 const connections={artificer:['fireworks','magical'],ascent:['magical','healing','celestial'],mending:['trauma','life-recall','healing'],vanishing:['jhana','formless'],siddhi:['jhana','tower','magical'],reappearance:['formless','celestial'],middle:['tower','house'],'library-lane':['house','library'],'fortification-road':['red-dot','fortification-tavern']};
 for(const [id,regions] of Object.entries(connections)){
  const route=routes.find(item=>item.id===id);assert(route,`missing ${id}`);
  for(const id of regions){const region=mapRegions.find(item=>item.id===id);assert(route.points.some(([x,y])=>Math.hypot(x-region.x,y-region.y)<.01),`${route.name} no longer reaches ${region.name}`)}
 }
});
