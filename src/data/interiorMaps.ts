export type InteriorTheme='tower'|'fireworks'|'magick'|'jhana'|'divine'|'formless'|'healing'|'recall'|'tavern'|'library';
export type InteriorShape='circle'|'rect';
export interface LoreLink {label:string;url:string}
export interface InteriorZone {id:string;name:string;copy:string;x:number;y:number;w:number;h:number;shape:InteriorShape;art:[number,number];artAtlas?:'special'|'legacy'|'states'|'rupa'|'luminous'|'divine'|'settlements';reference?:LoreLink;references?:LoreLink[]}
export interface InteriorNpc {id:string;name:string;copy:string;x:number;y:number;art:[number,number];atlas:'tavern-interior'|'library-interior';wander:number;references?:LoreLink[]}
export interface InteriorObstacle {x:number;y:number;w:number;h:number}
export interface InteriorFloor {id:string;name:string;subtitle:string;width:number;height:number;spawn:[number,number];zones:InteriorZone[];obstacles:InteriorObstacle[];npcs?:InteriorNpc[];environment?:'tavern'|'library'}
export interface InteriorMap {id:string;regionId:string;name:string;theme:InteriorTheme;floors:InteriorFloor[]}

const zone=(id:string,name:string,copy:string,x:number,y:number,art:[number,number],w=230,h=180,shape:InteriorShape='rect'):InteriorZone=>({id,name,copy,x,y,w,h,shape,art});
const specialZone=(id:string,name:string,copy:string,x:number,y:number,art:[number,number],w=260,h=210,shape:InteriorShape='circle'):InteriorZone=>({...zone(id,name,copy,x,y,art,w,h,shape),artAtlas:'special'});
const floor=(id:string,name:string,subtitle:string,zones:InteriorZone[],width=1600,height=1000):InteriorFloor=>({id,name,subtitle,width,height,spawn:[width/2,height-100],zones,obstacles:[{x:70,y:height*.48,w:70,h:210},{x:width-140,y:height*.55,w:70,h:190}]});
const grid=(items:Array<[string,string,string,[number,number]]>,columns:number,startX=230,startY=190,gapX=280,gapY=230)=>items.map(([id,name,copy,art],i)=>zone(id,name,copy,startX+(i%columns)*gapX,startY+Math.floor(i/columns)*gapY,art));
const insightTrail=(items:Array<[string,string,string,[number,number]]>)=>items.map(([id,name,copy,art],i)=>{const row=Math.floor(i/4),column=i%4,x=row%2===0?260+column*360:1340-column*360;return zone(id,name,copy,x,850-row*230,art,210,160,'circle')});

