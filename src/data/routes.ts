export type RouteKind='rail'|'tram'|'tunnel'|'bridge';
export type RouteFamily='generation'|'deconstruction'|'balance'|'connection';
export interface Route {id:string;name:string;family:RouteFamily;kind:RouteKind;points:[number,number][];labelAt:[number,number];}

export const routes:Route[]=[
 {id:'kindling',name:'The Kindling Road',family:'generation',kind:'tram',points:[[500,570],[420,360],[280,115]],labelAt:[405,270]},
 {id:'artificer',name:"The Artificer's Causeway",family:'generation',kind:'bridge',points:[[280,115],[500,65],[765,105]],labelAt:[510,55]},
 {id:'ascent',name:'The Luminous Ascent',family:'generation',kind:'rail',points:[[765,105],[1000,60],[1260,115]],labelAt:[1000,50]},
 {id:'unmaking',name:'The Unmaking Way',family:'deconstruction',kind:'tunnel',points:[[800,550],[1080,570],[940,760],[1110,940]],labelAt:[1040,675]},
 {id:'vanishing',name:'The Vanishing Road',family:'deconstruction',kind:'bridge',points:[[1110,940],[1290,955],[1480,970]],labelAt:[1310,915]},
 {id:'middle',name:"The Wayfarer's Middle Path",family:'balance',kind:'tram',points:[[300,510],[500,570],[800,550]],labelAt:[565,615]},
 {id:'clarity',name:'Clarity Ridge',family:'connection',kind:'bridge',points:[[280,115],[250,300],[300,510]],labelAt:[210,285]},
 {id:'reality',name:'The Reality-Testing Road',family:'connection',kind:'rail',points:[[765,105],[575,300],[300,510]],labelAt:[555,235]},
 {id:'integration',name:'The Integration Crossing',family:'balance',kind:'tram',points:[[300,510],[560,430],[800,400],[1080,320]],labelAt:[690,365]},
 {id:'mending',name:'The Mending Way',family:'balance',kind:'tram',points:[[1080,570],[1080,320]],labelAt:[1145,455]},
 {id:'healers-light',name:"The Healer's Light",family:'connection',kind:'bridge',points:[[765,105],[920,190],[1080,320],[1260,115]],labelAt:[960,260]},
 {id:'siddhi',name:'The Siddhi Pass',family:'connection',kind:'rail',points:[[1110,940],[1320,720],[1250,500],[1080,320],[765,105]],labelAt:[1300,610]},
 {id:'contemplative',name:'The Contemplative Loop',family:'connection',kind:'rail',points:[[1110,940],[800,930],[520,760],[300,510]],labelAt:[720,845]},
 {id:'return',name:'The Gentle Return',family:'connection',kind:'rail',points:[[1080,320],[1160,560],[1110,940]],labelAt:[1190,760]}
];
