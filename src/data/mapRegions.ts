export type TerrainType = 'home'|'garden'|'range'|'mist'|'lagoon'|'tunnel'|'peak'|'tower'|'hills'|'void'|'meadow'|'celestial'|'magical';
export type RegionShape={kind:'circle';radius:number}|{kind:'polygon';points:[number,number][]};
export interface Region { id:string; name:string; x:number; y:number; shape:RegionShape; terrain:TerrainType; }
export const WORLD={width:1600,height:1100};
export const mapRegions:Region[]=[
 {id:'formless',name:'The Formless Beyond',x:70,y:110,shape:{kind:'circle',radius:150},terrain:'void'},
 {id:'fireworks',name:'Fireworks Peak',x:390,y:120,shape:{kind:'circle',radius:120},terrain:'peak'},
 {id:'tower',name:'The Tower of Insight',x:795,y:110,shape:{kind:'circle',radius:110},terrain:'tower'},
 {id:'celestial',name:'The Divine Abodes',x:1250,y:120,shape:{kind:'circle',radius:150},terrain:'celestial'},
 {id:'mist',name:'The Mists of Purification',x:460,y:430,shape:{kind:'circle',radius:180},terrain:'mist'},
 {id:'house',name:'Your House',x:800,y:550,shape:{kind:'circle',radius:45},terrain:'home'},
 {id:'garden',name:'The Garden',x:800,y:550,shape:{kind:'circle',radius:150},terrain:'garden'},
 {id:'red-dot',name:'Red Dot Range',x:915,y:510,shape:{kind:'circle',radius:65},terrain:'range'},
 {id:'trauma',name:'The Trauma Tunnels',x:1140,y:520,shape:{kind:'circle',radius:150},terrain:'tunnel'},
 {id:'booboo',name:'Boohoo Lagoon',x:650,y:820,shape:{kind:'circle',radius:170},terrain:'lagoon'},
 {id:'healing',name:'The Healing Meadows',x:230,y:900,shape:{kind:'circle',radius:150},terrain:'meadow'},
 {id:'jhana',name:'Jhana Range',x:1050,y:900,shape:{kind:'circle',radius:145},terrain:'hills'},
 {id:'magical',name:'The Magical Range',x:1450,y:870,shape:{kind:'circle',radius:140},terrain:'magical'},
];
