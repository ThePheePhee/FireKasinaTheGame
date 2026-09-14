# FireKasinaTheGame

An 8-bit browser adventure through the imaginative landscape of fire kasina practice. The game and sandbox share the same regions, paths, lore, interiors, and artwork.

[Play the published game](https://thepheephee.github.io/FireKasinaTheGame/)

This version includes the retreat review and interior label-layout correction.
See [review results](docs/review-results.md) for
the implemented improvements, recovered constraints, verification and limitations.

## Playing

- **Game:** begin at Your House, explore the familiar homestead, and practise in the Red Dot Range. Enter the Mists with at least 35 concentration; the Fairy Playground requires both 35 concentration and 80 clarity. Concentration drains in the Mists, and a weakening lantern draws you home.
- **Sandbox:** freely walk or browse the complete map, enter its interiors, read field notes, and try minigames. Sandbox practice does not alter your saved game.
- **Controls:** WASD or arrow keys to walk; touch controls appear on phones. While walking, nearby roads display their names: tap the wooden path sign or press R for lore. Shared corridors offer all their named paths. In Map view, tap a region or named road sign, drag to pan, or pinch to zoom. The Named Paths guide lists every full name, itinerary, and teaching; zooming in reveals more road signs on phones. Interiors use actual staircases. Book and speech signs mark interactions: approach and tap the sign or persistent nearby-action card, or press E. Library links appear as selectable volumes. Inn replies also accept number keys.
- **Pause and save:** use Menu or Escape from the main map. Your game position, meters, discoveries, and exploration assists save automatically in this browser. Continue from the title screen. Starting a new journey explicitly replaces that browser's save. Saves do not sync between devices; an unfinished minigame resumes at its map entrance, with the latest saved meters.
- **Exploration assists:** expand the panel beneath the meters. Checked assists maintain the required real meter values, making exploration possible without repeated returns to practice.
- **Field Journal (J):** search discovered places and notes you have actually read. Sandbox includes the complete catalogue. Journal reading never moves the traveller or opens an encounter remotely.
- **Finding places:** the main map has Places and Named Paths guides. Area maps have a directory with separate Locate and Read actions. Locate changes only the camera. While walking an interior, Area map (M) shows your position; browsing other floors does not move you or bypass the stairs.
- **Activity pauses:** all five minigames begin at a ready screen. Begin starts play; Escape/P pauses and resumes. Losing focus pauses the activity until you deliberately resume. Interior walking also pauses on focus loss. Leaving an unfinished Inn conversation still has consequences.
- **Portable saves:** Save Files at the title or Game menu exports a local JSON file. Import previews its meters and asks before replacing the browser journey. Saves remain compatible with previous version-1 journeys. If storage is blocked, the current tab retains progress and offers a download; closing the tab without exporting can lose that progress. No file is uploaded to a server.

The meters are game rules, not measures of actual attainment. Sources distinguish
traditional models, practitioner reports, and the game's fictional elaborations.

## Run locally

Requires Node.js 22.15 or newer. Dependencies are pinned and the lockfile is committed.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. The app uses the `/FireKasinaTheGame/` base path.

```sh
npm test
npm run build
npm run preview
```

Tests run against the actual TypeScript source with Node's test runner. They cover progression, calibrated practice mechanics, maze reachability/hazards, conversational routes and consequences, map gestures, stairs/collision, and defensive save restoration. GitHub Pages runs these checks before publishing changes to `main`.

Local-only review entrances include `?qa=map`, `?qa=interior&area=tower`, and `?qa=red-dot`, `trauma`, `inn`, `lagoon`, or `chasm`. Add `&near=meditation-shelves` to the library interior review to inspect a nearby interaction. Use `?qa=road&path=artificer` or `path=ascent` to review walking-mode path names. These routes are excluded from production and do not write saved journeys.

`?qa=journey` starts at the normal title for a disposable end-to-end playtest:
onboarding, practice, exploration and save-file restoration all work without
overwriting the browser's real journey. `tests/fixtures/journey-v1.json` is a
non-personal portable-save fixture for that local review flow.

## Editing the landscape

| Concern | Source |
| --- | --- |
| Shared regions and shapes | `src/data/mapRegions.ts` |
| Sprite anchors and label placement | `src/data/regionVisuals.ts` |
| Region lore and subtle source links | `src/data/presentationContent.ts`, `presentationReferences.ts` |
| Routes and their teaching content | `src/data/routes.ts`, `pathContent.ts` |
| Continuous pixel terrain and scenery clearance | `src/rendering/drawLandscape.ts`, `landscapeModel.ts` |
| Named road signs and responsive map captions | `src/engine/routeLabels.ts`, `src/components/MapMode.tsx` |
| Walkable interior floors, zones, travelers | `src/data/interiorMaps.ts` |
| Optional discoveries in the terrain | `src/data/mapProps.ts` |
| Inn dialogue graph | `src/data/quarrelsomeConversations.ts` |
| Progression, practice, maze, conversation consequences | `src/game/` |
| Canonical searchable field journal / save validation | `src/game/journal.ts`, `saveGame.ts` |
| Activity lifecycle / input ownership | `src/game/activitySession.ts`, `useMinigameSession.ts`, `src/engine/movementInput.ts` |
| Map gestures, camera, collisions, stair arrivals | `src/engine/` |
| Pixel artwork, terrain caches, social interiors | `src/rendering/`, `public/assets/` |

Keep geometry in the shared world data so sandbox and game stay aligned. Artwork is loaded on demand and static terrain is cached separately from moving characters. Preserve the established pixel scale, strong silhouettes, restrained palette, and recognizable terrain when adding art. The historical `ChelleyMode` experiment is separate; `main` uses the static landscape with discovery and progression.

See [the Inn review](docs/inn-review.md) for route coverage and conversation design rules.
See [map art direction](docs/map-art-direction.md) for the landscape composition, road hierarchy, and shared-world safeguards.
See [the path-name review](docs/path-names.md) for recovered names, the two naming corrections, and their teaching roles.
See [the resource audit](docs/resource-review.md), [navigation review](docs/navigation-review.md), and [minigame review](docs/minigame-review.md) for this branch's detailed evidence.
