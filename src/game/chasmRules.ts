import type {GameStats} from './gameState';

export type ChasmOutcome='crossed'|'recovered';

/** Only reaching an anchor earns learning; falling and leaving are not rewards. */
export function chasmOutcomeReward(outcome:ChasmOutcome):Partial<GameStats>{
 return outcome==='recovered'
  ?{clarity:14,confusion:-15,equanimity:7,integration:6}
  :{clarity:9,confusion:-9,equanimity:4,integration:2};
}
