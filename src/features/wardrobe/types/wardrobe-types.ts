export type OutfitSlot = 'hat' | 'shirt' | 'pants' | 'accessory';
export type WardrobeCategory = 'all' | OutfitSlot | 'room' | 'season';

export interface WardrobeItem {
  id: string;
  name: string;
  category: OutfitSlot;
  unlockLevel: number;
  emoji: string;
  fillColor: string;
}
