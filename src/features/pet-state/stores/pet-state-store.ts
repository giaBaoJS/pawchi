import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '@shared/storage/zustand-mmkv';
import { applyDecay, clampStat } from '../utils/apply-decay';
import type { PetState, PetStateEvent } from '../types/pet-state';

interface PetStateStore extends PetState {
  applyPetStateEvent: (delta: PetStateEvent) => void;
  refreshDecay: () => void;
}

const initialState = (): PetState => ({
  hunger: 80,
  happiness: 80,
  energy: 80,
  lastUpdatedAt: Date.now(),
});

export const usePetStateStore = create<PetStateStore>()(
  persist(
    (set) => ({
      ...initialState(),
      applyPetStateEvent: (delta) =>
        set((state) => {
          const decayed = applyDecay(state, Date.now());
          return {
            ...decayed,
            hunger: clampStat(decayed.hunger + (delta.hunger ?? 0)),
            happiness: clampStat(decayed.happiness + (delta.happiness ?? 0)),
            energy: clampStat(decayed.energy + (delta.energy ?? 0)),
          };
        }),
      refreshDecay: () =>
        set((state) => ({
          ...applyDecay(state, Date.now()),
        })),
    }),
    {
      name: 'pet-state',
      storage: createJSONStorage(() => createMMKVStorage()),
      partialize: (state) => ({
        hunger: state.hunger,
        happiness: state.happiness,
        energy: state.energy,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    },
  ),
);
