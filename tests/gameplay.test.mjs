import assert from 'node:assert/strict';
import test from 'node:test';
import * as practice from '../src/game/practiceDynamics.ts';
import * as tunnels from '../src/game/traumaMaze.ts';
import * as world from '../src/game/gameState.ts';
import * as progression from '../src/game/worldProgression.ts';
import {mapRegions,WORLD} from '../src/data/mapRegions.ts';
import {routes} from '../src/data/routes.ts';
import {regionContains} from '../src/engine/regionGeometry.ts';

test('actual outward walks from every home location stop at mist until concentration reaches 35',()=>{
 for(const id of ['house','garden','red-dot','library','fortification-tavern']){
  const start=mapRegions.find(region=>region.id===id);let crossings=0;
  assert.equal(progression.countryAt(start.x,start.y),'home',id);
  for(let ray=0;ray<8;ray++){
   const angle=ray*Math.PI/4;let before=start;
   for(let distance=2;distance<750;distance+=2){
    const next={x:start.x+Math.cos(angle)*distance,y:start.y+Math.sin(angle)*distance};
    if(progression.countryAt(before.x,before.y)==='home'&&progression.countryAt(next.x,next.y)==='mist'){
     assert.equal(progression.worldEntryBarrier(before,next,{concentration:34.999,clarity:100}),'mist',`${id}, ray ${ray}: clarity cannot substitute for concentration`);
     assert.equal(progression.worldEntryBarrier(before,next,{concentration:35,clarity:0}),null,`${id}, ray ${ray}: exactly 35 opens the mist`);
     assert.equal(progression.worldEntryBarrier(next,before,{concentration:0,clarity:0}),null,`${id}, ray ${ray}: returning home must remain possible`);
     crossings++;break;
    }
    before=next;
   }
  }
  assert.equal(crossings,8,`all eight outward paths from ${id} must encounter the progression gate`);
 }
});

test('both home footpaths remain safe all the way to the library and tavern',()=>{
 for(const id of ['library-lane','fortification-road']){
  const route=routes.find(route=>route.id===id);
  for(let segment=1;segment<route.points.length;segment++){
   const a=route.points[segment-1],b=route.points[segment];let previous={x:a[0],y:a[1]};
   for(let step=0;step<=20;step++){
    const next={x:a[0]+(b[0]-a[0])*step/20,y:a[1]+(b[1]-a[1])*step/20};
    assert.equal(progression.countryAt(next.x,next.y),'home',`${id} should never become a mist toll road`);
    assert.equal(progression.worldEntryBarrier(previous,next,{concentration:0,clarity:0}),null);
    previous=next;
   }
  }
 }
});

test('physical exits from the mist require both 80 clarity and 35 concentration',()=>{
 const origin=mapRegions.find(region=>region.id==='garden');let crossings=0;
 for(let ray=0;ray<32;ray++){
  const angle=ray*Math.PI/16;let before=origin;
  for(let distance=3;distance<1600;distance+=3){
   const next={x:origin.x+Math.cos(angle)*distance,y:origin.y+Math.sin(angle)*distance};
   if(next.x<0||next.y<0||next.x>WORLD.width||next.y>WORLD.height)break;
   if(progression.countryAt(before.x,before.y)==='mist'&&progression.countryAt(next.x,next.y)==='fairy'){
    assert.equal(progression.worldEntryBarrier(before,next,{concentration:100,clarity:79.999}),'fairy',`ray ${ray}: high concentration cannot substitute for clarity`);
    assert.equal(progression.worldEntryBarrier(before,next,{concentration:34.999,clarity:100}),'fairy',`ray ${ray}: clarity cannot substitute for concentration`);
    assert.equal(progression.worldEntryBarrier(before,next,{concentration:35,clarity:80}),null,`ray ${ray}: both exact thresholds must work`);
    crossings++;break;
   }
   before=next;
  }
 }
 assert.equal(crossings,32,'check the entire perimeter, including diagonal approaches');
});

