type AtlasName='player'|'landmarks'|'terrain'|'expansion'|'special'|'story'|'states'|'recall'|'rupa'|'clarity'|'fairy'|'luminous'|'divine'|'settlements'|'tavern-interior'|'library-interior';
const atlases:Partial<Record<AtlasName,HTMLImageElement>>={};
const ready=new Set<AtlasName>(),listeners=new Set<()=>void>();
let revision=0;

const sources:Record<AtlasName,string>={
 player:'meditator-wizard-atlas.png',landmarks:'landmarks-atlas.png',terrain:'terrain-atlas.png',
 expansion:'path-expansion-atlas.png',special:'healing-jhana-landmarks.png',story:'fire-kasina-story-props.png',
 states:'recall-awakening-formless.png',recall:'life-recall-environment.png',rupa:'rupa-jhana-canonical.png',
 clarity:'counterfeit-clarity.png',fairy:'fairy-playground-props.png',luminous:'luminous-materials-v2.png',
 divine:'divine-abodes-v2.png',settlements:'library-tavern-v1.png','tavern-interior':'tavern-interior-v2.png',
 'library-interior':'library-interior-v1.png',
};

export function getAtlas(name:AtlasName){
 if(!atlases[name]){
  const image=new Image();atlases[name]=image;
  image.onload=()=>{ready.add(name);revision++;for(const listener of listeners)listener()};
  image.src=`${import.meta.env.BASE_URL}assets/${sources[name]}`;
 }
 return ready.has(name)?atlases[name]??null:null;
}
export function pixelArtRevision(){return revision}
export function onPixelArtReady(listener:()=>void){listeners.add(listener);if(ready.size)queueMicrotask(()=>{if(listeners.has(listener))listener()});return()=>{listeners.delete(listener)}}

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

export function drawClarityCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,x:number,y:number,size:number){
 const cellWidth=image.naturalWidth/2;
 ctx.drawImage(image,column*cellWidth,0,cellWidth,image.naturalHeight,Math.round(x-size/2),Math.round(y-size/2),Math.round(size),Math.round(size));
}

export function drawFairyCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number){
 const cellWidth=image.naturalWidth/4,cellHeight=image.naturalHeight/2;
 ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,Math.round(x-size/2),Math.round(y-size/2),Math.round(size),Math.round(size));
}

export function drawSettlementCell(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number){
 const cellWidth=image.naturalWidth/5,cellHeight=image.naturalHeight/4;
 ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,Math.round(x-size/2),Math.round(y-size/2),Math.round(size),Math.round(size));
}
