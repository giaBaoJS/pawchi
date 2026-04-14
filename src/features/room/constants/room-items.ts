import type { RoomItem } from '../types/room-types';

export const ROOM_ITEMS: RoomItem[] = [
  // ── Furniture ───────────────────────────────────────────────
  { id: 'room_bed',       name: 'Cozy Bed',     category: 'furniture', emoji: '🛏️', unlockLevel: 1 },
  { id: 'room_bowl_food', name: 'Food Bowl',    category: 'furniture', emoji: '🥣', unlockLevel: 1 },
  { id: 'room_bowl_water',name: 'Water Bowl',   category: 'furniture', emoji: '💧', unlockLevel: 1 },
  { id: 'room_toy_ball',  name: 'Ball',         category: 'furniture', emoji: '⚽', unlockLevel: 1 },
  { id: 'room_plant',     name: 'Plant',        category: 'furniture', emoji: '🪴', unlockLevel: 2 },
  { id: 'room_rug',       name: 'Rug',          category: 'furniture', emoji: '🟫', unlockLevel: 2 },

  // ── Decor ────────────────────────────────────────────────────
  { id: 'room_lamp',      name: 'Lamp',         category: 'decor',     emoji: '🪔', unlockLevel: 2 },
  { id: 'room_clock',     name: 'Wall Clock',   category: 'decor',     emoji: '🕐', unlockLevel: 3 },
  { id: 'room_bookshelf', name: 'Bookshelf',    category: 'decor',     emoji: '📚', unlockLevel: 4 },
  { id: 'room_window',    name: 'Window',       category: 'decor',     emoji: '🪟', unlockLevel: 3 },

  // ── Seasonal ─────────────────────────────────────────────────
  { id: 'room_sakura',    name: 'Sakura Branch',category: 'seasonal',  emoji: '🌸', season: 'spring', unlockLevel: 1 },
  { id: 'room_sunflower', name: 'Sunflower',    category: 'seasonal',  emoji: '🌻', season: 'summer', unlockLevel: 1 },
  { id: 'room_pumpkin',   name: 'Pumpkin',      category: 'seasonal',  emoji: '🎃', season: 'fall',   unlockLevel: 1 },
  { id: 'room_snowglobe', name: 'Snow Globe',   category: 'seasonal',  emoji: '🔮', season: 'winter', unlockLevel: 1 },
];
