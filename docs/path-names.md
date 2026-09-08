# Named roads: recovery and review

The road names were recovered from Git history, not invented to replace missing content. The September 8 review found that many names already existed in the data but were hard to see or find in play.

## Historical record

- `ee7cca8` (July 5, 2026) introduced the Kindling Road, Luminous Ascent, Unmaking Way, Vanishing Road, Wayfarer's Middle Path, Clarity Ridge, and Gentle Return.
- `d8b85e6` (July 5) introduced **The Artificer's Causeway**, linking Fireworks Peak and the Magick Proving Grounds. Its name has been retained ever since. This commit also added the Reality-Testing Road and Integration Descent, and retired the old Skybridge of Discernment when those connections were redesigned.
- `fee96e7` (July 6) renamed Integration Descent to **The Integration Crossing** and added the Mending Way, Healer's Light, Siddhi Pass, and Contemplative Loop.
- `a46d0ae` (July 6) added **The Road of Splendid Reappearance**, from the Formless Beyond to the Divine Abodes.
- `bcd9208` (July 7) added the Credulous Clarity Circuit, a genuinely closed road returning to the Crags.
- `9102234` (July 7) added the Fortification Road and Lantern Lane. The latter's lore already used **The Lantern-Lit Lane**; `8f69da4` (September 8) aligned the visible road name with that original lore title.

## Names retained

The Kindling Road; The Artificer's Causeway; The Luminous Ascent; The Unmaking Way; The Vanishing Road; The Wayfarer's Middle Path; Clarity Ridge; The Reality-Testing Road; The Integration Crossing; The Mending Way; The Healer's Light; The Siddhi Pass; The Road of Splendid Reappearance; The Credulous Clarity Circuit; The Lantern-Lit Lane; The Fortification Road.

These names still fit their connections and teaching roles. The disconnected Skybridge of Discernment has not been restored as a spurious extra road.

## Two deliberate corrections

| Previous name | Current name | Reason |
| --- | --- | --- |
| The Contemplative Loop | **The Contemplative Passage** | Its geometry has always connected the Jhāna Range and Tower of Insight without closing a loop. The lore now describes travel in either direction. |
| The Gentle Return | **The Renewal Road** | It joins Healing Meadows and Jhāna, through Life Recall Lane and difficult mist territory; it is neither a direct road Home nor uniformly gentle. The new name keeps its restorative teaching role without misleading navigation. |

Stable route IDs, geometry, families, and source links remain unchanged by this naming review.

## Itineraries and shared roads

Every `PathLore` now requires a `journey` field. It gives direction-neutral endpoints using **↔**, with important intermediate places where useful. These are navigational summaries, not claims that every road is a straight line or that every teaching metaphor is reversible.

The Luminous Ascent and Healer's Light deliberately share the same Magick–Healing–Divine corridor. Their lore now says so explicitly: two approaches to the same road, not two different physical tracks. The route index and current-road information can display both names and their common itinerary.

`tests/path-names.test.mjs` checks route/lore name and family agreement, complete itineraries, preservation of the original names, the two corrected titles, and the closed circuit/shared-road facts.
