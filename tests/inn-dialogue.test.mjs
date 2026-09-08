import test from 'node:test';
import assert from 'node:assert/strict';
import {innDebaters, validateInnDialogues} from '../src/data/quarrelsomeConversations.ts';
import {advanceInnConversation, createInnSession, getAvailableInnReplies, leaveInnConversation, MAX_INN_EXCHANGES, settleInnResult} from '../src/game/innDialogue.ts';
import {initialGameStats} from '../src/game/gameState.ts';

const experienced = {...initialGameStats, concentration: 70, clarity: 40, confusion: 20, equanimity: 100, metta: 100};
const beginner = {...experienced, equanimity: 0, metta: 0};
const scenarioFor = id => innDebaters.find(debater => debater.id === id).scenarios[0];

function follow(scenario, destinations, stats = experienced) {
  let session = createInnSession();
  for (const destination of destinations) {
    const reply = getAvailableInnReplies(scenario, session, stats).find(reply => (reply.next ?? reply.ending) === destination);
    assert.ok(reply, `No available reply from ${session.nodeId} to ${destination}`);
    session = advanceInnConversation(scenario, session, reply, stats);
  }
  return session;
}

test('all dialogue scenes are connected, finishable, and retain three choices without hidden traits', () => {
  assert.deepEqual(validateInnDialogues(), []);
  for (const debater of innDebaters) for (const scenario of debater.scenarios) {
    for (const id of ['start', ...Object.keys(scenario.nodes)]) {
      const session = {...createInnSession(), nodeId: id};
      for (const stats of [beginner, experienced]) {
        assert.ok(getAvailableInnReplies(scenario, session, stats).length >= 3, `${debater.id}/${id} strands a player`);
      }
    }
  }
});

test('every simple conversational route reaches a valid ending with finite bounded consequences', () => {
  let routes = 0;
  for (const debater of innDebaters) for (const scenario of debater.scenarios) for (const stats of [beginner, experienced]) {
    const endings = new Set();
    function visit(session, trail) {
      for (const reply of getAvailableInnReplies(scenario, session, stats)) {
        if (reply.next && trail.has(reply.next)) continue;
        const next = advanceInnConversation(scenario, session, reply, stats);
        if (next.result) {
          routes++;
          endings.add(next.result.id);
          assert.ok(scenario.endings[next.result.id], `Unexpected cut-off on a non-repeating route: ${debater.id}/${next.result.id}`);
          assert.ok(next.result.changes.clarity <= 18);
          if (next.result.grade === 'failure') assert.ok(next.result.changes.clarity < 0, `${debater.id}/${next.result.id} rewards a failed argument`);
          for (const [key, value] of Object.entries(settleInnResult(stats, next.result))) {
            assert.ok(Number.isFinite(value) && value >= 0 && value <= 100, `${debater.id}/${next.result.id} corrupts ${key}`);
          }
        } else {
          assert.ok(next.history.length <= MAX_INN_EXCHANGES);
          visit(next, new Set([...trail, next.nodeId]));
        }
      }
    }
    visit(createInnSession(), new Set(['start']));
    for (const id of Object.keys(scenario.endings)) assert.ok(endings.has(id), `${debater.id}/${id} is unreachable at this trait level`);
  }
  assert.ok(routes > 3000, `Only ${routes} routes were exercised`);
});

