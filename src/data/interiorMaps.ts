export type InteriorTheme='tower'|'fireworks'|'magick'|'jhana'|'divine'|'formless';
export type InteriorShape='circle'|'rect';
export interface InteriorZone {id:string;name:string;copy:string;x:number;y:number;w:number;h:number;shape:InteriorShape;art:[number,number]}
export interface InteriorObstacle {x:number;y:number;w:number;h:number}
export interface InteriorFloor {id:string;name:string;subtitle:string;width:number;height:number;spawn:[number,number];zones:InteriorZone[];obstacles:InteriorObstacle[]}
export interface InteriorMap {id:string;regionId:string;name:string;theme:InteriorTheme;floors:InteriorFloor[]}

const zone=(id:string,name:string,copy:string,x:number,y:number,art:[number,number],w=230,h=180,shape:InteriorShape='rect'):InteriorZone=>({id,name,copy,x,y,w,h,shape,art});
const floor=(id:string,name:string,subtitle:string,zones:InteriorZone[],width=1600,height=1000):InteriorFloor=>({id,name,subtitle,width,height,spawn:[width/2,height-100],zones,obstacles:[{x:70,y:height*.48,w:70,h:210},{x:width-140,y:height*.55,w:70,h:190}]});
const grid=(items:Array<[string,string,string,[number,number]]>,columns:number,startX=230,startY=190,gapX=280,gapY=230)=>items.map(([id,name,copy,art],i)=>zone(id,name,copy,startX+(i%columns)*gapX,startY+Math.floor(i/columns)*gapY,art));
const insightTrail=(items:Array<[string,string,string,[number,number]]>)=>items.map(([id,name,copy,art],i)=>{const row=Math.floor(i/4),column=i%4,x=row%2===0?260+column*360:1340-column*360;return zone(id,name,copy,x,850-row*230,art,210,160,'circle')});

const insightStages:Array<[string,string,string,[number,number]]>=[
 ['mind-body','Mind and Body','Knowing and what is known separate into a curious pair.',[0,0]],['cause-effect','Cause and Effect','Conditions tug conditions like gears behind a wall.',[0,0]],['three-char','The Three Characteristics','Every sensation flashes the three old runes.',[0,0]],['arising','Arising and Passing Away','The tower erupts in speed, clarity, rapture, and light.',[4,0]],
 ['dissolution','Dissolution','The bright architecture breaks apart at its vanishing edge.',[1,0]],['fear','Fear','When everything dissolves, the floor suddenly feels less certain.',[1,0]],['misery','Misery','The cost of clinging echoes through a rain-soaked chamber.',[1,0]],['disgust','Disgust','The old toys lose their shine; the traveller longs to leave.',[1,0]],
 ['deliverance','Desire for Deliverance','A narrow doorway appears, marked simply: OUT.',[1,0]],['reobservation','Re-observation','All the difficult rooms return together. Keep walking gently.',[1,0]],['equanimity','Equanimity','The floor opens wide; phenomena come and go without a quarrel.',[3,0]],['conformity','Conformity','Attention aligns with the path like tumblers in a lock.',[3,0]],
 ['change-lineage','Change of Lineage','One last threshold separates the familiar from the uncharted.',[3,0]],['path','Path','A single decisive step cuts through the old circuit.',[4,0]],['fruition','Fruition','The map blanks for a moment; afterward, the world resumes.',[4,0]],['review','Review','At the final balcony, retrace what happened without decorating it.',[4,0]]
];

