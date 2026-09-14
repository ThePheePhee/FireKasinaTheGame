# Retreat review — implemented result

Started 13 September 2026; final verification 14 September 2026.
Branch: `codex/retreat-review`, based on `c46947b` from `main`.
The worktree was clean before review. **No merge, push or publication.**

## Direction and rationale

The coherent direction is a **retreat field guide around the existing game**:
orient the traveller, make each encounter deliberately entered and safely paused,
and make discoveries useful after the moment of discovery. A general engine
rewrite and a wholesale map reskin were considered but rejected: neither was
needed to fix the observed problems, and the recently praised shared composition
already has meaningful physical connections and useful geometry tests.

The sourced [constraint ledger](review-constraints.md) distinguishes user intent
from superseded assistant task plans. It was written before runtime changes.

## Major changes

- **Journal and onboarding.** A short three-part introduction explains practice,
  exploration and return. The searchable Field Journal is generated from the
  canonical world data: Game shows discoveries and actually read pages; Sandbox
  shows the full teaching catalogue. It has no travel or activity-launch actions,
  so reading cannot bypass fog, gates, stairs or physical encounters.
- **Map/interior navigation.** Places and Named Paths guides share the same
  locate/read distinction. The area atlas pairs a real whole-floor view with a
  complete directory, beside the map on desktop and below it on tall phones.
  Locate gives tiny places a useful close-up. Walking has an Area Map with the
  wizard's actual position; browsing another floor never teleports the character.
- **Predictable activity lifecycle.** All five activities use explicit ready,
  running, paused, finished and closed states. Blur/hidden-document pauses require
  deliberate continuation. Active-time clocks exclude pauses. Main-world walking
  remains unmounted behind encounters, preventing mist drain and warp leakage.
  Paused/finished activity animation loops stop rather than polling continuously.
- **Outcomes and controls.** Lagoon learning survives retry/retreat and settles
  once per flight. Chasm completion/retreat flush the same result. Inn unfinished
  exits retain consequences. Touch and physical keys have separate ownership;
  cancellation cannot release someone else's held direction. Accessible button
  clicks nudge through the ordinary gate/collision rules, not direct coordinates.
- **Local save portability.** Version-1 saves gain an optional, whitelisted
  notebook. Older saves still load. Export/import uses a fixed local format,
  size limit, defensive parsing and an explicit restore confirmation. Imported
  content cannot inject lore or links: those always come from authored data.
  Failed browser storage now retains the in-memory journey even after returning
  to title, and the title explains the need to download before closing the tab.
- **Editorial/source repair.** All 26 exported teaching/community resource URLs
  have dated audit entries. Two stale deep links were replaced; 63 of the 67 live
  interior zones now have appropriate sources. Four original fictional rooms
  intentionally have no invented citation. Copy distinguishes Theravāda models,
  MCTB interpretations, Fire Kasina reports and fictional props. Two conversation
  continuity problems were repaired without changing branches or outcomes.
- **Observed mobile polish.** The area notice no longer covers the right D-pad
  button. Mist warnings cannot intercept touches and sit above the controls.
  Closed-eye practice removes the room background, and mobile phase captions
  stack above their full-width instruction. Atlas background controls become
  inert under lore; rotating retains the selected floor tab without resetting zoom.

## Preserved

All existing art files and attribution, the wizard and humorous voice, the five
homestead places and House start, all named roads and conceptual connections,
10 interior maps / 15 floors / 67 zones, five Inn travellers, 71 conversation
scenes and 24 endings. The main/static shared landscape and the historical
ChelleyMode experiment remain separate. Production base `/FireKasinaTheGame/`
and deployment configuration are unchanged.

The 35-concentration Mist gate and 35-concentration/80-clarity Fairy gate remain.
The exploration assists maintain real meters. Red Dot retains its calibrated
`.715` rate, clarity-dependent diminishing returns, approximately20-second dot
shrink and10-second absence closure. No steadiness meter, gain-speed commentary,
fixed two-cycle gate or visible metta/equanimity meter was introduced.

## Verification

`npm test`: **125 passing** (93 at the starting commit).
`npm run build`: passing, repeated after integration and final fixes.
Production output was inspected: developer QA parameters/entry code are absent,
and built asset references retain the production base path.

The tests exercise real production helpers, defensive saves, gates, return
routes, gesture ownership, camera/caption geometry, all stair arrivals, furniture
collisions, lifecycle receipts, calibrated practice, and every non-repeating Inn
conversation route (3,987 routes). They are not presented as visual playtests.

### Browser observations

