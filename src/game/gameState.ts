export interface GameStats {concentration:number;clarity:number;confusion:number;metta:number;equanimity:number;realityTesting:number;integration:number;craving:number}
export interface DiscoveryPoint {x:number;y:number;radius:number}

export const MIST_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CLARITY=25;
export const initialGameStats:GameStats={concentration:0,clarity:0,confusion:0,metta:0,equanimity:0,realityTesting:0,integration:0,craving:0};
export const initialDiscovery:DiscoveryPoint[]=[[[740,500],105],[[800,550],190],[[920,510],105]].map(([point,radius])=>{const [x,y]=expandPoint(point as [number,number]);return{x,y,radius:radius as number}});

export const clampMeter=(value:number)=>Math.max(0,Math.min(100,value));
import {expandPoint} from '../data/mapScale';