export const interiorMaps:InteriorMap[]=[
 {id:'insight-tower-world',regionId:'tower',name:'The Tower of Insight',theme:'tower',floors:[
  floor('characteristics','Floor I · The Three Characteristics','Three separate wings share one changing foundation',[
   zone('impermanence','Impermanence','Nothing crossing this chamber stays for two heartbeats.',300,350,[0,0],300,300),zone('unsatisfactoriness','Unsatisfactoriness','Every attempt to hold the turning floor adds another thorn.',800,210,[1,0],300,300),zone('no-self','No-Self','Actions occur, yet the throne in the hollow hall remains empty.',1300,350,[2,0],300,300)
  ]),
  floor('progress','Floor II · The Progress of Insight','Sixteen chambers wind from first distinctions through review',insightTrail(insightStages),1600,1080),
  floor('awakening','Floor III · The Stages of Awakening','Four gates from the traditional Theravāda path model',grid([
   ['stream','Stream Entry','The first gate: the path becomes directly known.',[2,0]],['once','Once-Returning','The second gate: reactivity is substantially weakened.',[2,0]],['nonreturn','Non-Returning','The third gate: traditional models describe further release.',[2,0]],['arahant','Arahantship','The fourth gate: the model’s highest claim, approached with humility.',[2,0]]
  ],4,230,350,380,0),1800,900)
 ]},
 {id:'fireworks-world',regionId:'fireworks',name:'Fireworks Peak',theme:'fireworks',floors:[
  floor('screens','The Four Screens','A volcanic climb through increasingly responsive inner skies',grid([
   ['first','First Screen','The dot itself: small, central, non-pixelated, fast-moving, and bound closely to attention.',[0,1]],['second','Second Screen','A wide curved field begins as the Murk, then slowly develops pixelated patterns, drawings, symmetry, and complex structures.',[1,1]],['third','Third Screen','Brief openings reveal volumetric, photorealistic faces, landscapes, scenes, and mysterious realms.',[2,1]],['fourth','Fourth Screen','The image becomes an immersive hyper-real world: no longer something watched, but a realm the traveller inhabits.',[3,1]]
  ],2,450,230,700,390),1800,1200),
  floor('materials','Luminous Materials','Phenomena gather into impossible substances',grid([
   ['gold','Molten Gold','Golden radiance pours through dark stone channels.',[4,1]],['plastic','The Plastic','Smooth luminous sheets fold and flex.',[0,2]],['tunnels','Tunnels','Spirals create corridors of apparent depth.',[1,2]],['scales','Scale Sheets','Overlapping plates tile the living sky.',[2,2]],['stars','Star Field','Pinpricks of brilliance open an immense night.',[3,2]],['washes','Colour Washes','Tides of colour replace object and edge.',[4,2]]
  ],3,300,230,500,360),1600,1100)
 ]},
 {id:'magick-world',regionId:'magical',name:'The Magick Proving Grounds',theme:'magick',floors:[
  floor('grounds','The Practice Grounds','A crooked campus where wonder must pass inspection',[
   zone('summoning','Summoning Circles','Meet personified imagery without granting it automatic authority.',300,260,[0,3],340,260,'circle'),zone('astral','Astral Launchpad','A star platform for experiments in imagined travel.',820,180,[1,3],300,220),zone('divination','Divination Station','Symbols invite reflection, never surrender of judgment.',1330,300,[2,3],300,250),zone('testing','Reality-Testing Chamber','Bring every marvel here before taking it into the world.',1050,700,[3,3],360,240),zone('forge','Intention Forge','Shape attention toward compassion and useful action.',480,720,[4,3],340,230)
  ],1700,1050)
 ]},
 {id:'jhana-world',regionId:'jhana',name:'Jhana Range',theme:'jhana',floors:[
  floor('rupa','The Four Rūpa Jhānas','A mountain path where each summit grows quieter',[
   zone('j1','First Jhāna','Applied attention, rapture, happiness, and unification.',250,760,[0,4],280,220),zone('j2','Second Jhāna','Attention steadies; rapture and happiness remain.',600,560,[1,4],280,220),zone('j3','Third Jhāna','Rapture quiets into happiness and equanimity.',1000,360,[2,4],280,220),zone('j4','Fourth Jhāna','Deep equanimity and lucid stillness crown the range.',1400,170,[3,4],280,220)
  ],1700,1100),
  floor('atypical','The Atypical Passes','Custom absorptions branch through hidden caves',grid([
   ['custom','Custom Jhāna Forge','Build absorption around a wholesome stable quality.',[4,4]],['slam','Slam-Shift Switchback','Shift rapidly between insight stages and jhānic factors.',[4,4]],['elements','Elemental Caves','Earth, water, fire, air, colour, and space shape the terrain.',[4,4]],['blends','Blended States','Factors mingle in ways the neat mountain map cannot show.',[4,4]]
  ],2,430,260,700,400),1800,1150)
 ]},
 {id:'divine-world',regionId:'celestial',name:'The Divine Abodes',theme:'divine',floors:[
  floor('brahmaviharas','The Four Immeasurables','Four gardens make a celestial compass',[
   zone('metta','Loving-Kindness Garden','May beings be well: warmth radiates without demand.',300,300,[3,3],320,280,'circle'),zone('karuna','Compassion Springs','Suffering is met by the wish to help.',1300,300,[3,3],320,280,'circle'),zone('mudita','Sympathetic Joy Arcade','Another being’s good fortune becomes shared treasure.',300,750,[4,3],320,280,'circle'),zone('upekkha','Equanimity Pavilion','Care remains steady while beings inherit their choices.',1300,750,[4,3],320,280,'circle'),zone('court','The Celestial Court','Gods and luminous visitors gather; courtesy and discernment share the throne.',800,510,[4,3],360,300)
  ],1600,1100)
 ]},
 {id:'formless-world',regionId:'formless',name:'The Formless Beyond',theme:'formless',floors:[
  floor('arupa','The Formless Beyond','Four vast territories dissolve the ordinary edges of the map',[
   zone('space','Infinite Space','Boundaries fall away into immeasurable openness.',260,540,[2,4],360,360,'circle'),zone('consciousness','Infinite Consciousness','Knowing itself seems boundless and luminous.',720,300,[3,4],360,360,'circle'),zone('nothingness','Nothingness','The absence of things becomes the whole strange territory.',1180,540,[4,4],360,360,'circle'),zone('neither','Neither Perception nor Non-Perception','At the far edge, even the question of perceiving becomes too coarse.',1500,260,[4,4],320,320,'circle')
  ],1800,1050)
 ]}
];

export const getInteriorMap=(regionId:string)=>interiorMaps.find(map=>map.regionId===regionId);
