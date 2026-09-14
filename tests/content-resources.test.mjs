import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {interiorMaps, getInteriorMap} from '../src/data/interiorMaps.ts';
import {presentationContent} from '../src/data/presentationContent.ts';
import {presentationReferences, loreSources} from '../src/data/presentationReferences.ts';
import {pathContent} from '../src/data/pathContent.ts';
import {mapProps} from '../src/data/mapProps.ts';
import {subMaps} from '../src/data/subMaps.ts';
import {innDebaters} from '../src/data/quarrelsomeConversations.ts';

const floor = (region, id) => getInteriorMap(region).floors.find(level => level.id === id);
const room = (region, id) => getInteriorMap(region).floors.flatMap(level => level.zones).find(zone => zone.id === id);
const links = zone => zone.references ?? (zone.reference ? [zone.reference] : []);

function collectLinks(value, found = []) {
  if (!value || typeof value !== 'object') return found;
  if (typeof value.url === 'string') found.push(value);
  for (const child of Object.values(value)) collectLinks(child, found);
  return found;
}

test('every exported teaching resource has a dated, honest audit entry', () => {
  const audit = readFileSync(new URL('../docs/resource-review.md', import.meta.url), 'utf8');
  const resources = collectLinks([interiorMaps, presentationReferences, loreSources, pathContent, mapProps, subMaps, innDebaters]);
  const unique = new Set(resources.map(link => link.url));
  assert.ok(unique.size >= 25, 'The source inventory has unexpectedly collapsed');
  for (const link of resources) {
    assert.equal(new URL(link.url).protocol, 'https:', link.url);
    assert.ok(link.label?.trim(), `Missing readable source label: ${link.url}`);
    assert.ok(audit.includes(link.url), `New resource needs a documented review: ${link.url}`);
  }
  assert.match(audit, /13 September 2026/);
  assert.match(audit, /Unverified.*tool access restriction/i);
  assert.match(audit, /HTTP 403/);
});

test('primary sources reach the live teaching rooms, not only obsolete card maps', () => {
  for (const region of ['tower', 'fireworks', 'jhana', 'formless', 'healing', 'celestial', 'life-recall']) {
    for (const level of getInteriorMap(region).floors) for (const zone of level.zones) {
      assert.ok(links(zone).length > 0, `${region}/${level.id}/${zone.id} lost its source`);
    }
  }
  for (const zone of floor('jhana', 'rupa').zones) assert.ok(links(zone).some(link => link.url === loreSources.rupa.url));
  assert.ok(links(room('tower', 'fruition')).some(link => link.url === loreSources.fruition.url));
  assert.ok(links(room('celestial', 'court')).some(link => link.url === loreSources.glossary.url));
  assert.ok(!links(room('celestial', 'court')).some(link => link.url === loreSources.brahmaviharas.url), 'Entities are not one of the four brahmavihāras');
});

test('the requested demo and library links remain alongside contextual sources', () => {
  const second = links(room('fireworks', 'second'));
  assert.ok(second.some(link => link.url === 'https://visual-static-screen-fk-replication.tiiny.site'));
  assert.ok(second.some(link => link.url === loreSources.glossary.url), 'A single demo must not mask the primary glossary');
  const fire = links(room('library', 'fire-kasina-shelves'));
  assert.ok(fire.some(link => link.url === 'https://firekasina.org/'));
  assert.ok(fire.some(link => link.url === 'https://discord.com/channels/934072734466572308/934072735171231755' && /members/.test(link.label)));
  const meditation = links(room('library', 'meditation-shelves'));
  assert.ok(meditation.some(link => link.url === 'https://www.dharmaoverground.org/'));
  assert.ok(meditation.some(link => link.url === 'https://www.mctb.org/'));
  const magick = links(room('library', 'magick-shelves'));
  for (const url of ['https://keepsilence.org/', 'https://hermetic.com/']) assert.ok(magick.some(link => link.url === url));
});

test('editorial framing preserves the full requested curriculum and memorable metaphors', () => {
  assert.equal(floor('tower', 'characteristics').zones.length, 3);
  assert.equal(floor('tower', 'progress').zones.length, 16);
  assert.equal(floor('tower', 'progress').zones[0].id, 'mind-body');
  assert.deepEqual(floor('tower', 'awakening').zones.map(zone => zone.id), ['stream', 'once', 'nonreturn', 'arahant']);
  assert.equal(floor('fireworks', 'screens').zones.length, 4);
  assert.equal(floor('fireworks', 'materials').zones.length, 6);
  assert.equal(floor('healing', 'healing-arts').zones.length, 4);
  assert.equal(floor('formless', 'arupa').zones.length, 4);
  assert.equal(getInteriorMap('life-recall').floors[0].zones.length, 3);
  assert.match(room('jhana', 'j1').copy, /kneading.*bath powder.*does not drip/);
  assert.match(room('jhana', 'j2').copy, /lake.*spring/);
  assert.match(room('jhana', 'j3').copy, /lotuses.*underwater/);
  assert.match(room('jhana', 'j4').copy, /white cloth/);
  assert.match(room('fireworks', 'gold').copy, /jealous.*court.*dance.*Plastic/);
  assert.match(room('fireworks', 'plastic').copy, /mercurial/);
  assert.match(presentationContent.trauma, /Darth Vader/);
  assert.match(presentationContent.inn, /adventure was kindled by its discussions/);
  assert.match(floor('tower', 'progress').subtitle, /MCTB/);
  assert.match(room('tower', 'fruition').copy, /MCTB describes/);
  assert.match(presentationContent.formless, /not.*awakening/);
  assert.match(room('celestial', 'karuna').copy, /pity.*near enemy/);
});

test('source corrections do not revive stale URLs or imply verified story props', () => {
  const resources = collectLinks([interiorMaps, presentationReferences, pathContent, mapProps]);
  for (const link of resources) {
    assert.ok(!link.url.includes('/ati/tipitaka/'), link.url);
    assert.ok(!link.url.includes('/57-the-fire-kasina/'), link.url);
  }
  assert.equal(pathContent.kindling.reference.url, loreSources.kasina.url);
  for (const prop of mapProps.filter(prop => prop.id !== 'comparison-mirror')) assert.match(prop.reference.label, /Inspired by/);
});

test('conversation repairs keep cause uncertainty and the person in the room intact', () => {
  const metaphor = innDebaters.find(debater => debater.id === 'metaphor').scenarios[0];
  const anecdote = innDebaters.find(debater => debater.id === 'anecdote').scenarios[0];
  assert.ok(!metaphor.nodes.flatten.line.includes('puppet'));
  assert.match(anecdote.nodes.relief.line, /cannot say the tea caused it/);
  assert.ok(anecdote.nodes.prescribe.replies.some(reply => /Stop serving first/.test(reply.text) && reply.next === 'modest'));
  assert.ok(anecdote.nodes.alternatives.replies.some(reply => /record/.test(reply.text) && reply.next === 'test-gently'));
});
