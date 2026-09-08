# FireKasinaTheGame

An 8-bit browser adventure through the imaginative landscape of fire kasina practice. The game and sandbox share the same regions, paths, lore, interiors, and artwork.

[Play the published game](https://thepheephee.github.io/FireKasinaTheGame/)

## Playing

- **Game:** begin at Your House, explore the familiar homestead, and practise in the Red Dot Range. Enter the Mists with at least 35 concentration; the Fairy Playground requires both 35 concentration and 80 clarity. Concentration drains in the Mists, and a weakening lantern draws you home.
- **Sandbox:** freely walk or browse the complete map, enter its interiors, read field notes, and try minigames. Sandbox practice does not alter your saved game.
- **Controls:** WASD or arrow keys to walk; touch controls appear on phones. In Map view, tap a region or named road sign, drag to pan, or pinch to zoom. The Routes guide lists every path and its lore; path names can be toggled without hiding the roads. Interiors use actual staircases. Book and speech signs mark interactions: approach and tap the sign or persistent nearby-action card, or press E. Library links appear as selectable volumes. Inn replies also accept number keys.
- **Pause and save:** use Menu or Escape from the main map. Your game position, meters, discoveries, and exploration assists save automatically in this browser. Continue from the title screen. Starting a new journey explicitly replaces that browser's save. Saves do not sync between devices; an unfinished minigame resumes at its map entrance, with the latest saved meters.
- **Exploration assists:** expand the panel beneath the meters. Checked assists maintain the required real meter values, making exploration possible without repeated returns to practice.

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

Local-only review entrances include `?qa=map`, `?qa=interior&area=tower`, and `?qa=red-dot`, `trauma`, `inn`, `lagoon`, or `chasm`. Add `&near=meditation-shelves` to the library interior review to inspect a nearby interaction. These routes are excluded from production and do not write saved journeys.

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
| Map gestures, camera, collisions, stair arrivals | `src/engine/` |
| Pixel artwork, terrain caches, social interiors | `src/rendering/`, `public/assets/` |

Keep geometry in the shared world data so sandbox and game stay aligned. Artwork is loaded on demand and static terrain is cached separately from moving characters. Preserve the established pixel scale, strong silhouettes, restrained palette, and recognizable terrain when adding art. The historical `ChelleyMode` experiment is separate; `main` uses the static landscape with discovery and progression.

See [the Inn review](docs/inn-review.md) for route coverage and conversation design rules.
See [map art direction](docs/map-art-direction.md) for the landscape composition, road hierarchy, and shared-world safeguards.
