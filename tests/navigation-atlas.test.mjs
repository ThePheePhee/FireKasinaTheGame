import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import SubMap from '../src/components/SubMap.tsx';
import {interiorMaps} from '../src/data/interiorMaps.ts';
import {mapRegions,WORLD} from '../src/data/mapRegions.ts';
import {regionVisuals} from '../src/data/regionVisuals.ts';
import {fitMap,focusMapTarget,worldToScreen} from '../src/engine/mapViewport.ts';
import {interiorEntry,interiorLoreEntryId} from '../src/engine/interiorInteraction.ts';

test('locating an interior landmark gives it a readable mobile view while preserving the same floor data',()=>{
 const size={width:390,height:310};
 for(const map of interiorMaps)for(const floor of map.floors){
  const original=JSON.stringify(floor),overview=fitMap(size,floor);
  for(const zone of floor.zones){
   const view=focusMapTarget({x:zone.x,y:zone.y+zone.h*.12,width:Math.max(260,zone.w),height:Math.max(240,zone.h+70)},size,floor);
   const p=worldToScreen(view,zone.x,zone.y);
   assert.ok(p.x>=0&&p.x<=size.width&&p.y>=0&&p.y<=size.height,`${map.name}/${zone.name} must be in view`);
   assert.ok(view.scale>=overview.scale&&view.scale<=overview.scale*5);
   assert.ok(view.scale>=overview.scale*1.5,`${map.name}/${zone.name} should become visibly larger`);
  }
  assert.equal(JSON.stringify(floor),original,'Atlas location must not alter spawn, artwork, topology or walkable floor data');
 }
});

test('main-map directory cameras point at each actual landmark and stay within zoom limits',()=>{
 for(const size of [{width:390,height:740},{width:1280,height:640}])for(const region of mapRegions){
  const visual=regionVisuals[region.id],offset=visual?.artOffset??[0,0];
  const target={x:region.x+offset[0],y:region.y+offset[1],width:320,height:300};
  const view=focusMapTarget(target,size,WORLD),point=worldToScreen(view,target.x,target.y);
  assert.ok(point.x>=0&&point.x<=size.width&&point.y>=0&&point.y<=size.height,`${region.name} must remain visible`);
  assert.ok(view.scale>=fitMap(size,WORLD).scale&&view.scale<=fitMap(size,WORLD).scale*5);
 }
 assert.deepEqual(focusMapTarget({x:NaN,y:0,width:300,height:300},{width:390,height:310}),fitMap({width:390,height:310}));
});

test('every floor and traveller has separate Locate and Read controls, even when overview captions cannot fit',()=>{
 const reads=[];
 for(const map of interiorMaps)for(const [index,floor] of map.floors.entries()){
  const html=renderToStaticMarkup(createElement(SubMap,{map,initialFloorIndex:index,onExit(){},onReadEntry:id=>reads.push(id)}));
  const count=floor.zones.length+(floor.npcs?.length??0);
  assert.equal((html.match(/class="area-locate"/g)??[]).length,count,`${map.name}/${floor.name}: missing location control`);
  assert.equal((html.match(/class="area-read"/g)??[]).length,count,`${map.name}/${floor.name}: missing notes control`);
  assert.match(html,/Places on this floor/);
  assert.match(html,/Show whole floor/);
  assert.match(html,/Floor notes/);
  assert.match(html,/MAIN MAP/);
 }
 assert.deepEqual(reads,[],'Merely opening the atlas must not mark unvisited floor notes as read');
});

test('the walking atlas exposes a way back and the wizard marker only on the real current floor',()=>{
 const map=interiorMaps.find(map=>map.regionId==='tower'),position={x:map.floors[1].spawn[0],y:map.floors[1].spawn[1],floorIndex:1};
 const render=index=>renderToStaticMarkup(createElement(SubMap,{map,initialFloorIndex:index,position,exitLabel:'BACK TO WALKING',onExit(){}}));
 const current=render(1);
 assert.match(current,/BACK TO WALKING/);
 assert.match(current,/YOU ARE HERE/);
 assert.match(current,/Locate your wizard/);
 assert.doesNotMatch(render(0),/YOU ARE HERE|Locate your wizard/,'Reading other floors must not pretend the wizard teleported there');
});

test('walking and map notes resolve to canonical floor, place and traveller journal identities',()=>{
 for(const map of interiorMaps)for(const floor of map.floors){
  assert.equal(interiorLoreEntryId(map,floor,interiorEntry(map,floor)),`floor:${map.id}:${floor.id}`);
  for(const zone of floor.zones)assert.equal(interiorLoreEntryId(map,floor,zone),`interior:${map.id}:${floor.id}:${zone.id}`);
  for(const npc of floor.npcs??[])assert.equal(interiorLoreEntryId(map,floor,{id:`npc-${npc.id}`}),`interior:${map.id}:${floor.id}:npc-${npc.id}`);
 }
});

test('the atlas makes every background control inert declaratively while reading without hiding the dialog',()=>{
 // Inspect the JSX contract itself: SSR cannot open local React state, and an
 // imperative sibling-inert workaround would be undone by React inconsistently.
 const source=ts.createSourceFile('SubMap.tsx',readFileSync(new URL('../src/components/SubMap.tsx',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const surfaces=new Map();let dialogInert=false;
 function visit(node){
  if(ts.isJsxOpeningElement(node)){
   const attrs=node.attributes.properties.filter(ts.isJsxAttribute);
   const css=attrs.find(attr=>attr.name.getText(source)==='className')?.initializer;
   if(css&&ts.isStringLiteral(css)&&['submap-header','floor-tabs','submap-content'].includes(css.text))surfaces.set(css.text,attrs.find(attr=>attr.name.getText(source)==='inert')?.initializer?.getText(source));
   if(node.tagName.getText(source)==='LoreDialog')dialogInert=attrs.some(attr=>attr.name.getText(source)==='inert');
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
 assert.deepEqual([...surfaces.entries()].sort(),[['floor-tabs','{!!selected}'],['submap-content','{!!selected}'],['submap-header','{!!selected}']]);
 assert.equal(dialogInert,false);
});

test('resizing keeps the selected floor tab visible without resetting its camera or chosen place',()=>{
 const source=ts.createSourceFile('SubMap.tsx',readFileSync(new URL('../src/components/SubMap.tsx',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const effects=[];
 const visit=node=>{if(ts.isCallExpression(node)&&node.expression.getText(source)==='useEffect')effects.push(node);ts.forEachChild(node,visit)};
 visit(source);
 const tab=effects.find(effect=>effect.arguments[0].getText(source).includes('scrollIntoView'));
 assert.ok(tab,'Selected floor tabs must scroll into view');
 assert.deepEqual(tab.arguments[1].elements.map(item=>item.getText(source)),['floor.id','size.width']);
 assert.doesNotMatch(tab.arguments[0].getText(source),/reset\(|setFloorIndex\(|setFocusedId\(/,'Orientation must not reset a focused camera or change floors');
 const reset=effects.find(effect=>effect.arguments[0].getText(source).includes('reset()'));
 assert.deepEqual(reset.arguments[1].elements.map(item=>item.getText(source)),['floor.id']);
});
