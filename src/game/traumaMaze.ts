export const maze=['###############','#S#.....#.....#','#.#.###.#.###.#','#...#...#...#.#','###.#.#####.#.#','#...#.....#.#.#','#.#######.#.#.#','#.....#...#...#','#.###.#.#####.#','#...#........E#','###############'];
export const symbols=new Map<string,{glyph:string;name:string}>([
 ['3,1',{glyph:'♢',name:'False Door'}],['7,3',{glyph:'⚡',name:'Flashback'}],['11,3',{glyph:'⌁',name:'Echo Knot'}],['5,5',{glyph:'◐',name:'Half-Seen Face'}],
 ['9,5',{glyph:'☂',name:'Shelter Switch'}],['5,7',{glyph:'✧',name:'Grounding Star'}],['11,7',{glyph:'◒',name:'Repeating Scene'}],['7,9',{glyph:'⛓',name:'Old Bindings'}]
]);
export const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]} as const;
export type MazeDirection=keyof typeof directions;
const opposite:Record<MazeDirection,MazeDirection>={ArrowUp:'ArrowDown',ArrowDown:'ArrowUp',ArrowLeft:'ArrowRight',ArrowRight:'ArrowLeft',w:'s',s:'w',a:'d',d:'a'};
export const phaseOpen=[new Set(['4,1','8,5']),new Set(['6,7','12,5'])];
export const keyOf=(x:number,y:number)=>`${x},${y}`;
export type MazePoint={x:number;y:number};
export interface LabyrinthState {position:MazePoint;checkpoint:MazePoint;reverseMoves:number;grounded:boolean;shifted:boolean;complete:boolean}
export const initialLabyrinthState:LabyrinthState={position:{x:1,y:1},checkpoint:{x:1,y:1},reverseMoves:0,grounded:false,shifted:false,complete:false};
export interface LabyrinthMove {state:LabyrinthState;moved:boolean;entered:string;message?:string;tone:'quiet'|'danger'|'shelter'}

export function stepLabyrinth(state:LabyrinthState,raw:MazeDirection):LabyrinthMove {
 const key=state.reverseMoves>0?opposite[raw]:raw,[dx,dy]=directions[key];
 const x=state.position.x+dx,y=state.position.y+dy,entered=keyOf(x,y),cell=maze[y]?.[x];
 const result:LabyrinthMove={state,moved:false,entered,tone:'quiet'};
 if(state.complete)return result;
 if(cell===undefined||cell==='#'&&!phaseOpen[state.shifted?1:0].has(entered))return {...result,message:state.shifted?'The changed tunnel closes here. Somewhere else, stone has remembered a door.':'Cold stone. This route belongs to another shape of the labyrinth.'};
 if(entered==='5,5')return {...result,message:'The Half-Seen Face fills the corridor. Looking harder does not move it; another route remains.',tone:'danger'};
 if(entered==='7,9'&&!state.grounded)return {...result,message:'Old Bindings pull tight across the passage. Find something present-tense and bright.',tone:'danger'};
 const next={...state,position:{x,y},reverseMoves:Math.max(0,state.reverseMoves-1)};
 result.state=next;result.moved=true;
 if(entered==='3,1'||entered==='7,3'){
  next.position={x:1,y:1};next.checkpoint={x:1,y:1};
  result.message=entered==='3,1'?'The painted doorway opens onto the entrance. Familiar is not always forward.':'The flash arrives before the present can answer. When the light returns, you are at the mouth of the tunnel.';result.tone='danger';
 }else if(entered==='11,3'){
  next.reverseMoves=8;result.message='The Echo Knot catches direction itself. For eight steps, left remembers right and forward remembers back.';result.tone='danger';
 }else if(entered==='9,5'){
  next.shifted=!state.shifted;next.checkpoint={x,y};result.message=`Inside the shelter, you move one old chair. The whole tunnel quietly becomes Pattern ${next.shifted?'B':'A'}.`;result.tone='shelter';
 }else if(entered==='5,7'&&!state.grounded){
  next.grounded=true;result.message='A plain star: feet, breath, stone, now. The Old Bindings cannot pretend the past is the present anymore.';result.tone='shelter';
 }else if(entered==='11,7'){
  next.position={...state.checkpoint};result.message='The scene repeats—but the Shelter remembers you. You return to the last safe place, not the beginning.';result.tone='danger';
 }
 if(cell==='E'){next.complete=true;result.message='The Lantern-Door opens. The tunnel is remembered, but it is no longer the whole world.';result.tone='shelter'}
 return result;
}
