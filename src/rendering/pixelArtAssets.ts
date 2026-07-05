type AtlasName='player'|'landmarks'|'terrain'|'expansion';
const atlases:Partial<Record<AtlasName,HTMLImageElement>>={};
const ready=new Set<AtlasName>(),listeners=new Set<()=>void>();

function load(name:AtlasName,file:string){
 const image=new Image();image.onload=()=>{ready.add(name);for(const listener of listeners)listener()};image.src=`${import.meta.env.BASE_URL}assets/${file}`;atlases[name]=image;
}

load('player','meditator-wizard-atlas.png');
load('landmarks','landmarks-atlas.png');
load('terrain','terrain-atlas.png');
load('expansion','path-expansion-atlas.png');

export function getAtlas(name:AtlasName){return ready.has(name)?atlases[name]??null:null}
export function onPixelArtReady(listener:()=>void){listeners.add(listener);if(ready.size===4)queueMicrotask(listener);return()=>{listeners.delete(listener)}}

export function drawAtlasCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,width:number,height=width){
 const cellWidth=image.naturalWidth/4,cellHeight=image.naturalHeight/4;
 ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,Math.round(x-width/2),Math.round(y-height/2),Math.round(width),Math.round(height));
}
