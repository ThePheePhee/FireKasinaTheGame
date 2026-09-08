import {lazy, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import type {Region} from './data/mapRegions';
import type {Route} from './data/routes';
import type {MapProp} from './data/mapProps';
import {pathContent} from './data/pathContent';
import {presentationContent} from './data/presentationContent';
import {presentationReferences} from './data/presentationReferences';
import {getInteriorMap, type InteriorMap} from './data/interiorMaps';
import type {Player} from './engine/movement';
import {applyExplorationAssists, FAIRY_ENTRY_CLARITY, FAIRY_ENTRY_CONCENTRATION, MIST_ENTRY_CONCENTRATION, initialGameStats, type GameStats} from './game/gameState';
import {createJourney, loadJourney, storeJourney, type SavedJourney} from './game/saveGame';
import MapMode from './components/MapMode';
import PlayerMode from './components/PlayerMode';
import GameHud from './components/GameHud';
import LoreDialog from './components/LoreDialog';
import LoreLinks from './components/LoreLinks';
import SceneBoundary from './components/SceneBoundary';
import './DialogueExtras.css';
import './application.css';

const InteriorMode = lazy(() => import('./components/InteriorMode'));
const SubMap = lazy(() => import('./components/SubMap'));
const RedDotMinigame = lazy(() => import('./components/RedDotMinigame'));
const TraumaLabyrinth = lazy(() => import('./components/TraumaLabyrinth'));
const QuarrelsomeInnMinigame = lazy(() => import('./components/QuarrelsomeInnMinigame'));
const BoohooLagoonMinigame = lazy(() => import('./components/BoohooLagoonMinigame'));
const ChasmDespairMinigame = lazy(() => import('./components/ChasmDespairMinigame'));

type Experience = 'game' | 'sandbox';
type SandboxView = 'player' | 'presentation';
type Activity = 'red-dot' | 'trauma' | 'inn' | 'lagoon' | 'chasm';
type Selection = {kind: 'region'; region: Region} | {kind: 'route'; route: Route} | {kind: 'prop'; prop: MapProp} | null;
const activities: Record<string, {id: Activity; label: string}> = {
  'red-dot': {id: 'red-dot', label: 'PRACTISE WITH THE RED DOT'},
  trauma: {id: 'trauma', label: 'ENTER THE LABYRINTH'},
  inn: {id: 'inn', label: 'JOIN THE ARGUMENT'},
  booboo: {id: 'lagoon', label: 'FLY BETWEEN THE SADNESSES'},
  chasm: {id: 'chasm', label: 'ATTEMPT THE CROSSING'},
};
// Review entrances are local only, and never overwrite a real journey.
const qaParams = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null;
const qa = qaParams?.get('qa');
const qaActivity = Object.values(activities).find(activity => activity.id === qa)?.id;
const reviewInterior = () => {
  if (qa !== 'interior') return null;
  const map = getInteriorMap(qaParams?.get('area') ?? 'tower');
  if (!map) return null;
  const zone = map.floors[0].zones.find(item => item.id === qaParams?.get('near'));
  return zone ? {...map, floors: [{...map.floors[0], spawn: [zone.x, zone.y + zone.h * .55] as [number, number]}, ...map.floors.slice(1)]} : map;
};

export default function App() {
  const [saved, setSaved] = useState<SavedJourney | null>(() => qa ? null : loadJourney());
  const [initial] = useState(() => saved ?? createJourney());
  const [experience, setExperience] = useState<Experience | null>(qa === 'map' || qa === 'interior' ? 'sandbox' : qa ? 'game' : null);
  const [sandboxView, setSandboxView] = useState<SandboxView>(qa === 'map' ? 'presentation' : 'player');
  const [selection, setSelection] = useState<Selection>(null);
  const [interior, setInterior] = useState<InteriorMap | null>(reviewInterior);
  const [overview, setOverview] = useState<InteriorMap | null>(null);
  const [activity, setActivity] = useState<Activity | null>(qaActivity ?? null);
  const [gameStats, setGameStats] = useState<GameStats>(() => qaActivity && qaActivity !== 'red-dot' ? {...initial.stats, concentration: 60} : initial.stats);
  const [sandboxStats, setSandboxStats] = useState<GameStats>({...initialGameStats, concentration: 60});
  const [assists, setAssists] = useState(initial.assists);
  const [menu, setMenu] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const gamePlayer = useRef<Player>({...initial.player});
  const sandboxPlayer = useRef<Player>(createJourney().player);
  const gameDiscovered = useRef(new Set(initial.discoveredRegions));
  const sandboxDiscovered = useRef(new Set<string>());
  const gameDiscovery = useRef(initial.discovery);
  const statsRef = useRef(gameStats);
  const assistsRef = useRef(assists);
  const lastSave = useRef('');
  const isGame = experience === 'game';
  const view = isGame ? 'player' : sandboxView;
  const sceneOpen = !!(interior || overview || activity);
  const blocked = !!selection || sceneOpen || menu;

  const save = useCallback(() => {
    if (qa) return;
    const data = {version: 1 as const, stats: statsRef.current, player: {...gamePlayer.current, moving: false}, discoveredRegions: [...gameDiscovered.current], discovery: gameDiscovery.current, assists: assistsRef.current};
    const signature = JSON.stringify(data);
    if (signature === lastSave.current) return;
    const snapshot: SavedJourney = {...data, savedAt: Date.now()};
    const succeeded = storeJourney(snapshot);
    setSaveFailed(!succeeded);
    if (succeeded) { lastSave.current = signature; setSaved(snapshot); }
  }, []);
  useEffect(() => {
    if (!isGame) return;
    const timer = window.setInterval(save, 4000);
    const onHidden = () => { if (document.hidden) save(); };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onHidden);
    return () => { clearInterval(timer); window.removeEventListener('pagehide', save); document.removeEventListener('visibilitychange', onHidden); save(); };
  }, [isGame, save]);

  const onGameStatsChange = useCallback((stats: GameStats) => {
    const next = applyExplorationAssists(stats, assistsRef.current);
    statsRef.current = next;
    setGameStats(previous => (Object.keys(next) as (keyof GameStats)[]).every(key => next[key] === previous[key]) ? previous : next);
  }, []);
  const toggleAssist = useCallback((key: 'mist' | 'fairy', checked: boolean) => {
    const next = {...assistsRef.current, [key]: checked};
    assistsRef.current = next;
    setAssists(next);
    onGameStatsChange(statsRef.current);
    save();
  }, [onGameStatsChange, save]);
  const selectRegion = useCallback((region: Region | null) => setSelection(region ? {kind: 'region', region} : null), []);
  const selectRoute = useCallback((route: Route) => setSelection({kind: 'route', route}), []);
  const selectProp = useCallback((prop: MapProp) => setSelection({kind: 'prop', prop}), []);
  const clearSelection = useCallback(() => setSelection(null), []);
  const openPractice = useCallback(() => { setSelection(null); setActivity('red-dot'); }, []);
  const startActivity = (id: Activity) => {
    if (!isGame) setSandboxStats(stats => ({...stats, concentration: id === 'red-dot' ? 0 : Math.max(60, stats.concentration)}));
    setActivity(id);
    clearSelection();
  };
  const closeScene = useCallback(() => { setActivity(null); setInterior(null); setOverview(null); if (isGame) save(); }, [isGame, save]);
  const returnToTitle = useCallback(() => { if (isGame) save(); setMenu(false); setSelection(null); setActivity(null); setInterior(null); setOverview(null); setExperience(null); }, [isGame, save]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || sceneOpen || selection || confirmNew || !experience) return;
      setMenu(value => !value);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [experience, sceneOpen, selection, confirmNew]);
  const beginFresh = () => {
    const fresh = createJourney();
    gamePlayer.current = fresh.player;
    gameDiscovered.current = new Set(fresh.discoveredRegions);
    gameDiscovery.current = fresh.discovery;
    assistsRef.current = fresh.assists;
    statsRef.current = fresh.stats;
    setAssists(fresh.assists); setGameStats(fresh.stats); setConfirmNew(false); setSelection(null); setExperience('game');
    save();
  };

  const region = selection?.kind === 'region' ? selection.region : null;
  const route = selection?.kind === 'route' ? selection.route : null;
  const prop = selection?.kind === 'prop' ? selection.prop : null;
  const lore = route ? pathContent[route.id] : null;
  const interiorEntrance = region ? getInteriorMap(region.id) : undefined;
  const activityEntrance = region ? activities[region.id] : undefined;
  const activityProps = {stats: isGame ? gameStats : sandboxStats, onChange: isGame ? onGameStatsChange : setSandboxStats, onExit: closeScene};
  const loading = <section className="scene-loading" role="status"><span className="pixel-flame" aria-hidden="true"/><h2>UNFOLDING THE LANDSCAPE…</h2><button onClick={closeScene}>RETURN TO THE MAP</button></section>;

  if (!experience) return <main className="title-screen">
    <div className="embers" aria-hidden="true"/>
    <section className="title-card">
      <span className="pixel-flame title-flame" aria-hidden="true"/>
      <p className="eyebrow">AN INTERACTIVE FIRE KASINA ADVENTURE</p>
      <h1>FIRE KASINA <span>is about to have an adventure called</span> YOU</h1>
      <p className="subtitle">Beyond the garden, the wilderness of mind is waiting.</p>
      <p className="provenance">AN ADVENTURE BASED ON DISCUSSION IN THE QUARRELSOME INN OVER X-MAS 2025</p>
      <div className="title-actions">
        <button onClick={saved ? () => setExperience('game') : beginFresh}>{saved ? 'CONTINUE YOUR JOURNEY' : 'BEGIN GAME MODE'}<small>{saved ? `${Math.round(gameStats.concentration)} CONCENTRATION · ${Math.round(gameStats.clarity)} CLARITY` : 'FOG · METERS · PROGRESSION'}</small></button>
        <button className="sandbox-choice" onClick={() => setExperience('sandbox')}>ENTER SANDBOX<small>FREE EXPLORATION · FULL MAP</small></button>
      </div>
      <div className="title-footnote">{saved && <button className="new-journey" onClick={() => setConfirmNew(true)}>START A NEW JOURNEY</button>}<span>{saved ? 'YOUR JOURNEY IS SAVED ON THIS DEVICE' : 'GAME MODE SAVES YOUR JOURNEY ON THIS DEVICE'}</span></div>
      <small>WASD / ARROW KEYS · MOBILE CONTROLS INCLUDED</small>
    </section>
    {confirmNew && <LoreDialog title="A NEW BEGINNING?" eyebrow="AT THE GARDEN GATE" className="journey-menu" onClose={() => setConfirmNew(false)}><p className="copy">Starting again replaces your saved journey on this device. Sandbox lets you wander freely while keeping that journey.</p><button className="enter-area" onClick={beginFresh}>BEGIN AGAIN AT HOME</button><button className="enter-area secondary" onClick={() => setConfirmNew(false)}>KEEP MY JOURNEY</button></LoreDialog>}
  </main>;

  return <main className={`game experience-${experience}`}>
    {!sceneOpen && <div className={`world-surface ${view === 'presentation' ? 'atlas-surface' : ''}`} inert={blocked}>
      <SceneBoundary onRecover={returnToTitle}>
        {view === 'player' ? <PlayerMode player={isGame ? gamePlayer : sandboxPlayer} dialogue={blocked} discoveredRegions={isGame ? gameDiscovered : sandboxDiscovered} onDiscover={selectRegion} onDiscoverProp={selectProp} game={isGame ? {stats: gameStats, discovery: gameDiscovery, onStatsChange: onGameStatsChange, onPractice: openPractice, explorationAssists: assists} : undefined}/> : <MapMode onSelectRegion={selectRegion} onSelectRoute={selectRoute} onSelectProp={selectProp} onClear={clearSelection}/>}
      </SceneBoundary>
    </div>}
    {!sceneOpen && <>
      <header inert={!!selection || menu}><div><b>FIRE KASINA</b><span>{isGame ? 'GAME MODE · YOUR JOURNEY' : 'SANDBOX · THE MAP OF YOU'}</span></div><nav aria-label={isGame ? 'Game menu' : 'Sandbox view'}>{!isGame && <><button className={view === 'player' ? 'active' : ''} aria-pressed={view === 'player'} onClick={() => { setSandboxView('player'); clearSelection(); }}>♟ PLAYER</button><button className={view === 'presentation' ? 'active' : ''} aria-pressed={view === 'presentation'} onClick={() => { setSandboxView('presentation'); clearSelection(); }}>⌖ MAP</button></>}<button onClick={() => { setMenu(true); if (isGame) save(); }}>MENU</button></nav></header>
      {isGame && <div inert={!!selection || menu}><GameHud stats={gameStats} mistOverride={assists.mist} fairyOverride={assists.fairy} onMistOverride={checked => toggleAssist('mist', checked)} onFairyOverride={checked => toggleAssist('fairy', checked)}/></div>}
      {view === 'player' && <aside className="help">MOVE <kbd>WASD</kbd> <kbd>↑↓←→</kbd> · <kbd>ESC</kbd> MENU</aside>}
      {saveFailed && <p className="save-warning" role="status">Saving is unavailable in this browser. Keep this tab open to keep your journey.</p>}
    </>}
    {region && <LoreDialog title={region.name} eyebrow={view === 'player' ? 'TRAVELER’S JOURNAL' : 'MAP LORE'} onClose={clearSelection}>
      <p className="copy"><span className="dialogue-gem">◆</span>{presentationContent[region.id]}</p>
      {activityEntrance && <button className="enter-area" onClick={() => startActivity(activityEntrance.id)}>{activityEntrance.label} →</button>}
      {interiorEntrance && view === 'player' && <button className="enter-area" onClick={() => { setInterior(interiorEntrance); clearSelection(); }}>ENTER THIS AREA →</button>}
      {interiorEntrance && view === 'presentation' && <><button className="enter-area" onClick={() => { setOverview(interiorEntrance); clearSelection(); }}>OPEN AREA MAP →</button><button className="enter-area secondary" onClick={() => { setInterior(interiorEntrance); clearSelection(); }}>WALK THROUGH THIS AREA →</button></>}
      <LoreLinks links={presentationReferences[region.id]??[]} title="FIELD GUIDE"/>
      <small className="dialogue-hint">ESC · TAP OUTSIDE · × TO CLOSE</small>
    </LoreDialog>}
    {route && lore && <LoreDialog title={lore.title} eyebrow={`PATH DISCOVERED · ${lore.family.toUpperCase()}`} className={`path-dialogue ${lore.family}`} onClose={clearSelection}><p className="copy"><span className="dialogue-gem">◆</span>{lore.copy}</p><LoreLinks links={lore.reference?[lore.reference]:[]} title="FIELD GUIDE"/></LoreDialog>}
    {prop && <LoreDialog title={prop.name} eyebrow="A CURIOUS FIND" className="prop-dialogue" onClose={clearSelection}><p className="copy"><span className="dialogue-gem">◆</span>{prop.copy}</p><LoreLinks links={[prop.reference]} title="TRAVELLER’S NOTE"/></LoreDialog>}
    {menu && <LoreDialog title="REST A MOMENT" eyebrow={isGame ? 'YOUR JOURNEY IS PAUSED' : 'SANDBOX'} className="journey-menu" onClose={() => setMenu(false)}>
      <p className="copy">{isGame ? `A steady flame opens the Mists at ${MIST_ENTRY_CONCENTRATION} concentration. The Fairy Playground calls for both ${FAIRY_ENTRY_CONCENTRATION} concentration and ${FAIRY_ENTRY_CLARITY} clarity. Return to the Red Dot Range when your strength runs low.` : 'The whole landscape is open. Use Map to browse regions and paths, or Player to wander, meet travelers, and enter the places you find.'}</p>
      <p className="menu-controls">WASD / ARROWS · MOVE<br/>TAP AN AREA NOTICE · READ ITS LORE<br/>ESC · CLOSE LORE / OPEN THIS MENU</p>
      <button className="enter-area" onClick={() => setMenu(false)}>CONTINUE EXPLORING</button>
      <button className="enter-area secondary" onClick={returnToTitle}>{isGame ? 'SAVE & RETURN TO TITLE' : 'RETURN TO TITLE'}</button>
      <small className="save-note">{isGame ? saveFailed ? 'BROWSER STORAGE IS UNAVAILABLE' : 'SAVED AUTOMATICALLY ON THIS DEVICE' : 'SANDBOX DOES NOT CHANGE YOUR SAVED JOURNEY'}</small>
    </LoreDialog>}
    {sceneOpen && <SceneBoundary key={activity ?? interior?.id ?? overview?.id} onRecover={closeScene}><Suspense fallback={loading}>
      {interior && <InteriorMode map={interior} onExit={closeScene}/>}
      {overview && <SubMap map={overview} onExit={closeScene}/>}
      {activity === 'red-dot' && <RedDotMinigame {...activityProps}/>}
      {activity === 'trauma' && <TraumaLabyrinth {...activityProps}/>}
      {activity === 'inn' && <QuarrelsomeInnMinigame {...activityProps}/>}
      {activity === 'lagoon' && <BoohooLagoonMinigame {...activityProps}/>}
      {activity === 'chasm' && <ChasmDespairMinigame {...activityProps}/>}
    </Suspense></SceneBoundary>}
  </main>;
}
