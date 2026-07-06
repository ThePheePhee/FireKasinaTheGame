type AtlasName='player'|'landmarks'|'terrain'|'expansion'|'special'|'story'|'states'|'recall'|'rupa';
const atlases:Partial<Record<AtlasName,HTMLImageElement>>={};
const ready=new Set<AtlasName>(),listeners=new Set<()=>void>();

function load(name:AtlasName,file:string){
 const image=new Image();image.onload=()=>{ready.add(name);for(const listener of listeners)listener()};image.src=`${import.meta.env.BASE_URL}assets/${file}`;atlases[name]=image;
}

load('player','meditator-wizard-atlas.png');
load('landmarks','landmarks-atlas.png');
load('terrain','terrain-atlas.png');
load('expansion','path-expansion-atlas.png');
load('special','healing-jhana-landmarks.png');
load('story','fire-kasina-story-props.png');
load('states','recall-awakening-formless.png');
load('recall','life-recall-environment.png');
load('rupa','rupa-jhana-canonical.png');

export function getAtlas(name:AtlasName){return ready.has(name)?atlases[name]??null:null}
export function onPixelArtReady(listener:()=>void){listeners.add(listener);if(ready.size===9)queueMicrotask(listener);return()=>{listeners.delete(listener)}}

export function drawAtlasCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,width:number,height=width){
 const cellWidth=image.naturalWidth/4,cellHeight=image.naturalHeight/4;
 ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,Math.round(x-width/2),Math.round(y-height/2),Math.round(width),Math.round(height));
}

export function drawStoryCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number){
 const cellWidth=image.naturalWidth/5,cellHeight=image.naturalHeight/2;
 ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,Math.round(x-size/2),Math.round(y-size/2),Math.round(size),Math.round(size));
}

export function drawStateCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number){
 const cellWidth=image.naturalWidth/4,cellHeight=image.naturalHeight/3;
 ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,Math.round(x-size/2),Math.round(y-size/2),Math.round(size),Math.round(size));
}
