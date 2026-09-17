import test from 'node:test';
import assert from 'node:assert/strict';
import {interiorMaps} from '../src/data/interiorMaps.ts';
import {fitMap,constrainMap,worldToScreen} from '../src/engine/mapViewport.ts';
import {playerCamera} from '../src/engine/camera.ts';
import {interiorCaptions,layoutInteriorCaptions,drawInteriorCaptions,showInteriorCaptionMarker} from '../src/rendering/drawInteriorCaptions.ts';

const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const divine=interiorMaps.find(map=>map.regionId==='celestial');

test('shared interior captions keep every place, traveller, exit and reciprocal staircase named',()=>{
 for(const map of interiorMaps)for(const [index,floor] of map.floors.entries()){
  const captions=interiorCaptions(map,floor,index);
  for(const item of [...floor.zones,...(floor.npcs??[])])assert.ok(captions.some(caption=>caption.name===item.name));
  assert.equal(captions.some(caption=>caption.id==='exit'),index===0);
  assert.equal(captions.some(caption=>caption.id==='stairs-down'),index>0);
  assert.equal(captions.some(caption=>caption.id==='stairs-up'),index<map.floors.length-1);
 }
});

test('all five Divine Abodes have whole readable captions at desktop and phone fit-map sizes',()=>{
 const floor=divine.floors[0],source=interiorCaptions(divine,floor,0);
 for(const size of [{width:1280,height:650},{width:1600,height:950},{width:390,height:668},{width:390,height:726}]){
  const reserved=[{x:size.width-72,y:size.height-170,width:72,height:170},{x:0,y:size.height-90,width:220,height:90}];
  const labels=layoutInteriorCaptions(source,fitMap(size,floor),size,reserved,floor);
  for(const zone of floor.zones){const label=labels.find(label=>label.caption.id===zone.id);assert.ok(label,`${zone.name} is hidden at ${size.width}×${size.height}`);assert.equal(label.lines.join(' '),zone.name)}
  if(size.width===390)assert.deepEqual(labels.find(label=>label.caption.id==='metta').lines,['Loving-Kindness','Garden']);
 }
});

test('interior signs keep screen-pixel typography instead of shrinking with the cached floor',()=>{
 const size={width:390,height:668},floor=divine.floors[0],source=interiorCaptions(divine,floor,0),fit=fitMap(size,floor);
 const overview=layoutInteriorCaptions(source,fit,size,[],floor);
 const walking=layoutInteriorCaptions(source,playerCamera(300,430,size.width,size.height,floor.width,floor.height),size,[],floor);
 const a=overview.find(label=>label.caption.id==='metta'),b=walking.find(label=>label.caption.id==='metta');
 assert.ok(a&&b);assert.equal(a.fontSize,12);assert.equal(b.fontSize,12);assert.ok(a.height>=44&&b.height>=44);
});

test('captions stay within the rendered floor, avoid artwork and each other, and never truncate a name',()=>{
 for(const map of interiorMaps)for(const [index,floor] of map.floors.entries())for(const size of [{width:1280,height:650},{width:390,height:668},{width:390,height:726}]){
  const source=interiorCaptions(map,floor,index),view=fitMap(size,floor),reserved=[{x:size.width-72,y:size.height-170,width:72,height:170},{x:0,y:size.height-90,width:220,height:90}],labels=layoutInteriorCaptions(source,view,size,reserved,floor);
  const start=worldToScreen(view,0,0),end=worldToScreen(view,floor.width,floor.height);
  const art=source.filter(caption=>caption.art).map(caption=>{const point=worldToScreen(view,caption.art.x,caption.art.y);return{...point,width:caption.art.width*view.scale,height:caption.art.height*view.scale}});
  for(const [labelIndex,label] of labels.entries()){
   assert.equal(label.lines.join(' '),label.caption.name);
   assert.ok(label.fontSize>=12&&label.height>=label.lines.length*label.lineHeight+8);
   assert.ok(label.x>=Math.max(0,start.x)&&label.y>=Math.max(0,start.y)&&label.x+label.width<=Math.min(size.width,end.x)&&label.y+label.height<=Math.min(size.height,end.y),`${map.name}/${label.caption.name} floats outside the floor`);
   assert.ok(!art.some(box=>overlap(label,box)),`${label.caption.name} covers landmark artwork`);
   assert.ok(!reserved.some(box=>overlap(label,box)),`${label.caption.name} is hidden under map controls`);
   assert.ok(!labels.slice(labelIndex+1).some(box=>overlap(label,box)),`${label.caption.name} overlaps another caption`);
   if(size.width<700){assert.ok(label.height>=44&&label.width>=44,`${label.caption.name} needs a full-size touch target`);assert.ok(Math.hypot(label.x+label.width/2-label.anchor.x,label.y+label.height/2-label.anchor.y)<=40)}
  }
 }
});

