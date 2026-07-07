import type {DiscoveryPoint} from '../game/gameState';

let fogCanvas:HTMLCanvasElement|null=null;
function surface(width:number,height:number){if(!fogCanvas)fogCanvas=document.createElement('canvas');const w=Math.max(1,Math.ceil(width)),h=Math.max(1,Math.ceil(height));if(fogCanvas.width!==w)fogCanvas.width=w;if(fogCanvas.height!==h)fogCanvas.height=h;return fogCanvas}
function reveal(mask:CanvasRenderingContext2D,x:number,y:number,radius:number,softness=.24){const gradient=mask.createRadialGradient(x,y,Math.max(0,radius*(1-softness)),x,y,radius);gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(1,'rgba(0,0,0,0)');mask.fillStyle=gradient;mask.beginPath();mask.arc(x,y,radius,0,Math.PI*2);mask.fill()}

export function drawFogOfWar(ctx:CanvasRenderingContext2D,width:number,height:number,cameraX:number,cameraY:number,discovery:DiscoveryPoint[],playerX:number,playerY:number,inMist:boolean,time:number){
 const canvas=surface(width,height),mask=canvas.getContext('2d')!;mask.clearRect(0,0,canvas.width,canvas.height);mask.globalCompositeOperation='source-over';mask.fillStyle='rgba(7,9,15,.95)';mask.fillRect(0,0,canvas.width,canvas.height);mask.globalCompositeOperation='destination-out';
 for(const point of discovery){const x=point.x-cameraX,y=point.y-cameraY;if(x+point.radius<0||y+point.radius<0||x-point.radius>width||y-point.radius>height)continue;reveal(mask,x,y,point.radius,inMist?.14:.22)}
 reveal(mask,playerX-cameraX,playerY-cameraY,inMist?84:148,inMist?.1:.28);mask.globalCompositeOperation='source-over';mask.globalAlpha=.36;mask.fillStyle='#aebbc0';for(let i=0;i<75;i++){const x=(i*233+Math.sin(time/1600+i)*34+width)%width,y=(i*137+Math.cos(time/1900+i)*28+height)%height;mask.fillRect(x,y,2+(i%3),2)}mask.globalAlpha=1;ctx.drawImage(canvas,0,0,width,height)
}

export function drawMistVeil(ctx:CanvasRenderingContext2D,width:number,height:number,time:number,confusion:number){
 ctx.save();ctx.fillStyle=`rgba(160,174,181,${.08+confusion/900})`;ctx.fillRect(0,0,width,height);ctx.globalAlpha=.12+confusion/700;
 for(let i=0;i<18;i++){const x=(i*127+time*.018*(i%2?1:-1)+width)%width,y=(i*79+Math.sin(time/900+i)*35+height)%height,r=55+(i%5)*18,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(225,230,224,.55)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 ctx.restore();
}
