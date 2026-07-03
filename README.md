# FireKasinaTheGame

A small browser-based, 8-bit interactive presentation about the unfolding terrain of a fire kasina retreat. Walk the map in Player Mode, or reveal the whole world and click its regions in Presentation Mode.

## Run locally

Requires a current Node.js installation.

```bash
npm install
npm run dev
```

Open the local URL Vite prints. Use WASD or arrow keys to walk. For a production check, run `npm run build`.

## Editing the world

- Edit region names, locations, sizes, and semantic terrain types in `src/data/mapRegions.ts`.
- Edit information-bubble copy in `src/data/presentationContent.ts`. Each key matches a region `id`.
- Edit transport networks in `src/data/routes.ts`; routes are arrays of world-space points with a rail, tram, tunnel, or bridge style.
- To add a region, add its definition and matching presentation copy. Add a terrain type/color and optional landmark drawing in `src/rendering/drawMap.ts` when it needs a new visual identity.

## Replacing the procedural art

Rendering is separated from world data. Future tilesheets can be loaded once in a small asset module and drawn in `src/rendering/drawMap.ts` according to each region's semantic `terrain` value. Replace the procedural player in `src/rendering/drawPlayer.ts` with directional sprite-sheet frames. Keep coordinates and interactions unchanged, so art can evolve without rewriting the map or content.

Future collision, quests, inventory, and scene transitions belong in focused modules under `src/engine/` rather than the React UI.
