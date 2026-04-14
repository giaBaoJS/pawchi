import type { PetState } from '../types/pet-state';

const HUNGER_DECAY_PER_HOUR = 10;
const HAPPINESS_DECAY_PER_HOUR = 5;
const ENERGY_DECAY_PER_HOUR = 5;
const MS_PER_HOUR = 60 * 60 * 1000;

function clamp(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export function applyDecay(state: PetState, now: number): PetState {
  const elapsedMs = Math.max(0, now - state.lastUpdatedAt);
  const elapsedHours = elapsedMs / MS_PER_HOUR;
  return {
    hunger: clamp(state.hunger - HUNGER_DECAY_PER_HOUR * elapsedHours),
    happiness: clamp(state.happiness - HAPPINESS_DECAY_PER_HOUR * elapsedHours),
    energy: clamp(state.energy - ENERGY_DECAY_PER_HOUR * elapsedHours),
    lastUpdatedAt: now,
  };
}

export function clampStat(n: number): number {
  return clamp(n);
}
