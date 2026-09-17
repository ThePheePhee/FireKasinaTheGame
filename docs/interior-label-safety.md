# Interior labels and HUD separation

17 September 2026, follow-up to the recurring missing Arising and Passing Away name.

The earlier fix removed fixed HUD exclusion rectangles, but label placement could
still silently omit a name when artwork (particularly a neighbouring staircase)
blocked its limited search area. A complete floor sweep reproduced this for Mind
and Body, Stream Entry, Molten Gold, the Custom Jhāna Forge, and the Discernment
Laboratory on a narrow viewport.

## Shared rules

- Interior walking uses three real grid rows: header, clipped world viewport,
  and control dock. There is no absolute-positioned HUD over the landscape and
  no JavaScript subtraction of estimated header/prompt heights.
- The canvas and world interaction badges share the same clipped viewport.
  Resizing, wrapping text, and orientation changes resize the viewport itself.
- Every floor uses the same caption renderer. A nearby/located place gets first
  choice of label space; readable plaques can move beside obstructing artwork,
  with a leader line showing which landmark they belong to.
- A visible landmark can retain a name even when its normal caption anchor lies
  just outside the viewport. Names stay complete, inside the floor/viewport, and
  clear of other names and landmark artwork.
- Atlas zoom buttons now live in the toolbar, outside the map canvas. Located
  landmarks receive the same caption priority as approached walking landmarks.
- Interaction badges yield to names, not the reverse. Lore remains available
  through the dock, E, and atlas Read buttons.
- Dense fully zoomed-out atlases still declutter. The complete directory and
  Locate action remain available; tiny unreadable labels are not substituted.

## Verification

Tests cover all 67 interior places at desktop, portrait-phone, and landscape-phone
viewport sizes, plus every traveller, the reported Tower sign, wide badge
collisions, edge-of-screen names, artwork exclusions, and atlas typography.
Browser checks cover Tower floor II walking, its located atlas view, and physical
HUD/world separation at 1280×800, 390×844, and 844×390.

Local-only review URL for the reported case:
`?qa=interior&area=tower&floor=1&near=arising`. The floor index is zero-based;
normal gameplay still starts on the first floor and uses stairs. QA never writes
the player's saved journey and is unavailable in production.