test('representative corrections, recovery, evasions, and disasters preserve their intended outcomes', () => {
  const cases = [
    ['tom', ['fruit', 'better-route', 'balance', 'many-roads'], 'success'],
    ['tom', ['harder', 'martyr-contest', 'whole-ledger', 'repair', 'honor', 'many-roads'], 'success'],
    ['tom', ['fruit', 'reject', 'one-road'], 'failure'],
    ['certainty', ['dismissed', 'observed', 'practice-test', 'provisional', 'open-map'], 'success'],
    ['certainty', ['dismissed', 'meaning', 'poetry', 'private-map', 'shared-map', 'private-symbol'], 'success'],
    ['certainty', ['observed', 'certainty-feeling', 'fog', 'silenced'], 'partial'],
    ['footnote', ['minimize', 'care', 'repair', 'publish', 'useful-correction'], 'success'],
    ['footnote', ['triage', 'blunt', 'labyrinth', 'paper-fog'], 'partial'],
    ['metaphor', ['flatten', 'wonder', 'decline', 'wonder-kept'], 'success'],
    ['metaphor', ['pay', 'swindled'], 'failure'],
    ['anecdote', ['shamed', 'relief', 'modest', 'good-guest'], 'success'],
    ['anecdote', ['prescribe', 'consequences', 'repair', 'silence'], 'partial'],
  ];
  for (const [id, path, grade] of cases) {
    const session = follow(scenarioFor(id), path);
    assert.equal(session.result?.grade, grade, `${id}: ${path.join(' → ')}`);
    assert.equal(session.result?.id, path[path.length - 1]);
    assert.equal(session.history.length, path.length);
  }
});

test('looping a persuasive point cannot farm clarity and the third return closes the argument', () => {
  // Captain Certainty has a recoverable loop: observed → dismissed → observed.
  const captain = scenarioFor('certainty');
  let session = follow(captain, ['observed', 'dismissed', 'observed']);
  const before = session.totals.clarity;
  const repeat = getAvailableInnReplies(captain, session, experienced).find(reply => reply.next === 'dismissed');
  session = advanceInnConversation(captain, session, repeat, experienced);
  assert.ok(session.totals.clarity <= before);
  const apology = getAvailableInnReplies(captain, session, experienced).find(reply => reply.next === 'observed');
  session = advanceInnConversation(captain, session, apology, experienced);
  assert.equal(session.result?.id, 'round-and-round');
  assert.ok(session.result.changes.clarity < 0);
});

test('leaving cannot erase either an unfinished conversation or an already reached failure', () => {
  assert.equal(leaveInnConversation(createInnSession()).result, null, 'Looking at a table should be free');
  const unfinished = leaveInnConversation(follow(scenarioFor('certainty'), ['crowned']));
  assert.equal(unfinished.result?.id, 'unfinished');
  assert.ok(settleInnResult(experienced, unfinished.result).concentration < experienced.concentration);
  assert.ok(unfinished.result.changes.confusion > 0);
  const failure = follow(scenarioFor('metaphor'), ['pay', 'swindled']);
  assert.equal(leaveInnConversation(failure), failure, 'Leaving a failure must preserve its consequences');
  assert.equal(advanceInnConversation(scenarioFor('metaphor'), failure, scenarioFor('metaphor').replies[0], experienced), failure);
});

test('hidden responses remain absent until earned and stale replies cannot select a different scene', () => {
  const scenario = scenarioFor('metaphor');
  let session = {...createInnSession(), nodeId: 'decline'};
  const advanced = scenario.nodes.decline.replies.find(reply => reply.requires);
  assert.ok(!getAvailableInnReplies(scenario, session, beginner).includes(advanced));
  session = {...session, totals: {...session.totals, practice: {equanimity: 3}}};
  assert.ok(getAvailableInnReplies(scenario, session, {...beginner, equanimity: 50}).includes(advanced));
  const afterOpening = follow(scenario, ['separate']);
  assert.equal(advanceInnConversation(scenario, afterOpening, scenario.replies[0], experienced), afterOpening);
});

test('graph validation rejects hidden-stat traps, conflicting destinations, and non-finite effects', () => {
  const bad = structuredClone(innDebaters);
  const node = bad[0].scenarios[0].nodes.observed;
  node.replies[0].requires = {key: 'metta', min: 40};
  node.replies[1].ending = 'open-map';
  node.replies[2].effect = {clarity: Number.NaN};
  const issues = validateInnDialogues(bad);
  assert.ok(issues.some(issue => issue.includes('fewer than three ungated')));
  assert.ok(issues.some(issue => issue.includes('two destinations')));
  assert.ok(issues.some(issue => issue.includes('non-finite')));
});
