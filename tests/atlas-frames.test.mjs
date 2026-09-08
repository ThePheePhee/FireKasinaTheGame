import test from 'node:test';
import assert from 'node:assert/strict';
import {atlasFrame} from '../src/rendering/atlasFrames.ts';
import {readRgbaPng} from './helpers/pngPixels.mjs';

const sheets={
 landmarks:readRgbaPng(new URL('../public/assets/landmarks-atlas.png',import.meta.url)),
 expansion:readRgbaPng(new URL('../public/assets/path-expansion-atlas.png',import.meta.url)),
};
// These are measured foreign-pixel bands in the committed source images, not
// values copied from the implementation's trim metadata. A faint alpha pixel
// in the Lagoon's last row makes the first Jhana inset 3px, not merely 2px.
const contaminated=[
 ['landmarks',0,1,{top:4}],['landmarks',1,1,{top:4}],['landmarks',2,1,{top:4}],['landmarks',3,1,{top:4}],
 ['landmarks',0,2,{top:3}],['landmarks',1,2,{top:3}],['landmarks',2,2,{top:5}],['landmarks',3,2,{top:6}],
 ['expansion',2,0,{left:8}],
 ['expansion',0,1,{top:10}],['expansion',1,1,{top:9}],['expansion',2,1,{top:8,right:3}],['expansion',3,1,{top:5}],
 ['expansion',2,2,{top:2}],
];
const inside=(frame,x,y)=>x>=frame.sx&&x<frame.sx+frame.sw&&y>=frame.sy&&y<frame.sy+frame.sh;
const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-10,`${actual} differs from ${expected}`);

test('legacy frame sampling excludes actual neighbouring sprite fragments while preserving every intended pixel',()=>{
 for(const [name,column,row,foreign] of contaminated){
  const image=sheets[name],frame=atlasFrame(name,column,row,image.width,image.height),cellWidth=image.width/4,cellHeight=image.height/4;
  let removed=0,preserved=0;
  for(let y=0;y<cellHeight;y++)for(let x=0;x<cellWidth;x++){
   const sourceX=column*cellWidth+x,sourceY=row*cellHeight+y;
   if(!image.alphaAt(sourceX,sourceY))continue;
   const isForeign=y<(foreign.top??0)||x<(foreign.left??0)||x>=cellWidth-(foreign.right??0);
   if(isForeign){removed++;assert(!inside(frame,sourceX,sourceY),`${name}[${column},${row}] retains neighbour at ${x},${y}`)}
   else{preserved++;assert(inside(frame,sourceX,sourceY),`${name}[${column},${row}] clips intended art at ${x},${y}`)}
  }
  assert(removed>0,`${name}[${column},${row}] fixture must demonstrate real contamination`);
  assert(preserved>1000,`${name}[${column},${row}] must retain the subject, not just clear the cell`);
 }
});

test('source insets preserve nominal placement and scale at native and doubled atlas resolution',()=>{
 for(const [name,column,row] of contaminated){
  const native=atlasFrame(name,column,row,512,512);
  for(const dimension of [512,1024]){
   const frame=atlasFrame(name,column,row,dimension,dimension),cell=dimension/4;
   close(frame.offsetX,(frame.sx-column*cell)/cell);close(frame.offsetY,(frame.sy-row*cell)/cell);
   close(frame.scaleX,frame.sw/cell);close(frame.scaleY,frame.sh/cell);
   close(frame.offsetX,native.offsetX);close(frame.offsetY,native.offsetY);
   close(frame.scaleX,native.scaleX);close(frame.scaleY,native.scaleY);
   // An asymmetric destination catches recentering or stretching a trimmed crop.
   const width=135,height=92,left=20,top=31;
   for(const [x,y] of [[frame.sx,frame.sy],[frame.sx+frame.sw-.5,frame.sy+frame.sh-.5]]){
    const sampledX=left+frame.offsetX*width+(x-frame.sx)/frame.sw*(frame.scaleX*width);
    const sampledY=top+frame.offsetY*height+(y-frame.sy)/frame.sh*(frame.scaleY*height);
    close(sampledX,left+(x-column*cell)/cell*width);close(sampledY,top+(y-row*cell)/cell*height);
   }
  }
 }
});

test('thin sparks and narrow spires remain visible instead of receiving a blanket border crop',()=>{
 const checks=[['landmarks',0,0,11],['landmarks',2,1,19],['landmarks',3,1,13],['landmarks',3,2,20],['expansion',1,0,9]];
 for(const [name,column,row,tipRow] of checks){
  const image=sheets[name],frame=atlasFrame(name,column,row,image.width,image.height),y=row*128+tipRow;
  const visible=Array.from({length:128},(_,x)=>column*128+x).filter(x=>image.alphaAt(x,y)>0);
  assert(visible.length>0,`${name}[${column},${row}] tip exists`);
  for(const x of visible)assert(inside(frame,x,y),`${name}[${column},${row}] loses its narrow tip`);
 }
});

test('clean cells and the differently sized settlement atlas remain untouched',()=>{
 for(const name of ['landmarks','expansion'])for(let row=0;row<4;row++)for(let column=0;column<4;column++){
  if(contaminated.some(([atlas,x,y])=>atlas===name&&x===column&&y===row))continue;
  assert.deepEqual(atlasFrame(name,column,row,512,512),{sx:column*128,sy:row*128,sw:128,sh:128,offsetX:0,offsetY:0,scaleX:1,scaleY:1});
 }
 const image=readRgbaPng(new URL('../public/assets/library-tavern-v1.png',import.meta.url));
 assert.equal(image.width,2560);assert.equal(image.height,2048);
 for(const column of [0,1]){
  const frame=atlasFrame('settlements',column,0,image.width,image.height,5,4);
  assert.deepEqual(frame,{sx:column*512,sy:0,sw:512,sh:512,offsetX:0,offsetY:0,scaleX:1,scaleY:1});
  // These are genuine gutters. The strip beside the Tavern came from Trauma's
  // neighbouring drawn frame, not from contaminated pixels in the Tavern sheet.
  for(let y=0;y<512;y++)for(let x=0;x<8;x++){
   assert.equal(image.alphaAt(column*512+x,y),0);
   assert.equal(image.alphaAt((column+1)*512-1-x,y),0);
  }
 }
});
