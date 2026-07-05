export interface MapProp {
 id:string; name:string; x:number; y:number; size:number; art:[number,number]; copy:string;
 reference:{label:string;url:string};
}

export const mapProps:MapProp[]=[
 {id:'two-cups',name:'The Two Cups Shrine',x:1010,y:275,size:70,art:[0,0],copy:'Two cups, one small heart, and a message almost too obvious for an oracle: LOVE. The card offers no footnotes. Perhaps, for once, none are needed.',reference:{label:'Lisett’s Thailand diary',url:'https://firekasina.org/diaries/thailand-summer-2023/diary-lisett/'}},
 {id:'borrowed-nimitta',name:'The Basket of Borrowed Nimittas',x:575,y:430,size:72,art:[1,0],copy:'A rainbow dot wriggles in the basket. Another traveler may have “borrowed” it during a suspiciously synchronized sit. Return it, keep it, or discover that mind was never very strict about ownership.',reference:{label:'Lisett’s Thailand diary',url:'https://firekasina.org/diaries/thailand-summer-2023/diary-lisett/'}},
 {id:'airport-guide',name:'The Stickered Guidepost',x:1180,y:245,size:66,art:[2,0],copy:'A guide once appeared holding the right destination, covered the travelers in stickers, and led them through every gate. Sometimes magick wears an airport lanyard.',reference:{label:'Lisett’s Thailand diary',url:'https://firekasina.org/diaries/thailand-summer-2023/diary-lisett/'}},
 {id:'ripple-pool',name:'The Ripple Pool',x:1140,y:360,size:76,art:[3,0],copy:'Lines cross the water. Ripples answer them. A steady gaze can make almost anything a door—but the pool recommends playfulness over wrestling.',reference:{label:'Lisett’s Thailand diary',url:'https://firekasina.org/diaries/thailand-summer-2023/diary-lisett/'}},
 {id:'desert-spirit',name:'The Desert Spirit’s Door',x:510,y:170,size:88,art:[4,0],copy:'A great figure steps through a wall, regards the meditators with grave approval, and departs without explaining itself. The desert has excellent timing and terrible documentation.',reference:{label:'Gabe’s Joshua Tree diary',url:'https://firekasina.org/diaries/joshua-tree-retreat-2016/diary-gabe-miller/'}},
 {id:'arcadian-gate',name:'The Arcadian Gate',x:1180,y:115,size:82,art:[0,1],copy:'Beyond the gate lies a garden gentler than memory. Enter with compassion as your quest-marker; marvelous sights are better when they teach the heart where to point.',reference:{label:'Gabe’s Joshua Tree diary',url:'https://firekasina.org/diaries/joshua-tree-retreat-2016/diary-gabe-miller/'}},
 {id:'two-color-banner',name:'The Ebbing Banner',x:340,y:190,size:64,art:[1,1],copy:'Orange advances. Violet retreats. Then they trade places like a tide inside the visual field. The banner calls this “ebbing”; it refuses to hold still for a portrait.',reference:{label:'2015 retreat summary',url:'https://firekasina.org/2015/02/17/retreat-summary/'}},
 {id:'parallax-window',name:'The Parallax Window',x:390,y:410,size:72,art:[2,1],copy:'The mountains shift behind one another although the window is flat. Depth, it seems, is another clever tale told by nearby colors.',reference:{label:'2015 retreat summary',url:'https://firekasina.org/2015/02/17/retreat-summary/'}},
 {id:'living-procession',name:'The Procession of Little Images',x:720,y:285,size:82,art:[3,1],copy:'Tiny lantern-folk march past with plans of their own. Low-resolution does not mean low ambition. One bows; another appears to be late for a vision.',reference:{label:'Tower of Hallbar summaries',url:'https://firekasina.org/diaries/the-tower-of-halbar-retreat-2015/retreat-summaries-part-i-ii/'}},
 {id:'comparison-mirror',name:'The Mirror of Other People’s Fireworks',x:945,y:890,size:70,art:[4,1],copy:'The mirror shows everyone else’s best retreat and none of their difficult afternoons. Fortunately, it is cracked. Your own path is still visible through the gap.',reference:{label:'Fire Kasina safety recommendations',url:'https://firekasina.org/fire-kasina-safety-recommendations/'}},
];

export const ambientProps:{x:number;y:number;size:number;art:[number,number];alpha:number}[]=[
 {x:170,y:360,size:42,art:[3,1],alpha:.72},{x:430,y:710,size:38,art:[1,1],alpha:.62},
 {x:790,y:850,size:35,art:[3,1],alpha:.58},{x:1335,y:420,size:38,art:[1,0],alpha:.58},
 {x:1380,y:760,size:42,art:[2,1],alpha:.58},{x:140,y:825,size:36,art:[1,0],alpha:.55},
];
