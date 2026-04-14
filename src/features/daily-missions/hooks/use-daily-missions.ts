import { useDailyMissionsStore } from '../stores/daily-missions-store';
import { MISSION_CATALOG } from '../constants/mission-catalog';

export function useDailyMissions() {
  const dateKey = useDailyMissionsStore((s) => s.dateKey);
  const missions = useDailyMissionsStore((s) => s.missions);
  const resetIfNewDay = useDailyMissionsStore((s) => s.resetIfNewDay);

  resetIfNewDay();

  return MISSION_CATALOG.map((def) => ({
    def,
    progress: missions[def.id] ?? { progress: 0, completed: false, claimed: false },
    dateKey,
  }));
}
