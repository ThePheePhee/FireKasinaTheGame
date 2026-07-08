export interface GameStats {concentration:number;clarity:number;confusion:number}
export interface DiscoveryPoint {x:number;y:number;radius:number}

export const MIST_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CLARITY=25;
export const initialGameStats:GameStats={concentration:0,clarity:0,confusion:0};
export const initialDiscovery:DiscoveryPoint[]=[[[740,500],115],[[800,550],195],[[920,510],115],[[650,450],85],[[1030,450],85]].map(([point,radius])=>{const [x,y]=expandPoint(point as [number,number]);return{x,y,radius:radius as number}});

export const clampMeter=(value:number)=>Math.max(0,Math.min(100,value));
import {expandPoint} from '../data/mapScale';
