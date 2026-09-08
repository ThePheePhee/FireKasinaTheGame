import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import MapMode from '../src/components/MapMode.tsx';
import {routes} from '../src/data/routes.ts';
import {mapRegions,WORLD} from '../src/data/mapRegions.ts';
import {regionVisuals} from '../src/data/regionVisuals.ts';
import {mapProps} from '../src/data/mapProps.ts';
import {constrainMap,fitMap,worldToScreen} from '../src/engine/mapViewport.ts';
import {boxesOverlap,isCompactRouteOverview,layoutLocationLabels,layoutRouteLabels,PRIMARY_ROUTE_IDS,splitRouteName} from '../src/engine/routeLabels.ts';

const distanceToRoad=(point,route)=>Math.min(...route.points.slice(1).map((b,index)=>{
 const a=route.points[index],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(point.x-a[0]-dx*t,point.y-a[1]-dy*t);
}));

function checkPlacement(labels,view,size,obstacles){
 for(const [index,label] of labels.entries()){
  assert.equal(label.lines.join(' '),label.route.name,'A road must keep its whole name');
  assert.ok(label.x>=0&&label.y>=0&&label.x+label.width<=size.width&&label.y+label.height<=size.height,'Sign leaves the visible viewport');
  for(const obstacle of obstacles)assert.ok(!boxesOverlap(label,obstacle),`${label.route.name} hides a landmark`);
  for(const other of labels.slice(index+1))assert.ok(!boxesOverlap(label,other),`${label.route.name} overlaps ${other.route.name}`);
  const worldAnchor={x:label.anchor.x/view.scale+view.x,y:label.anchor.y/view.scale+view.y};
  assert.ok(distanceToRoad(worldAnchor,label.route)<.00001,`${label.route.name} points to empty countryside`);
  assert.ok(Math.abs(label.stem.x-label.anchor.x)+Math.abs(label.stem.y-label.anchor.y)<=35,'A road sign became a long diagram leader');
  assert.ok(label.width<=150,'A road sign dwarfs the landmark names');
 }
}

test('signs keep complete names and split only between words',()=>{
 for(const route of routes){const lines=splitRouteName(route.name);assert.ok(lines.length<=2);assert.equal(lines.join(' '),route.name);assert.ok(lines.every(line=>line.trim()===line&&line.length>0))}
 assert.deepEqual(splitRouteName('Clarity Ridge'),['Clarity Ridge']);
 assert.equal(splitRouteName('The Road of Splendid Reappearance').length,2);
});

test('the route guide visibly names its purpose and starts with map labels enabled',()=>{
 const html=renderToStaticMarkup(createElement(MapMode,{onSelectRegion(){},onSelectRoute(){},onSelectProp(){},onClear(){}}));
 assert.match(html,new RegExp(`aria-label="Named paths: browse all ${routes.length} roads"`));
 assert.match(html,/NAMED PATHS/);
 assert.match(html,/aria-controls="map-route-index"/);
 assert.match(html,/aria-label="Show path names on the map" aria-pressed="true"/);
});

test('desktop overview lays out readable road names without covering landmark art or one another',()=>{
 const size={width:1280,height:800},view=fitMap(size,WORLD);
 const protectedArt=mapRegions.flatMap(region=>{
  const visual=regionVisuals[region.id];if(!visual?.artSize)return[];
  const [dx,dy]=visual.artOffset??[0,0],point=worldToScreen(view,region.x+dx,region.y+dy),size=visual.artSize*view.scale;
  return[{x:point.x-size/2,y:point.y-size/2,width:size,height:size}];
 });
 protectedArt.push(...layoutLocationLabels(mapRegions,regionVisuals,view));
 const labels=layoutRouteLabels(routes,view,size,protectedArt,false,null,WORLD);
 assert.ok(labels.length>=12,`Only ${labels.length} road signs visible`);
 for(const id of PRIMARY_ROUTE_IDS)assert.ok(labels.some(label=>label.route.id===id),`Missing major road ${id}`);
 checkPlacement(labels,view,size,protectedArt);
});

