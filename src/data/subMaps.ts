export type AtlasCell=readonly [number,number];
export interface SubMapRoom {id:string;name:string;copy:string;art:AtlasCell;reference?:{label:string;url:string}}
export interface SubMapLevel {id:string;name:string;subtitle:string;rooms:SubMapRoom[]}
export interface SubMapDefinition {id:string;regionId:string;name:string;kicker:string;levels:SubMapLevel[]}

const mctb='https://www.mctb.org/mctb2/table-of-contents/';
const glossary='https://firekasina.org/glossary/';
const room=(id:string,name:string,copy:string,art:AtlasCell,reference?:SubMapRoom['reference']):SubMapRoom=>({id,name,copy,art,reference});

export const subMaps:SubMapDefinition[]=[
 {id:'insight-tower',regionId:'tower',name:'The Tower of Insight',kicker:'A THREE-STOREY DUNGEON OF CLEAR SEEING',levels:[
  {id:'characteristics',name:'I · The Three Characteristics',subtitle:'Three keys open every changing door.',rooms:[
   room('impermanence','Impermanence','Watch closely: every spark, thought, and watcher flickers out before it can be kept.',[0,0]),
   room('unsatisfactoriness','Unsatisfactoriness','What cannot stay cannot finally satisfy. Notice the subtle strain in trying to hold the turning wheel.',[3,0]),
   room('no-self','No-Self','Events happen according to conditions, but no little monarch can be found commanding them.',[4,0],{label:'MCTB · Three Characteristics',url:`${mctb}part-i-the-fundamentals/5-the-three-characteristics/`})]},
  {id:'progress',name:'II · The Progress of Insight',subtitle:'A spiral staircase; not every landing feels heroic.',rooms:[
   room('opening','Mind & Body → Arising & Passing','Separate the knowing from the known, trace cause and effect, then meet the dazzling rush of arising and passing.',[1,0]),
   room('dukkha','Dissolution → Re-observation','When the fireworks fade, fear, misery, disgust, desire for deliverance, and re-observation patrol the dark corridor.',[3,0]),
   room('equanimity','Equanimity → Fruition','Balance widens. Conformity, change of lineage, path, fruition, and review complete the circuit—without making it a race.',[1,0],{label:'MCTB · Progress of Insight',url:`${mctb}part-iv-insight/30-the-progress-of-insight/`})]},
  {id:'awakening',name:'III · The Stages of Awakening',subtitle:'Four gates; maps are useful, claims require care.',rooms:[
   room('stream','Stream Entry','The first gate marks a decisive shift in understanding. The road is known directly, not merely believed.',[2,0]),
   room('returning','Once & Non-Returning','Later gates describe progressively transformed reactivity. Walk humbly; models differ and honest assessment matters.',[3,0]),
   room('arahant','Arahantship','The highest gate in the Theravāda four-path model. The game leaves its meaning open for careful practice and inquiry.',[2,0],{label:'MCTB · Four Path Model',url:`${mctb}part-v-awakening/37-models-of-the-stages-of-awakening/the-theravada-four-path-model/`})]}
 ]},
 {id:'fireworks-interior',regionId:'fireworks',name:'Fireworks Peak',kicker:'THE CHANGING SKIES OF THE FIRE KASINA',levels:[
  {id:'screens',name:'I · The Four Screens',subtitle:'A field guide, not a compulsory sequence.',rooms:[
   room('first','The First Screen','The outer image and its immediate afterimage: simple colour, contrast, and attention begin the climb.',[0,1]),
   room('second','The Second Screen','The red dot and its companions become unstable, vivid, and increasingly responsive.',[1,1]),
   room('third','The Third Screen','The murk comes alive with complex colour, geometry, imagery, and motion.',[2,1]),
   room('fourth','The Fourth Screen','A spacious, lucid field where attention and imagery may behave with astonishing clarity.',[3,1],{label:'Fire Kasina Glossary',url:glossary})]},
  {id:'materials',name:'II · Luminous Materials',subtitle:'Strange substances found above the cloud line.',rooms:[
   room('gold','Molten Gold','A rich, flowing golden texture—bright treasure poured across the inner sky.',[4,1]),
   room('plastic','The Plastic','Smooth, synthetic-looking sheets and surfaces that fold, flex, and transform.',[0,2]),
   room('starfield','The Star Field','Points of light gather into a vast night canopy. Enjoy the view; keep exploring.',[3,2]),
   room('washes','Colour Washes','Broad tides of colour flood the field, replacing objects with luminous weather.',[4,2],{label:'Fire Kasina Glossary',url:glossary})]},
  {id:'structures',name:'III · Structures in the Murk',subtitle:'When the darkness starts building architecture.',rooms:[
   room('tunnels','The Tunnels','Spirals and passages pull attention inward through apparent depth.',[1,2]),
   room('scales','Scale Sheets','Overlapping luminous plates tile the field like the hide of an impossible sky-serpent.',[2,2]),
   room('spirals','Spirograph Galleries','Repeating curves weave mechanical flowers and rotating gates.',[1,2],{label:'Fire Kasina Glossary',url:glossary})]}
 ]},
 {id:'magick-grounds',regionId:'magical',name:'The Magick Proving Grounds',kicker:'WONDER ENTERS; REALITY-TESTING LEAVES',levels:[
  {id:'practice-yard',name:'I · The Practice Yard',subtitle:'Train intention with ethics and both feet on the ground.',rooms:[
   room('circles','The Summoning Circles','A warded yard for exploring personified imagery, ritual, and attention without confusing appearance with authority.',[0,3]),
   room('astral','Astral Launchpad','A star-marked platform for experiments in imagined travel, perspective, and lucid inner space.',[1,3]),
   room('divination','Divination Station','Cards, symbols, and patterns invite reflection—not surrender of judgment.',[2,3])]},
  {id:'laboratory',name:'II · The Discernment Laboratory',subtitle:'Every enchantment gets a daylight inspection.',rooms:[
   room('testing','Reality-Testing Chamber','Compare impressions with evidence, trusted companions, and ordinary consequences.',[3,3]),
   room('forge','The Intention Forge','Shape attention toward compassion and useful action. Power without ethics is a cursed item.',[4,3]),
   room('records','The Wonder Ledger','Record predictions before outcomes. Memory is a mischievous wizard; written notes keep it honest.',[2,3]) ]}
 ]},
 {id:'jhana-interior',regionId:'jhana',name:'Jhana Range',kicker:'THE FOUR FORMED SUMMITS AND THEIR HIDDEN TRAILS',levels:[
  {id:'rupa',name:'I · The Four Rūpa Jhānas',subtitle:'Four increasingly still mountain shelters.',rooms:[
   room('first-jhana','First Jhāna','Applied and sustained attention gathers with rapture, happiness, and unification.',[0,4]),
   room('second-jhana','Second Jhāna','Attention steadies without being repeatedly placed; rapture and happiness remain bright.',[1,4]),
   room('third-jhana','Third Jhāna','Rapture quiets. Happiness, mindfulness, and equanimity fill the high valley.',[2,4]),
   room('fourth-jhana','Fourth Jhāna','Pleasure and pain grow quiet in deep equanimity and one-pointed clarity.',[3,4],{label:'MCTB · The Samatha Jhānas',url:`${mctb}part-iii-the-samatha-jhanas/25-introduction-to-part-three/`})]},
  {id:'atypical',name:'II · The Atypical Passes',subtitle:'Absorption can be tuned, blended, and entered from odd angles.',rooms:[
   room('custom','The Custom Jhāna Forge','Choose a wholesome quality or object and learn how absorption organizes around it.',[4,4]),
   room('slam','The Slam-Shift Switchback','Rapidly alternate insight stages and jhānic factors; advanced terrain, easy to misread.',[1,4]),
   room('elemental','Elemental & Colour Caves','Explore absorption shaped by kasina colours, elements, space, or other stable themes.',[4,4],{label:'MCTB · Slam-Shifting Ñanas and Jhānas',url:`${mctb}part-vi-my-spiritual-quest/54-the-middle-paths/slam-shifting-nanas-and-jhanas/`})]}
 ]}
];

export const getSubMap=(regionId:string)=>subMaps.find(map=>map.regionId===regionId);
