export function hashNoise(x:number,y:number){const n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n);}
