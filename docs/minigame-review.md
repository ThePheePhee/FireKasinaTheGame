# Minigame lifecycle and recovery review

Review branch: `codex/retreat-review`, based on `c46947b`. This review does not merge, push or publish. Scope: the five existing playable activities, their shared lifecycle, input, resource and outcome handling. Game/Sandbox selection, saved journeys and world gates remain App/world responsibilities.

## Constraints recovered from the requests

- Keep the candle → inverted afterimage → bright red/orange/yellow dot → outlined black absence sequence. The dot shrinks continuously over **20 seconds**; only then does the absence close over **10 seconds**. Space can reopen the eyes at any point after closing them. The candle’s activation meter is not a steadiness meter.
- Preserve the already-calibrated concentration curve (`.715` base quality rate), diminishing returns and clarity benefit. Do not add an increase-speed label, a new steadiness meter or a fixed two-cycle gate. The existing 35 concentration / 80 clarity world gates are unchanged.
- Keep low-concentration wandering thoughts inside the visual field; do not turn them into instructions below it. Preserve the pixel-art room, attention ring and dot styling.
- Retain the Trauma labyrinth and its mechanically meaningful symbols: blocked routes, returns, reversed steps, grounding and changing walls. Playing spends concentration; completion gives clarity and integration.
- Lagoon is an accelerating flight between retreat-related mind-shadows, not phone notifications or a claim that sadness must be defeated. Immediate crashes must not earn progress. Genuine passage and breath-lights do.
- Chasm is balance followed, after falling, by a separate recovery climb. A fall is an event, not a permanent verdict. Exhausted play cannot continue indefinitely.
- Inn keeps the five illustrated travelers, real branching conversations, hidden trait requirements, at least three ordinary choices and differentiated outcomes. Metta/equanimity thresholds are not displayed. Leaving cannot erase an argument already entered or a failure already reached.

Sources of these constraints: the supplied comprehensive review brief and earlier requests in this thread; current production behavior in `practiceDynamics.ts`, `traumaMaze.ts`, `innDialogue.ts` and the five components. No new claim of meditation efficacy is made by the activity instructions. The resource/editorial audit is separate.

## Defects found and changes made

| Area | Evidence in the prior implementation | Resolution |
| --- | --- | --- |
| Starting/pausing | Red Dot and Trauma ran immediately; the other activities had inconsistent implicit starts and no deliberate pause UI. Inn Escape abandoned an exchange. | Every activity now has a named ready screen, explicit Begin, visible Pause, Escape/P pause/resume and a deliberate leave action. A paused Inn conversation resumes the same node. |
| Focus loss | Hidden-tab checks did not cover ordinary window blur; several clocks used wall time, and clearing keys alone did not stop costs or physics. | A synchronous shared controller stops input and simulation on blur or hidden document and requires explicit resume. Active elapsed clocks drive Lagoon gap sway, Red Dot distractions and Chasm grab timing. Ready/paused/finished activities cancel their animation loops rather than polling every frame. |
| Held controls | Pointer releases could overwrite keyboard direction; focused Space could also trigger a global activity shortcut. | Separate held pointer/keyboard tokens, pointer capture/cancel/lost-capture/blur cleanup, focused-button shortcut ownership, and keyboard-operable held buttons. Assistive single clicks can nudge Red Dot attention or Chasm lean. |
| Lagoon rewards | Retry reset scores before applying them; retreat discarded earned progress; completion callbacks could be repeated. | One receipt per flight. Learning settles on collision/exhaustion, or voluntary leave, exactly once. Retry starts a fresh ready screen after retaining the old receipt. Crashing immediately still gives zero reward. |
| Lagoon resize | The bird was clamped to `height - 24`, past the collision threshold `height - 29`; shrinking the viewport could place it in an unavoidable collision. | Preserve the bird’s proportional height and keep its center inside the playable bounds when measuring the field. |
| Chasm outcomes | One exit awarded a finished outcome while the generic retreat button did not; repeated finish calls could reapply it. | Crossing/recovery settle immediately through one receipt. Every exit flushes current resources, without recalculating or losing the outcome. |
| Trauma input | Position state used asynchronous render snapshots for successive grid steps. | The authoritative maze state advances synchronously before render. One completed route gets one completion reward; a completed/exhausted session accepts no further movement. |
| Inn settlement | A reached outcome only changed stats after pressing its specific return button. | Consequences settle once when reached. Leaving mid-conversation first resolves the unfinished exchange, then shows the outcome. A later return never applies it again. |
| Stat echoes | Parent echoes could replace newer sub-frame progress; effect cleanup could publish during StrictMode rehearsal. | Shared stat bridge ignores the last echoed snapshot while retaining sub-frame progress, adopts genuinely external changes, and flushes explicitly on leave. Effect cleanup only clears input and cancels work. |

