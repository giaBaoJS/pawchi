import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '@shared/storage/zustand-mmkv';
import type { DogProfile } from '../types/dog-profile';

interface DogProfileState {
  profile: DogProfile | null;
  setProfile: (profile: DogProfile) => void;
  clearProfile: () => void;
}

export const useDogProfileStore = create<DogProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'dog-profile',
      storage: createJSONStorage(() => createMMKVStorage()),
    },
  ),
);
