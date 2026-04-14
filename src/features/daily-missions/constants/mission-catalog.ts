import {
  MISSION_FEED_TARGET,
  MISSION_WALK_TARGET_MIN,
} from '@features/gamification/constants';

export type MissionId = 'walk-10' | 'feed-2' | 'open-app';
export type MissionEventType = 'walked-minutes' | 'fed' | 'opened-app';

export interface MissionDef {
  id: MissionId;
  title: string;
  target: number;
  event: MissionEventType;
  reward: { bones: number; exp: number };
}

export const MISSION_CATALOG: MissionDef[] = [
  {
    id: 'walk-10',
    title: `Walk ${MISSION_WALK_TARGET_MIN} minutes`,
    target: MISSION_WALK_TARGET_MIN,
    event: 'walked-minutes',
    reward: { bones: 15, exp: 30 },
  },
  {
    id: 'feed-2',
    title: `Feed your dog ${MISSION_FEED_TARGET} times`,
    target: MISSION_FEED_TARGET,
    event: 'fed',
    reward: { bones: 10, exp: 15 },
  },
  {
    id: 'open-app',
    title: 'Open the app',
    target: 1,
    event: 'opened-app',
    reward: { bones: 5, exp: 5 },
  },
];
