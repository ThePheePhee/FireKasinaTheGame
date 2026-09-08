import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRoadSections,roadFamilyPriority,routes} from '../src/data/routes.ts';
import {mapRegions,WORLD} from '../src/data/mapRegions.ts';
import {countryAt} from '../src/game/worldProgression.ts';

const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const sections=buildRoadSections(routes);

test('all eighteen named teachings retain intentional orthogonal or diagonal roads',()=>{
 assert.deepEqual(routes.map(route=>route.id).sort(),['kindling','artificer','ascent','unmaking','vanishing','middle','clarity','reality','integration','mending','healers-light','siddhi','contemplative','return','reappearance','credulous-loop','library-lane','fortification-road'].sort());
 for(const route of routes){
  assert(route.name.trim());
  for(let index=1;index<route.points.length;index++){
   const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],dx=Math.abs(bx-ax),dy=Math.abs(by-ay);
   assert(dx<.001||dy<.001||Math.abs(dx-dy)<.001,`${route.name}: awkward bend between ${route.points[index-1]} and ${route.points[index]}`);
   assert(distance([ax,ay],[bx,by])>1,`${route.name}: duplicate waypoint`);
   assert(bx>=0&&bx<=WORLD.width&&by>=0&&by<=WORLD.height,`${route.name}: outside map`);
  }
 }
});

test('shared corridor deduplication preserves every named route’s full distance',()=>{
 for(const route of routes){
  const logical=route.points.slice(1).reduce((sum,point,index)=>sum+distance(point,route.points[index]),0);
  const physical=sections.filter(section=>section.routeIds.includes(route.id)).reduce((sum,section)=>sum+distance(section.a,section.b),0);
  assert(Math.abs(logical-physical)<.001,`${route.name} lost a connection during road merging`);
 }
 const logical=routes.reduce((sum,route)=>sum+route.points.slice(1).reduce((total,point,index)=>total+distance(point,route.points[index]),0),0);
 const physical=sections.reduce((sum,section)=>sum+distance(section.a,section.b),0);
 assert(physical<logical*.8,'named shortcuts should share real trunks rather than add overlapping lines');
 for(const section of sections){
  const priorities=section.routeIds.map(id=>roadFamilyPriority[routes.find(route=>route.id===id).family]);
  assert.equal(roadFamilyPriority[section.family],Math.max(...priorities),'neutral shortcuts must not paint over a primary teaching road');
 }
});

test('a reversed shortcut shares only its overlapping trunk and keeps its branch junction',()=>{
 const primary={id:'main',name:'Main',family:'generation',kind:'tram',points:[[0,0],[100,0]],labelAt:[0,0]};
 const shortcut={id:'short',name:'Short',family:'connection',kind:'rail',points:[[80,0],[20,0]],labelAt:[20,0]};
 const branch={id:'branch',name:'Branch',family:'balance',kind:'tram',points:[[50,0],[50,50]],labelAt:[50,25]};
 const result=buildRoadSections([shortcut,primary,branch]);
 assert.equal(result.length,5);
 assert.equal(result.reduce((sum,section)=>sum+distance(section.a,section.b),0),150);
 assert.equal(result.filter(section=>section.routeIds.includes('short')).reduce((sum,section)=>sum+distance(section.a,section.b),0),60);
 assert(result.filter(section=>section.routeIds.includes('main')).every(section=>section.family==='generation'));
 assert.equal(result.filter(section=>[section.a,section.b].some(point=>distance(point,[50,0])<.001)).length,3);
});

test('roads meet at deliberate junctions rather than crossing mid-segment',()=>{
 for(let i=0;i<sections.length;i++)for(let j=i+1;j<sections.length;j++){
  const a=sections[i],b=sections[j],dx=a.b[0]-a.a[0],dy=a.b[1]-a.a[1],ex=b.b[0]-b.a[0],ey=b.b[1]-b.a[1],det=dx*ey-dy*ex;
  if(Math.abs(det)<.001)continue;
  const x=b.a[0]-a.a[0],y=b.a[1]-a.a[1],t=(x*ey-y*ex)/det,u=(x*dy-y*dx)/det;
  assert(!(t>.00001&&t<.99999&&u>.00001&&u<.99999),`${a.routeIds.join('/')} crosses ${b.routeIds.join('/')} without a junction`);
 }
});

test('both principal practice roads begin at home and lead through the mist to an outer destination',()=>{
 for(const id of ['kindling','unmaking']){
  const route=routes.find(item=>item.id===id),[x,y]=route.points[0],[lastX,lastY]=route.points.at(-1);
  assert.equal(countryAt(x,y),'home',`${route.name} should be reachable from the homestead`);
  assert(route.points.some(([x,y])=>countryAt(x,y)==='mist'));
  assert.equal(countryAt(lastX,lastY),'fairy',`${route.name} must lead to an outer destination`);
 }
});

test('the Credulous Clarity Circuit still visits its crags and circles back to them',()=>{
 const route=routes.find(item=>item.id==='credulous-loop'),crags=mapRegions.find(region=>region.id==='counterfeit-crags'),circuit=mapRegions.find(region=>region.id==='credulous-circuit');
 assert.deepEqual(route.points[0],[crags.x,crags.y]);assert.deepEqual(route.points.at(-1),route.points[0]);
 assert(route.points.some(point=>distance(point,[circuit.x,circuit.y])<.001));
});
