import { useState } from 'react';
import { WARDROBE_ITEMS } from '../constants/items';
import { useDogOutfit, useEquipItem } from '@features/dog/stores/dog-store';
import { useDogProfile } from '@features/dog/stores/dog-store';
import type { WardrobeCategory, OutfitSlot } from '../types/wardrobe-types';

export function useWardrobe() {
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory>('all');
  const outfit = useDogOutfit();
  const profile = useDogProfile();
  const equipItem = useEquipItem();

  const dogLevel = profile?.level ?? 1;

  const filteredItems =
    activeCategory === 'all'
      ? WARDROBE_ITEMS
      : WARDROBE_ITEMS.filter((item) => item.category === activeCategory);

  function handleSelectItem(itemId: string, slot: OutfitSlot) {
    const currentlyEquipped = outfit[slot];
    // Tapping an already-equipped item unequips it
    equipItem(slot, currentlyEquipped === itemId ? null : itemId);
  }

  function isSelected(itemId: string, slot: OutfitSlot): boolean {
    return outfit[slot] === itemId;
  }

  function isLocked(unlockLevel: number): boolean {
    return dogLevel < unlockLevel;
  }

  return {
    activeCategory,
    setActiveCategory,
    filteredItems,
    handleSelectItem,
    isSelected,
    isLocked,
    outfit,
  };
}
