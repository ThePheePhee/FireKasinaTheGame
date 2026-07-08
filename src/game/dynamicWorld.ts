import {mapRegions,WORLD,type Region} from '../data/mapRegions';
import type {Route,RouteFamily,RouteKind} from '../data/routes';

export interface PracticeState {
 concentration:number;vividness:number;stability:number;generativeControl:number;
 deconstructiveClarity:number;equanimity:number;craving:number;embodiment:number;
 realityTesting:number;integration:number;
}
export type PracticeKey=keyof PracticeState;
export interface WorldHistory {visitedRegions:string[];learnedTransitions:string[];previousStates:PracticeState[];unresolvedExperiences:string[];integratedExperiences:string[];discoveredLocations:Record<string,[number,number]>}
export interface WorldCondition {key:PracticeKey;min?:number;max?:number}
export interface ExperientialRegion {id:string;profile:Partial<PracticeState>;effects:Partial<Record<PracticeKey,number>>;attractor?:boolean}
export interface ExperientialTransition {id:string;source:string;target:string;name:string;family:RouteFamily;kind:RouteKind;required?:WorldCondition[];blocked?:WorldCondition[];oneWay?:boolean}
export type ScreenMode='ordinary'|'first'|'second'|'third'|'fourth';
export interface ActiveTransition extends ExperientialTransition {score:number}
export interface DynamicWorld {regions:Region[];routes:Route[];transitions:ActiveTransition[];activeIds:Set<string>;currentRegionId:string;screenMode:ScreenMode;signature:string;reason:string}

export const initialPracticeState:PracticeState={concentration:0,vividness:8,stability:38,generativeControl:4,deconstructiveClarity:8,equanimity:42,craving:18,embodiment:78,realityTesting:82,integration:12};
const homesteadIds=['house','garden','library','fortification-tavern','red-dot'] as const;
const homesteadLocations=Object.fromEntries(homesteadIds.map(id=>{const region=mapRegions.find(item=>item.id===id)!;return[id,[region.x,region.y] as [number,number]]}));
export const initialWorldHistory:WorldHistory={visitedRegions:[...homesteadIds],learnedTransitions:[],previousStates:[],unresolvedExperiences:[],integratedExperiences:[],discoveredLocations:homesteadLocations};
const R=(id:string,profile:Partial<PracticeState>,effects:ExperientialRegion['effects'],attractor=false):ExperientialRegion=>({id,profile,effects,attractor});
export const experientialRegions:ExperientialRegion[]=[
 R('house',{embodiment:90,stability:65,realityTesting:85},{embodiment:8,stability:4,craving:-5}),
 R('garden',{embodiment:78,equanimity:58,stability:55},{embodiment:7,equanimity:4,craving:-4}),
 R('library',{realityTesting:85,integration:60,deconstructiveClarity:45},{realityTesting:6,integration:3}),
 R('fortification-tavern',{embodiment:72,integration:48,stability:60},{embodiment:5,stability:4,craving:-3}),
 R('red-dot',{concentration:48,vividness:35,stability:50},{concentration:4,vividness:3,generativeControl:2,embodiment:-2}),
 R('mist',{vividness:22,stability:28,equanimity:52,deconstructiveClarity:38},{equanimity:2,deconstructiveClarity:2,craving:-2}),
 R('fireworks',{concentration:68,vividness:88,generativeControl:72,stability:52},{vividness:7,generativeControl:5,craving:3,embodiment:-4}),
 R('magical',{vividness:78,generativeControl:84,realityTesting:62,stability:58},{generativeControl:5,vividness:3,realityTesting:-1}),
 R('celestial',{vividness:86,equanimity:68,stability:62,realityTesting:60},{vividness:3,equanimity:3,integration:2}),
 R('tower',{deconstructiveClarity:82,equanimity:68,craving:18,stability:58},{deconstructiveClarity:7,equanimity:3,craving:-4,integration:2}),
 R('jhana',{concentration:84,stability:82,equanimity:65,vividness:55},{concentration:3,stability:6,equanimity:3,craving:-2}),
 R('formless',{concentration:90,stability:78,equanimity:80,embodiment:16},{equanimity:4,embodiment:-5,deconstructiveClarity:3}),
 R('healing',{embodiment:72,integration:78,equanimity:70},{integration:7,embodiment:5,equanimity:3}),
 R('life-recall',{concentration:58,integration:62,stability:45},{integration:5,stability:2}),
 R('trauma',{stability:28,equanimity:38,integration:22,embodiment:38},{integration:3,equanimity:2,stability:-2}),
 R('booboo',{stability:20,equanimity:25,embodiment:30,craving:55},{craving:2,stability:-3}),
 R('chasm',{stability:15,equanimity:48,integration:18},{equanimity:3,stability:-4}),
 R('inn',{realityTesting:55,integration:40,craving:42},{realityTesting:2,integration:2}),
 R('counterfeit-crags',{realityTesting:24,deconstructiveClarity:18,craving:72,stability:48},{craving:5,realityTesting:-5,deconstructiveClarity:-2},true),
 R('credulous-circuit',{realityTesting:18,craving:82,stability:30,integration:15},{craving:6,realityTesting:-5,stability:-2},true)
];

