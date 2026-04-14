import type { DogStats } from '@features/dog/types/dog-state';

// Decay rates: units lost per minute
const HUNGER_DECAY_PER_MIN = 1 / 10; // -1 per 10 min
const ENERGY_DECAY_PER_MIN = 1 / 15; // -1 per 15 min
const BOND_GAIN_PER_MIN = 0.01;       // +0.01 per min (passive)

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Pure function — no side effects. Calculates decayed stats based on elapsed time.
 * Call from AppState listener, never inside render.
 */
export function calculateDecay(
  currentStats: DogStats,
  lastTickAt: number,
  now: number,
): DogStats {
  const elapsedMs = now - lastTickAt;
  if (elapsedMs <= 0) return currentStats;

  const minutes = elapsedMs / 60_000;

  const hunger = clamp(currentStats.hunger - HUNGER_DECAY_PER_MIN * minutes);
  const energy = clamp(currentStats.energy - ENERGY_DECAY_PER_MIN * minutes);

  // Mood drops faster when hunger or energy is low
  const moodDecay =
    (100 - hunger) * 0.003 * minutes + (100 - energy) * 0.002 * minutes;
  const mood = clamp(currentStats.mood - moodDecay);

  const bond = clamp(currentStats.bond + BOND_GAIN_PER_MIN * minutes);

  return { hunger, mood, energy, bond };
}

export const COOLDOWNS = {
  feed: 30 * 60 * 1000,    // 30 minutes in ms
  sleep: 2 * 60 * 60 * 1000, // 2 hours in ms
} as const;

export type GameAction = 'feed' | 'play' | 'sleep';

export interface ActionResult {
  statsDelta: Partial<DogStats>;
  xpGain: number;
}

export const ACTION_EFFECTS: Record<GameAction, ActionResult> = {
  feed: {
    statsDelta: { hunger: 40, mood: 5 },
    xpGain: 5,
  },
  play: {
    statsDelta: { energy: -20, mood: 30, bond: 5 },
    xpGain: 10,
  },
  sleep: {
    statsDelta: { energy: 60, mood: 10, hunger: -5 },
    xpGain: 0,
  },
};

export function applyActionDelta(
  stats: DogStats,
  delta: Partial<DogStats>,
): DogStats {
  return {
    hunger: clamp(stats.hunger + (delta.hunger ?? 0)),
    mood: clamp(stats.mood + (delta.mood ?? 0)),
    energy: clamp(stats.energy + (delta.energy ?? 0)),
    bond: clamp(stats.bond + (delta.bond ?? 0)),
  };
}

export function getCooldownRemaining(
  action: 'feed' | 'sleep',
  lastAt: number | null,
  now: number,
): number {
  if (!lastAt) return 0;
  const elapsed = now - lastAt;
  return Math.max(0, COOLDOWNS[action] - elapsed);
}

export function formatCooldown(ms: number): string {
  if (ms <= 0) return '';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
