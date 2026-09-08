import type {GameStats} from './gameState';

// Keep practice calibrated in seconds, independent of display refresh rate.
export const DOT_DURATION_SECONDS=20;
export const ABSENCE_DURATION_SECONDS=10;
export function concentrationRate(stats:Pick<GameStats,'concentration'|'clarity'>,quality:number):number {
 const diminishing=Math.pow(Math.max(.02,1-stats.concentration/100),1.45);
 const clarityBoost=1+stats.clarity/45;
 const barrierProgress=Math.max(0,Math.min(1,(stats.concentration-60)/10));
 const highBarrier=1-barrierProgress*(.92-stats.clarity/100);
 return Math.max(0,Math.min(1,quality))*.715*diminishing*clarityBoost*highBarrier;
}
export const targetDamping=(seconds:number)=>Math.pow(.996,seconds*60);

export function lagoonReward(shadows:number,breathLights:number) {
 return {clarity:Math.min(20,shadows*1.6+breathLights*.8),confusion:Math.min(14,shadows+Math.floor(breathLights/2)),equanimity:Math.min(5,Math.floor(breathLights/3))};
}