const T=(source:string,target:string,name:string,family:RouteFamily,required:WorldCondition[]=[],blocked:WorldCondition[]=[],kind:RouteKind='tram',oneWay=true):ExperientialTransition=>({id:`${source}-${target}`,source,target,name,family,required,blocked,kind,oneWay});
export const experientialTransitions:ExperientialTransition[]=[
 T('house','garden','The Familiar Step','balance'),T('house','library','The Lantern Lane','connection'),T('house','fortification-tavern','The Supper Road','balance'),
 T('garden','house','The Homeward Path','balance'),T('garden','red-dot','The First Kindling','generation'),T('garden','library','The Reader’s Walk','connection'),T('garden','fortification-tavern','The Fortifying Stroll','balance'),
 T('library','garden','Close the Book Gently','balance'),T('fortification-tavern','garden','The Road After Supper','balance'),
 T('red-dot','garden','Open the Eyes','balance'),T('red-dot','mist','The Uncertain Threshold','deconstruction',[{key:'concentration',min:35}]),T('red-dot','fireworks','The Bright Kindling','generation',[{key:'concentration',min:45},{key:'vividness',min:28}]),T('red-dot','jhana','The Collected Pass','deconstruction',[{key:'concentration',min:62},{key:'stability',min:48}]),
 T('mist','red-dot','The Fading Thread','balance',[{key:'embodiment',min:42}]),T('mist','trauma','The Echoing Descent','deconstruction',[{key:'integration',max:55}]),T('mist','booboo','The Sorrow Current','deconstruction',[{key:'equanimity',max:48}]),T('mist','chasm','The Meaningless Bridge','deconstruction',[{key:'stability',max:38}]),T('mist','inn','The Argumentative Lantern','balance'),T('mist','tower','The Dissolving Stair','deconstruction',[{key:'deconstructiveClarity',min:32},{key:'equanimity',min:42}]),T('mist','counterfeit-crags','The Too-Certain Ridge','connection',[{key:'craving',min:45},{key:'realityTesting',max:58}]),T('mist','fireworks','The Pattern Kindles','generation',[{key:'vividness',min:42},{key:'generativeControl',min:30}]),
 T('fireworks','magical','The Artificer’s Causeway','generation',[{key:'generativeControl',min:45},{key:'stability',min:35}]),T('fireworks','celestial','The Luminous Ascent','generation',[{key:'vividness',min:68},{key:'equanimity',min:42}]),T('fireworks','tower','Clarity Ridge','deconstruction',[{key:'deconstructiveClarity',min:38}]),T('fireworks','mist','The Relinquishing Road','deconstruction',[{key:'craving',max:45},{key:'equanimity',min:45}]),T('fireworks','counterfeit-crags','The Brilliant Mistake','connection',[{key:'realityTesting',max:52},{key:'craving',min:48}]),
 T('magical','fireworks','The Return of Raw Light','generation'),T('magical','celestial','The Entity Road','generation',[{key:'vividness',min:58}]),T('magical','healing','The Healer’s Light','balance',[{key:'integration',min:28}]),T('magical','tower','The Reality-Testing Road','connection',[{key:'realityTesting',min:58}]),
 T('celestial','healing','The Compassionate Descent','balance',[{key:'integration',min:35}]),T('celestial','formless','The Vanishing Palace','deconstruction',[{key:'concentration',min:70},{key:'equanimity',min:62}]),T('celestial','magical','The Road Back to Craft','generation'),
 T('tower','jhana','The Contemplative Loop','connection',[{key:'concentration',min:48}]),T('tower','healing','The Integration Crossing','balance',[{key:'integration',min:30}]),T('tower','mist','The Stair into Weather','deconstruction'),T('tower','fireworks','The Constructed Splendour','generation',[{key:'vividness',min:38}]),
 T('jhana','formless','The Vanishing Road','deconstruction',[{key:'concentration',min:72},{key:'stability',min:65}]),T('jhana','tower','The Investigating Pass','deconstruction',[{key:'deconstructiveClarity',min:38}]),T('jhana','magical','The Siddhi Pass','generation',[{key:'generativeControl',min:40},{key:'realityTesting',min:50}]),T('jhana','red-dot','The Simple Object','balance'),
 T('formless','celestial','The Road of Splendid Reappearance','generation',[{key:'equanimity',min:60}]),T('formless','jhana','The Return to Form','balance',[{key:'embodiment',min:24}]),
 T('trauma','life-recall','The Remembering Passage','deconstruction',[{key:'stability',min:24}]),T('trauma','healing','The Mending Way','balance',[{key:'integration',min:18}]),T('trauma','mist','The Tunnel Mouth','balance'),
 T('life-recall','healing','Integration Lane','balance',[{key:'integration',min:32}]),T('life-recall','trauma','The Older Door','deconstruction'),T('healing','garden','The Embodied Return','balance',[{key:'embodiment',min:52}]),T('healing','magical','The Subtle Craft','generation'),T('healing','tower','The Clear Medicine','deconstruction'),
 T('booboo','mist','The Kindly Shore','balance',[{key:'equanimity',min:28}]),T('booboo','garden','The Grounding Ferry','balance',[{key:'embodiment',min:58}]),T('booboo','healing','The Compassionate Reed-Bed','balance',[{key:'equanimity',min:48},{key:'integration',min:28}]),T('chasm','mist','The Far End of the Bridge','deconstruction',[{key:'equanimity',min:45}]),T('chasm','tower','The Meaningless Stair','deconstruction',[{key:'equanimity',min:52},{key:'deconstructiveClarity',min:38}]),T('inn','mist','Enough Argument for Now','balance'),T('inn','tower','The Testable Claim','connection',[{key:'realityTesting',min:60}]),T('inn','healing','The Reconciliatory Round','balance',[{key:'integration',min:42},{key:'equanimity',min:48}]),
 T('counterfeit-crags','credulous-circuit','The Credulous Clarity Circuit','connection',[],[{key:'realityTesting',min:72}],'rail'),T('credulous-circuit','counterfeit-crags','The Familiar Summit','connection',[],[{key:'realityTesting',min:72}],'rail'),T('counterfeit-crags','tower','The Doubtful Footpath','deconstruction',[{key:'realityTesting',min:58},{key:'craving',max:52}]),T('credulous-circuit','mist','The Admitted Uncertainty','deconstruction',[{key:'realityTesting',min:60},{key:'equanimity',min:48},{key:'craving',max:55}])
];

