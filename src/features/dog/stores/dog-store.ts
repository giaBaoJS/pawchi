import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/keys/query';
import { readClientState, writeClientState } from '@lib/mmkv';
import type { DogState, DogStats, DogOutfit } from '../types/dog-state';
import type { DogProfile } from '../types/dog-profile';
import { DEFAULT_DOG_STATE } from '../types/dog-state';

const MMKV_KEY = 'dog-state';

export const dogStateQueryOptions = queryOptions({
  queryKey: [queryKeys.dogState],
  queryFn: () => readClientState<DogState>(MMKV_KEY, DEFAULT_DOG_STATE),
  staleTime: Infinity,
  gcTime: Infinity,
});

export function useDogState() {
  return useQuery(dogStateQueryOptions);
}

export function useDogProfile() {
  const { data } = useQuery(dogStateQueryOptions);
  return data?.profile ?? null;
}

export function useDogStats() {
  const { data } = useQuery(dogStateQueryOptions);
  return data?.stats ?? DEFAULT_DOG_STATE.stats;
}

export function useDogOutfit() {
  const { data } = useQuery(dogStateQueryOptions);
  return data?.outfit ?? DEFAULT_DOG_STATE.outfit;
}

function getState(queryClient: ReturnType<typeof useQueryClient>): DogState {
  return queryClient.getQueryData<DogState>([queryKeys.dogState]) ?? DEFAULT_DOG_STATE;
}

function setState(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: DogState) => DogState,
): void {
  const next = updater(getState(queryClient));
  writeClientState(MMKV_KEY, next);
  queryClient.setQueryData([queryKeys.dogState], next);
}

export function useSetDogProfile() {
  const queryClient = useQueryClient();
  return (profile: DogProfile) =>
    setState(queryClient, (prev) => ({ ...prev, profile }));
}

export function useUpdateDogStats() {
  const queryClient = useQueryClient();
  return (updater: (prev: DogStats) => DogStats) =>
    setState(queryClient, (prev) => ({
      ...prev,
      stats: updater(prev.stats),
    }));
}

export function useEquipItem() {
  const queryClient = useQueryClient();
  return (slot: keyof DogOutfit, itemId: string | null) =>
    setState(queryClient, (prev) => ({
      ...prev,
      outfit: { ...prev.outfit, [slot]: itemId },
    }));
}

export function useAddXP() {
  const queryClient = useQueryClient();
  return (amount: number) =>
    setState(queryClient, (prev) => {
      if (!prev.profile) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, xp: prev.profile.xp + amount },
      };
    });
}

export function useLevelUpDog() {
  const queryClient = useQueryClient();
  return () =>
    setState(queryClient, (prev) => {
      if (!prev.profile) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, level: prev.profile.level + 1, xp: 0 },
      };
    });
}

export function useClearDog() {
  const queryClient = useQueryClient();
  return () =>
    setState(queryClient, () => DEFAULT_DOG_STATE);
}
