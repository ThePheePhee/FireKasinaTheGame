# A landscape, not a route diagram

The main map uses a continuous, shared world in both game and sandbox. This pass
changes its presentation and the bends of its roads, not the identities or saved
positions of its places. The `ChelleyMode` experiment remains separate.

## Composition

- **A familiar central clearing.** The house, garden, library, tavern, and training
  range share warm grass. Their two safe lanes use the same geometry as the
  concentration gate and initial fog reveal.
- **A wooded middle country.** Muted grass, grouped pines, rocky clearings, and
  the lagoon distinguish the Mists. Scenery frames encounters instead of covering
  them. The Garden's beds follow the fenced garden sprite, not its larger logical
  homestead region.
- **An inviting outer country.** Green grass, deciduous groves, flowers, and the
  existing magical discoveries tie the outer destinations together. Built places
  have stone landings; natural places have irregular earth and rock aprons.
- **A readable road network.** Golden generation, violet deconstruction, and
  pale-green balance roads have a clear hierarchy. Smaller neutral paths reuse
  common trunks. Overlapping sections are drawn once, intersections have paved
  landings, and the lagoon crossing has a wooden boardwalk.
- **Destinations first, directions second.** Location captions stay readable as
  the map zooms out. Smaller road signs retain the full path names. The Routes
  guide contains every named teaching on desktop and mobile; selection traces
  the actual road and opens its existing lore.

The visual reference is the legible landscape, landmarks, and exploration of
classic adventure games, including [Nintendo's original Zelda manual](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAANE.pdf).
The new terrain is original code-native pixel art: 16-pixel ground cells, stepped
banks and canopies, small palettes, and two-pixel details. This is an 8-bit-inspired
browser game, not a claim that all existing artwork meets NES hardware limits.

## Keeping it coherent

`landscapeModel.ts` derives countries from the actual progression classifier,
including both homestead lanes and the outer destinations that overlap the Mists.
It reserves landmark art, captions, discoveries, and the full width of every road
before admitting scenery. Country tiles and scenery geometry are deterministic;
the finished terrain is cached until artwork changes, not repainted tile-by-tile
on each animation frame.

`buildRoadSections` preserves each named itinerary while merging reversed or
partially shared segments. Road geometry tests prevent new accidental crossings
and ensure the principal paths still lead from home through the Mists to the
outer country. Prop placement and label layout have separate clearance tests.

When extending the map:

1. Change shared region/route data, not a mode-specific copy.
2. Keep saved region IDs and absolute player coordinates stable, or write an
   explicit save migration.
3. Reserve doors, labels, paths, and story props before planting more scenery.
4. Give a new natural location its own ground treatment, not a generic paved disk.
5. Keep routes named and teachable even when they share a physical corridor.
6. Check a whole-map desktop view, a zoomed player view, and a narrow touch view.

The main landscape remains walkable terrain: the woodland is decorative, not an
unannounced collision maze. Concentration and clarity gates, fog discovery,
practice calibration, minigames, interiors, and all existing lore are unchanged.
