import {mapRegions,type Region} from '../data/mapRegions';
import {routes} from '../data/routes';
import {regionContains,regionExtent} from '../engine/regionGeometry';
import {FAIRY_ENTRY_CLARITY,FAIRY_ENTRY_CONCENTRATION,HOMESTEAD_IDS,HOMESTEAD_ROUTE_IDS,MIST_ENTRY_CONCENTRATION,type GameStats} from './gameState';

export type Country='home'|'mist'|'fairy';
interface Point {x:number;y:number}
const mist=mapRegions.find(region=>region.id==='mist')!;
const orderedRegions=[...mapRegions].sort((a,b)=>regionExtent(a)-regionExtent(b));
const outerRegions=new Set(['fireworks','magical','healing','celestial','tower','jhana','formless']);
const homesteadPaths=routes.filter(route=>HOMESTEAD_ROUTE_IDS.has(route.id));

export const regionAt=(x:number,y:number)=>orderedRegions.find(region=>regionContains(region,x,y))??null;
function nearSegment(x:number,y:number,a:[number,number],b:[number,number]) {
 const vx=b[0]-a[0],vy=b[1]-a[1],length=vx*vx+vy*vy;
 const t=length?Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/length)):0;
 return Math.hypot(x-a[0]-vx*t,y-a[1]-vy*t)<38;
}

export function countryAt(x:number,y:number,region:Region|null=regionAt(x,y)):Country {
 if(HOMESTEAD_IDS.has(region?.id??'')||homesteadPaths.some(route=>route.points.slice(1).some((point,index)=>nearSegment(x,y,route.points[index],point))))return 'home';
 // An edge destination remains Fairy territory where its drawn circle overlaps mist.
 if(outerRegions.has(region?.id??''))return 'fairy';
 return regionContains(mist,x,y)?'mist':'fairy';
}

export function worldEntryBarrier(before:Point,next:Point,stats:Pick<GameStats,'concentration'|'clarity'>):'mist'|'fairy'|null {
 const from=countryAt(before.x,before.y),to=countryAt(next.x,next.y);
 if(to==='mist'&&from==='home'&&stats.concentration<MIST_ENTRY_CONCENTRATION)return 'mist';
 if(to==='fairy'&&from!=='fairy'&&(stats.concentration<FAIRY_ENTRY_CONCENTRATION||stats.clarity<FAIRY_ENTRY_CLARITY))return 'fairy';
 // Entry gates never prevent someone already in the mist from making their way home.
 return null;
}
