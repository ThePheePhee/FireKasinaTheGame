import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD,mapRegions} from '../src/data/mapRegions.ts';
import {routes} from '../src/data/routes.ts';
import {countryAt} from '../src/game/worldProgression.ts';
import {LANDSCAPE_TILE,countryGrid,countryCellAt,distanceToRoad,clearForScenery,sceneryExclusions} from '../src/rendering/landscapeModel.ts';

test('landscape tiles follow the real country classifier, including the partial edge row',()=>{
 const grid=countryGrid();
 assert.equal(LANDSCAPE_TILE,16);assert.equal(grid.columns,Math.ceil(WORLD.width/16));assert.equal(grid.rows,Math.ceil(WORLD.height/16));
 assert.equal(grid.cells.length,grid.columns*grid.rows);
 const countries=new Set();
 for(let row=0;row<grid.rows;row++)for(let column=0;column<grid.columns;column++){
  const left=column*16,top=row*16,x=(left+Math.min(WORLD.width,left+16))/2,y=(top+Math.min(WORLD.height,top+16))/2;
  assert.equal(grid.cells[row*grid.columns+column],countryAt(x,y));
  assert.equal(countryCellAt(x,y),countryAt(x,y));countries.add(countryCellAt(x,y));
 }
 assert.deepEqual([...countries].sort(),['fairy','home','mist']);
 assert.strictEqual(countryGrid(),grid);assert(Object.isFrozen(grid.cells));
});

test('the homestead and both safe lanes stay recognisably home on the tile grid',()=>{
 for(const id of ['house','garden','red-dot','library','fortification-tavern']){
  const region=mapRegions.find(item=>item.id===id);assert.equal(countryCellAt(region.x,region.y),'home',id);
 }
 for(const id of ['library-lane','fortification-road']){
  const route=routes.find(item=>item.id===id);
  for(let index=1;index<route.points.length;index++)for(let step=0;step<=10;step++){
   const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],x=ax+(bx-ax)*step/10,y=ay+(by-ay)*step/10;
   assert.equal(countryAt(x,y),'home');assert.equal(countryCellAt(x,y),'home',id);
  }
 }
});

test('road distances use every actual named route, and scenery respects the whole footprint',()=>{
 for(const route of routes)for(let index=1;index<route.points.length;index++){
  const [ax,ay]=route.points[index-1],[bx,by]=route.points[index],x=(ax+bx)/2,y=(ay+by)/2,length=Math.hypot(bx-ax,by-ay);
  assert(distanceToRoad(x,y)<1e-9,route.id);assert.equal(clearForScenery(x,y,8,8),false,route.id);
  if(length){const nx=-(by-ay)/length,ny=(bx-ax)/length;assert.equal(clearForScenery(x+nx*30,y+ny*30,16,16),false,`${route.id}: a footprint edge cannot overhang the road margin`)}
 }
});

test('landmarks, labels, and all existing props reserve their own scenery-free space',()=>{
 const boxes=sceneryExclusions();assert.strictEqual(sceneryExclusions(),boxes);assert(Object.isFrozen(boxes));
 assert.deepEqual([...new Set(boxes.map(box=>box.kind))].sort(),['ambient','fairy','label','landmark','prop']);
 for(const box of boxes){
  assert([box.x,box.y,box.w,box.h].every(Number.isFinite));assert(box.w>0&&box.h>0);
  assert.equal(clearForScenery(box.x+box.w/2,box.y+box.h/2,2,2),false,`${box.kind}:${box.id}`);
 }
});

test('scenery has useful open ground while respecting world edges and invalid inputs',()=>{
 let available=0;
 for(let y=24;y<WORLD.height-24;y+=32)for(let x=24;x<WORLD.width-24;x+=32){
  assert(Number.isFinite(distanceToRoad(x,y)));
  if(clearForScenery(x,y,16,16)){available++;assert(distanceToRoad(x,y)>26);assert.equal(clearForScenery(x,y,16,16),true)}
 }
 assert(available>100,'the exclusions should leave room for a landscape, not remove every decoration');
 assert.equal(clearForScenery(12,100,16,16),false);assert.equal(clearForScenery(WORLD.width-12,100,16,16),false);
 for(const args of [[NaN,100,16,16],[100,Infinity,16,16],[100,100,0,16],[100,100,16,-1]])assert.equal(clearForScenery(...args),false);
 assert.equal(distanceToRoad(NaN,100),Infinity);
 assert.equal(countryCellAt(-100,-100),countryCellAt(0,0));
 assert.equal(countryCellAt(WORLD.width+100,WORLD.height+100),countryCellAt(WORLD.width-1,WORLD.height-1));
});
