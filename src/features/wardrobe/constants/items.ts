import type { WardrobeItem } from '../types/wardrobe-types';

export const WARDROBE_ITEMS: WardrobeItem[] = [
  // ── Hats (6) ────────────────────────────────────────────────
  { id: 'hat_beret',       name: 'Beret',        category: 'hat',       unlockLevel: 1,  emoji: '🎩', fillColor: '#FFAFCC' },
  { id: 'hat_flower',      name: 'Flower Crown', category: 'hat',       unlockLevel: 1,  emoji: '🌸', fillColor: '#FFE4EC' },
  { id: 'hat_tophat',      name: 'Top Hat',      category: 'hat',       unlockLevel: 3,  emoji: '🎩', fillColor: '#5A4A54' },
  { id: 'hat_strawhat',    name: 'Straw Hat',    category: 'hat',       unlockLevel: 2,  emoji: '👒', fillColor: '#FFE9A8' },
  { id: 'hat_bunny',       name: 'Bunny Ears',   category: 'hat',       unlockLevel: 4,  emoji: '🐰', fillColor: '#FFF0F5' },
  { id: 'hat_crown',       name: 'Crown',        category: 'hat',       unlockLevel: 6,  emoji: '👑', fillColor: '#FFCBA4' },

  // ── Shirts (6) ──────────────────────────────────────────────
  { id: 'shirt_bow',       name: 'Bow Tie',      category: 'shirt',     unlockLevel: 1,  emoji: '🎀', fillColor: '#FFAFCC' },
  { id: 'shirt_stripe',    name: 'Stripes',      category: 'shirt',     unlockLevel: 1,  emoji: '👕', fillColor: '#BDE0FE' },
  { id: 'shirt_sweater',   name: 'Sweater',      category: 'shirt',     unlockLevel: 2,  emoji: '🧶', fillColor: '#FFE9A8' },
  { id: 'shirt_hoodie',    name: 'Hoodie',       category: 'shirt',     unlockLevel: 3,  emoji: '🧥', fillColor: '#B9E4C9' },
  { id: 'shirt_tuxedo',    name: 'Tuxedo',       category: 'shirt',     unlockLevel: 5,  emoji: '🤵', fillColor: '#5A4A54' },
  { id: 'shirt_kimono',    name: 'Kimono',       category: 'shirt',     unlockLevel: 7,  emoji: '👘', fillColor: '#D8C8F6' },

  // ── Pants (4) ───────────────────────────────────────────────
  { id: 'pants_shorts',    name: 'Shorts',       category: 'pants',     unlockLevel: 1,  emoji: '🩳', fillColor: '#BDE0FE' },
  { id: 'pants_jeans',     name: 'Jeans',        category: 'pants',     unlockLevel: 2,  emoji: '👖', fillColor: '#8B7A82' },
  { id: 'pants_skirt',     name: 'Skirt',        category: 'pants',     unlockLevel: 3,  emoji: '👗', fillColor: '#FFE4EC' },
  { id: 'pants_overalls',  name: 'Overalls',     category: 'pants',     unlockLevel: 4,  emoji: '👔', fillColor: '#FFCBA4' },

  // ── Accessories (4) ─────────────────────────────────────────
  { id: 'acc_glasses',     name: 'Glasses',      category: 'accessory', unlockLevel: 1,  emoji: '🕶️', fillColor: '#5A4A54' },
  { id: 'acc_scarf',       name: 'Scarf',        category: 'accessory', unlockLevel: 2,  emoji: '🧣', fillColor: '#FFAFCC' },
  { id: 'acc_bowtie',      name: 'Bow',          category: 'accessory', unlockLevel: 2,  emoji: '🎀', fillColor: '#D8C8F6' },
  { id: 'acc_bag',         name: 'Tiny Bag',     category: 'accessory', unlockLevel: 5,  emoji: '👜', fillColor: '#FFE9A8' },
];