const insightStages:Array<[string,string,string,[number,number]]>=[
 ['mind-body','Mind and Body','The first chamber distinguishes mental events from bodily ones: intention is known as mind, pressure and motion as body. Two gears, one dance—neither requires a tiny operator.',[0,0]],['cause-effect','Cause and Effect','Intentions precede actions; contact conditions feeling; one event tugs another into view. Trace the chain carefully without inventing a first link.',[0,0]],['three-char','The Three Characteristics','Sensations pulse, fail to satisfy when grasped, and arise through conditions rather than command. Impermanence, unsatisfactoriness, and not-self are three runes on the same turning door.',[0,0]],['arising','Arising and Passing Away','Experience may accelerate into crisp vibrations, rapture, confidence, strange synchronicities, and brilliant light. Enjoy the fireworks, but remember: spectacular clarity is a stage, not a crown.',[4,0]],
 ['dissolution','Dissolution','Attention begins noticing endings more readily than beginnings. The bright architecture fades at its vanishing edge, and effort may feel oddly weak or wide.',[1,0]],['fear','Fear','When everything is plainly vanishing, the nervous system may read the lesson as danger. Fear is weather in the tower—not proof that the traveller has found a monster.',[1,0]],['misery','Misery','The cost of leaning on unstable things becomes difficult to ignore. Let the rain teach without turning its lesson into a verdict on your life.',[1,0]],['disgust','Disgust','Old fascinations lose their shine as their repetitive machinery becomes obvious. Disenchantment can open a door; contempt merely paints the room darker.',[1,0]],
 ['deliverance','Desire for Deliverance','A fierce wish to escape the whole contraption appears. Before taking the doorway marked OUT, notice that the wish itself is another conditioned event.',[1,0]],['reobservation','Re-observation','The difficult lessons return together—fast, tangled, and persuasive. Reduce strain, maintain ordinary supports, and learn the pattern rather than trying to win a boss fight.',[1,0]],['equanimity','Equanimity','The floor opens wide enough for pleasant, painful, and neutral events to cross without a quarrel. Balance here is intimate and alert, not numbness.',[3,0]],['conformity','Conformity','Attention aligns with impermanence, unsatisfactoriness, or not-self as tumblers align inside a lock. The old way of organizing experience is nearly exhausted.',[3,0]],
 ['change-lineage','Change of Lineage','One brief threshold turns from the familiar lineage of ordinary perception toward the unconditioned in the traditional map. It is a doorway, not a new costume.',[3,0]],['path','Path','The map describes a single decisive moment that performs the work of breakthrough. It cannot be prolonged or collected; it cuts, then gives way.',[4,0]],['fruition','Fruition','Experience ceases without an object, then the world resumes. Traditions call this contact with nibbāna; careful review matters more than dramatic storytelling.',[4,0]],['review','Review','At the final balcony, examine what led up to the opening, what occurred, and what changed afterward. Honest review keeps a bright event from becoming a counterfeit passport.',[4,0]]
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
   zone('impermanence','Impermanence','Nothing crossing this chamber stays for two heartbeats. Look beneath the idea of change and notice each sight, sound, and sensation arise, alter, and vanish on its own.',300,350,[0,0],300,300),zone('unsatisfactoriness','Unsatisfactoriness','What changes cannot provide a permanent refuge. The thorn is not every pleasant thing—it is the strain added when the hand insists that a turning floor must hold still.',800,210,[1,0],300,300),zone('no-self','No-Self','Intentions and actions occur, yet the throne in the mirror hall remains empty. Events answer conditions; no separate controller can be found outside the process directing it.',1300,350,[2,0],300,300)
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
   ['gold','Molten Gold','Beautiful, brilliant, and a little jealous, Molten Gold does not yield its secrets to a hurried hand. Learn to court it, follow its rhythm, and dance without trying to own it; the golden river may then carry you toward spectacular country—perhaps even the Plastic.',[0,0]],
   ['plastic','The Plastic','A versatile, mercurial substance with no loyalty to a single shape. It may become a ribbon, a beast, a vessel, a landscape—or almost anything the luminous field can imagine—then melt cheerfully into something else.',[1,0]],
   ['tunnels','The Tunnels','These energetic corridors run through the apparent depths of the screen, bending distance as they go. Navigate gently, keep your lantern of attention steady, and wonder: what might be waiting at the far end?', [2,0]],
   ['scales','Scale Sheets','Vast overlapping scales spread across the screen in iridescent sheets, part armour, part sky, and perhaps the sleeping hide of something too large for the map.',[0,1]],
   ['stars','Star Field','The darkness opens into a dimensional field of innumerable stars. Near lights, far lights, and impossible depths make a small traveller feel wonderfully—and usefully—small.',[1,1]],
   ['washes','Colour Washes','Great translucent tides of colour pour across the field. Edges dissolve beneath rose, blue, gold, and green until the whole screen becomes luminous weather.',[2,1]]
  ],3,300,230,500,360).map(item=>({...item,artAtlas:'luminous' as const})),1600,1100)
 ]},
 {id:'magick-world',regionId:'magical',name:'The Magick Proving Grounds',theme:'magick',floors:[
  floor('grounds','The Practice Grounds','A crooked campus where wonder learns its first responsible tricks',[
   zone('summoning','Summoning Circles','Concentrated imagery may arrive with a face, voice, and apparent will of its own. Meet it courteously, set ethical boundaries, and do not confuse vivid personification with automatic authority.',300,620,[0,2],340,260,'circle'),
   zone('astral','Astral Launchpad','A star platform for experiments in imagined travel, shifting viewpoint, and lucid inner space. Record what seems to happen; keep experience, interpretation, and externally verified fact in separate luggage.',820,260,[1,2],320,240),
   zone('divination','Divination Station','Symbols can reveal associations and questions the ordinary mind overlooked. Let them provoke reflection, then test predictions honestly—divination should not receive the keys to judgment.',1390,600,[2,2],320,260)
  ],1700,1050),
  floor('laboratory','The Discernment Laboratory','Every enchantment gets a daylight inspection',[
   zone('testing','Reality-Testing Chamber','Place each marvel on the testing bench. Compare impressions with evidence, trusted companions, and ordinary consequences before declaring a new law of nature.',330,620,[0,3],360,280),
   zone('forge','The Intention Forge','Shape attention toward compassion and useful action. Power without ethics is merely a cursed item with excellent marketing.',840,280,[1,3],360,280,'circle'),
   zone('records','The Wonder Ledger','Write predictions before outcomes arrive. Memory is a mischievous wizard; ink keeps it from quietly improving yesterday’s prophecy.',1380,620,[2,3],360,280)
  ],1750,1050)
 ]},
 {id:'lantern-library-world',regionId:'library',name:'The Lantern Library',theme:'library',floors:[{
  id:'reading-hall',name:'The Three Reading Halls',subtitle:'Practice records arranged beneath warm, wandering lanterns',width:1650,height:1050,spawn:[825,930],environment:'library',
  zones:[
   {...zone('fire-kasina-shelves','Fire Kasina Practice','The flame-lit shelves gather practical accounts of the kasina journey: how to begin, what strange country may appear, and how fellow travellers compare their maps.',330,350,[0,1],330,300),references:[{label:'Fire Kasina',url:'https://firekasina.org/'},{label:'Fire Kasina Discord',url:'https://discord.com/channels/934072734466572308/934072735171231755'}]},
   {...zone('meditation-shelves','Meditation Practice','Here the wider contemplative map is kept: concentration, insight, ethics, awakening models, and the cheerful arguments that prevent any single book from pretending to be the whole library.',825,350,[1,1],330,300),references:[{label:'Mastering the Core Teachings of the Buddha',url:'https://www.mctb.org/'},{label:'Dharma Overground forum',url:'https://www.dharmaoverground.org/'}]},
   {...zone('magick-shelves','Magick','Astrolabes and old grimoires share these shelves with stern notes about discernment. Wonder is welcome here, but every enchantment must surrender its library card to reality-testing.',1320,350,[2,1],330,300),references:[{label:'Keep Silence',url:'https://keepsilence.org/'},{label:'The Hermetic Library',url:'https://hermetic.com/'}]}
  ],obstacles:[{x:130,y:90,w:1390,h:90},{x:185,y:250,w:290,h:170},{x:680,y:250,w:290,h:170},{x:1175,y:250,w:290,h:170}]
 }]},
 {id:'fortification-tavern-world',regionId:'fortification-tavern',name:'The Tavern of Fortification',theme:'tavern',floors:[{
  id:'common-room',name:'The Fortified Common Room',subtitle:'Warm food, sturdy walls, and fellow travellers comparing their maps',width:1650,height:1050,spawn:[825,930],environment:'tavern',
  zones:[zone('hearth','The Fortifying Hearth','The fire is ordinary, the stew is warm, and nobody needs to achieve anything before supper. Rest here before deciding which road deserves your boots.',175,235,[0,0],250,210,'circle')],
  npcs:[
   {id:'innkeeper',name:'Auntie Moss, Innkeeper',copy:'If the landscape becomes too grand, return to the house, garden, library, or tavern. A map is useful only when it helps a traveller come home with better stories and steadier feet.',x:825,y:180,art:[2,2],atlas:'tavern-interior',wander:2},
   {id:'mapmaker',name:'Mara the Mapmaker',copy:'The great map has three broad movements: practice begins near home, the Mists contain unstable encounters, and the Fairy Playground holds destinations shaped by what you learned inside. Roads show affinities, not compulsory sequences.',x:450,y:445,art:[0,2],atlas:'tavern-interior',wander:2},
   {id:'practitioner',name:'Suri of the Small Flame',copy:'Concentration is your travel strength. The Red Dot Range restores it; the Mists spend it. Clarity comes from meeting difficult territory directly, and both qualities are needed to cross into the Fairy Playground.',x:825,y:515,art:[1,2],atlas:'tavern-interior',wander:2},
   {id:'wanderer',name:'Rowan the Returning',copy:'The Mists do not punish retreat. When concentration thins, returning to the Red Dot Range is navigation, not failure. A wise traveller learns the road both ways.',x:1200,y:445,art:[3,2],atlas:'tavern-interior',wander:2}
  ],obstacles:[{x:545,y:145,w:560,h:155},{x:325,y:430,w:250,h:165},{x:700,y:500,w:250,h:170},{x:1075,y:430,w:250,h:165},{x:95,y:155,w:165,h:165},{x:1410,y:660,w:150,h:160}]
 }]},
 {id:'jhana-world',regionId:'jhana',name:'Jhana Range',theme:'jhana',floors:[
  floor('rupa','The Four Rūpa Jhānas','A mountain path where each summit grows quieter',[
   {...zone('j1','First Jhāna','Like a skilled bath attendant kneading sprinkled water through bath powder until the whole ball is saturated yet does not drip: directed attention works rapture and pleasure through the entire body.',250,760,[0,0],300,240),artAtlas:'rupa'},
   {...zone('j2','Second Jhāna','Like a lake with no streams entering it, filled and cooled everywhere by a spring welling from within: thought grows quiet and rapture and pleasure spread effortlessly through unified awareness.',600,560,[1,0],300,240),artAtlas:'rupa'},
   {...zone('j3','Third Jhāna','Like blue, white, and red lotuses born and grown underwater, saturated by still cool water from roots to tips: rapture fades, while mindful equanimity and bodily pleasure remain.',1000,360,[2,0],300,240),artAtlas:'rupa'},
   {...zone('j4','Fourth Jhāna','Like a seated person covered head to foot by a white cloth, with no part left uncovered: pleasure and pain fall quiet, and pure bright awareness pervades the whole body.',1400,170,[3,0],300,240),artAtlas:'rupa'}
  ],1700,1100),
  floor('atypical','The Atypical Passes','Custom absorptions branch through hidden caves',grid([
   ['custom','Custom Jhāna Forge','Absorption can organize around a stable wholesome quality, image, bodily tone, or other coherent theme. Choose the material carefully: whatever enters the forge may colour the whole mountain.',[0,1]],['slam','Slam-Shift Switchback','Advanced practitioners sometimes shift rapidly among jhānic factors or insight stages, comparing their textures directly. Speed is useful only when recognition remains accurate; otherwise every bend receives the same grand name.',[1,1]],['elements','Elemental Caves','Earth may become solidity, water cohesion, fire temperature, air motion; colours and space can also gather into stable terrain. The cave teaches how attention selects and amplifies a theme.',[2,1]],['blends','Blended States','Real absorptions do not always respect tidy borders. Factors can mingle, fade in different orders, or form hybrids—use the four-summit map as a compass, not a fence.',[3,1]]
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
   {...zone('metta','Loving-Kindness Garden','Mettā wishes: may beings be safe, healthy, peaceful, and at ease. Like a lamp shining through an open gate, it offers warmth without demanding affection in return; its near imitation is possessive attachment.',300,300,[0,0],320,280,'circle'),artAtlas:'divine'},
   {...zone('karuna','Compassion Springs','Karuṇā meets suffering with the trembling wish that it be relieved. The spring moves toward the wound and asks what would actually help; grief without steadiness is its near enemy, cruelty its far one.',1300,300,[1,0],320,280,'circle'),artAtlas:'divine'},
   {...zone('mudita','Sympathetic Joy Arcade','Muditā delights in another being’s happiness, virtue, or success as though treasure had appeared for everyone. It is the antidote to envy—not forced cheerfulness when suffering needs compassion.',300,750,[2,0],320,280,'circle'),artAtlas:'divine'},
   {...zone('upekkha','Equanimity Pavilion','Upekkhā keeps the heart balanced while remembering that beings inherit the consequences of their choices. It is spacious care without control, quite different from the near enemy of indifference.',1300,750,[0,1],320,280,'circle'),artAtlas:'divine'},
   {...zone('court','The Celestial Court','Gods and luminous visitors gather in forms shaped by concentration, culture, expectation, and mystery. Offer courtesy without credulity: a splendid throne does not certify its occupant, and discernment belongs in every audience.',800,510,[1,1],360,300),artAtlas:'divine'}
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
const secondScreen=interiorMaps.find(map=>map.regionId==='fireworks')?.floors.find(floor=>floor.id==='screens')?.zones.find(stage=>stage.id==='second');
if(secondScreen)secondScreen.reference={label:'Explore the Second Screen replication',url:'https://visual-static-screen-fk-replication.tiiny.site'};

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
