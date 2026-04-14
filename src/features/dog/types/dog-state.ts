import type { DogProfile } from './dog-profile';

export interface DogStats {
  hunger: number;
  mood: number;
  energy: number;
  bond: number;
}

export interface DogOutfit {
  hat: string | null;
  shirt: string | null;
  pants: string | null;
  accessory: string | null;
}

export interface DogState {
  profile: DogProfile | null;
  stats: DogStats;
  outfit: DogOutfit;
}

export const DEFAULT_DOG_STATE: DogState = {
  profile: null,
  stats: { hunger: 80, mood: 80, energy: 80, bond: 20 },
  outfit: { hat: null, shirt: null, pants: null, accessory: null },
};
