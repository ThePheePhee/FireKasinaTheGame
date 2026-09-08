/**
 * Hand-authored sampling gutters for legacy sprite sheets. Some paintings cross
 * the nominal grid: the next cell then contains a sliver of its neighbour.
 * Gutters are measured in pixels of the original 512px sheet. They alter the
 * sample, not the sprite's placement or scale. Unlisted cells stay untouched.
 */
interface FrameTrim {top?:number;right?:number;bottom?:number;left?:number}
export const ATLAS_FRAME_TRIMS:Readonly<Record<string,Readonly<Record<string,FrameTrim>>>>={
 landmarks:{
  '0,1':{top:4},'1,1':{top:4},'2,1':{top:4},'3,1':{top:4},
  '0,2':{top:3},'1,2':{top:3},'2,2':{top:5},'3,2':{top:6},
 },
 expansion:{
  '2,0':{left:8},
  '0,1':{top:10},'1,1':{top:9},'2,1':{top:8,right:3},'3,1':{top:5},
  '2,2':{top:2},
 },
};

export interface AtlasFrame {
 sx:number;sy:number;sw:number;sh:number;
 offsetX:number;offsetY:number;scaleX:number;scaleY:number;
}

export function atlasFrame(name:string,column:number,row:number,imageWidth:number,imageHeight:number,columns=4,rows=4):AtlasFrame {
 const cellWidth=imageWidth/columns,cellHeight=imageHeight/rows;
 const trim=ATLAS_FRAME_TRIMS[name]?.[`${column},${row}`];
 const left=(trim?.left??0)*imageWidth/512,right=(trim?.right??0)*imageWidth/512;
 const top=(trim?.top??0)*imageHeight/512,bottom=(trim?.bottom??0)*imageHeight/512;
 return {sx:column*cellWidth+left,sy:row*cellHeight+top,sw:cellWidth-left-right,sh:cellHeight-top-bottom,
  offsetX:left/cellWidth,offsetY:top/cellHeight,scaleX:1-(left+right)/cellWidth,scaleY:1-(top+bottom)/cellHeight};
}
