import type {InteriorFloor, InteriorMap, InteriorZone} from '../data/interiorMaps';

export const zoneContains = (zone: InteriorZone, x: number, y: number) => zone.shape === 'circle'
  ? Math.hypot((x-zone.x)/(zone.w*.625), (y-zone.y)/(zone.h*.625)) <= 1
  : Math.abs(x-zone.x) <= zone.w*.625 && Math.abs(y-zone.y) <= zone.h*.625;

export function nearbyInteriorZone(zones: readonly InteriorZone[], x: number, y: number) {
  return zones.filter(zone => zoneContains(zone, x, y)).sort((a,b) => Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y))[0] ?? null;
}

export function interiorEntry(map: InteriorMap, floor: InteriorFloor): InteriorZone {
  const guidance = floor.environment === 'library'
    ? 'Three reading alcoves lie to the north. Follow the runners to a marked bookshelf, then choose BROWSE SHELVES to open its notes and reading links.'
    : floor.environment === 'tavern'
    ? 'Approach a traveller at a table or the innkeeper behind the bar. A speech sign marks a conversation waiting to happen.'
    : 'Approach the landmarks to uncover their field notes. The nearby prompt stays with you until you move on; tap it or press E when you wish to read.';
  return {id:`entry-${floor.id}`,name:floor.name,copy:`You have entered ${map.name}. ${guidance}`,x:floor.spawn[0],y:floor.spawn[1],w:0,h:0,shape:'rect',art:[0,0]};
}

export function interactionKind(zone: InteriorZone): 'book' | 'talk' | 'lore' {
  return zone.id.startsWith('npc-') ? 'talk' : zone.references?.length || zone.reference ? 'book' : 'lore';
}

export function interactionAnchor(zone: InteriorZone, environment?: InteriorFloor['environment']): [number,number] {
  if (zone.id.startsWith('npc-')) return [zone.x,zone.y-72];
  if (environment === 'library') return [zone.x,zone.y+zone.h*.32];
  return [zone.x,zone.y-zone.h*.43-24];
}