No new visual assets, concentrations rates, maze topology, conversation graph structure, gate thresholds or save keys were introduced by this lifecycle work. Existing graphics remain. New chrome uses the game’s square pixel borders, palette and fonts. Touch targets have a 44-pixel minimum; the shared ready/pause dialog traps focus and makes the underlying activity inert.

## Verification

- `tests/minigame-session.test.mjs`: eight production-code tests cover ready/running/paused/terminal transitions, same-run resumption, exactly-once Lagoon/Chasm receipts, immediate-crash and exhaustion behavior, shortcut ownership, all five ready screens, and the unchanged Red Dot curve/timing.
- Existing `tests/gameplay.test.mjs` still exercises the actual world gates and safe return routes, calibrated practice, frame-rate-independent damping, Lagoon learning and a complete solvable Trauma route.
- Existing Inn graph tests traverse every simple conversational route at ordinary and elevated hidden traits, validate bounded effects, unfinished/failure exits and stale replies.
- Follow-up walking-control review found the same shared touch/keyboard ownership bug in `PlayerMode` and `InteriorMode`. Both now use the pure `movementInput.ts` controller. Its six tests cover independent owners, interruption clearing, frame-rate-independent accessible nudges, unchanged speed, real mist gates and furniture collisions. Button activation goes through normal movement rules rather than editing coordinates.
- Production TypeScript/Vite build passes. The complete integrated suite passes **123/123 tests**, including the walking-control follow-up.
- Interactive browser verification is performed by the parent agent: this worker cannot access the parent’s attached browser. Do not interpret the unit tests as having verified visual layout or real input dispatch. The QA route checklist below is supplied for that verification.
- Parent mobile QA found the lit room showing through during closed-eye practice. Closed-eye phases now remove the room background directly, in addition to the dark shade; the original candle room returns on reopening the eyes. Mobile phase captions stack heading above full-width instructions. These fixes do not change the dot sequence or gain.

## Interactive QA checklist

Use dev-only `?qa=red-dot`, `?qa=trauma`, `?qa=lagoon`, `?qa=chasm`, `?qa=inn` on the local review server. These QA fixtures do not write the saved journey.

1. On every ready screen, wait: there must be no movement, resource cost or keyboard reply selection. Begin should focus the activity, and Leave should always work.
2. Start, pause with the button and with Escape/P. Wait, then resume: state and resources should match. Switch to another tab/window: returning should show Paused, not running play. Hold an arrow while pausing; resumption must not inherit it.
3. Red Dot: center the ring, activate the visual field, close eyes, reopen early, then repeat through afterimage/dot/absence. Pause during the dot; the timer must not expire while paused. Space on a focused Pause/Resume/Leave button must activate that button, not close/open eyes underneath it.
4. Trauma: use arrows and click/tap directions, touch the reset/shift/reversal symbols, and complete the known grounding route. Pausing must not drain concentration. Completion should award once; zero concentration should expose a working retreat.
5. Lagoon: pass a shadow or take a breath-light, fail, retry, and leave. The first flight’s learning should remain exactly once. An immediate second crash adds nothing. Repeated Return clicks cannot award again. Pause midflight and compare the shadow gaps before and after. Rotate the viewport without placing the bird outside its legal field.
6. Chasm: Begin, deliberately hold one side to fall, then alternate holds with at least 280 ms between grabs. Pause during falling or climbing. Complete recovery and use either return control: the same learning must be kept. A depleted lantern stops play.
7. Inn: Begin, follow number/button choices, pause mid-branch, resume, reach success/partial/failure and compare displayed stat changes with the returned HUD. Leave an unfinished exchange and inspect its consequence. Hidden responses and trait amounts must remain hidden.

## Remaining limits

- The analog minigames still use their original random disturbances and difficulty curves. This pass fixes lifecycle/accounting rather than claiming statistical play-balancing from unit tests.
- Activity transient position/flight/maze progress is not saved across a full browser reload. Already-published character resources and settled outcomes are App save responsibilities. Explicit Pause, rather than closing the page, preserves an in-progress attempt.
- Optional exploration assists can intentionally replenish concentration through the parent stat bridge. That is a testing/exploration facility, not a minigame reward.
