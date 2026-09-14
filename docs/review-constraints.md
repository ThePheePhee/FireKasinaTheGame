# Retreat review — constraint ledger

Review started 13 September 2026 from `c46947b`, on `codex/retreat-review`.
The initial worktree was clean. This branch must **not be merged or published**.

## Sources and authority

- **Current user brief:** attachment `054a146e-fbd5-426d-9f81-cf64173e7ab6/pasted-text.txt`, “Please comprehensively review and improve…” (13 September).
- **User development history:** the requests retained in this task, including the original map topology, artwork, lore, progression, minigame, mobile, and Chelley experiment instructions.
- **Implementation evidence:** `src/data/`, `src/game/`, components and tests at the starting commit; actual browser inspection.
- **Earlier assistant documentation:** README and `docs/map-art-direction.md`, `path-names.md`, `inn-review.md`, `sprite-frame-boundaries.md`. These describe decisions and verified behavior; they do not override user instructions.

| Constraint or deliberate feature | User source / corroborating implementation |
| --- | --- |
| Explorable, humorous, pixel-art Fire Kasina retreat; Zelda/Pokémon inspiration, small meditator/wizard, recognizable existing art | Earlier user requests for 8-bit environments and whimsical Zelda-like lore; reaffirmed current brief. Assets in `public/assets/` are retained, not replaced wholesale. |
| Game has progression/discovery; Sandbox freely presents the same landscape and interiors without affecting a saved game | Original Game/Sandbox request and current brief; `App.tsx`, shared map/interior data. |
| Start at Your House, with Garden, Library, Tavern of Fortification, Red Dot Range forming the familiar homestead | User explicitly moved the start from the Range to House and later named the five-place homestead; `gameState.ts`, `saveGame.ts`. |
| Mists surround the homestead; difficult encounters are in/at the Mists; outer destinations and their interiors belong outside | Repeated topology requests. Healing lies between Magick and Divine; Life Recall connects Trauma and Healing; Jhāna connects Insight/Magick and leads to Formless; Formless returns to Divine through splendid form. Shared routes and progression classifier corroborate. |
| Named, teachable generation/deconstruction/balance roads, not merely connectors | User requests for path lore and recovery of Artificer-style names; `routes.ts`, `pathContent.ts`, historic commits listed in `path-names.md`. Names may be improved with a reason, not casually discarded. |
| Gates at 35 concentration into Mists; both concentration and at least 80 clarity into Fairy Playground; exploration checkboxes actually maintain the meters | Explicit progression/correction requests; `gameState.ts` and gate tests. These are game rules, not attainment criteria. |
| Red Dot sequence: candle/attention → inverted afterimage → bright red/orange/yellow dot shrinking over about20s → outlined dark absence closing; eyes may reopen; diminishing concentration gains benefit from clarity | Repeated very specific user corrections. Preserve calibrated gain and absence of a “steadiness” meter or verbal gain-speed indicator. `practiceDynamics.ts` and Red Dot component are execution evidence, not independent requirements. |
| Mists drain concentration, obscure vision and may warp the traveller; depletion pulls movement toward the Range; encounters teach clarity | User Game and fog/recovery requests; `PlayerMode.tsx`, `worldProgression.ts`. No time should leak into a hidden map while an encounter/overlay owns input. |
| Trauma remains a meaningful spooky labyrinth; Boohoo is accelerating flight between sadnesses; Despair balances then climbs after falling; Inn is actual branching conversation with consequences | User minigame requests; activity implementations. Recovery matters, not just victory. |
| Inn has five recognizable travellers, coherent branching, at least3 ordinary replies, hidden metta/equanimity-dependent choices without exposing those meters; argument is not wholly bad | Explicit dialogue requests; graph and outcome tests. Preserve the game's origin in Quarrelsome Inn discussions. |
| Walkable, distinct interiors and actual stairs; first Progress-of-Insight arrival begins at first stage; map-mode interiors are browsable and escapable | Explicit rewrite and stair/entry corrections; `interiorMaps.ts`, navigation tests. |
| Resources remain useful teaching material; respect classical texts, practitioner accounts and the user's supplied links, with appropriate framing | User source requests, including canonical formed-jhāna imagery and second-screen replication. Current brief authorizes correcting weak/misleading resource selection. Keep attribution and document unverifiable resources. |
| Main map is called the main map, not “overworld”; title retains the Quarrelsome Inn Christmas2025 origin line | Explicit user wording/provenance requests. |
| Mobile taps read; drags pan; pinches zoom without accidental dialogs; zoom controls keep their anchor | Repeated user interaction corrections and existing gesture tests. |
| Leave historical `ChelleyMode` alone; retain production base path and deployment configuration | User abandoned experiment in favor of main; current brief explicitly preserves deployment and forbids publication. |

## Open design space, not permanent restrictions

Earlier “layout unchanged,” “only small fixes,” and “no structural changes” statements were task-local assistant plans or superseded scopes. The current brief authorizes meaningful layout, interface, editorial and architecture changes. Absolute saved coordinates are an implementation choice: moving places is possible with a migration, not forbidden. Existing tiny fonts, oversized chrome, duplicated controls, immediate-start timers, and disconnected React booleans are not project identity.

We considered (a) a new general game engine, (b) a map-first visual reskin, and (c) a coherent **retreat field guide** around the existing world. We select(c): make the journey understandable, activities safely entered and left, discoveries retrievable, and map/interior navigation legible. Existing pure geometry and mechanics already have useful tests; no evidence currently justifies a general engine rewrite. Spatial changes should solve an observed problem rather than erase recently praised composition.

## Working assumptions / consequential uncertainties

- This is a teaching/game metaphor for curious adults, not clinical treatment or a meditation certification system. The current brief explicitly asks for these distinctions; no new health or attainment claims will be introduced.
- Main remains the static shared landscape, not a revival of dynamic Chelley topology.
- Preserve calibrated practice difficulty. Fix lost rewards and unsafe timing rather than silently increasing gains or changing gates.
- Save portability can be explicit file export/import, with validation and confirmation; no accounts, analytics or remote storage are needed.
- All source checks will distinguish successful content verification, partial retrieval, and blocked/unverified links. No consequential unresolved user conflict has been found at this point.

Implementation outcomes and remaining limitations are recorded in `review-results.md`; resource and subsystem audits have separate linked reports.
