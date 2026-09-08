import test from 'node:test';
import assert from 'node:assert/strict';
import {routes} from '../src/data/routes.ts';
import {pathContent} from '../src/data/pathContent.ts';

const expectedNames={kindling:'The Kindling Road',artificer:"The Artificer's Causeway",ascent:'The Luminous Ascent',unmaking:'The Unmaking Way',vanishing:'The Vanishing Road',middle:"The Wayfarer's Middle Path",clarity:'Clarity Ridge',reality:'The Reality-Testing Road',integration:'The Integration Crossing',mending:'The Mending Way','healers-light':"The Healer's Light",siddhi:'The Siddhi Pass',contemplative:'The Contemplative Passage',return:'The Renewal Road',reappearance:'The Road of Splendid Reappearance','credulous-loop':'The Credulous Clarity Circuit','library-lane':'The Lantern-Lit Lane','fortification-road':'The Fortification Road'};

test('all eighteen historic route identities have matching map names, lore names, and families',()=>{
 assert.deepEqual(routes.map(route=>route.id).sort(),Object.keys(expectedNames).sort());
 assert.deepEqual(Object.keys(pathContent).sort(),Object.keys(expectedNames).sort());
 for(const route of routes){
  const lore=pathContent[route.id];
  assert.equal(route.name,expectedNames[route.id]);
  assert.equal(lore.title,route.name,`${route.id} has two different names`);
  assert.equal(lore.family,route.family,`${route.id} has inconsistent path families`);
  const ends=lore.journey.split('↔');
  assert.equal(ends.length,2,`${route.id} needs a direction-neutral itinerary`);
  assert.ok(ends.every(end=>end.trim().length>0));
 }
});

test('the shared northern corridor is explained and misleading loop/homeward names are corrected',()=>{
 const byId=Object.fromEntries(routes.map(route=>[route.id,route]));
 assert.deepEqual(byId.ascent.points,byId['healers-light'].points);
 assert.equal(pathContent.ascent.journey,pathContent['healers-light'].journey);
 assert.match(pathContent.ascent.copy,/Healer’s Light/);
 assert.match(pathContent['healers-light'].copy,/Luminous Ascent/);
 assert.notDeepEqual(byId.contemplative.points[0],byId.contemplative.points.at(-1));
 assert.deepEqual(byId['credulous-loop'].points[0],byId['credulous-loop'].points.at(-1));
 assert.match(pathContent.return.journey,/Healing Meadows ↔ Jhana Range/);
 assert.match(pathContent.contemplative.journey,/Jhana Range ↔ Tower of Insight/);
});
