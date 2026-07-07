export interface GameStats {concentration:number;clarity:number;confusion:number}
export interface DiscoveryPoint {x:number;y:number;radius:number}

export const MIST_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CLARITY=25;
export const initialGameStats:GameStats={concentration:0,clarity:0,confusion:0};
export const initialDiscovery:DiscoveryPoint[]=[
 {x:740,y:500,radius:105},
 {x:800,y:550,radius:190},
 {x:920,y:510,radius:105}
];

export const clampMeter=(value:number)=>Math.max(0,Math.min(100,value));
