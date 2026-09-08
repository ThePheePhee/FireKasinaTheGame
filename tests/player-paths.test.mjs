import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import PlayerMode from '../src/components/PlayerMode.tsx';
import RoadsideSign from '../src/components/RoadsideSign.tsx';
import {routes} from '../src/data/routes.ts';
import {createJourney} from '../src/game/saveGame.ts';

const noop=()=>{};
function renderPlayer(x,y,dialogue=false){
 return renderToStaticMarkup(React.createElement(PlayerMode,{player:{current:{...createJourney().player,x,y}},dialogue,discoveredRegions:{current:new Set()},onDiscover:noop,onDiscoverProp:noop,onReadRoute:noop}));
}

test('walking mode exposes the Artificer name and a separate road-lore action without MapMode',()=>{
 const road=routes.find(route=>route.id==='artificer'),html=renderPlayer(...road.labelAt);
 assert(html.includes('The Artificer&#x27;s Causeway'));
 assert(html.includes('Read path lore:'));
 assert(html.includes('<kbd>R</kbd>'));
 assert(html.includes('ON A NAMED PATH'));
});

test('walking-road invitations disappear off the road and during other dialogue',()=>{
 assert(!renderPlayer(24,24).includes('Read path lore:'));
 const road=routes.find(route=>route.id==='artificer');
 assert(!renderPlayer(...road.labelAt,true).includes('Read path lore:'));
});

test('a shared corridor exposes a deliberate choice instead of silently losing its other names',()=>{
 const shared=['ascent','healers-light'].map(id=>routes.find(route=>route.id===id));
 const html=renderToStaticMarkup(React.createElement(RoadsideSign,{routes:shared,onRead:noop}));
 assert(html.includes('2<!-- --> named paths share this stretch')||html.includes('2 named paths share this stretch'));
 assert(html.includes('aria-expanded="false"'));
 assert(html.includes('The Luminous Ascent'));
});