Browser UI testing used the local app with normal desktop and390×844 phone-sized
viewports. Screenshots were inspected during the review; the local preview is
the handoff artifact. QA URLs kept the existing browser journey untouched.

| Journey/check | Observed result |
| --- | --- |
| Phone: title → introduction → walk from House to Range → practice → Mists → Trauma → recovery | Practice reached37 concentration without assists. Closing eyes showed the afterimage. Mists entry added3 clarity; Trauma discovery brought clarity to11. Grounding-star route completed, awarded18 more clarity, and returned to the actual map with29 clarity and depleted concentration. Walking returned safely to the Range. |
| Game journal after that journey | Exactly the five known place pages were listed; no outer destinations or unread interior rooms leaked. Lore/search controls remained legible on the phone layout. |
| Desktop: Places → locate Tower → read → area atlas → second floor | Locate framed the landmark without opening lore or moving the wizard. The floor directory exposed all16 stage names and separate reading actions. |
| Phone: dense second-floor atlas → locate Mind and Body → read | Selected art became a useful close-up. Lore and its direct MCTB source were readable. This check prompted background-inert and resize/tab-visibility fixes, covered by added regressions. |
| Desktop Inn: five-exchange Brother Anecdote branch | Questions and replies remained causally connected. Escape paused; Resume preserved the exact exchange. The successful ending returned57 concentration and16 clarity to the HUD, matching its -3/+16 receipt. |
| Desktop Chasm | Deliberate imbalance led into the recovery climb. Handhold input, pauses/resume and safe retreat worked. A full successful climb was not completed in the browser run. |
| Phone Lagoon | Begin, upward input, collision, result and Try Again were exercised. Retry returned to a non-running ready screen. The immediate zero-progress crash did not award clarity. Long successful flights were not manually completed. |
| Save import | UI reached the local file chooser, but the browser automation file-picker operation failed before setting the fixture file. No import was claimed. Format validation, version compatibility, field sanitizing, round-trip and oversized/malformed rejection passed automated tests. |

The browser file-picker failure interrupted the final test session; final build
and branch checks were repeated afterward. No real saved journey was replaced.

## Remaining limitations and uncertainties

- The complete natural progression loop was played on the phone-sized viewport;
  desktop coverage used focused map/atlas and encounter journeys rather than a
  second full progression replay. Not every interior and every conversation
  branch was manually played, although all authored floors/graphs have automated
  coverage and editorial inspection.
- Real multi-finger pinch, hardware touch-cancel and Safari/iOS behavior need a
  physical-device check. The gesture state machine and cancellation paths have
  regression coverage; a narrow desktop viewport is not a physical phone.
- Full dot→absence visual timing after the final CSS adjustment, successful long
  Lagoon flights, and a completed Chasm recovery climb remain targeted manual
  follow-ups. Their timing/reward rules have automated coverage. No statistical
  difficulty-balance study is claimed.
- Save import/export should receive a native-browser file-picker smoke test.
  Exported JSON round-trips in tests; the browser download itself was not verified.
- Some source sites were blocked or partially retrievable. See the exact statuses
  in [resource review](resource-review.md); “audited” does not mean every link was
  successfully fetched. Requested sources remain when verification was unavailable.
- Activity transient state is not restored after a full reload. Saves return to
  the main-map position with published meters and discoveries. They do not sync
  automatically between devices.
- Dense whole-floor maps intentionally omit some on-map captions. The directory
  retains every full name; Locate is the deliberate alternative to precision zoom.

No consequential unresolved user-intent conflict was found. These are validation
and design trade-offs, not new restrictions on future development.

## Local review

From the repository, run `npm run dev -- --host 127.0.0.1 --port 5180` and open
`http://127.0.0.1:5180/FireKasinaTheGame/`. Use `?qa=journey` for a disposable
title-to-world journey or `?qa=map` for the full atlas. QA entry points remain
local-only and are excluded from the production build.

## Follow-up: interior names and publication

The user subsequently authorized publishing all review updates to main. The
original no-publication statements above describe the completed review stage,
not the follow-up authorization.

Interior walking previously reserved a hard-coded 220px-tall information-panel
rectangle inside the canvas. It could silently suppress a landmark name even
when the panel itself was smaller. Controls now occupy a measured bottom dock
outside the landscape viewport. Names are placed first; spare interaction badges
yield to captions using their actual dimensions. The nearby-action card and E
remain available when a redundant floating Read badge is hidden.

Regression coverage reproduces the missing Arising and Passing Away sign and
checks the corrected desktop, portrait-phone and landscape-phone viewports,
plus wide interaction-badge collisions. No floor topology or lore was changed.
