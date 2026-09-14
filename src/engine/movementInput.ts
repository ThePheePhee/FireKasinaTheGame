/** Keyboard, held on-screen controls and accessible single clicks share motion,
 *  but never share ownership of a pressed key. No DOM or player mutation. */
export function createMovementInput(){
 const held=new Set<string>();
 let pulse:{key:string;remaining:number}|null=null;
 return {
  held,
  setVirtual(key:string,pressed:boolean){const token=`virtual:${key}`;if(pressed)held.add(token);else held.delete(token)},
  nudge(key:string){pulse={key,remaining:.06}},
  clear(){held.clear();pulse=null},
  frame(seconds:number):{keys:Set<string>;dt:number}{
   const dt=Number.isFinite(seconds)?Math.max(0,seconds):0;
   const keys=new Set([...held].map(key=>key.startsWith('virtual:')?key.slice(8):key));
   const step=pulse&&!held.size?Math.min(dt,pulse.remaining):dt;
   if(pulse){keys.add(pulse.key);pulse.remaining-=dt;if(pulse.remaining<=0)pulse=null}
   return {keys,dt:step};
  },
 };
}
