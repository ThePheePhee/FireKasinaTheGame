export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export interface Route {kind:RouteKind; points:[number,number][];}
export const routes:Route[]=[
 {kind:'rail',points:[[390,120],[460,430],[650,820],[230,900]]},
 {kind:'tram',points:[[795,110],[800,550],[1050,900],[1450,870]]},
 {kind:'tunnel',points:[[1250,120],[1140,520],[1450,870]]},
 {kind:'bridge',points:[[230,900],[650,820],[1050,900]]}
];
