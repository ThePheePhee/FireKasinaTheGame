import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {activityKey,createActivitySession,createOutcomeReceipt} from '../src/game/activitySession.ts';
import {chasmOutcomeReward} from '../src/game/chasmRules.ts';
import {initialGameStats} from '../src/game/gameState.ts';
import {lagoonReward,concentrationRate,DOT_DURATION_SECONDS,ABSENCE_DURATION_SECONDS} from '../src/game/practiceDynamics.ts';
import RedDotMinigame from '../src/components/RedDotMinigame.tsx';
import TraumaLabyrinth from '../src/components/TraumaLabyrinth.tsx';
import BoohooLagoonMinigame from '../src/components/BoohooLagoonMinigame.tsx';
import ChasmDespairMinigame from '../src/components/ChasmDespairMinigame.tsx';
import QuarrelsomeInnMinigame from '../src/components/QuarrelsomeInnMinigame.tsx';

test('a session waits for consent, pauses synchronously, and resumes the same run',()=>{
 const session=createActivitySession();let activeSeconds=0,concentration=60;
 const tick=()=>{if(session.running){activeSeconds++;concentration-=.45}};
 assert.equal(session.phase,'ready');tick();assert.equal(concentration,60);
 session.begin();tick();session.pause();
 assert.equal(session.running,false,'input and physics stop before React has rendered the overlay');
 for(let second=0;second<600;second++)tick();
 assert.equal(activeSeconds,1);assert.equal(concentration,59.55);
 session.begin();tick();assert.equal(activeSeconds,2,'resuming does not reset elapsed play');
 assert(Math.abs(concentration-59.1)<1e-10);
});

test('completed and closed sessions cannot be restarted accidentally or exited twice',()=>{
 const session=createActivitySession();session.begin();session.complete();
 assert.equal(session.begin(),'done');assert.equal(session.pause(),'done');
 assert.equal(session.retry(),'ready');session.begin();
 assert.equal(session.close(),true);assert.equal(session.close(),false);
 assert.equal(session.begin(),'closed');assert.equal(session.retry(),'closed');
 assert.equal(session.complete(),'closed');assert.equal(session.running,false);
});

test('a Lagoon flight has one reward receipt across failure, retry and leave buttons',()=>{
 let stats={...initialGameStats,concentration:52.123,clarity:9,confusion:40};
 const receipt=createOutcomeReceipt(),reward=lagoonReward(4,2);
 const changes={clarity:reward.clarity,confusion:-reward.confusion,equanimity:reward.equanimity};
 const before={...stats};stats=receipt(stats,changes);
 assert.deepEqual(before,{...initialGameStats,concentration:52.123,clarity:9,confusion:40},'input snapshots are never mutated');
 assert.equal(stats.clarity,17);assert.equal(stats.concentration,52.123);
 assert.equal(receipt(stats,changes),null,'retry cannot re-award the previous flight');
 assert.equal(receipt(stats,changes),null,'a subsequent leave cannot re-award it either');
 const retryReceipt=createOutcomeReceipt();
 const zeroFlight=lagoonReward(0,0);
 stats=retryReceipt(stats,{clarity:zeroFlight.clarity,confusion:-zeroFlight.confusion});
 assert.equal(stats.clarity,17,'an immediate crash earns nothing');
});

test('exhaustion preserves actual Lagoon learning but never restores concentration',()=>{
 const reward=lagoonReward(3,1),receipt=createOutcomeReceipt();
 const result=receipt({...initialGameStats,concentration:0,confusion:20},{clarity:reward.clarity,confusion:-reward.confusion});
 assert.equal(result.concentration,0);assert(Math.abs(result.clarity-5.6)<1e-10);assert.equal(result.confusion,17);
 assert.equal(receipt(result,{clarity:99}),null);
});

test('Chasm crossing and recovery settle once, preserve spent resources and clamp results',()=>{
 for(const outcome of ['crossed','recovered']){
  const receipt=createOutcomeReceipt(),changes=chasmOutcomeReward(outcome),base={...initialGameStats,concentration:37.42,clarity:96,confusion:2};
  const result=receipt(base,changes);
  assert.equal(result.clarity,100);assert.equal(result.confusion,0);assert.equal(result.concentration,37.42);
  assert.equal(result.integration,outcome==='recovered'?6:2);
  assert.equal(receipt(result,changes),null,'either exit button sees an already paid receipt');
 }
});

test('activity shortcuts respect focused controls, editable fields and browser modifiers',t=>{
 const original=globalThis.Element;
 class FakeElement{constructor(kind){this.kind=kind}closest(selector){return selector.split(',').includes(this.kind)?this:null}}
 globalThis.Element=FakeElement;t.after(()=>{if(original===undefined)delete globalThis.Element;else globalThis.Element=original});
 const key=(key,code='',target=null,extra={})=>activityKey({key,code,target,...extra});
 assert.equal(key('W'),'w');assert.equal(key('ArrowLeft'),'ArrowLeft');assert.equal(key('Escape'),'Escape');
 assert.equal(key(' ','Space',new FakeElement('button')),null,'Space belongs to the focused button');
 assert.equal(key('Enter','Enter',new FakeElement('[role="button"]')),null);
 assert.equal(key('1','Digit1',new FakeElement('input')),null,'Inn reply numbers cannot leak from form input');
 assert.equal(key('p','KeyP',null,{ctrlKey:true}),null);assert.equal(key('p','KeyP',null,{metaKey:true}),null);
 assert.equal(key('ArrowUp','ArrowUp',null,{defaultPrevented:true}),null);
});

test('all five minigames render a named ready dialog with begin, instructions and an exit',()=>{
 for(const Component of [RedDotMinigame,TraumaLabyrinth,BoohooLagoonMinigame,ChasmDespairMinigame,QuarrelsomeInnMinigame]){
  const html=renderToStaticMarkup(createElement(Component,{stats:{...initialGameStats,concentration:60},onChange(){throw Error('render must not award or drain resources')},onExit(){throw Error('render must not leave')}}));
  assert.match(html,/AT THE THRESHOLD/);assert.match(html,/>BEGIN<\/button>/);
  assert.match(html,/>LEAVE THIS ENCOUNTER<\/button>/);assert.match(html,/data-activity-paused="true"/);
  assert.match(html,/CHANGING TABS PAUSES THE GAME/);assert.doesNotMatch(html,/Equanimity\s*[+\d]|Metta\s*[+\d]/i);
 }
});

test('lifecycle work leaves the deliberately calibrated Red Dot timing and gain intact',()=>{
 assert.equal(DOT_DURATION_SECONDS,20);assert.equal(ABSENCE_DURATION_SECONDS,10);
 assert.equal(concentrationRate({...initialGameStats},1),.715);
 assert(concentrationRate({...initialGameStats,concentration:65},1)<.1);
 assert(concentrationRate({...initialGameStats,concentration:65,clarity:60},1)>concentrationRate({...initialGameStats,concentration:65},1));
 const html=renderToStaticMarkup(createElement(RedDotMinigame,{stats:{...initialGameStats},onChange(){},onExit(){}}));
 assert.match(html,/VISUAL FIELD/);assert.match(html,/CONCENTRATION/);
 assert.doesNotMatch(html,/STEADINESS|gaining rapidly|increasing rapidly|gain rate/i);
});
