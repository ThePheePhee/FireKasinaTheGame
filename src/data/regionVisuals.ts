export interface RegionVisual {artOffset?:[number,number];artSize?:number;labelOffset?:[number,number];labelLines?:string[];labelSize?:number}

export const regionVisuals:Record<string,RegionVisual>={
 'fairy-playground':{labelOffset:[0,515],labelLines:['The Fairy Playground']},
 mist:{labelOffset:[-502,-55],labelLines:['The Mists of','Purification']},
 house:{artSize:90,labelOffset:[0,56]},
 garden:{artOffset:[-48,88],artSize:135,labelOffset:[-48,164]},
 'red-dot':{artOffset:[0,5],artSize:95,labelOffset:[0,66]},
 chasm:{artSize:155,labelOffset:[0,92]},
 inn:{artSize:145,labelOffset:[0,90]},
 fireworks:{artSize:140,labelOffset:[0,70]},
 magical:{artSize:140,labelOffset:[0,72]},
 celestial:{artSize:155,labelOffset:[0,82]},
 tower:{artSize:132,labelOffset:[0,72]},
 healing:{artSize:135,labelOffset:[0,70]},
 'life-recall':{artSize:135,labelOffset:[30,76]},
 'counterfeit-crags':{artSize:112,labelOffset:[-18,68],labelLines:['Crags of','Counterfeit Clarity']},
 'credulous-circuit':{artOffset:[-16,-18],artSize:90,labelOffset:[-16,-115],labelSize:14,labelLines:['Credulous','Clarity Circuit']},
 jhana:{artSize:160,labelOffset:[0,88]},
 formless:{artSize:165,labelOffset:[0,92]},
 trauma:{artSize:135,labelOffset:[0,72]},
 booboo:{artSize:155,labelOffset:[0,86]},
 library:{artSize:115,labelOffset:[0,62],labelLines:['The Lantern','Library']},
 'fortification-tavern':{artOffset:[16,12],artSize:110,labelOffset:[28,-100],labelSize:14,labelLines:['Tavern of','Fortification']},
};

const baseMistWisps:[number,number,number][]=[
 [385,390,105],
 [1000,285,95],
 [1235,385,100],
 [1170,760,95],
];
export const mistWisps:[number,number,number][]=baseMistWisps.map(([x,y,size])=>{const [nextX,nextY]=expandPoint([x,y]);return[nextX,nextY,size]});

export const fairyDecorations=([
 [0,0,75,315,76],[1,0,355,90,68],[2,0,850,42,64],[3,0,1555,405,70],
 [0,1,65,900,74],[1,1,760,1055,74],[2,1,1190,1055,70],[3,1,1555,690,74],
] as [number,number,number,number,number][]).map(([column,row,baseX,baseY,size])=>{const [x,y]=expandPoint([baseX,baseY]);return{art:[column,row] as [number,number],x,y,size}});
import {expandPoint} from './mapScale';
