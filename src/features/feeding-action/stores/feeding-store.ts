import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '@shared/storage/zustand-mmkv';
import { useGamificationStore } from '@features/gamification/stores/gamification-store';
import { usePetStateStore } from '@features/pet-state/stores/pet-state-store';
import { useDailyMissionsStore } from '@features/daily-missions/stores/daily-missions-store';
import {
  FEED_COOLDOWN_MS,
  FEED_COST_BONES,
  FEED_HAPPINESS_DELTA,
  FEED_HUNGER_DELTA,
} from '@features/gamification/constants';

export type FeedResult =
  | { ok: true }
  | { ok: false; reason: 'cooldown' | 'insufficient-bones' };

interface FeedingStore {
  lastFedAt: number | null;
  feed: () => FeedResult;
}

export const useFeedingStore = create<FeedingStore>()(
  persist(
    (set, get) => ({
      lastFedAt: null,
      feed: () => {
        const now = Date.now();
        const { lastFedAt } = get();
        if (lastFedAt && now - lastFedAt < FEED_COOLDOWN_MS) {
          return { ok: false, reason: 'cooldown' };
        }
        const debit = useGamificationStore.getState().debitBones(FEED_COST_BONES);
        if (!debit.ok) return { ok: false, reason: 'insufficient-bones' };

        usePetStateStore.getState().applyPetStateEvent({
          hunger: FEED_HUNGER_DELTA,
          happiness: FEED_HAPPINESS_DELTA,
        });
        useDailyMissionsStore.getState().recordEvent('fed', 1);
        set({ lastFedAt: now });
        return { ok: true };
      },
    }),
    {
      name: 'feeding',
      storage: createJSONStorage(() => createMMKVStorage()),
      partialize: (s) => ({ lastFedAt: s.lastFedAt }),
    },
  ),
);
