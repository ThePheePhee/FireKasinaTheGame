import {mapRegions} from '../data/mapRegions';
import {routes} from '../data/routes';

export interface GameStats {concentration:number;clarity:number;confusion:number;metta:number;equanimity:number;realityTesting:number;integration:number;craving:number}
export interface DiscoveryPoint {x:number;y:number;radius:number}
export interface ExplorationAssists {mist:boolean;fairy:boolean}

export const MIST_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CONCENTRATION=35;
export const FAIRY_ENTRY_CLARITY=80;
export const HOMESTEAD_IDS=new Set(['house','garden','red-dot','library','fortification-tavern']);
export const HOMESTEAD_ROUTE_IDS=new Set(['library-lane','fortification-road']);
export const initialGameStats:GameStats={concentration:0,clarity:0,confusion:0,metta:0,equanimity:0,realityTesting:0,integration:0,craving:0};
// Reveal the actual homestead and its footpaths, including both new buildings.
export const initialDiscovery:DiscoveryPoint[]=[
 ...mapRegions.filter(region=>HOMESTEAD_IDS.has(region.id)).map(region=>({x:region.x,y:region.y,radius:region.shape.kind==='circle'?region.shape.radius+28:100})),
 ...routes.filter(route=>HOMESTEAD_ROUTE_IDS.has(route.id)).flatMap(route=>route.points.map(([x,y])=>({x,y,radius:52})))
];

export const clampMeter=(value:number)=>Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
export function applyExplorationAssists(stats:GameStats,assists:ExplorationAssists):GameStats {
 return {...stats,
  concentration:assists.mist||assists.fairy?Math.max(MIST_ENTRY_CONCENTRATION+1,stats.concentration):stats.concentration,
  clarity:assists.fairy?Math.max(FAIRY_ENTRY_CLARITY+1,stats.clarity):stats.clarity
 };
}