test('dense phone floors declutter while every insight stage remains recoverable through zoom and pan',()=>{
 const map=interiorMaps.find(map=>map.regionId==='tower'),floor=map.floors[1],size={width:390,height:726},source=interiorCaptions(map,floor,1),fit=fitMap(size,floor);
 const reserved=[{x:size.width-72,y:size.height-170,width:72,height:170},{x:0,y:size.height-90,width:220,height:90}];
 const overview=layoutInteriorCaptions(source,fit,size,reserved,floor);
 assert.ok(overview.length<source.length,'The entire insight glossary became a wall of floating plaques');
 for(const target of source.filter(caption=>caption.kind==='place')){
  // Dense neighbouring stair art can favour an intermediate pinch-zoom over
  // maximum magnification. Every authored stage, including the first, must
  // remain reachable by the normal map controls without shrinking its text.
  const recovered=[2.5,3,4,5].some(factor=>{
   const scale=fit.scale*factor,view=constrainMap({x:target.x-size.width/(2*scale),y:target.y-size.height/(2*scale),scale},size,floor);
   const label=layoutInteriorCaptions(source,view,size,reserved,floor).find(label=>label.caption.id===target.id);
   if(!label)return false;
   assert.equal(label.lines.join(' '),target.name);assert.ok(label.fontSize>=12&&label.width>=44&&label.height>=44);
   return true;
  });
  assert.ok(recovered,`${target.name} never regains its name when zoomed`);
 }
});

test('floating interaction badges cannot duplicate or cover a readable caption',()=>{
 const floor=divine.floors[0],size={width:390,height:668},labels=layoutInteriorCaptions(interiorCaptions(divine,floor,0),fitMap(size,floor),size,[],floor),label=labels[0];
 assert.equal(showInteriorCaptionMarker(label.caption.id,{x:10,y:10},labels),false);
 assert.equal(showInteriorCaptionMarker('another-place',{x:label.x+label.width/2,y:label.y+label.height/2},labels),false);
 // The badge's centre can be clear while its 44px footprint still obscures ink.
 assert.equal(showInteriorCaptionMarker('another-place',{x:label.x+label.width+20,y:label.y+label.height/2},labels),false);
 assert.equal(showInteriorCaptionMarker('another-place',{x:10,y:10},labels),true);
});

test('Arising and Passing Away remains named beside the player with the HUD outside the landscape',()=>{
 const map=interiorMaps.find(map=>map.regionId==='tower'),floor=map.floors[1],source=interiorCaptions(map,floor,1);
 const oldSize={width:1280,height:700},oldView=playerCamera(1340,850,oldSize.width,oldSize.height,floor.width,floor.height);
 // The original oversized exclusion used to erase this sign; extended placement
 // can now recover it even before the controls are moved outside the viewport.
 const legacyPanel={x:878,y:480,width:402,height:220};
 const recovered=layoutInteriorCaptions(source,oldView,oldSize,[legacyPanel],floor).find(label=>label.caption.id==='arising');
 assert.ok(recovered);assert.ok(!overlap(recovered,legacyPanel));
 for(const size of [{width:1280,height:526},{width:390,height:526},{width:844,height:210}]){
  const view=playerCamera(1340,850,size.width,size.height,floor.width,floor.height);
  const labels=layoutInteriorCaptions(source,view,size,[],floor),label=labels.find(label=>label.caption.id==='arising');
  assert.ok(label,`Arising name missing in ${size.width}×${size.height} walking viewport`);
  assert.equal(label.lines.join(' '),source.find(caption=>caption.id==='arising').name);
  assert.equal(showInteriorCaptionMarker('arising',label.anchor,labels,{width:150,height:66}),false);
 }
});

test('every approached interior place retains its full name across desktop and phone viewports',()=>{
 for(const map of interiorMaps)for(const [floorIndex,floor] of map.floors.entries()){
  const source=interiorCaptions(map,floor,floorIndex);
  for(const size of [{width:1280,height:526},{width:390,height:526},{width:844,height:210}])for(const zone of floor.zones){
   const view=playerCamera(zone.x,zone.y+zone.h*.55,size.width,size.height,floor.width,floor.height);
   const labels=layoutInteriorCaptions(source,view,size,[],floor,zone.id);
   const label=labels.find(item=>item.caption.id===zone.id);
   assert.ok(label,`${map.name}/${floor.name}/${zone.name} missing at ${size.width}×${size.height}`);
   assert.equal(label.lines.join(' '),zone.name);
   assert.ok(label.x>=0&&label.y>=0&&label.x+label.width<=size.width&&label.y+label.height<=size.height);
   assert.ok(!labels.some(other=>other!==label&&overlap(other,label)));
   for(const caption of source)if(caption.art){const point=worldToScreen(view,caption.art.x,caption.art.y);assert.ok(!overlap(label,{...point,width:caption.art.width*view.scale,height:caption.art.height*view.scale}),`${zone.name} obscures art`)}
  }
 }
});

