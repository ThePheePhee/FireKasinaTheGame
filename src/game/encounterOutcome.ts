import type {GameStats} from './gameState';
import type {PracticeKey} from './dynamicWorld';

export type EncounterGrade='success'|'partial'|'failure';
export interface EncounterOutcome {
 grade:EncounterGrade;title:string;copy:string;reason:string;
 stats:Partial<GameStats>;practice:Partial<Record<PracticeKey,number>>;
 unresolved?:string;resolved?:string;
}
export type MistEncounterId='mist'|'booboo'|'chasm'|'inn'|'counterfeit-crags'|'credulous-circuit'|'trauma';