test('compact maps retain primary road names and prioritize the selected road',()=>{
 const size={width:390,height:844},view=fitMap(size,WORLD),labels=layoutRouteLabels(routes,view,size,[],true);
 assert.equal(labels.length,PRIMARY_ROUTE_IDS.length);
 assert.deepEqual(labels.map(label=>label.route.id),PRIMARY_ROUTE_IDS);
 checkPlacement(labels,view,size,[]);
 for(const route of routes){
  const selected=layoutRouteLabels(routes,view,size,[],true,route.id);
  assert.equal(selected[0]?.route.id,route.id,`Cannot reveal ${route.name} from the Routes index`);
  assert.ok(selected.every(label=>PRIMARY_ROUTE_IDS.includes(label.route.id)||label.route.id===route.id));
  checkPlacement(selected,view,size,[]);
 }
});

test('road labels remain readable when zooming and omit impossible placements rather than overlap',()=>{
 const size={width:1000,height:700};
 const route={id:'test',name:'The Patient Crossing',family:'balance',kind:'bridge',points:[[100,250],[800,250]],labelAt:[450,250]};
 const wide=layoutRouteLabels([route],{x:0,y:0,scale:1},size,[])[0];
 const zoomed=layoutRouteLabels([route],{x:200,y:100,scale:1.5},size,[])[0];
 assert.equal(wide.width,zoomed.width);assert.equal(wide.height,zoomed.height);
 assert.deepEqual(layoutRouteLabels([route],{x:0,y:0,scale:1},size,[{x:0,y:0,width:1000,height:700}]),[]);
});

test('mobile decluttering ends after the first zoom step, not only after the browser grows wider',()=>{
 for(const size of [{width:390,height:768},{width:600,height:800},{width:720,height:420}]){
  const fit=fitMap(size,WORLD);
  assert.equal(isCompactRouteOverview(fit,size,true,WORLD),true);
  assert.equal(isCompactRouteOverview({...fit,scale:fit.scale*1.5},size,true,WORLD),false);
  assert.equal(isCompactRouteOverview(fit,size,false,WORLD),false);
 }
});

test('phone explorers can see secondary named roads after zooming without selecting them first',()=>{
 const size={width:390,height:768},scale=fitMap(size,WORLD).scale*1.5;
 for(const id of ['artificer','ascent','reappearance']){
  const route=routes.find(route=>route.id===id);
  const view=constrainMap({x:route.labelAt[0]-size.width/scale/2,y:route.labelAt[1]-size.height/scale/2,scale},size,WORLD);
  const props=mapProps.map(prop=>{const p=worldToScreen(view,prop.x,prop.y),w=prop.size*scale;return{x:p.x-w/2,y:p.y-w/2,width:w,height:w}});
  const art=mapRegions.flatMap(region=>{const visual=regionVisuals[region.id],w=(visual?.artSize??0)*scale;if(!w)return[];const [dx,dy]=visual.artOffset??[0,0],p=worldToScreen(view,region.x+dx,region.y+dy);return[{x:p.x-w/2,y:p.y-w/2,width:w,height:w}]});
  const obstacles=[...art,...props,...layoutLocationLabels(mapRegions,regionVisuals,view,props,size),{x:0,y:size.height-100,width:240,height:100},{x:size.width-76,y:size.height-194,width:76,height:194}];
  const labels=layoutRouteLabels(routes,view,size,obstacles,true,null,WORLD);
  assert.ok(labels.some(label=>label.route.id===id),`${route.name} is still hidden from phone explorers`);
  checkPlacement(labels,view,size,obstacles);
 }
});

