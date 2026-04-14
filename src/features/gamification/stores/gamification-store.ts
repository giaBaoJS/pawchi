import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '@shared/storage/zustand-mmkv';
import { expToLevel } from '../utils/level-curve';
import { computeStreak } from '../utils/streak';
import type { DebitResult, GamificationState } from '../types/gamification';

interface GamificationStore extends GamificationState {
  creditBones: (n: number) => void;
  debitBones: (n: number) => DebitResult;
  addExp: (n: number) => { leveledUp: boolean; level: number };
  tickStreak: (todayKey: string) => void;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      bones: 20,
      exp: 0,
      streakDays: 0,
      lastOpenDay: null,

      creditBones: (n) => set((s) => ({ bones: s.bones + n })),

      debitBones: (n) => {
        const { bones } = get();
        if (bones < n) return { ok: false, reason: 'insufficient' };
        set({ bones: bones - n });
        return { ok: true };
      },

      addExp: (n) => {
        const prev = get().exp;
        const next = prev + n;
        const prevLevel = expToLevel(prev);
        const nextLevel = expToLevel(next);
        set({ exp: next });
        return { leveledUp: nextLevel > prevLevel, level: nextLevel };
      },

      tickStreak: (todayKey) => {
        const { streakDays, lastOpenDay } = get();
        const result = computeStreak(streakDays, lastOpenDay, todayKey);
        if (result.streakDays !== streakDays || result.lastOpenDay !== lastOpenDay) {
          set(result);
        }
      },
    }),
    {
      name: 'gamification',
      storage: createJSONStorage(() => createMMKVStorage()),
    },
  ),
);
