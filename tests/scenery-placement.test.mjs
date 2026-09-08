import test from 'node:test';
import assert from 'node:assert/strict';
import {mapProps,ambientProps} from '../src/data/mapProps.ts';
import {fairyDecorations} from '../src/data/regionVisuals.ts';
import {routes} from '../src/data/routes.ts';
import {WORLD} from '../src/data/mapScale.ts';
import {countryAt} from '../src/game/worldProgression.ts';
import {sceneryExclusions} from '../src/rendering/landscapeModel.ts';

const props=[...mapProps,...ambientProps.map((prop,index)=>({...prop,id:`ambient-${index}`})),...fairyDecorations.map((prop,index)=>({...prop,id:`fairy-${index}`}))];
const bounds=(prop,padding=0)=>({x:prop.x-prop.size/2-padding,y:prop.y-prop.size/2-padding,w:prop.size+padding*2,h:prop.size+padding*2});
const overlaps=(a,b)=>a.x<=b.x+b.w&&a.x+a.w>=b.x&&a.y<=b.y+b.h&&a.y+a.h>=b.y;

// Clip the whole road segment against the expanded sprite rectangle. Checking
// only a prop's centre misses diagonals through its corners and wide roads.
function segmentIntersectsBox(a,b,box){
 let enter=0,exit=1;
 for(const [origin,delta,minimum,maximum] of [[a[0],b[0]-a[0],box.x,box.x+box.w],[a[1],b[1]-a[1],box.y,box.y+box.h]]){
  if(delta===0){if(origin<minimum||origin>maximum)return false;continue}
  const first=(minimum-origin)/delta,last=(maximum-origin)/delta;
  enter=Math.max(enter,Math.min(first,last));exit=Math.min(exit,Math.max(first,last));
  if(enter>exit)return false;
 }
 return true;
}

test('all decorative and interactive props leave room for the full road surface',()=>{
 for(const prop of props)for(const route of routes)for(let index=1;index<route.points.length;index++){
  // The widest road is 28px: preserve its 14px half-width plus a 2px verge.
  assert(!segmentIntersectsBox(route.points[index-1],route.points[index],bounds(prop,16)),`${prop.id} obstructs ${route.name}`);
 }
});

test('prop relocation preserves breathing room around landmarks, labels, other props, and map edges',()=>{
 const landmarks=sceneryExclusions().filter(box=>box.kind==='landmark'||box.kind==='label');
 for(const [index,prop] of props.entries()){
  const box=bounds(prop,4);
  assert(box.x>=12&&box.y>=12&&box.x+box.w<=WORLD.width-12&&box.y+box.h<=WORLD.height-12,`${prop.id} crowds the world edge`);
  for(const landmark of landmarks)assert(!overlaps(box,landmark),`${prop.id} crowds ${landmark.id} ${landmark.kind}`);
  for(const other of props.slice(index+1))assert(!overlaps(box,bounds(other,4)),`${prop.id} crowds ${other.id}`);
 }
});

test('roadside staging retains every teaching prop and keeps magical decorations outside the mist',()=>{
 assert.deepEqual(mapProps.map(prop=>prop.id),['two-cups','borrowed-nimitta','airport-guide','ripple-pool','desert-spirit','arcadian-gate','two-color-banner','parallax-window','living-procession','comparison-mirror']);
 assert.equal(ambientProps.length,6);assert.equal(fairyDecorations.length,8);
 for(const prop of fairyDecorations)assert.equal(countryAt(prop.x,prop.y),'fairy');
 for(const id of ['two-cups','borrowed-nimitta','comparison-mirror']){
  const prop=mapProps.find(prop=>prop.id===id);assert.equal(countryAt(prop.x,prop.y),'mist',`${id} must remain available within the mist`);
 }
 for(const prop of mapProps){assert(prop.copy.length>30);assert(prop.reference.url.startsWith('https://firekasina.org/'))}
});
