import test from 'node:test';
import assert from 'node:assert/strict';
import {routes} from '../src/data/routes.ts';
import {pathContent} from '../src/data/pathContent.ts';

test('every named physical road has matching teaching content and family',()=>{
 for(const route of routes){
  const lore=pathContent[route.id];
  assert(lore,`${route.name} lost its lore`);
  assert.equal(lore.title,route.name);
  assert.equal(lore.family,route.family,`${route.name} changes family when its dialogue opens`);
  assert(lore.copy.length>80,`${route.name} needs an actual teaching, not only a label`);
 }
});
