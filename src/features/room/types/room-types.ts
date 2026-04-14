export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type ActiveSeason = 'auto' | Season;

export interface PlacedItem {
  itemId: string;
  x: number;
  y: number;
}

export interface RoomState {
  placedItems: PlacedItem[];
  activeSeason: ActiveSeason;
}

export const DEFAULT_ROOM_STATE: RoomState = {
  placedItems: [],
  activeSeason: 'auto',
};

export interface RoomItem {
  id: string;
  name: string;
  category: 'furniture' | 'decor' | 'seasonal';
  emoji: string;
  season?: Season;
  unlockLevel: number;
}
