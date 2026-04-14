import type { Mood, PetState } from '../types/pet-state';

export function deriveMood(state: Pick<PetState, 'hunger' | 'happiness' | 'energy'>): Mood {
  if (state.hunger < 20) return 'hungry';
  const avg = (state.happiness + state.energy) / 2;
  if (avg >= 80) return 'happy';
  if (avg >= 60) return 'content';
  if (avg >= 40) return 'neutral';
  return 'sad';
}
