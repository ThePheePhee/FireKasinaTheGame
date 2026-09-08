import {FAIRY_ENTRY_CLARITY, FAIRY_ENTRY_CONCENTRATION, MIST_ENTRY_CONCENTRATION, type GameStats} from '../game/gameState';
import './GameMode.css';

const meters: [keyof GameStats, string][] = [['concentration', 'CONCENTRATION'], ['clarity', 'CLARITY'], ['confusion', 'CONFUSION']];
export default function GameHud({stats, mistOverride, fairyOverride, onMistOverride, onFairyOverride}: {
  stats: GameStats;
  mistOverride: boolean;
  fairyOverride: boolean;
  onMistOverride: (checked: boolean) => void;
  onFairyOverride: (checked: boolean) => void;
}) {
  const mistReady = stats.concentration >= MIST_ENTRY_CONCENTRATION;
  const fairyReady = stats.clarity >= FAIRY_ENTRY_CLARITY && stats.concentration >= FAIRY_ENTRY_CONCENTRATION;
  return <aside className="game-hud" aria-label="Player meters">
    {meters.map(([key, label]) => <div className={`meter meter-${key}`} key={key}>
      <span>{label}</span>
      <div role="meter" aria-label={label.toLowerCase()} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(stats[key])}><i style={{width: `${stats[key]}%`}}/></div>
      <b aria-hidden="true">{Math.round(stats[key])}</b>
    </div>)}
    <p className={`journey-gate ${fairyReady ? 'gate-open' : ''}`}>{fairyReady ? '◆ FAIRY PLAYGROUND · GATE OPEN' : mistReady ? `◆ MISTS OPEN · FAIRY CLARITY ${Math.round(stats.clarity)}/${FAIRY_ENTRY_CLARITY}` : `◆ RED DOT RANGE · BUILD TO ${MIST_ENTRY_CONCENTRATION}`}</p>
    <details className="exploration-options">
      <summary>EXPLORATION ASSISTS{mistOverride || fairyOverride ? ' · ON' : ''}</summary>
      <div className="exploration-overrides">
        <label><input type="checkbox" checked={mistOverride} onChange={event => onMistOverride(event.target.checked)}/> EXPLORE THE MISTS</label>
        <label><input type="checkbox" checked={fairyOverride} onChange={event => onFairyOverride(event.target.checked)}/> EXPLORE THE FAIRY PLAYGROUND</label>
        <small>Keep the required meters high while checked.</small>
      </div>
    </details>
  </aside>;
}