const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function applyStateDelta(state:PracticeState,delta:Partial<Record<PracticeKey,number>>):PracticeState {const next={...state};for(const key of Object.keys(delta) as PracticeKey[])next[key]=clamp(next[key]+(delta[key]??0));return next}
export const practiceActions={
 intensify:{name:'INTENSIFY THE IMAGE',copy:'Hold the image more firmly and feed its brightness.',effects:{concentration:7,vividness:9,generativeControl:8,craving:4,embodiment:-5}},
 observe:{name:'OBSERVE WITHOUT INTERFERENCE',copy:'Let the image arrange itself without helping or correcting it.',effects:{equanimity:8,stability:6,craving:-8,deconstructiveClarity:3}},
 examine:{name:'WATCH FORMING & VANISHING',copy:'Attend to construction, movement, and disappearance rather than content.',effects:{deconstructiveClarity:10,equanimity:4,generativeControl:-4,craving:-4}},
 ground:{name:'RETURN TO BODY',copy:'Feel posture, breathing, weight, and the ordinary room around practice.',effects:{embodiment:12,realityTesting:6,stability:5,vividness:-7,craving:-5}},
 believe:{name:'TRUST THE VISION COMPLETELY',copy:'Treat the apparent message as literal and unquestionable.',effects:{realityTesting:-12,craving:8,vividness:5,generativeControl:3}}
} as const;
export type PracticeActionId=keyof typeof practiceActions;

