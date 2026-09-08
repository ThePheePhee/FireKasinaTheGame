import {mapRegions, WORLD} from '../data/mapRegions';
import {mapProps} from '../data/mapProps';
import type {Player} from '../engine/movement';
import {applyExplorationAssists, clampMeter, initialDiscovery, initialGameStats, type DiscoveryPoint, type ExplorationAssists, type GameStats} from './gameState';

export const SAVE_KEY = 'fire-kasina.journey.v1';
export interface SavedJourney {
  version: 1;
  savedAt: number;
  stats: GameStats;
  player: Player;
  discoveredRegions: string[];
  discovery: DiscoveryPoint[];
  assists: ExplorationAssists;
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const finite = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const regionIds = new Set([...mapRegions.map(region => region.id), ...mapProps.map(prop => `prop:${prop.id}`)]);

export function createJourney(): SavedJourney {
  const house = mapRegions.find(region => region.id === 'house')!;
  return {
    version: 1,
    savedAt: Date.now(),
    stats: {...initialGameStats},
    player: {x: house.x, y: house.y, direction: 'down', moving: false, step: 0},
    discoveredRegions: ['house', 'garden', 'red-dot'],
    discovery: initialDiscovery.map(point => ({...point})),
    assists: {mist: false, fairy: false},
  };
}

// Browser storage is untrusted: old or incomplete saves must never poison physics.
export function parseJourney(raw: string | null): SavedJourney | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1 || !object(value.stats) || !object(value.player)) return null;
    const fresh = createJourney();
    const stats = {...fresh.stats};
    for (const key of Object.keys(stats) as (keyof GameStats)[]) stats[key] = clampMeter(finite(value.stats[key], 0));
    const assists = {mist: object(value.assists) && value.assists.mist === true, fairy: object(value.assists) && value.assists.fairy === true};
    const direction = value.player.direction;
    const points: DiscoveryPoint[] = [];
    if (Array.isArray(value.discovery)) for (const point of value.discovery.slice(0, 12000)) {
      if (!object(point) || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.radius)) continue;
      if ((point.x as number) < 0 || (point.x as number) > WORLD.width || (point.y as number) < 0 || (point.y as number) > WORLD.height) continue;
      points.push({x: point.x as number, y: point.y as number, radius: Math.max(16, Math.min(250, point.radius as number))});
    }
    return {
      version: 1,
      savedAt: finite(value.savedAt, 0),
      stats: applyExplorationAssists(stats, assists),
      player: {
        x: Math.max(12, Math.min(WORLD.width - 12, finite(value.player.x, fresh.player.x))),
        y: Math.max(12, Math.min(WORLD.height - 12, finite(value.player.y, fresh.player.y))),
        direction: direction === 'up' || direction === 'down' || direction === 'left' || direction === 'right' ? direction : 'down',
        moving: false,
        step: 0,
      },
      discoveredRegions: [...new Set([...fresh.discoveredRegions, ...(Array.isArray(value.discoveredRegions) ? value.discoveredRegions.filter((id): id is string => typeof id === 'string' && regionIds.has(id)) : [])])],
      discovery: [...new Map([...fresh.discovery, ...points].map(point => [`${point.x},${point.y},${point.radius}`, point])).values()],
      assists,
    };
  } catch {
    return null;
  }
}

export function loadJourney(): SavedJourney | null {
  try { return parseJourney(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}

export function storeJourney(journey: SavedJourney): boolean {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(journey)); return true; } catch { return false; }
}
