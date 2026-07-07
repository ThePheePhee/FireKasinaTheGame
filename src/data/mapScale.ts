export const SOURCE_WORLD={width:1600,height:1100};
export const MAP_SPACING=1.18;
export const WORLD={width:1888,height:1298};
export const expandPoint=([x,y]:[number,number]):[number,number]=>[WORLD.width/2+(x-SOURCE_WORLD.width/2)*MAP_SPACING,WORLD.height/2+(y-SOURCE_WORLD.height/2)*MAP_SPACING];
export const expandOffset=([x,y]:[number,number]):[number,number]=>[x*MAP_SPACING,y*MAP_SPACING];
