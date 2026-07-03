import type {Route} from '../data/routes';
export function drawRoutes(ctx:CanvasRenderingContext2D,routes:Route[]){
 for(const route of routes){ctx.save();ctx.beginPath();route.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.lineWidth=route.kind==='bridge'?14:8;ctx.strokeStyle={rail:'#3e3130',tram:'#d49b45',tunnel:'#6e4f72',bridge:'#b88750'}[route.kind];ctx.setLineDash(route.kind==='tunnel'?[13,12]:route.kind==='rail'?[3,10]:[]);ctx.stroke();
  if(route.kind==='rail'){ctx.lineWidth=2;ctx.strokeStyle='#e0c38f';ctx.setLineDash([2,10]);ctx.stroke();}ctx.restore();}
}
