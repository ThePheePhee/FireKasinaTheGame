import {clampMeter,type GameStats} from './gameState';

export type ActivityPhase='ready'|'running'|'paused'|'done'|'closed';

/** Synchronous input ownership; React rendering may follow an event a beat later. */
export function createActivitySession(){
 let phase:ActivityPhase='ready';
 return {
  get phase(){return phase},
  get running(){return phase==='running'},
  begin(){if(phase==='ready'||phase==='paused')phase='running';return phase},
  pause(){if(phase==='running')phase='paused';return phase},
  complete(){if(phase!=='closed')phase='done';return phase},
  retry(){if(phase==='done')phase='ready';return phase},
  close(){if(phase==='closed')return false;phase='closed';return true},
 };
}

/** A flight/crossing has one receipt, regardless of which exit button is used. */
export function createOutcomeReceipt(){
 let settled=false;
 return (stats:GameStats,changes:Partial<GameStats>):GameStats|null=>{
  if(settled)return null;
  settled=true;
  const next={...stats};
  for(const [key,value] of Object.entries(changes) as [keyof GameStats,number][])next[key]=clampMeter(next[key]+value);
  return next;
 };
}

/** Do not consume shortcuts intended for a browser, form, or focused button. */
export function activityKey(event:KeyboardEvent){
 if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey)return null;
 const target=typeof Element!=='undefined'&&event.target instanceof Element?event.target:null;
 if(target?.closest('input,textarea,select,[contenteditable="true"]'))return null;
 if((event.code==='Space'||event.key==='Enter')&&target?.closest('button,a,[role="button"]'))return null;
 return event.key.length===1?event.key.toLowerCase():event.key;
}
