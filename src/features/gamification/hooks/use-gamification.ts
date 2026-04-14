import { useGamificationStore } from '../stores/gamification-store';
import { expToLevel, expToNextLevel } from '../utils/level-curve';

export function useGamification() {
  const bones = useGamificationStore((s) => s.bones);
  const exp = useGamificationStore((s) => s.exp);
  const streakDays = useGamificationStore((s) => s.streakDays);

  return {
    bones,
    exp,
    level: expToLevel(exp),
    expToNextLevel: expToNextLevel(exp),
    streakDays,
  };
}
