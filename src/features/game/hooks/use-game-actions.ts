import { useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { queryKeys } from '@/api/keys/query';
import { writeClientState } from '@lib/mmkv';
import {
  ACTION_EFFECTS,
  applyActionDelta,
  getCooldownRemaining,
  formatCooldown,
} from '../utils/game-engine';
import { shouldLevelUp } from '../utils/level-system';
import type { GameState } from '../types/game-state';
import type { DogState } from '@features/dog/types/dog-state';

export interface GameActionState {
  feedCooldown: string;
  sleepCooldown: string;
  canFeed: boolean;
  canSleep: boolean;
}

export function useGameActionState(): GameActionState {
  const queryClient = useQueryClient();
  const gameState = queryClient.getQueryData<GameState>([queryKeys.gameState]);
  const now = Date.now();

  const feedRemaining = getCooldownRemaining('feed', gameState?.lastFedAt ?? null, now);
  const sleepRemaining = getCooldownRemaining('sleep', gameState?.lastSleptAt ?? null, now);

  return {
    feedCooldown: formatCooldown(feedRemaining),
    sleepCooldown: formatCooldown(sleepRemaining),
    canFeed: feedRemaining === 0,
    canSleep: sleepRemaining === 0,
  };
}

export function useGameActions() {
  const queryClient = useQueryClient();

  function performAction(action: 'feed' | 'play' | 'sleep') {
    const gameState = queryClient.getQueryData<GameState>([queryKeys.gameState]);
    const dogState = queryClient.getQueryData<DogState>([queryKeys.dogState]);

    if (!dogState?.profile) return;

    const now = Date.now();

    if (action === 'feed') {
      const remaining = getCooldownRemaining('feed', gameState?.lastFedAt ?? null, now);
      if (remaining > 0) return;
    }
    if (action === 'sleep') {
      const remaining = getCooldownRemaining('sleep', gameState?.lastSleptAt ?? null, now);
      if (remaining > 0) return;
    }

    const effect = ACTION_EFFECTS[action];
    const updatedStats = applyActionDelta(dogState.stats, effect.statsDelta);
    const newXp = dogState.profile.xp + effect.xpGain;
    const didLevelUp = shouldLevelUp(dogState.profile.level, dogState.profile.xp, effect.xpGain);

    const nextDog: DogState = {
      ...dogState,
      stats: updatedStats,
      profile: {
        ...dogState.profile,
        xp: didLevelUp ? 0 : newXp,
        level: didLevelUp ? dogState.profile.level + 1 : dogState.profile.level,
      },
    };

    const nextGame: GameState = {
      ...(gameState ?? {
        lastFedAt: null,
        lastPlayedAt: null,
        lastSleptAt: null,
        lastDecayTick: now,
        hasCompletedOnboarding: true,
      }),
      lastFedAt: action === 'feed' ? now : (gameState?.lastFedAt ?? null),
      lastPlayedAt: action === 'play' ? now : (gameState?.lastPlayedAt ?? null),
      lastSleptAt: action === 'sleep' ? now : (gameState?.lastSleptAt ?? null),
    };

    writeClientState('dog-state', nextDog);
    writeClientState('game-state', nextGame);
    queryClient.setQueryData([queryKeys.dogState], nextDog);
    queryClient.setQueryData([queryKeys.gameState], nextGame);

    impactAsync(ImpactFeedbackStyle.Medium);

    return { didLevelUp };
  }

  return { performAction };
}
