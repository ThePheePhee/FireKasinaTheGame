import test from 'node:test';
import assert from 'node:assert/strict';
import {routes} from '../src/data/routes.ts';
import {countryAt} from '../src/game/worldProgression.ts';
import {distanceToRoute,nearbyRoutes} from '../src/engine/nearbyRoutes.ts';

const routeById=id=>routes.find(route=>route.id===id);
const ids=roads=>roads.map(route=>route.id);
const midpoint=(route,index)=>[(route.points[index][0]+route.points[index+1][0])/2,(route.points[index][1]+route.points[index+1][1])/2];
const causeway=routeById('artificer'),[causewayX,causewayY]=midpoint(causeway,1);

test('the actual Artificer causeway is named along its surface, not only at its plaque',()=>{
 assert.deepEqual(ids(nearbyRoutes(causewayX,causewayY)),['artificer']);
 assert(distanceToRoute(causeway,causewayX,causewayY)<1e-9);
 assert.equal(distanceToRoute(causeway,causewayX,causewayY+14),14);
 assert.deepEqual(ids(nearbyRoutes(causewayX,causewayY+28)),['artificer']);
 assert.deepEqual(nearbyRoutes(causewayX,causewayY+28.1),[]);
});

test('one physical northern road exposes both the Luminous Ascent and the Healer’s Light',()=>{
 const [x,y]=midpoint(routeById('ascent'),0);
 assert.deepEqual(ids(nearbyRoutes(x,y)),['ascent','healers-light']);
 assert.deepEqual(ids(nearbyRoutes(x,y,'healers-light')),['healers-light','ascent']);
 // Retaining the name at the verge retains its shared-road alternatives too.
 assert.deepEqual(ids(nearbyRoutes(x,y+32,'ascent')),['ascent','healers-light']);
});

test('the library lane is discoverable without leaving the safe homestead',()=>{
 const lane=routeById('library-lane'),[x,y]=midpoint(lane,lane.points.length-2);
 assert.equal(countryAt(x,y),'home');
 assert.deepEqual(ids(nearbyRoutes(x,y)),['library-lane']);
 const [sharedX,sharedY]=midpoint(lane,0);
 assert.deepEqual(new Set(ids(nearbyRoutes(sharedX,sharedY))),new Set(['middle','library-lane']));
});

test('verge hysteresis retains an encountered road up to 38 pixels, but never latches onto a remote road',()=>{
 assert.deepEqual(nearbyRoutes(causewayX,causewayY+32),[]);
 assert.deepEqual(ids(nearbyRoutes(causewayX,causewayY+32,'artificer')),['artificer']);
 assert.deepEqual(ids(nearbyRoutes(causewayX,causewayY+38,'artificer')),['artificer']);
 assert.deepEqual(nearbyRoutes(causewayX,causewayY+38.1,'artificer'),[]);
 assert.deepEqual(nearbyRoutes(causewayX,causewayY+32,'unmaking'),[]);
 assert.deepEqual(ids(nearbyRoutes(causewayX,causewayY,'missing-route')),['artificer']);
});

test('junction names remain stable through small movements and discard clearly farther branches',()=>{
 const [x,y]=routeById('ascent').points[0];
 const atJunction=nearbyRoutes(x,y);
 assert.equal(atJunction[0].family,'generation');
 for(const [dx,dy] of [[0,0],[4,3],[-3,2],[2,-3]]){
  assert.equal(nearbyRoutes(x+dx,y+dy,'reality')[0].id,'reality');
 }
 const alongAscent=nearbyRoutes(x+18,y,'reality');
 assert.deepEqual(ids(alongAscent),['ascent','healers-light']);
 const nearest=Math.min(...routes.map(route=>distanceToRoute(route,x+18,y)));
 for(const route of alongAscent)assert(distanceToRoute(route,x+18,y)<=nearest+8);
});

test('empty wilderness and invalid positions never invent a road encounter',()=>{
 for(const [x,y] of [[0,0],[1888,1298],[-1000,-1000],[NaN,0],[0,Infinity],[-Infinity,0],[Number.MAX_VALUE,Number.MAX_VALUE]]){
  assert.deepEqual(nearbyRoutes(x,y),[]);
  assert.deepEqual(nearbyRoutes(x,y,'artificer'),[]);
 }
 assert.equal(distanceToRoute(causeway,NaN,0),Infinity);
 assert.equal(distanceToRoute({...causeway,points:[]},0,0),Infinity);
 assert.equal(distanceToRoute({...causeway,points:[[5,5],[5,5]]},8,9),5);
});

test('proximity queries are deterministic and leave authored routes untouched',()=>{
 const before=JSON.stringify(routes);
 for(const route of routes)for(let index=0;index<route.points.length-1;index++){
  const [x,y]=midpoint(route,index),first=nearbyRoutes(x,y,route.id),second=nearbyRoutes(x,y,route.id);
  assert.deepEqual(first,second);
  assert(first.includes(route),`${route.name} must be discoverable on every segment`);
  first.reverse();first.pop();
 }
 assert.equal(JSON.stringify(routes),before);
});
