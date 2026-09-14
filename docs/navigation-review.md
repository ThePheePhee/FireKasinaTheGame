# Navigation review — an atlas that helps you explore

Review branch: `codex/retreat-review`. No publication or changes to ChelleyMode.

## Recovered intent and evidence

Read the current comprehensive brief, the retained development history, README,
and the map-art-direction, path-names, and sprite-frame-boundaries records.
The complete constraint ledger is in `review-constraints.md`.

The binding navigation requirements are a shared Game/Sandbox landscape, an
escapable whole-area map, genuinely walkable interiors with meaningful stairs,
preserved destination/path relationships, a house start, sensible floor arrivals,
readable pixel-art presentation, and touch gestures that never confuse a pinch
with a lore request. The atlas must remain a teaching tool, not reveal that the
walking character has moved somewhere merely because a reader inspected it.

The small lettering, full-fit-only phone presentation, duplicated exit buttons,
and lack of an interior orientation map were implementation limitations, not
requirements. A prior task's decision not to change layout did not bind this
comprehensive review. Conversely, recently praised landscape composition and
working physical connections did not need a new coordinate system to solve the
observed navigation problems.

## Diagnosis and considered approaches

The old dense floor overview could technically contain all artwork but offered
tiny landmarks and omitted names. On a tall phone, a wide floor used a small
letterboxed portion of the screen. A reader had to guess which tiny landmark
to pinch toward. Walking mode had no equivalent orientation aid. Escape left
the area immediately, and clearing keys on window blur did not give the player
a deliberate pause/resume boundary.

Three approaches were considered:

1. Enlarge or rearrange every floor and replace sprite sets. This could improve
   artwork scale but would disturb walking distances and arrivals without
   resolving discoverability or input ownership.
2. Draw all names as bigger map plaques. Existing collision tests and dense
   insight floors show why this fails: typography overwhelms the environment.
3. Keep a spatial overview and add **locate → read** navigation. This makes all
   teaching content discoverable, lets the environment breathe, and scales from
   five Divine Abodes to sixteen insight stages without changing their meaning.

The third approach was selected and used consistently across the main map and
interiors. No geometry, path identity, region composition, sprite asset, or lore
content was removed by this work.

## Implemented behavior

- Main-map **Places** guide groups the familiar homestead and wider landscape.
  Locate frames the actual landmark artwork; Read retains the existing lore
  action. Both are camera/reading actions, never player teleportation.
- The existing **Named Paths** guide remains conspicuous, keeps all eighteen
  full names and itineraries, traces the chosen road, and retains its on/off
  map-label control. Closing a guide restores focus to its opening control.
- The area atlas retains the whole-floor overview, pinch, pan, tap-to-read,
  anchored zoom buttons, and reciprocal floor tabs. A full named directory sits
  beside the map on desktop and below it on tall phones. Short landscape screens
  use the side arrangement. Every place/traveller has separate Locate and
  Read/Talk controls, including places whose overview captions cannot fit.
- Whole-floor/detail status, a named reset control, numbered floor tabs, and
  floor notes provide orientation. The duplicate bottom exit is gone; the top
  return button describes its actual destination.
- Walking interiors can open **Area map (M)** on their current floor. The
  character appears only on that real floor. Browsing another floor does not
  move the wizard, change the walking floor, or bypass stairs. Back to walking
  restores the same scene and focus.
- Walking **Escape**, the pause button, window blur, or hiding the document
  produces a pause requiring deliberate continuation. Movement and NPC updates
  also stop entirely while lore or the atlas is open. Input is cleared as soon
  as an overlay opens, and underlying controls are inert/removed from keyboard
  focus. Touch cancellation and lost pointer capture continue to release keys.
- Atlas gestures cancel when reading takes over or the window loses focus.
  Reading, locating and gestures therefore do not leak into one another.
- Open notes declaratively make the atlas header, floor tabs and map/directory
  inert, so assistive navigation cannot trigger background actions. Responsive
  resizing scrolls the selected floor tab into view without resetting the
  chosen floor, focused landmark or map camera.
- Both walking lore and atlas reading record the same canonical journal IDs.
  Merely entering the atlas, selecting a floor or locating a place records
  nothing as read. Reopening a prior encounter is labelled field notes, not a
  misleading imitation of the application's persistent Field Journal.
- The shared floor renderer was extracted from the walking component into
  `drawInteriorFloor.ts`; walking and atlas still use exactly the same artwork.
  This also avoids a circular component import. Tavern/library scenes no longer
  request four unrelated landscape atlases they never draw.

## Verification

Initial `npm test`: **117 passing**, including five new atlas tests. `npm run build`:
passing. Existing checks retain all safe stair arrivals, first-insight-stage
entry, touch/pinch separation, map clamping, caption bounds, and named-road
placement. The new tests exercise production camera logic and server-rendered
components across every authored floor and traveller:

- Locate exposes the chosen landmark at a materially larger phone scale and
  never mutates floor data or exceeds zoom limits.
- Main-map Locate uses actual artwork anchors, including offset landmarks.
- Each floor renders a full separate location/reading directory without marking
  anything read simply by rendering it.
- The walking atlas has an explicit return and shows the wizard only on the
  actual current floor.
- Floor, room and NPC notes resolve to shared canonical journal identities.
- Updated guide tests cover both conspicuous entry buttons and the retained
  enabled/disabled path-name toggle, rather than requiring that toggle to sit
  permanently in the collapsed footer.

Browser QA is being performed by the parent reviewer on the shared local app.
The parent has confirmed the desktop main-map Locate → Tower → area atlas →
floor II journey and mobile directory → Locate Mind and Body → Read journey.
This exposed two follow-up issues now fixed: background atlas controls remained
in the accessibility tree while notes were open, and narrowing the desktop
window could hide the selected floor tab. Two additional structural regressions
verify the declarative inert boundaries and that tab visibility responds to
width changes independently of camera resets. All seven atlas tests and the
production build pass after these fixes.
This subagent's computer-use attachment exposed no browser, so automated tests
are not presented as screenshot verification. Requested visual/input journeys:

1. Main map → Places → locate Tower → read → close; Named Paths → select route
   → toggle captions → reset whole map, on desktop and390×844 phone.
2. Tower walking → Area map → floor II → locate/read an early and a late stage
   → return; confirm the original physical floor and position.
3. Divine, Library and Tavern atlas layouts on tall phone and desktop; inspect
   header/directory scrolling, readable focused artwork, all reading links,
   and absence of clipped captions or a control blocking touch movement.
4. Walking while opening an atlas, opening lore, pressing Escape, switching
   browser focus, rotating a phone, or cancelling a touch. No movement until
   deliberate resume; an inner lore Escape closes only that lore.

## Remaining trade-offs

Dense whole-floor views deliberately omit some canvas captions: the directory
keeps every place named without turning the environment into a wall of signs.
Locate is an alternate to precision zooming, not fast travel. The static atlas
shows NPCs at their authored stations; the walking scene retains their live
movement. A new map renderer or wholesale sprite replacement remains possible,
but neither is needed for the usability problems addressed here.
