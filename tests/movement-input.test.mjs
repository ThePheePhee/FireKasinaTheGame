import test from 'node:test';
import assert from 'node:assert/strict';
import {createMovementInput} from '../src/engine/movementInput.ts';
import {movePlayer} from '../src/engine/movement.ts';
import {slideAlongObstacles} from '../src/engine/interiorNavigation.ts';
import {worldEntryBarrier} from '../src/game/worldProgression.ts';
import {mapRegions,WORLD} from '../src/data/mapRegions.ts';

test('touch release/cancel cannot release a physical key, and physical release cannot cancel touch',()=>{
 const input=createMovementInput();input.held.add('w');input.setVirtual('w',true);
 input.setVirtual('w',false);assert(input.frame(.02).keys.has('w'));
 input.setVirtual('w',true);input.held.delete('w');assert(input.frame(.02).keys.has('w'));
 input.setVirtual('w',false);assert.equal(input.frame(.02).keys.size,0);
});

test('independent directions combine normally, and clearing interrupts every input owner',()=>{
 const input=createMovementInput();input.held.add('ArrowLeft');input.setVirtual('d',true);
 let player={x:100,y:100,direction:'down',moving:false,step:0};
 const frame=input.frame(.03);player=movePlayer(player,frame.keys,frame.dt,500,500);
 assert.equal(player.x,100,'opposite held directions cancel through ordinary movement');
 input.nudge('w');input.clear();assert.equal(input.frame(.04).keys.size,0);
 assert.equal(input.frame(.04).keys.size,0,'a paused/resumed frame cannot revive a queued nudge');
});

test('accessible button nudges use a bounded frame-rate-independent step without held-input drift',()=>{
 for(const hz of [30,60,144]){
  const input=createMovementInput();input.nudge('d');
  let player={x:100,y:100,direction:'down',moving:false,step:0};
  for(let frame=0;frame<hz;frame++){const next=input.frame(1/hz);player=movePlayer(player,next.keys,next.dt,500,500)}
  assert(Math.abs(player.x-111.4)<1e-8,`${hz} Hz must not turn one click into a held key`);
  assert.equal(player.moving,false);
 }
});

test('ordinary held movement keeps its existing speed and diagonal normalization',()=>{
 const input=createMovementInput();input.held.add('w');input.setVirtual('d',true);
 const frame=input.frame(.04),player={x:100,y:100,direction:'down',moving:false,step:0};
 const next=movePlayer(player,frame.keys,frame.dt,500,500);
 assert(Math.abs(Math.hypot(next.x-player.x,next.y-player.y)-190*.04)<1e-8);
 for(const dt of [NaN,Infinity,-1])assert.equal(input.frame(dt).dt,0);
});

test('button nudges still meet the actual mist gate instead of teleporting through it',()=>{
 const house=mapRegions.find(region=>region.id==='house'),input=createMovementInput();
 let player={x:house.x,y:house.y,direction:'down',moving:false,step:0},blocked=0;
 for(let click=0;click<200;click++){
  input.nudge('s');
  for(let step=0;step<4;step++){
   const frame=input.frame(.02),candidate=movePlayer(player,frame.keys,frame.dt,WORLD.width,WORLD.height);
   const barrier=worldEntryBarrier(player,candidate,{concentration:0,clarity:0});
   if(barrier){assert.equal(barrier,'mist');blocked++}else player=candidate;
  }
 }
 assert(blocked>0,'the real outward route must encounter the progression boundary');
});

test('button nudges stop at interior furniture through the ordinary collision solver',()=>{
 const input=createMovementInput(),table={x:150,y:70,w:90,h:100};
 let player={x:100,y:100,direction:'right',moving:false,step:0};
 for(let click=0;click<40;click++){
  input.nudge('d');
  for(let step=0;step<4;step++){
   const frame=input.frame(.02),candidate=movePlayer(player,frame.keys,frame.dt,500,500);
   player=slideAlongObstacles(player,candidate,[table]);
  }
 }
 assert(player.x<150,'repeated accessible clicks must not tunnel through the table');
 assert(player.x>100,'the nudge should still approach the table normally');
});
