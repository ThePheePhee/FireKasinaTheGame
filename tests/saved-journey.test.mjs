import test from 'node:test';
import assert from 'node:assert/strict';
import {createJourney, parseJourney, storeJourney, loadJourney} from '../src/game/saveGame.ts';
import {mapRegions, WORLD} from '../src/data/mapRegions.ts';
import {mapProps} from '../src/data/mapProps.ts';

test('a saved journey restores progress, fog, assists, and prop encounters without stuck movement', () => {
  const journey = createJourney();
  journey.stats = {...journey.stats, concentration: 54, clarity: 86, equanimity: 31};
  journey.player = {...journey.player, x: 750, y: 500, moving: true};
  journey.discoveredRegions.push('mist', `prop:${mapProps[0].id}`);
  journey.discovery.push({x: 750, y: 500, radius: 55});
  journey.assists.mist = true;
  const restored = parseJourney(JSON.stringify(journey));
  assert.deepEqual(restored.stats, journey.stats);
  assert.equal(restored.player.x, 750);
  assert.equal(restored.player.moving, false);
  assert.equal(restored.assists.mist, true);
  assert.ok(restored.discoveredRegions.includes(`prop:${mapProps[0].id}`));
  assert.deepEqual(restored.discovery, journey.discovery);
  // Repeated browser reloads must not grow the saved fog trail.
  assert.deepEqual(parseJourney(JSON.stringify(restored)).discovery, restored.discovery);
});

test('malformed or future saves fail safely; partial numbers cannot corrupt gameplay', () => {
  for (const raw of [null, 'oops', 'null', '[]', '{"version":2}', '{"version":1}']) assert.equal(parseJourney(raw), null);
  const restored = parseJourney(JSON.stringify({version: 1, stats: {concentration: 999, clarity: -6, confusion: 'bad'}, player: {x: -30, y: 99999, direction: 'spin'}, discovery: [{x: 6, y: 9, radius: 'bad'}, {x: 100, y: 100, radius: 9999}], discoveredRegions: ['fake-place']}));
  assert.equal(restored.stats.concentration, 100);
  assert.equal(restored.stats.clarity, 0);
  assert.equal(restored.stats.confusion, 0);
  assert.equal(restored.player.x, 12);
  assert.equal(restored.player.y, WORLD.height - 12);
  assert.equal(restored.player.direction, 'down');
  assert.ok(restored.discovery.every(point => Number.isFinite(point.radius) && point.radius <= 250));
  assert.ok(!restored.discoveredRegions.includes('fake-place'));
});

test('new journeys are independent and begin at the house', () => {
  const first = createJourney(), second = createJourney();
  first.stats.concentration = 50;
  first.discovery[0].x = -5;
  const house = mapRegions.find(region => region.id === 'house');
  assert.equal(second.stats.concentration, 0);
  assert.equal(second.player.x, house.x);
  assert.equal(second.player.y, house.y);
  assert.ok(second.discovery[0].x > 0);
});

test('exploration assists restore their real meter floors', () => {
  const journey = createJourney();
  journey.assists = {mist: false, fairy: true};
  const restored = parseJourney(JSON.stringify(journey));
  assert.equal(restored.stats.concentration, 36);
  assert.equal(restored.stats.clarity, 81);
});

test('unavailable browser storage never crashes the game', () => {
  assert.equal(loadJourney(), null);
  assert.equal(storeJourney(createJourney()), false);
});
