export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export type RouteFamily='generation'|'deconstruction'|'balance'|'connection';
export interface Route {id:string;name:string;family:RouteFamily;kind:RouteKind;points:[number,number][];labelAt:[number,number];}

export const routes:Route[]=[
 {id:'kindling',name:'The Kindling Road',family:'generation',kind:'tram',points:[[500,570],[380,330],[175,120]],labelAt:[340,285]},
 {id:'artificer',name:"The Artificer's Causeway",family:'generation',kind:'bridge',points:[[175,120],[400,55],[650,95]],labelAt:[400,48]},
 {id:'ascent',name:'The Luminous Ascent',family:'generation',kind:'rail',points:[[650,95],[1040,95],[1415,155]],labelAt:[835,48]},
 {id:'unmaking',name:'The Unmaking Way',family:'deconstruction',kind:'tunnel',points:[[870,625],[1000,630],[1120,565],[1040,700],[940,760],[650,860],[430,940]],labelAt:[1080,735]},
 {id:'vanishing',name:'The Vanishing Road',family:'deconstruction',kind:'bridge',points:[[430,940],[930,1010],[1480,970]],labelAt:[950,970]},
 {id:'middle',name:"The Wayfarer's Middle Path",family:'balance',kind:'tram',points:[[175,620],[330,700],[560,710],[700,630],[800,550]],labelAt:[450,730]},
 {id:'clarity',name:'Clarity Ridge',family:'connection',kind:'bridge',points:[[175,120],[120,350],[175,620]],labelAt:[105,360]},
 {id:'reality',name:'The Reality-Testing Road',family:'connection',kind:'rail',points:[[650,95],[400,350],[175,620]],labelAt:[475,245]},
 {id:'integration',name:'The Integration Crossing',family:'balance',kind:'tram',points:[[175,620],[300,420],[650,340],[900,310],[1080,250],[1040,95]],labelAt:[690,300]},
 {id:'mending',name:'The Mending Way',family:'balance',kind:'tram',points:[[1120,565],[1080,250],[1040,95]],labelAt:[1150,420]},
 {id:'healers-light',name:"The Healer's Light",family:'connection',kind:'bridge',points:[[650,95],[1040,95],[1415,155]],labelAt:[1215,55]},
 {id:'siddhi',name:'The Siddhi Pass',family:'connection',kind:'rail',points:[[430,940],[260,800],[175,620],[300,420],[470,260],[650,95]],labelAt:[330,455]},
 {id:'contemplative',name:'The Contemplative Loop',family:'connection',kind:'rail',points:[[430,940],[250,800],[175,620]],labelAt:[265,820]},
 {id:'return',name:'The Gentle Return',family:'connection',kind:'rail',points:[[1040,95],[1080,250],[1120,565],[760,790],[430,940]],labelAt:[820,760]}
];
