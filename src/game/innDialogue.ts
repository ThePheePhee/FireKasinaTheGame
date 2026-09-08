import type {ArgumentScenario, DialogueEffect, DialogueEnding, DialogueNode, DialogueReply, PracticeKey} from '../data/quarrelsomeConversations';
import {clampMeter, type GameStats} from './gameState';

export type ThreadTone = 'clear' | 'warm' | 'tangled';
export interface DialogueTotals {
  clarity: number;
  confusion: number;
  metta: number;
  practice: Partial<Record<PracticeKey, number>>;
}
export interface InnResult {
  id: string;
  title: string;
  copy: string;
  grade: DialogueEnding['grade'];
  changes: DialogueTotals;
}
export interface InnSession {
  nodeId: string;
  visits: Record<string, number>;
  totals: DialogueTotals;
  history: Array<{nodeId: string;reply: string;tone: ThreadTone}>;
  result: InnResult | null;
}

export const MAX_INN_EXCHANGES = 20;
const between = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const emptyTotals = (): DialogueTotals => ({clarity: 0, confusion: 0, metta: 0, practice: {}});

export function createInnSession(): InnSession {
  return {nodeId: 'start', visits: {start: 1}, totals: emptyTotals(), history: [], result: null};
}

export function getInnNode(scenario: ArgumentScenario, nodeId: string): DialogueNode | undefined {
  return nodeId === 'start' ? {line: scenario.opening, replies: scenario.replies} : scenario.nodes[nodeId];
}

export function getAvailableInnReplies(scenario: ArgumentScenario, session: InnSession, stats: GameStats): DialogueReply[] {
  if (session.result) return [];
  return getInnNode(scenario, session.nodeId)?.replies.filter(reply => {
    if (!reply.requires) return true;
    const {key, min} = reply.requires;
    const earned = (session.totals.practice[key] ?? 0) + (key === 'metta' ? session.totals.metta : 0);
    return (stats[key] ?? 0) + earned >= min;
  }) ?? [];
}

function addEffect(totals: DialogueTotals, effect: DialogueEffect = {}, repeated = false): DialogueTotals {
  // Revisiting a scene can repair the conversation, but repeating its lesson cannot farm rewards.
  const earned = (value = 0, lowerIsBetter = false) => repeated ? (lowerIsBetter ? Math.max(0, value) : Math.min(0, value)) : value;
  const practice = {...totals.practice};
  for (const [key, value] of Object.entries(effect.practice ?? {}) as [PracticeKey, number][]) {
    practice[key] = (practice[key] ?? 0) + earned(value, key === 'craving');
  }
  return {
    clarity: totals.clarity + earned(effect.clarity),
    confusion: totals.confusion + earned(effect.confusion, true),
    metta: totals.metta + earned(effect.metta),
    practice,
  };
}

function endConversation(session: InnSession, id: string, ending: DialogueEnding): InnSession {
  const changes = addEffect(session.totals, ending.effect);
  // A long, circuitous route must not outweigh the ending: winning an argument can still lose clarity.
  changes.clarity = between(changes.clarity, -18, ending.grade === 'success' ? 18 : ending.grade === 'partial' ? 6 : -2);
  changes.confusion = between(changes.confusion, -12, 18);
  if (ending.grade === 'failure') changes.confusion = Math.max(2, changes.confusion);
  changes.metta = between(changes.metta, -12, 12);
  for (const key of Object.keys(changes.practice) as PracticeKey[]) changes.practice[key] = between(changes.practice[key] ?? 0, -10, 10);
  return {...session, result: {id, title: ending.title, copy: ending.copy, grade: ending.grade, changes}};
}

export function advanceInnConversation(scenario: ArgumentScenario, session: InnSession, reply: DialogueReply, stats: GameStats): InnSession {
  if (session.result || !getAvailableInnReplies(scenario, session, stats).includes(reply)) return session;
  const effect = reply.effect ?? {};
  const repeated = session.visits[session.nodeId] > 1;
  const tangled = repeated || (effect.clarity ?? 0) < 0 || (effect.confusion ?? 0) > 0 || (effect.practice?.craving ?? 0) > 0;
  const tone: ThreadTone = tangled ? 'tangled' : (effect.metta ?? effect.practice?.metta ?? 0) > 0 ? 'warm' : 'clear';
  let next: InnSession = {
    ...session,
    totals: addEffect(session.totals, effect, repeated),
    history: [...session.history, {nodeId: session.nodeId, reply: reply.text, tone}],
  };
  if (reply.ending && scenario.endings[reply.ending]) return endConversation(next, reply.ending, scenario.endings[reply.ending]);
  if (!reply.next || !scenario.nodes[reply.next]) return endConversation(next, 'loose-thread', {
    title: 'A THREAD COMES LOOSE', copy: 'The Innkeeper catches a torn page in the conversation and calls a pause. This table needs a little repair.', grade: 'partial', effect: {},
  });
  if ((session.visits[reply.next] ?? 0) >= 2) return endConversation(next, 'round-and-round', {
    title: 'THE MUG LEAVES ANOTHER RING',
    copy: 'The same claim, the same rebuttal, the same damp circle on the table. The Innkeeper removes the empty mugs. You have rehearsed the argument until it sounds like understanding; outside, the Mists have learned the refrain.',
    grade: 'failure', effect: {clarity: -4, confusion: 4, practice: {craving: 2}},
  });
  if (next.history.length >= MAX_INN_EXCHANGES) return endConversation(next, 'closing-time', {
    title: 'THE INNKEEPER TURNS DOWN THE LAMPS',
    copy: 'Plenty was said, and a few useful distinctions survived, but the road has waited long enough. Carry one good question outside before another pot of tea becomes a whole season.',
    grade: 'partial', effect: {clarity: -2, confusion: 2},
  });
  next = {...next, nodeId: reply.next, visits: {...session.visits, [reply.next]: (session.visits[reply.next] ?? 0) + 1}};
  return next;
}

export function leaveInnConversation(session: InnSession): InnSession {
  if (session.result || !session.history.length) return session;
  return endConversation(session, 'unfinished', {
    title: 'A QUESTION LEFT BESIDE THE MUG',
    copy: 'You push back your chair before the matter is settled. Leaving can be wise, but the words already spoken come along: keep what was useful, and notice the loose question still following you into the Mists.',
    grade: 'partial', effect: {clarity: -2, confusion: 2},
  });
}

export function settleInnResult(stats: GameStats, result: InnResult): GameStats {
  const changes = result.changes, practice = changes.practice;
  return {
    ...stats,
    concentration: clampMeter(stats.concentration - (result.grade === 'success' ? 3 : result.grade === 'partial' ? 4 : 6)),
    clarity: clampMeter(stats.clarity + changes.clarity),
    confusion: clampMeter(stats.confusion + changes.confusion),
    metta: clampMeter((stats.metta ?? 0) + changes.metta + (practice.metta ?? 0)),
    equanimity: clampMeter((stats.equanimity ?? 0) + (practice.equanimity ?? 0)),
    realityTesting: clampMeter((stats.realityTesting ?? 0) + (practice.realityTesting ?? 0)),
    integration: clampMeter((stats.integration ?? 0) + (practice.integration ?? 0)),
    craving: clampMeter((stats.craving ?? 0) + (practice.craving ?? 0)),
  };
}