test('visible landmark keeps its name when the original sign anchor is below the viewport',()=>{
 const caption={id:'edge',name:'The Edge of Seeing',x:200,y:215,kind:'place',art:{x:145,y:100,width:110,height:90}};
 const label=layoutInteriorCaptions([caption],{x:0,y:0,scale:1},{width:400,height:200},[],undefined,'edge')[0];
 assert.ok(label);assert.equal(label.lines.join(' '),caption.name);
 assert.ok(label.y+label.height<=200);assert.ok(!overlap(label,caption.art));
});

test('traveller names also survive nearby furniture and small walking viewports',()=>{
 for(const map of interiorMaps)for(const [index,floor] of map.floors.entries())for(const npc of floor.npcs??[]){
  for(const size of [{width:1280,height:526},{width:390,height:526},{width:844,height:182}]){
   const source=interiorCaptions(map,floor,index),view=playerCamera(npc.x,npc.y+90,size.width,size.height,floor.width,floor.height);
   const labels=layoutInteriorCaptions(source,view,size,[],floor,`npc-${npc.id}`);
   assert.equal(labels.find(label=>label.caption.id===`npc-${npc.id}`)?.lines.join(' '),npc.name);
  }
 }
});

test('wide Read badges yield to neighbouring names using their actual footprint',()=>{
 const floor=divine.floors[0],size={width:1280,height:650};
 const labels=layoutInteriorCaptions(interiorCaptions(divine,floor,0),fitMap(size,floor),size,[],floor),label=labels[0];
 const anchor={x:label.x+label.width+50,y:label.y+label.height/2};
 assert.equal(showInteriorCaptionMarker('unlabelled-place',anchor,[label]),true);
 assert.equal(showInteriorCaptionMarker('unlabelled-place',anchor,[label],{width:150,height:66}),false);
});

test('caption painting contains the complete glyph height and restores inherited canvas state',()=>{
 const size={width:390,height:668},floor=divine.floors[0],labels=layoutInteriorCaptions(interiorCaptions(divine,floor,0),fitMap(size,floor),size,[],floor);
 const text=[],plates=[],states=[];
 const initialState={globalAlpha:.2,textBaseline:'ideographic',textAlign:'left',fillStyle:'red',font:'8px serif',strokeStyle:'cyan',lineWidth:7};
 let saved=0,restored=0;
 const ctx={...initialState,
  save(){saved++;states.push(Object.fromEntries(Object.keys(initialState).map(key=>[key,this[key]])))},restore(){restored++;Object.assign(this,states.pop())},
  fillRect(x,y,width,height){if(this.fillStyle==='#17141de8')plates.push({x,y,width,height})},measureText(value){return{width:value.length*7.2,actualBoundingBoxAscent:9,actualBoundingBoxDescent:3}},
  fillText(value,x,y){text.push({value,x,y,baseline:this.textBaseline,font:this.font})},beginPath(){},moveTo(){},lineTo(){},stroke(){},scale(){assert.fail('Text was rescaled with world artwork')},
 };
 drawInteriorCaptions(ctx,labels);
 assert.equal(text.length,labels.reduce((count,label)=>count+label.lines.length,0));
 const expected=labels.flatMap(label=>label.lines.map(value=>({label,value})));
 for(const [index,line] of text.entries()){
  const {label,value}=expected[index],inkWidth=ctx.measureText(line.value).width;
  assert.equal(line.value,value);assert.equal(line.baseline,'alphabetic');assert.match(line.font,/bold 12px monospace/);
  assert.ok(line.x-inkWidth/2>=label.x+2&&line.x+inkWidth/2<=label.x+label.width-2&&line.y-9>=label.y+2&&line.y+3<=label.y+label.height-2,`Ink for ${line.value} spills out of its own sign`);
 }
 assert.equal(plates.length,labels.length);assert.equal(saved,1);assert.equal(restored,1);assert.equal(states.length,0);
 for(const [key,value] of Object.entries(initialState))assert.equal(ctx[key],value,`${key} leaks into later canvas drawing`);
});

test('caption layout is deterministic and cannot mutate authored zones, NPCs, or lore',()=>{
 const before=JSON.stringify(interiorMaps),floor=divine.floors[0],size={width:390,height:726},source=interiorCaptions(divine,floor,0),view=fitMap(size,floor);
 assert.deepEqual(layoutInteriorCaptions(source,view,size,[],floor),layoutInteriorCaptions(source,view,size,[],floor));
 for(const scale of [0,-1,NaN,Infinity])assert.deepEqual(layoutInteriorCaptions(source,{...view,scale},size,[],floor),[]);
 assert.deepEqual(layoutInteriorCaptions(source,view,{width:40,height:40},[],floor),[]);
 assert.equal(JSON.stringify(interiorMaps),before);
});
