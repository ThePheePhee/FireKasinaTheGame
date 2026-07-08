import type {ScreenMode} from '../game/dynamicWorld';

export function drawDynamicScreen(ctx:CanvasRenderingContext2D,width:number,height:number,mode:ScreenMode,time:number){
 if(mode==='ordinary')return;ctx.save();
 if(mode==='first'){const shade=ctx.createRadialGradient(width/2,height/2,65,width/2,height/2,Math.max(width,height)*.7);shade.addColorStop(0,'transparent');shade.addColorStop(.48,'rgba(8,7,12,.2)');shade.addColorStop(1,'rgba(5,4,9,.78)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height)}
 if(mode==='second'){ctx.globalAlpha=.12;for(let y=0;y<height;y+=18)for(let x=0;x<width;x+=18){const wave=Math.sin(x*.04+y*.025+time*.001);ctx.fillStyle=wave>0?'#d887e1':'#75c9bc';ctx.fillRect(x,y,3+Math.abs(wave)*5,3)}ctx.strokeStyle='#f5d57c44';ctx.lineWidth=2;for(let r=80;r<Math.max(width,height);r+=95){ctx.beginPath();ctx.arc(width/2,height/2,r+Math.sin(time*.001+r)*9,0,Math.PI*2);ctx.stroke()}}
 if(mode==='third'){ctx.globalAlpha=.14;for(let i=0;i<4;i++){const x=(i+1)*width/5+Math.sin(time*.0007+i)*30,y=height*(.28+(i%2)*.34),gradient=ctx.createRadialGradient(x,y,5,x,y,100);gradient.addColorStop(0,i%2?'#9de7c7':'#ffd49d');gradient.addColorStop(1,'transparent');ctx.fillStyle=gradient;ctx.fillRect(x-110,y-110,220,220)}}
 if(mode==='fourth'){const edge=ctx.createRadialGradient(width/2,height/2,Math.min(width,height)*.28,width/2,height/2,Math.max(width,height)*.72);edge.addColorStop(0,'rgba(255,238,183,.04)');edge.addColorStop(.7,'rgba(53,31,70,.08)');edge.addColorStop(1,'rgba(8,5,18,.55)');ctx.fillStyle=edge;ctx.fillRect(0,0,width,height);ctx.globalAlpha=.24;for(let i=0;i<35;i++){ctx.fillStyle=i%3?'#ffe290':'#b9a4ff';ctx.fillRect((i*173+time*.012)%width,(i*97)%height,2+(i%3),2+(i%3))}}
 ctx.restore();
}
