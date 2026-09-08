# Sprite-sheet sampling boundaries

The legacy 512 × 512 landmark and expansion sheets use nominal 128px cells,
but some drawings cross their cell boundaries. Sampling a whole cell can include
a neighbour's foot, roof, or ground shadow, separated from the intended sprite by
transparent pixels. These are source pixels, not roads or background-tile seams.

Examples from the September 8 rendering review:

- Tower of Insight: the preceding mist sprite occupies the first four rows.
- Divine Abodes: the preceding tower base occupies the first six rows.
- Trauma Tunnels: the preceding garden base appears as a floating strip beside
  the nearby Tavern of Fortification. The tavern's own sprite is clean.

`src/rendering/atlasFrames.ts` records only the inspected foreign edge bands.
The shared `drawAtlasCell` renderer samples inside these authored gutters while
retaining the original nominal-cell position and pixel scale. It does not stretch
the remaining pixels to fill the old rectangle, recenter the art, or trim every
sprite indiscriminately. Player frames and clean cells are unchanged. The source
PNGs are preserved.

When replacing an atlas, review this metadata alongside it. New sheets should
keep clear padding between sprites; do not assume generated art respects an
evenly divided grid. The pixel regression tests inspect the real PNG alpha data
and verify that the excluded bands contain disconnected neighbour fragments,
while the intended subjects remain in their original positions.
