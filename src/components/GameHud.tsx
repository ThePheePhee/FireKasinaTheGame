import type {GameStats} from '../game/gameState';
import {projectionSummary,type DynamicWorld} from '../game/dynamicWorld';
import './GameMode.css';
import './DynamicWorld.css';

const meters:[keyof GameStats,string][]=[['concentration','CONCENTRATION'],['clarity','CLARITY'],['confusion','CONFUSION']];
export default function GameHud({stats,world,concentrationAssist,onConcentrationAssist}:{stats:GameStats;world?:DynamicWorld;concentrationAssist?:boolean;onConcentrationAssist?:(enabled:boolean)=>void}){return <aside className="game-hud" aria-label="Player meters">{meters.map(([key,label])=><div className={`meter meter-${key}`} key={key}><span>{label}</span><div><i style={{width:`${stats[key]}%`}}/></div><b>{Math.round(stats[key])}</b></div>)}{onConcentrationAssist&&<label className="concentration-assist"><input type="checkbox" checked={!!concentrationAssist} onChange={event=>onConcentrationAssist(event.target.checked)}/><span>MIST EXPLORATION ASSIST</span><small>Holds concentration above 35</small></label>}{world&&<div className="world-readout"><span>{world.screenMode.toUpperCase()} SCREEN</span><b>{world.reason}</b><small>{projectionSummary(world)}</small></div>}</aside>}