function conditionMatches(condition:WorldCondition,state:PracticeState,tolerance=0){const value=state[condition.key];return(condition.min===undefined||value>=condition.min-tolerance)&&(condition.max===undefined||value<=condition.max+tolerance)}
function resonance(state:PracticeState,region:ExperientialRegion,history:WorldHistory){const entries=Object.entries(region.profile) as [PracticeKey,number][];let score=entries.reduce((sum,[key,target])=>sum+Math.max(0,100-Math.abs(state[key]-target)),0)/Math.max(1,entries.length);if(history.visitedRegions.includes(region.id))score+=4;if(history.unresolvedExperiences.includes(region.id))score+=8*(1-state.integration/100);if(region.attractor&&history.visitedRegions.includes(region.id))score+=10;return Math.max(0,Math.min(100,score))}
export function screenModeFor(state:PracticeState):ScreenMode {if(state.vividness>=82&&state.stability>=68)return'fourth';if(state.vividness>=68&&state.stability>=45)return'third';if(state.vividness>=30)return'second';if(state.concentration>=18)return'first';return'ordinary'}
const cloneRegion=(region:Region,x:number,y:number):Region=>({...region,x,y});
export function buildDynamicWorld(state:PracticeState,currentRegionId:string,history:WorldHistory,previousActive=new Set<string>(),reason='The roads quietly reconsider their destinations.'):DynamicWorld{
 const current=experientialRegions.find(region=>region.id===currentRegionId)??experientialRegions[0],outgoing=experientialTransitions.filter(edge=>edge.source===current.id).filter(edge=>edge.blocked?.every(condition=>!conditionMatches(condition,state))??true).filter(edge=>edge.required?.every(condition=>conditionMatches(condition,state,previousActive.has(edge.target)?8:0))??true).map(edge=>({...edge,score:resonance(state,experientialRegions.find(region=>region.id===edge.target)!,history)})).sort((a,b)=>b.score-a.score).slice(0,6);
 const activeIds=new Set(['fairy-playground','mist',...homesteadIds,...history.visitedRegions,current.id,...outgoing.map(edge=>edge.target)]),canonical=new Map(mapRegions.map(region=>[region.id,region])),currentCanonical=canonical.get(current.id)!,currentPosition=history.discoveredLocations[current.id]??[currentCanonical.x,currentCanonical.y] as [number,number];
 const regions:Region[]=[];for(const id of activeIds){const region=canonical.get(id);if(!region)continue;if(id==='fairy-playground'||id==='mist'||homesteadIds.includes(id as typeof homesteadIds[number])){regions.push({...region});continue}const frozen=history.discoveredLocations[id];if(frozen){regions.push(cloneRegion(region,...frozen));continue}const index=outgoing.findIndex(edge=>edge.target===id),edge=outgoing[Math.max(0,index)],angle=-Math.PI/2+Math.max(0,index)*Math.PI*2/Math.max(3,outgoing.length),distance=300+(100-(edge?.score??100))*2.25;regions.push(cloneRegion(region,currentPosition[0]+Math.cos(angle)*distance,currentPosition[1]+Math.sin(angle)*distance))}
 const currentVisible=regions.find(region=>region.id===current.id)!;const routes:Route[]=outgoing.map((edge,index)=>{const target=regions.find(region=>region.id===edge.target)!;const bend=(index%2?1:-1)*42,mid:[number,number]=[(currentVisible.x+target.x)/2+bend,(currentVisible.y+target.y)/2-bend];return{id:edge.id,name:edge.name,family:edge.family,kind:edge.kind,points:[[currentVisible.x,currentVisible.y],mid,[target.x,target.y]],labelAt:mid}});
 const screenMode=screenModeFor(state),signature=`${current.id}:${outgoing.map(edge=>edge.target).join(',')}:${screenMode}:${Object.keys(history.discoveredLocations).sort().join(',')}`;
 return{regions,routes,transitions:outgoing,activeIds,currentRegionId:current.id,screenMode,signature,reason};
}

export function enterRegion(state:PracticeState,regionId:string,history:WorldHistory){const region=experientialRegions.find(item=>item.id===regionId),nextState=region?applyStateDelta(state,region.effects):state,visited=history.visitedRegions.includes(regionId)?history.visitedRegions:[...history.visitedRegions,regionId],difficult=['trauma','booboo','chasm','counterfeit-crags','credulous-circuit'].includes(regionId),unresolved=difficult&&state.integration<55&&!history.unresolvedExperiences.includes(regionId)?[...history.unresolvedExperiences,regionId]:regionId==='healing'?history.unresolvedExperiences.filter(id=>id==='trauma'&&state.integration<45):history.unresolvedExperiences,integrated=regionId==='healing'?[...new Set([...history.integratedExperiences,...history.unresolvedExperiences.filter(id=>!unresolved.includes(id))])]:history.integratedExperiences;return{state:nextState,history:{...history,visitedRegions:visited,unresolvedExperiences:unresolved,integratedExperiences:integrated,previousStates:[...history.previousStates.slice(-11),state]}}}

export function projectionSummary(world:DynamicWorld){return world.transitions.length?world.transitions.map(edge=>`${edge.name} → ${mapRegions.find(region=>region.id===edge.target)?.name??edge.target}`).join(' · '):'No road is presently willing to become solid.'}
