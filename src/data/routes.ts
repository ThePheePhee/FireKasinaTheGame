export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export interface Route {kind:RouteKind; points:[number,number][];}
export const routes:Route[]=[
 {kind:'rail',points:[[245,105],[430,360],[650,790],[245,990]]},
 {kind:'tram',points:[[650,90],[800,550],[1110,940],[1480,970]]},
 {kind:'tunnel',points:[[1120,95],[1080,570],[1470,500]]},
 {kind:'bridge',points:[[245,990],[650,790],[1110,940]]}
];
