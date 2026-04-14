import {
  WALK_BONE_PER_MIN,
  WALK_EXP_PER_MIN,
  WALK_MAX_MINUTES,
  WALK_MIN_DURATION_SEC,
} from '@features/gamification/constants';

export interface WalkRewards {
  bones: number;
  exp: number;
  minutesCounted: number;
  tooShort: boolean;
}

export function computeWalkRewards(durationSeconds: number): WalkRewards {
  if (durationSeconds < WALK_MIN_DURATION_SEC) {
    return { bones: 0, exp: 0, minutesCounted: 0, tooShort: true };
  }
  const minutes = Math.min(WALK_MAX_MINUTES, Math.floor(durationSeconds / 60));
  return {
    bones: minutes * WALK_BONE_PER_MIN,
    exp: minutes * WALK_EXP_PER_MIN,
    minutesCounted: minutes,
    tooShort: false,
  };
}
