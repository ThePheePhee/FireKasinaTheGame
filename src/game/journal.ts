import {mapRegions} from '../data/mapRegions';
import {mapProps} from '../data/mapProps';
import {routes} from '../data/routes';
import {pathContent} from '../data/pathContent';
import {presentationContent} from '../data/presentationContent';
import {presentationReferences} from '../data/presentationReferences';
import {interiorMaps, type LoreLink} from '../data/interiorMaps';

export type JournalCategory = 'Places' | 'Paths' | 'Curiosities' | 'Interiors';
export interface JournalEntry {id: string; title: string; context: string; category: JournalCategory; copy: string; links: LoreLink[]}

// The journal is a view of the landscape's data, never a second copy of its lore.
export const journalEntries: JournalEntry[] = [
  ...mapRegions.map(region => ({id: region.id, title: region.name, context: 'Main map', category: 'Places' as const, copy: presentationContent[region.id] ?? '', links: presentationReferences[region.id] ?? []})),
  ...routes.filter(route => pathContent[route.id]).map(route => { const lore = pathContent[route.id]; return {id: `route:${route.id}`, title: lore.title, context: lore.journey, category: 'Paths' as const, copy: lore.copy, links: lore.reference ? [lore.reference] : []}; }),
  ...mapProps.map(prop => ({id: `prop:${prop.id}`, title: prop.name, context: 'A curious find', category: 'Curiosities' as const, copy: prop.copy, links: [prop.reference]})),
  ...interiorMaps.flatMap(map => map.floors.flatMap(floor => [
    {id: `floor:${map.id}:${floor.id}`, title: floor.name, context: map.name, category: 'Interiors' as const, copy: floor.subtitle, links: []},
    ...floor.zones.map(zone => ({id: `interior:${map.id}:${floor.id}:${zone.id}`, title: zone.name, context: `${map.name} · ${floor.name}`, category: 'Interiors' as const, copy: zone.copy, links: zone.references ?? (zone.reference ? [zone.reference] : [])})),
    ...(floor.npcs ?? []).map(npc => ({id: `interior:${map.id}:${floor.id}:npc-${npc.id}`, title: npc.name, context: `${map.name} · ${floor.name}`, category: 'Interiors' as const, copy: npc.copy, links: npc.references ?? []})),
  ])),
];
const entryIds = new Set(journalEntries.map(entry => entry.id));
export function sanitizeNotebook(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && entryIds.has(id)))] : [];
}
export function availableJournalEntries(sandbox: boolean, discovered: Iterable<string>, notebook: Iterable<string>): JournalEntry[] {
  const known = new Set([...discovered, ...notebook]);
  return journalEntries.filter(entry => sandbox || known.has(entry.id));
}
export function searchJournal(entries: JournalEntry[], query: string, category?: JournalCategory): JournalEntry[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(entry => (!category || entry.category === category) && words.every(word => `${entry.title} ${entry.context} ${entry.copy}`.toLocaleLowerCase().includes(word)));
}
