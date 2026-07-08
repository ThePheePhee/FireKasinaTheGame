import type {GameStats} from '../game/gameState';
import {practiceActions,projectionSummary,type DynamicWorld,type PracticeActionId} from '../game/dynamicWorld';
import './GameMode.css';
import './DynamicWorld.css';

const meters:[keyof GameStats,string][]=[['concentration','CONCENTRATION'],['clarity','CLARITY'],['confusion','CONFUSION']];
export default function GameHud({stats,world,onAction}:{stats:GameStats;world?:DynamicWorld;onAction?:(action:PracticeActionId)=>void}){return <><aside className="game-hud" aria-label="Player meters">{meters.map(([key,label])=><div className={`meter meter-${key}`} key={key}><span>{label}</span><div><i style={{width:`${stats[key]}%`}}/></div><b>{Math.round(stats[key])}</b></div>)}{world&&<div className="world-readout"><span>{world.screenMode.toUpperCase()} SCREEN</span><b>{world.reason}</b><small>{projectionSummary(world)}</small></div>}</aside>{world&&onAction&&<aside className="practice-actions" aria-label="Ways of relating to experience"><b>HOW DO YOU RELATE TO WHAT APPEARS?</b>{(Object.entries(practiceActions) as [PracticeActionId,(typeof practiceActions)[PracticeActionId]][]).map(([id,action])=><button key={id} title={action.copy} onClick={()=>onAction(id)}>{action.name}</button>)}</aside>}</>}
