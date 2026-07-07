export interface LoreReference{label:string;url:string}

const site='https://firekasina.org/';
const glossary='https://firekasina.org/glossary/';
const safety='https://firekasina.org/fire-kasina-safety-recommendations/';
const book='https://firekasina.org/fire-kasina-book/';

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
 tower:[{label:'Insight & Awakening',url:site}],
 jhana:[{label:'Canonical Jhāna Similes · DN 2',url:'https://www.accesstoinsight.org/ati/tipitaka/dn/dn.02.0.than.html'},{label:'Jhāna & Concentration',url:book}],
 formless:[{label:'The Fire Kasina Book',url:book}],
 healing:[{label:'Grounding the Journey',url:safety}],
 'life-recall':[{label:'Memory & Integration',url:'https://firekasina.org/wp-content/uploads/2017/11/the-fire-kasina.pdf'}],
 'counterfeit-crags':[{label:'Expectations & Comparison',url:safety}],
 'credulous-circuit':[{label:'Expectations & Comparison',url:safety}],
 celestial:[{label:'Fourth Screen & Entities',url:glossary}],
 magical:[{label:'Magickal Realms',url:glossary}],
};
