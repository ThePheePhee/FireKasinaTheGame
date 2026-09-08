import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {interiorMaps} from '../src/data/interiorMaps.ts';
import {nearbyInteriorZone,interiorEntry,interactionAnchor,interactionKind} from '../src/engine/interiorInteraction.ts';
import InteractionPrompt from '../src/components/InteractionPrompt.tsx';
import LoreLinks from '../src/components/LoreLinks.tsx';

const library=interiorMaps.find(map=>map.regionId==='library'),floor=library.floors[0];
test('each reading shelf can be approached from the open aisle without entering furniture',()=>{
  for(const shelf of floor.zones){
    const point={x:shelf.x,y:475};
    assert.equal(nearbyInteriorZone(floor.zones,point.x,point.y)?.id,shelf.id);
    assert(!floor.obstacles.some(o=>point.x+18>o.x&&point.x-18<o.x+o.w&&point.y+18>o.y&&point.y-18<o.y+o.h));
    const [x,y]=interactionAnchor(shelf,'library');
    assert.equal(x,shelf.x);assert(y>420&&y<470,'Book marker stays between shelves and wooden signs');
    assert.equal(interactionKind(shelf),'book');
  }
});
test('nearby lore follows the closest area, and clears when the player walks away',()=>{
  const a={...floor.zones[0],x:100,y:100,w:300,h:300},b={...floor.zones[1],x:240,y:100,w:300,h:300};
  assert.equal(nearbyInteriorZone([a,b],220,110).id,b.id);
  assert.equal(nearbyInteriorZone([a,b],102,110).id,a.id);
  assert.equal(nearbyInteriorZone([a,b],1000,1000),null);
  assert.equal(nearbyInteriorZone(floor.zones,...floor.spawn),null);
});
test('floor introductions never borrow an unrelated shelf’s sources',()=>{
  for(const map of interiorMaps)for(const item of map.floors){const entry=interiorEntry(map,item);assert.equal(entry.references,undefined);assert.equal(entry.reference,undefined);assert(entry.copy.includes(map.name));}
  assert(interiorEntry(library,floor).copy.includes('BROWSE SHELVES'));
});
test('NPC interactions are conversations rather than shelf or region lore',()=>{
  assert.equal(interactionKind({...floor.zones[0],id:'npc-mapmaker'}),'talk');
  assert.deepEqual(interactionAnchor({...floor.zones[0],id:'npc-mapmaker',x:100,y:200},'tavern'),[100,128]);
});
test('nearby prompt provides a named real button, keyboard cue, and touch instruction',()=>{
  const markup=renderToStaticMarkup(createElement(InteractionPrompt,{title:'Meditation Practice',eyebrow:'READING SHELF',action:'BROWSE SHELVES',kind:'book',onActivate:()=>{}}));
  assert(markup.includes('aria-label="BROWSE SHELVES: Meditation Practice"'));
  assert(markup.includes('<kbd>E</kbd>'));assert(markup.includes('CLICK / TAP TO OPEN'));
  assert(markup.includes('<button type="button"'));assert(!markup.includes('disabled'));
});
test('reading links preserve every supplied source and explain new-tab navigation',()=>{
  for(const shelf of floor.zones){
    const markup=renderToStaticMarkup(createElement(LoreLinks,{links:shelf.references,title:'CHOOSE A VOLUME'}));
    for(const link of shelf.references)assert(markup.includes(`href="${link.url}"`));
    assert.equal((markup.match(/target="_blank"/g)??[]).length,shelf.references.length);
    assert(markup.includes('OPENS IN A NEW TAB'));assert(markup.includes('rel="noreferrer"'));
  }
  assert.equal(renderToStaticMarkup(createElement(LoreLinks,{links:[]})), '');
});
