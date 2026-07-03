import {mapRegions,WORLD,type Region,type TerrainType} from '../data/mapRegions';
import {routes} from '../data/routes';import {drawRoutes} from './drawRoutes';import {hashNoise} from '../engine/terrainEffects';
const colors:Record<TerrainType,string>={home:'#d7773d',garden:'#79a84c',range:'#b58a50',mist:'#778995',lagoon:'#527f76',tunnel:'#55475d',peak:'#9e4938',tower:'#788da0',hills:'#9ebd55',void:'#171831',meadow:'#7dbd71',celestial:'#b8d9d5',magical:'#844f87'};
function blob(ctx:CanvasRenderingContext2D,r:Region){ctx.save();ctx.fillStyle=colors[r.terrain];ctx.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=r.radius*(.83+hashNoise(i,r.x)*.24),x=r.x+Math.cos(a)*rr,y=r.y+Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.restore();}
function landmark(ctx:CanvasRenderingContext2D,r:Region){ctx.save();ctx.translate(r.x,r.y);ctx.fillStyle='#f5d67a';
 if(r.terrain==='home'){ctx.fillStyle='#7b3d2b';ctx.fillRect(-26,-20,52,40);ctx.fillStyle='#dc7037';ctx.beginPath();ctx.moveTo(-34,-20);ctx.lineTo(0,-48);ctx.lineTo(34,-20);ctx.fill();ctx.fillStyle='#ffd66b';ctx.fillRect(-7,4,14,16)}
 if(r.terrain==='range'){ctx.fillStyle='#e8d8a8';ctx.fillRect(-32,18,64,4);ctx.fillStyle='#842d2b';ctx.fillRect(13,-20,5,38);ctx.fillStyle='#f1d7a4';ctx.fillRect(3,-29,24,24);ctx.fillStyle='#df3434';ctx.fillRect(10,-22,10,10)}
 if(r.terrain==='tower'){ctx.fillStyle='#e0d2ad';ctx.fillRect(-25,-55,50,85);ctx.fillStyle='#596379';ctx.fillRect(-34,-65,68,18);ctx.fillStyle='#ffdf72';ctx.fillRect(-6,-35,12,18)}
 if(r.terrain==='peak'){ctx.fillStyle='#4b3f49';ctx.beginPath();ctx.moveTo(-65,45);ctx.lineTo(0,-55);ctx.lineTo(70,45);ctx.fill();ctx.fillStyle='#f0643e';ctx.fillRect(-12,-58,24,18);for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#ffd966':'#ec5f67';ctx.fillRect(Math.cos(i)*50,-75+Math.sin(i)*30,6,6)}}
 if(r.terrain==='celestial'){ctx.fillStyle='#f5f0c4';for(let i=-2;i<3;i++)ctx.fillRect(i*30-25,Math.abs(i)*8-18,50,24)}
 if(r.terrain==='hills'){ctx.strokeStyle='#f1e37b';ctx.lineWidth=10;ctx.beginPath();ctx.arc(0,0,70,Math.PI,0);ctx.stroke();}
 if(r.terrain==='void'){ctx.fillStyle='#c9b9ff';for(let i=0;i<18;i++)ctx.fillRect(hashNoise(i,4)*210-105,hashNoise(i,8)*180-90,4,4)}
 if(r.terrain==='magical'){ctx.strokeStyle='#f19fe7';ctx.lineWidth=7;ctx.strokeRect(-38,-38,76,76);ctx.rotate(Math.PI/4);ctx.strokeRect(-28,-28,56,56)}ctx.restore();}
export function drawMap(ctx:CanvasRenderingContext2D,showLabels:boolean){ctx.fillStyle='#374f3a';ctx.fillRect(0,0,WORLD.width,WORLD.height);
 for(let y=10;y<WORLD.height;y+=32)for(let x=10;x<WORLD.width;x+=32){const n=hashNoise(x,y);ctx.fillStyle=n>.7?'#426043':'#314a35';ctx.fillRect(x+(n*8|0),y,3,8)}
 const garden=mapRegions.find(r=>r.id==='garden')!;blob(ctx,garden);drawRoutes(ctx,routes);for(const r of mapRegions.filter(r=>r.id!=='garden'))blob(ctx,r);for(const r of mapRegions)landmark(ctx,r);
 if(showLabels){ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.textBaseline='top';for(const r of mapRegions){const y=r.y+(r.terrain==='house'?28:Math.min(r.radius*.55,75));ctx.fillStyle='rgba(20,18,20,.75)';const w=ctx.measureText(r.name).width+12;ctx.fillRect(r.x-w/2,y-3,w,23);ctx.fillStyle='#fff1bb';ctx.fillText(r.name,r.x,y)}}}
