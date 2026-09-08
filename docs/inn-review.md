# Quarrelsome Inn review — September 2026

The Inn keeps its five travellers, existing portraits, and v4 pixel-art interior. This pass focuses on consequential conversation, continuity, and readable controls.

## Conversation audit

All 71 scenes, including openings, have at least three replies available without hidden traits. Additional compassionate or equanimous replies remain invisible until available. Choices can teach those traits during the conversation, without showing either meter or a locked-answer list.

The graph tests traverse every non-repeating route twice: once with beginner traits, once with all advanced replies available. They cover all 24 authored endings at both levels.

| Traveller | Beginner routes | Advanced routes |
| --- | ---: | ---: |
| Captain Certainty | 294 | 676 |
| Sister Footnote | 375 | 759 |
| Old Tom | 171 | 238 |
| Mistress Metaphor | 161 | 201 |
| Brother Anecdote | 464 | 648 |
| Total | 1,465 | 2,522 |

That is 3,987 complete paths checked for reachable endings, valid destinations, and finite, bounded stat changes. The tests do not substitute for editorial judgment: the dialogue was also read for continuity, with twelve representative routes checked from opening through outcome.

Representative routes include:

- Old Tom: compare the fruits → include the cost → balance effort → keep a useful road without making it compulsory.
- Old Tom: join the martyr contest → recognize competition → restore the full ledger → hear his companions → repair the story.
- Captain Certainty: dismiss his imagery → acknowledge the mistake → examine the observation → adopt a provisional map.
- Captain Certainty: explore symbolism → distinguish a personal meaning from public authority → let a harmless belief remain. This new branch ends with **A Pocket Square, Not a Flag**.
- Sister Footnote: evade the conflict → recognize care beneath anger → preserve the correction → invite repair.
- Mistress Metaphor: dismiss imagination → repair the dismissal → decline the command → preserve wonder.
- Brother Anecdote: shame the storyteller → acknowledge his experience → share tea without claiming a universal cure.

The Captain no longer answers agreement as though it were a competing revelation. Tom no longer answers agreement as though it were an insult. The fish’s escalating payment now introduces its symbolic coin before increasing the demand. Extra ordinary responses offer different actions—investigation, postponement, practical boundaries, public correction—alongside the Inn’s intentionally foolish choices.

## Consequences and controls

Repeating a scene can recover a conversation but cannot award its positive stat effects again. A third return to the same question ends the circular argument; a twenty-exchange closing time bounds all other loops. Authored non-repeating paths take at most fourteen exchanges.

Failure always loses clarity, even after an initially productive discussion. Clarity gains are capped at 18 for a successful conversation and 6 for a partial one. Leaving before choosing a response is free; leaving after participating produces an unfinished-conversation outcome. An already reached failure cannot be escaped through the Leave button. Result settlement and stale double taps are guarded.

Number keys now activate the numbered replies. Escape follows the same leaving rules as the button. Mobile choices have larger text and touch targets; keyboard focus follows the speaker’s new line. Motion effects respect reduced-motion settings. Endings show changes to the three visible meters only.

## Field notes

Endings link subtly to the relevant [Fire Kasina glossary](https://firekasina.org/glossary/) or [safety recommendations](https://firekasina.org/fire-kasina-safety-recommendations/), verified during this review. These support the themes of patient interest in the Murk, comparison, changing access, and careful handling of instructions or claims. The travellers and their arguments are fictional.

The main-map Red Dot Range description now explains the implemented candle → afterimage → dot → dark absence cycle. Existing luminous-material descriptions, canonical formed-jhāna similes, library links, and the Second Screen replication link were checked against the current interior definitions and retained.

Verification: `node --import ./tests/register-typescript.mjs --test tests/inn-dialogue.test.mjs` — seven tests pass. The source validator reports no structural issues.
