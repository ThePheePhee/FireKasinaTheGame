import type {GameStats} from '../game/gameState';
import './GameMode.css';

const meters:[keyof GameStats,string][]=[['concentration','CONCENTRATION'],['clarity','CLARITY'],['confusion','CONFUSION']];
export default function GameHud({stats}:{stats:GameStats}){return <aside className="game-hud" aria-label="Player meters">{meters.map(([key,label])=><div className={`meter meter-${key}`} key={key}><span>{label}</span><div><i style={{width:`${stats[key]}%`}}/></div><b>{Math.round(stats[key])}</b></div>)}</aside>}
