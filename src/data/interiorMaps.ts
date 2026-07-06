export type InteriorTheme='tower'|'fireworks'|'magick'|'jhana'|'divine'|'formless'|'healing'|'recall';
export type InteriorShape='circle'|'rect';
export interface InteriorZone {id:string;name:string;copy:string;x:number;y:number;w:number;h:number;shape:InteriorShape;art:[number,number];artAtlas?:'special'|'legacy'|'states'}
export interface InteriorObstacle {x:number;y:number;w:number;h:number}
export interface InteriorFloor {id:string;name:string;subtitle:string;width:number;height:number;spawn:[number,number];zones:InteriorZone[];obstacles:InteriorObstacle[]}
export interface InteriorMap {id:string;regionId:string;name:string;theme:InteriorTheme;floors:InteriorFloor[]}

const zone=(id:string,name:string,copy:string,x:number,y:number,art:[number,number],w=230,h=180,shape:InteriorShape='rect'):InteriorZone=>({id,name,copy,x,y,w,h,shape,art});
const specialZone=(id:string,name:string,copy:string,x:number,y:number,art:[number,number],w=260,h=210,shape:InteriorShape='circle'):InteriorZone=>({...zone(id,name,copy,x,y,art,w,h,shape),artAtlas:'special'});
const floor=(id:string,name:string,subtitle:string,zones:InteriorZone[],width=1600,height=1000):InteriorFloor=>({id,name,subtitle,width,height,spawn:[width/2,height-100],zones,obstacles:[{x:70,y:height*.48,w:70,h:210},{x:width-140,y:height*.55,w:70,h:190}]});
const grid=(items:Array<[string,string,string,[number,number]]>,columns:number,startX=230,startY=190,gapX=280,gapY=230)=>items.map(([id,name,copy,art],i)=>zone(id,name,copy,startX+(i%columns)*gapX,startY+Math.floor(i/columns)*gapY,art));
const insightTrail=(items:Array<[string,string,string,[number,number]]>)=>items.map(([id,name,copy,art],i)=>{const row=Math.floor(i/4),column=i%4,x=row%2===0?260+column*360:1340-column*360;return zone(id,name,copy,x,850-row*230,art,210,160,'circle')});

const insightStages:Array<[string,string,string,[number,number]]>=[
 ['mind-body','Mind and Body','Knowing and what is known separate into a curious pair.',[0,0]],['cause-effect','Cause and Effect','Conditions tug conditions like gears behind a wall.',[0,0]],['three-char','The Three Characteristics','Every sensation flashes the three old runes.',[0,0]],['arising','Arising and Passing Away','The tower erupts in speed, clarity, rapture, and light.',[4,0]],
 ['dissolution','Dissolution','The bright architecture breaks apart at its vanishing edge.',[1,0]],['fear','Fear','When everything dissolves, the floor suddenly feels less certain.',[1,0]],['misery','Misery','The cost of clinging echoes through a rain-soaked chamber.',[1,0]],['disgust','Disgust','The old toys lose their shine; the traveller longs to leave.',[1,0]],
 ['deliverance','Desire for Deliverance','A narrow doorway appears, marked simply: OUT.',[1,0]],['reobservation','Re-observation','All the difficult rooms return together. Keep walking gently.',[1,0]],['equanimity','Equanimity','The floor opens wide; phenomena come and go without a quarrel.',[3,0]],['conformity','Conformity','Attention aligns with the path like tumblers in a lock.',[3,0]],
 ['change-lineage','Change of Lineage','One last threshold separates the familiar from the uncharted.',[3,0]],['path','Path','A single decisive step cuts through the old circuit.',[4,0]],['fruition','Fruition','The map blanks for a moment; afterward, the world resumes.',[4,0]],['review','Review','At the final balcony, retrace what happened without decorating it.',[4,0]]
];

