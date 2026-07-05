export interface RegionVisual {artOffset?:[number,number];artSize?:number;labelOffset?:[number,number]}

export const regionVisuals:Record<string,RegionVisual>={
 mist:{labelOffset:[-330,-150]},
 house:{artOffset:[-60,-50],artSize:100,labelOffset:[-60,12]},
 garden:{artOffset:[-55,50],artSize:150,labelOffset:[-55,125]},
 'red-dot':{artOffset:[0,10],artSize:105,labelOffset:[0,78]},
};

export const mistWisps:[number,number,number][]=[
 [385,390,105],
 [1000,285,95],
 [1235,385,100],
 [1170,760,95],
];
