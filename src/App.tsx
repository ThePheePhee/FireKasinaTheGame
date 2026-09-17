import {lazy, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import type {Region} from './data/mapRegions';
import {routes,type Route} from './data/routes';
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
import FieldJournal from './components/FieldJournal';
import JourneyTransfer from './components/JourneyTransfer';
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
const qaFloor = Math.max(0,Math.floor(Number(qaParams?.get('floor'))||0));
const qaActivity = Object.values(activities).find(activity => activity.id === qa)?.id;
const reviewRoad = qa === 'road' ? routes.find(route => route.id === qaParams?.get('path')) : null;
const reviewInterior = () => {
  if (qa !== 'interior') return null;
  const map = getInteriorMap(qaParams?.get('area') ?? 'tower');
  if (!map) return null;
  const floorIndex = Math.min(map.floors.length-1,qaFloor);
  const zone = map.floors[floorIndex].zones.find(item => item.id === qaParams?.get('near'));
  // Stand beside the landmark, outside a staircase trigger beneath its centre.
  return zone ? {...map, floors: map.floors.map((floor,index)=>index===floorIndex?{...floor,spawn:[Math.min(floor.width-30,zone.x+100),zone.y+zone.h*.55] as [number,number]}:floor)} : map;
};

export default function App() {
  const [saved, setSaved] = useState<SavedJourney | null>(() => qa ? null : loadJourney());
  const [initial] = useState(() => saved ?? createJourney());
  const [experience, setExperience] = useState<Experience | null>(qa === 'journey' ? null : qa === 'map' || qa === 'interior' || qa === 'road' ? 'sandbox' : qa ? 'game' : null);
  const [sandboxView, setSandboxView] = useState<SandboxView>(qa === 'map' ? 'presentation' : 'player');
  const [selection, setSelection] = useState<Selection>(null);
  const [interior, setInterior] = useState<InteriorMap | null>(reviewInterior);
  const [overview, setOverview] = useState<InteriorMap | null>(null);
  const [activity, setActivity] = useState<Activity | null>(qaActivity ?? null);
  const [gameStats, setGameStats] = useState<GameStats>(() => qaActivity && qaActivity !== 'red-dot' ? {...initial.stats, concentration: 60} : initial.stats);
  const [sandboxStats, setSandboxStats] = useState<GameStats>({...initialGameStats, concentration: 60});
  const [assists, setAssists] = useState(initial.assists);
  const [menu, setMenu] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [journal, setJournal] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [worldRevision, setWorldRevision] = useState(0);
  const [confirmNew, setConfirmNew] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const gamePlayer = useRef<Player>({...initial.player});
  const sandboxPlayer = useRef<Player>(reviewRoad ? {...createJourney().player,x:reviewRoad.labelAt[0],y:reviewRoad.labelAt[1]} : createJourney().player);
  const gameDiscovered = useRef(new Set(initial.discoveredRegions));
  const sandboxDiscovered = useRef(new Set<string>());
  const gameDiscovery = useRef(initial.discovery);
  const notebook = useRef(new Set(initial.notebook));
  const statsRef = useRef(gameStats);
  const assistsRef = useRef(assists);
  const lastSave = useRef('');
  const isGame = experience === 'game';
  const view = isGame ? 'player' : sandboxView;
  const sceneOpen = !!(interior || overview || activity);
  const blocked = !!selection || sceneOpen || menu || journal || transfer;

  const snapshot = useCallback((): SavedJourney => ({version: 1, savedAt: Date.now(), stats: {...statsRef.current}, player: {...gamePlayer.current, moving: false}, discoveredRegions: [...gameDiscovered.current], discovery: gameDiscovery.current.map(point => ({...point})), assists: {...assistsRef.current}, notebook: [...notebook.current]}), []);

  const save = useCallback(() => {
    const {savedAt: _savedAt, ...data} = snapshot();
    const signature = JSON.stringify(data);
    if (signature === lastSave.current) return;
    const savedSnapshot: SavedJourney = {...data, savedAt: Date.now()};
    const succeeded = !!qa || storeJourney(savedSnapshot);
    setSaveFailed(!succeeded);
    // Even if storage is blocked, returning to the title must retain this tab's journey.
    setSaved(savedSnapshot);
    if (succeeded) lastSave.current = signature;
  }, [snapshot]);
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
  const readEntry = useCallback((id: string) => { if (isGame) notebook.current.add(id); }, [isGame]);
  const selectRegion = useCallback((region: Region | null) => { if (region) readEntry(region.id); setSelection(region ? {kind: 'region', region} : null); }, [readEntry]);
  const selectRoute = useCallback((route: Route) => { readEntry(`route:${route.id}`); setSelection({kind: 'route', route}); }, [readEntry]);
  const selectProp = useCallback((prop: MapProp) => { readEntry(`prop:${prop.id}`); setSelection({kind: 'prop', prop}); }, [readEntry]);
  const clearSelection = useCallback(() => setSelection(null), []);
  const openPractice = useCallback(() => { setSelection(null); setActivity('red-dot'); }, []);
  const startActivity = (id: Activity) => {
    if (!isGame) setSandboxStats(stats => ({...stats, concentration: id === 'red-dot' ? 0 : Math.max(60, stats.concentration)}));
    setActivity(id);
    clearSelection();
  };
  const closeScene = useCallback(() => { setActivity(null); setInterior(null); setOverview(null); if (isGame) save(); }, [isGame, save]);
  const returnToTitle = useCallback(() => { if (isGame) save(); setMenu(false); setWelcome(false); setJournal(false); setTransfer(false); setSelection(null); setActivity(null); setInterior(null); setOverview(null); setExperience(null); }, [isGame, save]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || sceneOpen || selection || confirmNew || journal || transfer || !experience) return;
      if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (event.key === 'Escape') { event.preventDefault(); setWelcome(false); setMenu(value => !value); }
      if (event.key.toLowerCase() === 'j' && !menu) { event.preventDefault(); setJournal(true); }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [experience, sceneOpen, selection, confirmNew, journal, transfer, menu]);
  useEffect(() => {
    if (!experience || sceneOpen) return;
    const pause = () => { if (!selection && !journal && !transfer) { setWelcome(false); setMenu(true); } };
    const hidden = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', hidden); };
  }, [experience, sceneOpen, selection, journal, transfer]);
  const restoreJourney = (fresh: SavedJourney) => {
    gamePlayer.current = fresh.player;
    gameDiscovered.current = new Set(fresh.discoveredRegions);
    gameDiscovery.current = fresh.discovery;
    notebook.current = new Set(fresh.notebook);
    assistsRef.current = fresh.assists;
    statsRef.current = fresh.stats;
    setAssists(fresh.assists); setGameStats(fresh.stats); setConfirmNew(false); setSelection(null); setActivity(null); setInterior(null); setOverview(null); setJournal(false); setTransfer(false); setExperience('game'); setWorldRevision(value => value + 1);
    save();
  };
  const beginFresh = () => { restoreJourney(createJourney()); setWelcome(true); setMenu(true); };

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
      <p className="practice-framing">A playful map of practice reports and traditions—not a test of attainment. Game meters are rules of this adventure.</p>
      <div className="title-actions">
        <button onClick={saved ? () => setExperience('game') : beginFresh}>{saved ? 'CONTINUE YOUR JOURNEY' : 'BEGIN GAME MODE'}<small>{saved ? `${Math.round(gameStats.concentration)} CONCENTRATION · ${Math.round(gameStats.clarity)} CLARITY` : 'FOG · METERS · PROGRESSION'}</small></button>
        <button className="sandbox-choice" onClick={() => setExperience('sandbox')}>ENTER SANDBOX<small>FREE EXPLORATION · FULL MAP</small></button>
      </div>
      <div className="title-footnote">{saved && <button className="new-journey" onClick={() => setConfirmNew(true)}>START A NEW JOURNEY</button>}<span>{saveFailed ? 'KEPT IN THIS TAB ONLY · DOWNLOAD A SAVE FILE' : qa ? 'LOCAL REVIEW · YOUR BROWSER SAVE IS UNTOUCHED' : saved ? 'YOUR JOURNEY IS SAVED ON THIS DEVICE' : 'GAME MODE SAVES YOUR JOURNEY ON THIS DEVICE'}</span></div>
      <small>WASD / ARROW KEYS · MOBILE CONTROLS INCLUDED</small>
      <div className="journey-tools"><button onClick={() => setTransfer(true)}>SAVE FILES · IMPORT / EXPORT</button></div>
    </section>
    {confirmNew && <LoreDialog title="A NEW BEGINNING?" eyebrow="AT THE GARDEN GATE" className="journey-menu" onClose={() => setConfirmNew(false)}><p className="copy">Starting again replaces your saved journey on this device. Sandbox lets you wander freely while keeping that journey.</p><button className="enter-area" onClick={beginFresh}>BEGIN AGAIN AT HOME</button><button className="enter-area secondary" onClick={() => setConfirmNew(false)}>KEEP MY JOURNEY</button></LoreDialog>}
    {transfer && <JourneyTransfer snapshot={snapshot} onImport={journey => { restoreJourney(journey); setWelcome(false); setMenu(true); }} onClose={() => setTransfer(false)}/>}
  </main>;

  return <main className={`game experience-${experience}`}>
    {!sceneOpen && <div className={`world-surface ${view === 'presentation' ? 'atlas-surface' : ''}`} inert={blocked}>
      <SceneBoundary key={worldRevision} onRecover={returnToTitle}>
        {view === 'player' ? <PlayerMode player={isGame ? gamePlayer : sandboxPlayer} dialogue={blocked} discoveredRegions={isGame ? gameDiscovered : sandboxDiscovered} onDiscover={selectRegion} onDiscoverProp={selectProp} onReadRoute={selectRoute} game={isGame ? {stats: gameStats, discovery: gameDiscovery, onStatsChange: onGameStatsChange, onPractice: openPractice, explorationAssists: assists} : undefined}/> : <MapMode onSelectRegion={selectRegion} onSelectRoute={selectRoute} onSelectProp={selectProp} onClear={clearSelection} selectedRouteId={route?.id??null}/>}
      </SceneBoundary>
    </div>}
    {!sceneOpen && <>
      <header inert={blocked}><div><b>FIRE KASINA</b><span>{isGame ? 'GAME MODE · YOUR JOURNEY' : 'SANDBOX · THE MAP OF YOU'}</span></div><nav aria-label={isGame ? 'Game menu' : 'Sandbox view'}>{!isGame && <><button className={view === 'player' ? 'active' : ''} aria-pressed={view === 'player'} onClick={() => { setSandboxView('player'); clearSelection(); }}>♟ PLAYER</button><button className={view === 'presentation' ? 'active' : ''} aria-pressed={view === 'presentation'} onClick={() => { setSandboxView('presentation'); clearSelection(); }}>⌖ MAP</button></>}<button onClick={() => setJournal(true)}>JOURNAL</button><button onClick={() => { setWelcome(false); setMenu(true); if (isGame) save(); }}>MENU</button></nav></header>
      {isGame && <div inert={blocked}><GameHud stats={gameStats} mistOverride={assists.mist} fairyOverride={assists.fairy} onMistOverride={checked => toggleAssist('mist', checked)} onFairyOverride={checked => toggleAssist('fairy', checked)}/></div>}
      {view === 'player' && <aside className="help">MOVE <kbd>WASD</kbd> <kbd>↑↓←→</kbd> · <kbd>R</kbd> PATH · <kbd>J</kbd> JOURNAL · <kbd>ESC</kbd> MENU</aside>}
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
    {route && lore && <LoreDialog title={lore.title} eyebrow={`PATH DISCOVERED · ${lore.family.toUpperCase()}`} className={`path-dialogue ${lore.family}`} onClose={clearSelection}><p className="path-itinerary">{lore.journey}</p><p className="copy"><span className="dialogue-gem">◆</span>{lore.copy}</p><LoreLinks links={lore.reference?[lore.reference]:[]} title="FIELD GUIDE"/></LoreDialog>}
    {prop && <LoreDialog title={prop.name} eyebrow="A CURIOUS FIND" className="prop-dialogue" onClose={clearSelection}><p className="copy"><span className="dialogue-gem">◆</span>{prop.copy}</p><LoreLinks links={[prop.reference]} title="TRAVELLER’S NOTE"/></LoreDialog>}
    {menu && <LoreDialog title={welcome ? 'A LANTERN FOR THE ROAD' : 'REST A MOMENT'} eyebrow={isGame ? 'YOUR JOURNEY IS PAUSED' : 'SANDBOX'} className="journey-menu" onClose={() => { setMenu(false); setWelcome(false); }}>
      {isGame ? <div className="retreat-guide"><p><b>1 · A FAMILIAR BEGINNING</b>Start at home. Visit the Library and Tavern, then practise with the candle at the Red Dot Range.</p><p><b>2 · EXPLORE, THEN RETURN</b>{MIST_ENTRY_CONCENTRATION} concentration opens the Mists. Encounters can build clarity; travel spends concentration. Return to the Range when it runs low.</p><p><b>3 · VISIT THE MARVELS</b>Beyond the Mists, the Fairy Playground needs {FAIRY_ENTRY_CONCENTRATION} concentration and {FAIRY_ENTRY_CLARITY} clarity. Remember the road home.</p></div> : <p className="copy">The whole landscape is open. Use Map to browse named places and paths, or Player to wander, meet travelers, and enter the places you find. The Journal collects all lore and sources without moving your traveller.</p>}
      <details className="menu-controls"><summary>CONTROLS & FIELD NOTES</summary>WASD / ARROWS · MOVE<br/>TAP AN AREA NOTICE / E · READ ITS LORE<br/>TAP A ROAD SIGN / R · READ THE CURRENT PATH<br/>J · OPEN YOUR JOURNAL<br/>ESC · CLOSE LORE / OPEN THIS MENU</details>
      <button className="enter-area" onClick={() => { setMenu(false); setWelcome(false); }}>{welcome ? 'STEP OUT FROM HOME' : 'CONTINUE EXPLORING'}</button>
      <div className="journey-tools"><button onClick={() => { setMenu(false); setJournal(true); }}>OPEN JOURNAL</button>{isGame && <button onClick={() => { setMenu(false); setTransfer(true); }}>SAVE FILES · IMPORT / EXPORT</button>}</div>
      <button className="enter-area secondary" onClick={returnToTitle}>{isGame ? 'SAVE & RETURN TO TITLE' : 'RETURN TO TITLE'}</button>
      <small className="save-note">{isGame ? qa ? 'LOCAL REVIEW · NO BROWSER SAVE IS CHANGED' : saveFailed ? 'BROWSER STORAGE IS UNAVAILABLE · DOWNLOAD A SAVE FILE' : 'SAVED AUTOMATICALLY ON THIS DEVICE' : 'SANDBOX DOES NOT CHANGE YOUR SAVED JOURNEY'}</small>
    </LoreDialog>}
    {journal && <FieldJournal sandbox={!isGame} discovered={gameDiscovered.current} notebook={notebook.current} onClose={() => setJournal(false)}/>}
    {transfer && <JourneyTransfer snapshot={snapshot} onImport={journey => { restoreJourney(journey); setWelcome(false); setMenu(true); }} onClose={() => setTransfer(false)}/>}
    {sceneOpen && <SceneBoundary key={activity ?? interior?.id ?? overview?.id} onRecover={closeScene}><Suspense fallback={loading}>
      {interior && <InteriorMode map={interior} initialFloorIndex={qa==='interior'?qaFloor:0} onExit={closeScene} onReadEntry={readEntry}/>}
      {overview && <SubMap map={overview} onExit={closeScene} onReadEntry={readEntry}/>}
      {activity === 'red-dot' && <RedDotMinigame {...activityProps}/>}
      {activity === 'trauma' && <TraumaLabyrinth {...activityProps}/>}
      {activity === 'inn' && <QuarrelsomeInnMinigame {...activityProps}/>}
      {activity === 'lagoon' && <BoohooLagoonMinigame {...activityProps}/>}
      {activity === 'chasm' && <ChasmDespairMinigame {...activityProps}/>}
    </Suspense></SceneBoundary>}
  </main>;
}