test('edge destination circles cannot bypass the Fairy gate where they overlap the mist',()=>{
 const mist=mapRegions.find(region=>region.id==='mist');let overlapCrossings=0;
 for(const id of ['fireworks','magical','healing','celestial','tower','jhana','formless']){
  const region=mapRegions.find(region=>region.id===id);
  assert.equal(progression.countryAt(region.x,region.y),'fairy',`${id} is always an edge destination`);
  for(let ray=0;ray<256;ray++){
   const angle=ray*Math.PI/128,radius=region.shape.radius;
   const before={x:region.x+Math.cos(angle)*(radius+1),y:region.y+Math.sin(angle)*(radius+1)};
   const next={x:region.x+Math.cos(angle)*(radius-1),y:region.y+Math.sin(angle)*(radius-1)};
   if(!regionContains(mist,next.x,next.y)||progression.countryAt(before.x,before.y)!=='mist'||progression.regionAt(next.x,next.y)?.id!==id)continue;
   assert.equal(progression.countryAt(next.x,next.y),'fairy',`${id}'s overlap belongs to Fairy territory`);
   assert.equal(progression.worldEntryBarrier(before,next,{concentration:100,clarity:79}),'fairy',`${id}'s overlap must enforce clarity`);
   assert.equal(progression.worldEntryBarrier(before,next,{concentration:35,clarity:80}),null);
   overlapCrossings++;
  }
 }
 assert(overlapCrossings>0,'the real map must exercise at least one overlapping edge destination');
});

test('a depleted player inside the mist can walk continuously back to the Red Dot Range',()=>{
 const range=mapRegions.find(region=>region.id==='red-dot');
 for(const id of ['trauma','booboo','chasm','inn','counterfeit-crags','credulous-circuit']){
  const source=mapRegions.find(region=>region.id===id),distance=Math.hypot(range.x-source.x,range.y-source.y),steps=Math.ceil(distance/2);let before=source;
  assert.equal(progression.countryAt(source.x,source.y),'mist',id);
  for(let step=1;step<=steps;step++){
   const next={x:source.x+(range.x-source.x)*step/steps,y:source.y+(range.y-source.y)*step/steps};
   assert.equal(progression.worldEntryBarrier(before,next,{concentration:0,clarity:0}),null,`${id}: the homeward pull must not trap an exhausted traveler`);
   before=next;
  }
  assert.equal(progression.countryAt(before.x,before.y),'home');
 }
});

test('progression uses the requested 35 concentration and 80 clarity gates',()=>{
 assert.equal(world.MIST_ENTRY_CONCENTRATION,35);
 assert.equal(world.FAIRY_ENTRY_CONCENTRATION,35);
 assert.equal(world.FAIRY_ENTRY_CLARITY,80);
 assert.equal(world.applyExplorationAssists({...world.initialGameStats,concentration:2},{mist:true,fairy:false}).concentration,36);
 const fairy=world.applyExplorationAssists(world.initialGameStats,{mist:false,fairy:true});
 assert.equal(fairy.concentration,36);assert.equal(fairy.clarity,81);
 assert.equal(world.initialGameStats.concentration,0,'enabling an assist must not mutate the next new game');
});

test('all five homestead locations are initially visible',()=>{
 for(const id of ['house','garden','red-dot','library','fortification-tavern']){
  const region=mapRegions.find(region=>region.id===id);
  assert(world.initialDiscovery.some(point=>Math.hypot(point.x-region.x,point.y-region.y)<point.radius*.75),`${id} should be revealed from the start`);
 }
 const tower=mapRegions.find(region=>region.id==='tower');
 assert(!world.initialDiscovery.some(point=>Math.hypot(point.x-tower.x,point.y-tower.y)<point.radius),'distant destinations should remain undiscovered');
});

test('practice preserves the calibrated gain, diminishing returns and clarity benefit',()=>{
 const rate=(concentration,clarity=0,quality=1)=>practice.concentrationRate({concentration,clarity},quality);
 assert.equal(rate(0),.715);
 assert.equal(rate(0,0,0),0);
 assert(rate(35)<rate(0));
 assert(rate(65)<rate(35)*.4,'high concentration should remain difficult without clarity');
 assert(rate(65,50)>rate(65)*2,'clarity should help the upper concentration range');
 assert.equal(practice.DOT_DURATION_SECONDS,20);
 assert.equal(practice.ABSENCE_DURATION_SECONDS,10);
});

