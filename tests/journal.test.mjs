import test from 'node:test';
import assert from 'node:assert/strict';
import {journalEntries, availableJournalEntries, sanitizeNotebook, searchJournal} from '../src/game/journal.ts';
import {createJourney, parseJourney, importJourney, exportJourney, MAX_JOURNEY_FILE_BYTES} from '../src/game/saveGame.ts';
import {interiorMaps} from '../src/data/interiorMaps.ts';

test('field guide has one canonical entry per place, path, room and traveller', () => {
  assert.equal(new Set(journalEntries.map(entry => entry.id)).size, journalEntries.length);
  for (const map of interiorMaps) for (const floor of map.floors) {
    for (const zone of floor.zones) {
      const entry = journalEntries.find(item => item.id === `interior:${map.id}:${floor.id}:${zone.id}`);
      assert.equal(entry.copy, zone.copy);
      assert.equal(entry.title, zone.name);
    }
  }
});
test('Game journal reveals only discoveries/read pages; Sandbox exposes same complete catalogue', () => {
  const fresh = createJourney();
  const entries = availableJournalEntries(false, fresh.discoveredRegions, fresh.notebook);
  assert.deepEqual(entries.map(entry => entry.id).sort(), ['garden', 'house', 'red-dot']);
  assert.equal(availableJournalEntries(true, [], []).length, journalEntries.length);
  const room = journalEntries.find(entry => entry.id.startsWith('interior:'));
  assert.deepEqual(availableJournalEntries(false, [], [room.id]), [room]);
  assert.ok(!availableJournalEntries(false, ['tower'], []).some(entry => entry.id.startsWith('interior:')));
});
test('notebook saves are additive, whitelisted and backwards compatible', () => {
  assert.deepEqual(sanitizeNotebook(['house', 'house', 'unreleased-secret', {}, 1]), ['house']);
  const old = createJourney(); delete old.notebook;
  assert.deepEqual(parseJourney(JSON.stringify(old)).notebook, []);
  const fresh = createJourney(); fresh.notebook = ['house', 'route:artificer', 'invalid'];
  assert.deepEqual(parseJourney(JSON.stringify(fresh)).notebook, ['house', 'route:artificer']);
});
test('journal searches meaning and context, with category filters and no empty-query trap', () => {
  assert.ok(searchJournal(journalEntries, 'library').length > 0);
  assert.ok(searchJournal(journalEntries, '  ').length === journalEntries.length);
  assert.ok(searchJournal(journalEntries, 'insight', 'Interiors').every(entry => entry.category === 'Interiors'));
  assert.deepEqual(searchJournal(journalEntries, 'zznonexistent'), []);
});
test('portable saves round-trip safely without accepting arbitrary JSON or oversized input', () => {
  const journey = createJourney(); journey.stats.concentration = 48; journey.notebook = ['house'];
  const restored = importJourney(exportJourney(journey));
  assert.deepEqual(restored, journey);
  for (const raw of ['null', '{}', JSON.stringify(journey), '{"format":"not-this-game"}', 'x'.repeat(MAX_JOURNEY_FILE_BYTES + 1)]) assert.equal(importJourney(raw), null);
  const invalid = JSON.parse(exportJourney(journey)); invalid.journey.version = 2;
  assert.equal(importJourney(JSON.stringify(invalid)), null);
});
