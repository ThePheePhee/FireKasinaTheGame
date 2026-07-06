export interface RegionVisual {artOffset?:[number,number];artSize?:number;labelOffset?:[number,number]}

export const regionVisuals:Record<string,RegionVisual>={
 mist:{labelOffset:[-330,-150]},
 house:{artSize:90,labelOffset:[0,56]},
 garden:{artOffset:[-55,65],artSize:135,labelOffset:[-55,138]},
 'red-dot':{artOffset:[0,5],artSize:95,labelOffset:[0,66]},
 chasm:{artSize:155,labelOffset:[0,92]},
 inn:{artSize:145,labelOffset:[0,90]},
 fireworks:{artSize:140,labelOffset:[0,70]},
 magical:{artSize:140,labelOffset:[0,72]},
 celestial:{artSize:155,labelOffset:[0,82]},
 tower:{artSize:132,labelOffset:[0,72]},
 healing:{artSize:135,labelOffset:[0,70]},
 'life-recall':{artSize:135,labelOffset:[0,76]},
 jhana:{artSize:160,labelOffset:[0,88]},
 formless:{artSize:165,labelOffset:[0,92]},
 trauma:{artSize:135,labelOffset:[0,72]},
 booboo:{artSize:155,labelOffset:[0,86]},
};

export const mistWisps:[number,number,number][]=[
 [385,390,105],
 [1000,285,95],
 [1235,385,100],
 [1170,760,95],
];
