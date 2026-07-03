export interface View {x:number;y:number;scale:number}
export function playerCamera(x:number,y:number,cw:number,ch:number,ww:number,wh:number):View{return {x:Math.max(0,Math.min(ww-cw,x-cw/2)),y:Math.max(0,Math.min(wh-ch,y-ch/2)),scale:1};}
export function mapCamera(cw:number,ch:number,ww:number,wh:number):View{const scale=Math.min(cw/ww,ch/wh);return{x:(ww-cw/scale)/2,y:(wh-ch/scale)/2,scale};}
