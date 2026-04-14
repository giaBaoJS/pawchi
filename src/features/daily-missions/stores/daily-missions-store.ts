import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '@shared/storage/zustand-mmkv';
import { useGamificationStore } from '@features/gamification/stores/gamification-store';
import {
  MISSION_CATALOG,
  type MissionDef,
  type MissionEventType,
  type MissionId,
} from '../constants/mission-catalog';
import { todayKey } from '../utils/today-key';

interface MissionProgress {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

interface DailyMissionsState {
  dateKey: string;
  missions: Record<MissionId, MissionProgress>;
  recordEvent: (type: MissionEventType, value?: number) => void;
  resetIfNewDay: () => void;
  getView: () => { def: MissionDef; progress: MissionProgress }[];
}

function emptyMissions(): Record<MissionId, MissionProgress> {
  return MISSION_CATALOG.reduce(
    (acc, def) => {
      acc[def.id] = { progress: 0, completed: false, claimed: false };
      return acc;
    },
    {} as Record<MissionId, MissionProgress>,
  );
}

export const useDailyMissionsStore = create<DailyMissionsState>()(
  persist(
    (set, get) => ({
      dateKey: todayKey(),
      missions: emptyMissions(),

      resetIfNewDay: () => {
        const today = todayKey();
        if (get().dateKey !== today) {
          set({ dateKey: today, missions: emptyMissions() });
        }
      },

      recordEvent: (type, value = 1) => {
        get().resetIfNewDay();
        const { missions } = get();
        const updated: Record<MissionId, MissionProgress> = { ...missions };
        let changed = false;

        for (const def of MISSION_CATALOG) {
          if (def.event !== type) continue;
          const current = updated[def.id];
          if (current.claimed) continue;
          const nextProgress = Math.min(def.target, current.progress + value);
          const nowCompleted = nextProgress >= def.target;
          if (nextProgress === current.progress && current.completed === nowCompleted) continue;

          const wasAlreadyComplete = current.completed;
          updated[def.id] = {
            progress: nextProgress,
            completed: nowCompleted,
            claimed: nowCompleted ? true : current.claimed,
          };
          changed = true;

          if (nowCompleted && !wasAlreadyComplete) {
            const { creditBones, addExp } = useGamificationStore.getState();
            creditBones(def.reward.bones);
            addExp(def.reward.exp);
          }
        }

        if (changed) set({ missions: updated });
      },

      getView: () => {
        get().resetIfNewDay();
        const { missions } = get();
        return MISSION_CATALOG.map((def) => ({ def, progress: missions[def.id] }));
      },
    }),
    {
      name: 'daily-missions',
      storage: createJSONStorage(() => createMMKVStorage()),
      partialize: (s) => ({ dateKey: s.dateKey, missions: s.missions }),
    },
  ),
);
