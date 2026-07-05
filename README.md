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

## Pixel-art atlases

The game ships with two transparent 4×4 PNG atlases in `public/assets/`:

- `meditator-wizard-atlas.png`: directional walking frames, with down/right/left/up as rows.
- `landmarks-atlas.png`: region landmarks plus bridge, station, and wilderness props.

Atlas loading and cell drawing live in `src/rendering/pixelArtAssets.ts`. Region-to-cell assignments and world-prop placement live in `src/rendering/drawMap.ts`.

## Replacing the procedural art

Rendering is separated from world data. Replace either PNG atlas while preserving its 4×4 cell layout, or update the cell assignments in the rendering modules. Procedural drawing remains as a loading/error fallback. Coordinates and interactions stay unchanged, so art can evolve without rewriting the map or content.

Future collision, quests, inventory, and scene transitions belong in focused modules under `src/engine/` rather than the React UI.