test('road signs stay inside the rendered world, not in the surrounding letterbox',()=>{
 const size={width:1440,height:800},view=fitMap(size,WORLD),labels=layoutRouteLabels(routes,view,size,[],false,null,WORLD);
 const start=worldToScreen(view,0,0),end=worldToScreen(view,WORLD.width,WORLD.height);
 assert.ok(labels.length>10);
 for(const label of labels){assert.ok(label.x>=start.x&&label.y>=start.y);assert.ok(label.x+label.width<=end.x&&label.y+label.height<=end.y)}
});

test('location captions remain readable at overview and preserve authored line breaks',()=>{
 const view=fitMap({width:1280,height:720},WORLD),labels=layoutLocationLabels(mapRegions,regionVisuals,view);
 for(const label of labels){
  assert.ok(label.fontSize>=9.9);
  const custom=regionVisuals[label.region.id]?.labelLines;
  if(label.region.id==='credulous-circuit')assert.deepEqual(label.lines,['Credulous','Clarity','Circuit']);
  else if(custom)assert.deepEqual(label.lines,custom);else assert.equal(label.lines.join(' '),label.region.name);
 }
});

test('location captions never overlap other captions, landmark art, or story props on desktop or mobile',()=>{
 for(const size of [{width:1280,height:720},{width:390,height:844},{width:1280,height:644},{width:390,height:768}]){
  const view=fitMap(size,WORLD),props=mapProps.map(prop=>{const p=worldToScreen(view,prop.x,prop.y),w=prop.size*view.scale;return{x:p.x-w/2,y:p.y-w/2,width:w,height:w}});
  const art=mapRegions.flatMap(region=>{const v=regionVisuals[region.id];if(!v?.artSize)return[];const [dx,dy]=v.artOffset??[0,0],p=worldToScreen(view,region.x+dx,region.y+dy),w=v.artSize*view.scale;return[{x:p.x-w/2,y:p.y-w/2,width:w,height:w}]});
  const labels=layoutLocationLabels(mapRegions,regionVisuals,view,props,size);
  assert.ok(labels.length>=12,`Only ${labels.length} captions visible at ${size.width}px`);
  for(const [index,label] of labels.entries()){
   assert.ok(label.x>=0&&label.x+label.width<=size.width&&label.y>=0&&label.y+label.height<=size.height,'Caption clips outside viewport');
   for(const other of labels.slice(index+1))assert.ok(!boxesOverlap(label,other,2),`${label.region.name} overlaps ${other.region.name} at ${size.width}px`);
   for(const item of [...art,...props])assert.ok(!boxesOverlap(label,item),`${label.region.name} hides art at ${size.width}px`);
  }
  const home=labels.find(label=>label.region.id==='house');assert.ok(home,`Home must remain named at ${size.width}×${size.height}`);
  for(const id of ['library','red-dot'])assert.ok(labels.some(label=>label.region.id===id),`${id} must remain named at ${size.width}×${size.height}`);
  if(size.width<760){assert.deepEqual(home.lines,['Home']);assert.equal(home.region.name,'Your House')}
 }
});

test('the short desktop overview names every clearing beside its own landmark',()=>{
 const size={width:1280,height:644},view=fitMap(size,WORLD);
 const props=mapProps.map(prop=>{const point=worldToScreen(view,prop.x,prop.y),width=prop.size*view.scale;return{x:point.x-width/2,y:point.y-width/2,width,height:width}});
 const labels=layoutLocationLabels(mapRegions,regionVisuals,view,props,size);
 assert.equal(labels.length,mapRegions.length,'No destination should lose its name on the desktop overview');
 for(const id of ['library','counterfeit-crags','credulous-circuit']){
  const label=labels.find(label=>label.region.id===id),region=mapRegions.find(region=>region.id===id),[dx,dy]=regionVisuals[id].labelOffset;
  const anchor=worldToScreen(view,region.x+dx,region.y+dy);
  assert(Math.hypot(label.x+label.width/2-anchor.x,label.y-anchor.y)<25,`${id} caption drifted toward another landmark`);
  assert.equal(label.region.name,region.name,'A concise caption must not rename the actual place');
 }
});
