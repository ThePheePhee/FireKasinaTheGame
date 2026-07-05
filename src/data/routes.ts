export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export type RouteFamily='generation'|'deconstruction'|'balance'|'connection';
export interface Route {id:string;name:string;family:RouteFamily;kind:RouteKind;points:[number,number][];labelAt:[number,number];}

export const routes:Route[]=[
 {id:'kindling',name:'The Kindling Road',family:'generation',kind:'tram',points:[[500,570],[420,360],[280,115]],labelAt:[350,300]},
 {id:'artificer',name:"The Artificer's Causeway",family:'generation',kind:'bridge',points:[[280,115],[500,65],[765,105]],labelAt:[515,100]},
 {id:'ascent',name:'The Luminous Ascent',family:'generation',kind:'rail',points:[[765,105],[1000,60],[1260,115]],labelAt:[1005,105]},
 {id:'unmaking',name:'The Unmaking Way',family:'deconstruction',kind:'tunnel',points:[[800,550],[1080,570],[940,760],[1110,940]],labelAt:[1035,670]},
 {id:'vanishing',name:'The Vanishing Road',family:'deconstruction',kind:'bridge',points:[[1110,940],[1290,955],[1480,970]],labelAt:[1300,930]},
 {id:'middle',name:"The Wayfarer's Middle Path",family:'balance',kind:'tram',points:[[245,990],[290,760],[300,510],[500,570],[800,550]],labelAt:[355,690]},
 {id:'clarity',name:'Clarity Ridge',family:'connection',kind:'bridge',points:[[280,115],[250,300],[300,510]],labelAt:[250,315]},
 {id:'reality',name:'The Reality-Testing Road',family:'connection',kind:'rail',points:[[765,105],[575,300],[300,510]],labelAt:[545,260]},
 {id:'integration',name:'The Integration Descent',family:'balance',kind:'tram',points:[[300,510],[250,740],[245,990]],labelAt:[235,730]},
 {id:'return',name:'The Gentle Return',family:'connection',kind:'rail',points:[[245,990],[520,1010],[790,980],[1110,940]],labelAt:[690,1030]}
];
