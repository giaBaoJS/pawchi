import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/keys/query';
import { readClientState, writeClientState } from '@lib/mmkv';
import type { GameState } from '../types/game-state';
import { DEFAULT_GAME_STATE } from '../types/game-state';

const MMKV_KEY = 'game-state';

export const gameStateQueryOptions = queryOptions({
  queryKey: [queryKeys.gameState],
  queryFn: () => readClientState<GameState>(MMKV_KEY, DEFAULT_GAME_STATE),
  staleTime: Infinity,
  gcTime: Infinity,
});

export function useGameState() {
  return useQuery(gameStateQueryOptions);
}

function getState(queryClient: ReturnType<typeof useQueryClient>): GameState {
  return queryClient.getQueryData<GameState>([queryKeys.gameState]) ?? DEFAULT_GAME_STATE;
}

function setState(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: GameState) => GameState,
): void {
  const next = updater(getState(queryClient));
  writeClientState(MMKV_KEY, next);
  queryClient.setQueryData([queryKeys.gameState], next);
}

export function useRecordAction() {
  const queryClient = useQueryClient();
  return (action: 'feed' | 'play' | 'sleep') => {
    const now = Date.now();
    setState(queryClient, (prev) => ({
      ...prev,
      lastFedAt: action === 'feed' ? now : prev.lastFedAt,
      lastPlayedAt: action === 'play' ? now : prev.lastPlayedAt,
      lastSleptAt: action === 'sleep' ? now : prev.lastSleptAt,
    }));
  };
}

export function useSetDecayTick() {
  const queryClient = useQueryClient();
  return (timestamp: number) =>
    setState(queryClient, (prev) => ({ ...prev, lastDecayTick: timestamp }));
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return () =>
    setState(queryClient, (prev) => ({ ...prev, hasCompletedOnboarding: true }));
}

export function getGameStateSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
): GameState {
  return queryClient.getQueryData<GameState>([queryKeys.gameState]) ?? DEFAULT_GAME_STATE;
}
