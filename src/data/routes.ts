export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export type RouteFamily='generation'|'deconstruction'|'balance'|'connection';
export interface Route {id:string;name:string;family:RouteFamily;kind:RouteKind;points:[number,number][];labelAt:[number,number];}
export const routes:Route[]=[
 {id:'kindling',name:'The Kindling Road',family:'generation',kind:'tram',points:[[800,550],[500,570],[430,330],[245,105]],labelAt:[410,285]},
 {id:'ascent',name:'The Luminous Ascent',family:'generation',kind:'rail',points:[[800,550],[900,360],[1120,95]],labelAt:[960,275]},
 {id:'unmaking',name:'The Unmaking Way',family:'deconstruction',kind:'tunnel',points:[[800,550],[1080,570],[940,760],[1110,940]],labelAt:[1030,665]},
 {id:'vanishing',name:'The Vanishing Road',family:'deconstruction',kind:'bridge',points:[[1110,940],[1290,955],[1480,970]],labelAt:[1300,930]},
 {id:'middle',name:'The Wayfarer’s Middle Path',family:'balance',kind:'tram',points:[[245,990],[410,820],[500,570],[800,550],[700,330],[650,90]],labelAt:[525,410]},
 {id:'clarity',name:'Clarity Ridge',family:'connection',kind:'bridge',points:[[245,105],[440,75],[650,90]],labelAt:[445,120]},
 {id:'skybridge',name:'Skybridge of Discernment',family:'connection',kind:'bridge',points:[[650,90],[880,55],[1120,95]],labelAt:[875,115]},
 {id:'return',name:'The Gentle Return',family:'connection',kind:'rail',points:[[245,990],[520,1010],[790,980],[1110,940]],labelAt:[690,1030]}
];
