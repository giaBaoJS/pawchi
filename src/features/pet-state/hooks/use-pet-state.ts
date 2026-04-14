import { useEffect } from 'react';
import { usePetStateStore } from '../stores/pet-state-store';
import { deriveMood } from '../utils/derive-mood';

export function usePetState() {
  const hunger = usePetStateStore((s) => s.hunger);
  const happiness = usePetStateStore((s) => s.happiness);
  const energy = usePetStateStore((s) => s.energy);
  const refreshDecay = usePetStateStore((s) => s.refreshDecay);

  useEffect(() => {
    refreshDecay();
  }, [refreshDecay]);

  return {
    hunger: Math.round(hunger),
    happiness: Math.round(happiness),
    energy: Math.round(energy),
    mood: deriveMood({ hunger, happiness, energy }),
  };
}
