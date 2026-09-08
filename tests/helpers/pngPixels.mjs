import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';

// Read-only fixture decoder: our atlas fixtures are non-interlaced 8-bit RGBA
// PNGs. Keeping this small subset here makes pixel regressions run in CI without
// native image dependencies or a browser. Unsupported formats fail explicitly.
export function readRgbaPng(path){
 const file=readFileSync(path);
 if(!file.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('Expected a PNG fixture');
 let width=0,height=0;const chunks=[];
 for(let cursor=8;cursor<file.length;){
  const length=file.readUInt32BE(cursor),type=file.toString('ascii',cursor+4,cursor+8),data=file.subarray(cursor+8,cursor+8+length);
  if(type==='IHDR'){
   width=data.readUInt32BE(0);height=data.readUInt32BE(4);
   if(data[8]!==8||data[9]!==6||data[10]!==0||data[11]!==0||data[12]!==0)throw new Error('Fixture decoder requires non-interlaced 8-bit RGBA');
  }else if(type==='IDAT')chunks.push(data);
  cursor+=length+12;if(type==='IEND')break;
 }
 if(!width||!height||!chunks.length)throw new Error('Incomplete PNG fixture');
 const stride=width*4,filtered=inflateSync(Buffer.concat(chunks)),pixels=new Uint8Array(stride*height);
 if(filtered.length!==(stride+1)*height)throw new Error('Unexpected PNG scanline length');
 const paeth=(left,up,diagonal)=>{
  const estimate=left+up-diagonal,a=Math.abs(estimate-left),b=Math.abs(estimate-up),c=Math.abs(estimate-diagonal);
  return a<=b&&a<=c?left:b<=c?up:diagonal;
 };
 for(let y=0;y<height;y++){
  const source=y*(stride+1),filter=filtered[source],target=y*stride;
  if(filter>4)throw new Error(`Unknown PNG filter ${filter}`);
  for(let x=0;x<stride;x++){
   const left=x>=4?pixels[target+x-4]:0,up=y?pixels[target+x-stride]:0,diagonal=y&&x>=4?pixels[target+x-stride-4]:0;
   const predictor=filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):filter===4?paeth(left,up,diagonal):0;
   pixels[target+x]=(filtered[source+1+x]+predictor)&255;
  }
 }
 return {width,height,pixels,alphaAt:(x,y)=>pixels[(y*width+x)*4+3]};
}
