export interface LoreReference{label:string;url:string}

const site='https://firekasina.org/';
const glossary='https://firekasina.org/glossary/';
const safety='https://firekasina.org/fire-kasina-safety-recommendations/';
const book='https://firekasina.org/fire-kasina-book/';

// Primary sources shared by the main map and the walkable rooms. These are
// sources for particular traditions/reports, not endorsements of every claim.
export const loreSources={
 glossary:{label:'Fire Kasina glossary · reported phenomena',url:glossary},
 safety:{label:'Fire Kasina · community safety guidance',url:safety},
 characteristics:{label:'MCTB · Three Characteristics',url:'https://www.mctb.org/mctb2/table-of-contents/part-i-the-fundamentals/5-the-three-characteristics/'},
 progress:{label:'MCTB · Progress of Insight',url:'https://www.mctb.org/mctb2/table-of-contents/part-iv-insight/30-the-progress-of-insight/'},
 fruition:{label:'MCTB · Fruition and discontinuity',url:'https://www.mctb.org/mctb2/table-of-contents/part-iv-insight/30-the-progress-of-insight/15-fruition/'},
 awakening:{label:'MCTB · Four-Path Model & critique',url:'https://www.mctb.org/mctb2/table-of-contents/part-v-awakening/37-models-of-the-stages-of-awakening/the-theravada-four-path-model/'},
 kasina:{label:'MCTB · Kasina Practice',url:'https://www.mctb.org/mctb2/table-of-contents/part-iii-the-samatha-jhanas/29-kasina-practice/'},
 rupa:{label:'DN 2 · The four jhāna similes',url:'https://www.dhammatalks.org/suttas/DN/DN02.html'},
 jhana:{label:'MCTB · Concentration states',url:'https://www.mctb.org/mctb2/table-of-contents/part-iii-the-samatha-jhanas/27-the-concentration-states-shamatha-jhanas/'},
 slam:{label:'MCTB · An advanced practice account',url:'https://www.mctb.org/mctb2/table-of-contents/part-vi-my-spiritual-quest/54-the-middle-paths/slam-shifting-nanas-and-jhanas/'},
 formless:{label:'MCTB · The Formless Realms',url:'https://www.mctb.org/mctb2/table-of-contents/part-iii-the-samatha-jhanas/28-the-formless-realms/'},
 brahmaviharas:{label:'MCTB · The four brahmavihāras',url:'https://www.mctb.org/mctb2/table-of-contents/part-vi-my-spiritual-quest/68-magick-and-the-brahma-viharas/the-brahma-viharas/'},
 lisett:{label:'Lisett’s diary · a personal retreat account',url:'https://firekasina.org/diaries/thailand-summer-2023/diary-lisett/'},
 book:{label:'The Fire Kasina · retreat book',url:book},
} satisfies Record<string,LoreReference>;

export const presentationReferences:Partial<Record<string,LoreReference[]>>={
 'fairy-playground':[{label:'The Fire Kasina Journey',url:site},{label:'Grounding & Return',url:safety}],
 house:[{label:'Fire Kasina',url:site}],
 garden:[{label:'Practice Overview',url:site}],
 library:[{label:'Fire Kasina',url:'https://firekasina.org/'},{label:'Mastering the Core Teachings of the Buddha',url:'https://www.mctb.org/'},{label:'Keep Silence',url:'https://keepsilence.org/'}],
 'red-dot':[{label:'The Dot',url:glossary}],
 mist:[{label:'The Murk',url:glossary}],
 booboo:[{label:'Grounding & Safety',url:safety}],
 trauma:[{label:'Traveller’s Safety',url:safety}],
 chasm:[{label:'Grounding & Safety',url:safety}],
 inn:[{label:'Patience, Faith & Curiosity',url:glossary}],
 fireworks:[{label:'Fire & Flares',url:glossary}],
 tower:[loreSources.progress,loreSources.awakening],
 jhana:[loreSources.rupa,loreSources.jhana],
 formless:[loreSources.formless],
 healing:[{label:'Grounding the Journey',url:safety}],
 'life-recall':[loreSources.lisett,{label:'The Fire Kasina · retreat book (PDF)',url:'https://firekasina.org/wp-content/uploads/2017/11/the-fire-kasina.pdf'}],
 'counterfeit-crags':[{label:'Expectations & Comparison',url:safety}],
 'credulous-circuit':[{label:'Expectations & Comparison',url:safety}],
 celestial:[{label:'Fourth Screen & Entities',url:glossary}],
 magical:[{label:'Magickal Realms',url:glossary}],
};
