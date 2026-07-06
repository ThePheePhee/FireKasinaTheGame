export interface RegionVisual {artOffset?:[number,number];artSize?:number;labelOffset?:[number,number]}

export const regionVisuals:Record<string,RegionVisual>={
 mist:{labelOffset:[-330,-150]},
 house:{artOffset:[-60,-50],artSize:100,labelOffset:[-60,12]},
 garden:{artOffset:[-55,50],artSize:150,labelOffset:[-55,125]},
 'red-dot':{artOffset:[0,10],artSize:105,labelOffset:[0,78]},
 chasm:{artSize:175,labelOffset:[0,110]},
 inn:{artSize:165,labelOffset:[0,105]},
 fireworks:{artSize:155,labelOffset:[0,78]},
 magical:{artSize:155,labelOffset:[0,82]},
 celestial:{artSize:175,labelOffset:[0,92]},
 tower:{artSize:145,labelOffset:[0,82]},
 healing:{artSize:150,labelOffset:[0,78]},
 'life-recall':{artSize:150,labelOffset:[0,86]},
 jhana:{artSize:175,labelOffset:[0,96]},
 formless:{artSize:180,labelOffset:[0,100]},
 trauma:{artSize:150,labelOffset:[0,82]},
 booboo:{artSize:170,labelOffset:[0,96]},
};

export const mistWisps:[number,number,number][]=[
 [385,390,105],
 [1000,285,95],
 [1235,385,100],
 [1170,760,95],
];
