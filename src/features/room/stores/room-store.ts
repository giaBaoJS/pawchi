import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/keys/query';
import { readClientState, writeClientState } from '@lib/mmkv';
import type { RoomState, PlacedItem, ActiveSeason } from '../types/room-types';
import { DEFAULT_ROOM_STATE } from '../types/room-types';

const MMKV_KEY = 'room-state';

export const roomStateQueryOptions = queryOptions({
  queryKey: [queryKeys.roomState],
  queryFn: () => readClientState<RoomState>(MMKV_KEY, DEFAULT_ROOM_STATE),
  staleTime: Infinity,
  gcTime: Infinity,
});

export function useRoomState() {
  return useQuery(roomStateQueryOptions);
}

function getState(queryClient: ReturnType<typeof useQueryClient>): RoomState {
  return queryClient.getQueryData<RoomState>([queryKeys.roomState]) ?? DEFAULT_ROOM_STATE;
}

function setState(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: RoomState) => RoomState,
): void {
  const next = updater(getState(queryClient));
  writeClientState(MMKV_KEY, next);
  queryClient.setQueryData([queryKeys.roomState], next);
}

export function usePlaceItem() {
  const queryClient = useQueryClient();
  return (item: PlacedItem) =>
    setState(queryClient, (prev) => ({
      ...prev,
      placedItems: [...prev.placedItems, item],
    }));
}

export function useRemoveItem() {
  const queryClient = useQueryClient();
  return (itemId: string) =>
    setState(queryClient, (prev) => ({
      ...prev,
      placedItems: prev.placedItems.filter((i) => i.itemId !== itemId),
    }));
}

export function useSetActiveSeason() {
  const queryClient = useQueryClient();
  return (season: ActiveSeason) =>
    setState(queryClient, (prev) => ({ ...prev, activeSeason: season }));
}
