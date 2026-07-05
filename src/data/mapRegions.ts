export type TerrainType = 'home'|'garden'|'range'|'mist'|'lagoon'|'tunnel'|'peak'|'tower'|'hills'|'void'|'meadow'|'celestial'|'magical';
export type RegionShape={kind:'circle';radius:number}|{kind:'polygon';points:[number,number][]};
export interface Region { id:string; name:string; x:number; y:number; shape:RegionShape; terrain:TerrainType; layer:number; }
export const WORLD={width:1600,height:1100};
export const mapRegions:Region[]=[
 {id:'mist',name:'The Mists of Purification',x:800,y:560,shape:{kind:'polygon',points:[[-520,-280],[-360,-410],[-80,-450],[220,-400],[440,-250],[500,20],[400,290],[120,410],[-190,400],[-430,280],[-520,60]]},terrain:'mist',layer:1},
 {id:'fireworks',name:'Fireworks Peak',x:245,y:105,shape:{kind:'circle',radius:115},terrain:'peak',layer:2},
 {id:'tower',name:'The Tower of Insight',x:650,y:90,shape:{kind:'circle',radius:105},terrain:'tower',layer:2},
 {id:'celestial',name:'The Divine Abodes',x:1120,y:95,shape:{kind:'circle',radius:135},terrain:'celestial',layer:2},
 {id:'magical',name:'The Magical Range',x:1470,y:500,shape:{kind:'circle',radius:125},terrain:'magical',layer:2},
 {id:'healing',name:'The Healing Meadows',x:245,y:990,shape:{kind:'circle',radius:135},terrain:'meadow',layer:2},
 {id:'jhana',name:'Jhana Range',x:1110,y:940,shape:{kind:'circle',radius:145},terrain:'hills',layer:2},
 {id:'formless',name:'The Formless Beyond',x:1480,y:970,shape:{kind:'circle',radius:145},terrain:'void',layer:2},
 {id:'trauma',name:'The Trauma Tunnels',x:1080,y:570,shape:{kind:'circle',radius:125},terrain:'tunnel',layer:3},
 {id:'booboo',name:'Boohoo Lagoon',x:650,y:790,shape:{kind:'circle',radius:145},terrain:'lagoon',layer:3},
 {id:'garden',name:'The Garden',x:800,y:550,shape:{kind:'circle',radius:155},terrain:'garden',layer:4},
 {id:'red-dot',name:'Red Dot Range',x:920,y:510,shape:{kind:'circle',radius:65},terrain:'range',layer:5},
 {id:'house',name:'Your House',x:800,y:550,shape:{kind:'circle',radius:45},terrain:'home',layer:6},
];