test('dot velocity damping is identical at 30, 60 and 144 frames per second',()=>{
 const damping=fps=>Array.from({length:fps}).reduce(value=>value*practice.targetDamping(1/fps),1);
 assert(Math.abs(damping(30)-damping(144))<1e-12);
 assert(Math.abs(damping(60)-Math.pow(.996,60))<1e-12);
});

test('crashing immediately cannot farm clarity; genuine lagoon progress does',()=>{
 assert.deepEqual(practice.lagoonReward(0,0),{clarity:0,confusion:0,equanimity:0});
 assert(practice.lagoonReward(3,2).clarity>practice.lagoonReward(1,0).clarity);
 assert.equal(practice.lagoonReward(100,100).clarity,20);
});

test('the labyrinth has a playable route from its entrance through grounding to its exit',()=>{
 const queue=[{state:tunnels.initialLabyrinthState,path:[]}],seen=new Set();let solution;
 for(let index=0;index<queue.length;index++){
  const item=queue[index],state=item.state;
  const key=JSON.stringify(state);if(seen.has(key))continue;seen.add(key);
  if(state.complete){solution=item;break}
  for(const direction of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){
   const next=tunnels.stepLabyrinth(state,direction);
   if(next.moved)queue.push({state:next.state,path:[...item.path,direction]});
  }
  assert(seen.size<20000,'maze search should remain bounded');
 }
 assert(solution,'the lantern door must be reachable');
 assert(solution.state.grounded,'the exit route must pass through the grounding mechanic');
 assert(solution.path.length*.52<35,'a careful route should be affordable at mist entry');
});

test('labyrinth symbols alter actual play and wall bumps do not use reversed steps',()=>{
 const initial=tunnels.initialLabyrinthState;
 const stateAt=(x,y,extra={})=>({...initial,position:{x,y},...extra});
 const falseDoor=tunnels.stepLabyrinth(stateAt(3,2),'ArrowUp');
 assert.deepEqual(falseDoor.state.position,{x:1,y:1});
 const face=tunnels.stepLabyrinth(stateAt(6,5),'ArrowLeft');
 assert.equal(face.moved,false);
 const locked=tunnels.stepLabyrinth(stateAt(6,9),'ArrowRight');
 assert.equal(locked.moved,false);
 const open=tunnels.stepLabyrinth(stateAt(6,9,{grounded:true}),'ArrowRight');
 assert.equal(open.moved,true);
 const shelter=tunnels.stepLabyrinth(stateAt(9,6),'ArrowUp');
 assert.equal(shelter.state.shifted,true);
 assert.deepEqual(shelter.state.checkpoint,{x:9,y:5});
 const repeat=tunnels.stepLabyrinth(stateAt(12,7,{checkpoint:{x:9,y:5}}),'ArrowLeft');
 assert.deepEqual(repeat.state.position,{x:9,y:5});
 const blockedReverse=tunnels.stepLabyrinth(stateAt(1,1,{reverseMoves:4}),'ArrowRight');
 assert.equal(blockedReverse.moved,false);
 assert.equal(blockedReverse.state.reverseMoves,4);
 const reverse=tunnels.stepLabyrinth(stateAt(1,1,{reverseMoves:4}),'ArrowUp');
 assert.deepEqual(reverse.state.position,{x:1,y:2});
 assert.equal(reverse.state.reverseMoves,3);
});

test('maze movement cannot leave its bounds or mutate an earlier state',()=>{
 const original=structuredClone(tunnels.initialLabyrinthState);
 const next=tunnels.stepLabyrinth(tunnels.initialLabyrinthState,'ArrowDown');
 assert.deepEqual(tunnels.initialLabyrinthState,original);
 assert.notDeepEqual(next.state.position,original.position);
 const out=tunnels.stepLabyrinth({...original,position:{x:0,y:0}},'ArrowLeft');
 assert.equal(out.moved,false);
});