const lifeRecallMap:InteriorMap={id:'life-recall-world',regionId:'life-recall',name:'Life Recall Lane',theme:'recall',floors:[
 floor('memory-lane','The Three Turns of Memory Lane','A half-misty road where memory becomes unusually bright—and asks what you will do with it',[
  {...zone('life-review','Life Review','Memories arrive without knocking: a school corridor, a forgotten kindness, the exact light in an old kitchen. Look clearly, but do not demand that every vivid visitor be a perfect recording.',320,650,[1,0],330,270,'circle'),artAtlas:'states'},
  {...zone('integration-work','Integration Work','Concentration steadies the lamp while reactivity lowers its voice. Sort the useful threads, make amends where appropriate, and put the old boxes somewhere they no longer block the stairs.',820,310,[2,0],360,290),artAtlas:'states'},
  {...zone('past-life-tour','Past Life Tour','The lane wanders beyond the sign marked BIRTH. Traditions call these past-life memories; the wise traveler carries curiosity, uncertainty, and no need to turn every costume into a passport.',1380,620,[3,0],350,280,'circle'),artAtlas:'states'}
 ],1750,1050)
]};

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
  floor('grounds','The Practice Grounds','A crooked campus where wonder learns its first responsible tricks',[
   zone('summoning','Summoning Circles','Meet personified imagery without granting it automatic authority.',300,620,[0,3],340,260,'circle'),
   zone('astral','Astral Launchpad','A star platform for experiments in imagined travel.',820,260,[1,3],320,240),
   zone('divination','Divination Station','Symbols invite reflection, never surrender of judgment.',1390,600,[2,3],320,260)
  ],1700,1050),
  floor('laboratory','The Discernment Laboratory','Every enchantment gets a daylight inspection',[
   zone('testing','Reality-Testing Chamber','Place each marvel on the testing bench. Compare impressions with evidence, trusted companions, and ordinary consequences before declaring a new law of nature.',330,620,[3,3],360,280),
   zone('forge','The Intention Forge','Shape attention toward compassion and useful action. Power without ethics is merely a cursed item with excellent marketing.',840,280,[4,3],360,280,'circle'),
   zone('records','The Wonder Ledger','Write predictions before outcomes arrive. Memory is a mischievous wizard; ink keeps it from quietly improving yesterday’s prophecy.',1380,620,[2,3],360,280)
  ],1750,1050)
 ]},
 {id:'jhana-world',regionId:'jhana',name:'Jhana Range',theme:'jhana',floors:[
  floor('rupa','The Four Rūpa Jhānas','A mountain path where each summit grows quieter',[
   {...zone('j1','First Jhāna','Applied attention, rapture, happiness, and unification.',250,760,[0,4],280,220),artAtlas:'legacy'},
   {...zone('j2','Second Jhāna','Attention steadies; rapture and happiness remain.',600,560,[1,4],280,220),artAtlas:'legacy'},
   {...zone('j3','Third Jhāna','Rapture quiets into happiness and equanimity.',1000,360,[2,4],280,220),artAtlas:'legacy'},
   {...zone('j4','Fourth Jhāna','Deep equanimity and lucid stillness crown the range.',1400,170,[3,4],280,220),artAtlas:'legacy'}
  ],1700,1100),
  floor('atypical','The Atypical Passes','Custom absorptions branch through hidden caves',grid([
   ['custom','Custom Jhāna Forge','Build absorption around a wholesome stable quality.',[0,1]],['slam','Slam-Shift Switchback','Shift rapidly between insight stages and jhānic factors.',[1,1]],['elements','Elemental Caves','Earth, water, fire, air, colour, and space shape the terrain.',[2,1]],['blends','Blended States','Factors mingle in ways the neat mountain map cannot show.',[3,1]]
  ],2,430,260,700,400).map(item=>({...item,artAtlas:'special' as const})),1800,1150)
 ]},
 {id:'healing-world',regionId:'healing',name:'The Healing Meadows',theme:'healing',floors:[
  floor('healing-arts','The Four Healing Gardens','Care for yourself, then learn how care may move through relationship and practice',[
   specialZone('self-healing','Self Healing','A quiet garden for rest, grounding, self-compassion, and the patient repair of one’s own body and mind.',300,650,[0,0],300,260),
   specialZone('energy-healing','Energy Healing','Explore healing framed through attention, touch, breath, subtle sensation, and energetic imagery—while keeping consent and discernment close.',650,330,[1,0],310,260),
   specialZone('channeled-healing','Channeled Healing','A luminous shrine for practices understood as receiving or transmitting help beyond the ordinary self. Test claims gently and never abandon practical care.',1050,330,[2,0],310,260),
   specialZone('intuitive-healing','Intuitive Healing','Listen for quiet pattern-recognition in body, image, relationship, and circumstance; then check intuition against evidence, ethics, and the person before you.',1400,650,[3,0],300,260)
  ],1700,1050)
 ]},
 lifeRecallMap,
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

const awakeningStateData:Record<string,{art:[number,number];copy:string}>={
 stream:{art:[0,1],copy:'Three old chains break at the river gate: personality belief, skeptical doubt, and dependence on rites as ends in themselves. The current is entered; the whole journey is not finished.'},
 once:{art:[1,1],copy:'The road circles the world once more. Attraction and aversion have lost much of their pull, though the traveller still has integration work and ordinary life to live.'},
 nonreturn:{art:[2,1],copy:'The one-way lotus gate marks the traditional claim that sense-desire and ill will no longer bind the traveller. Keep humility beside every map.'},
 arahant:{art:[3,1],copy:'The center-knot is pictured as fully untied and the remaining fetters released. The wheel is open, not a superhero badge; life, ethics, growth, and laundry continue.'}
};
const formlessStateData:Record<string,{art:[number,number];copy:string}>={
 space:{art:[0,2],copy:'The borders fall outward until no edge answers back. Space itself—not the stars within it—becomes the immeasurable theme.'},
 consciousness:{art:[1,2],copy:'Attention notices that the knowing of boundless space also seems boundless: a luminous field recognizing no shore.'},
 nothingness:{art:[2,2],copy:'Even the vast field is released. “There is nothing” becomes the quiet, peculiar territory—not a gloomy hole, but absence foregrounded.'},
 neither:{art:[3,2],copy:'Perception grows too subtle to call present and too present to call absent. The final threshold declines to explain itself.'}
};
for(const map of interiorMaps)for(const stage of map.floors.flatMap(item=>item.zones)){
 const data=awakeningStateData[stage.id]??formlessStateData[stage.id];
 if(data){stage.art=data.art;stage.copy=data.copy;stage.artAtlas='states'}
}

export const getInteriorMap=(regionId:string)=>interiorMaps.find(map=>map.regionId===regionId);
