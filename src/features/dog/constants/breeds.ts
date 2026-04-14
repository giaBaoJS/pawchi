import type { SpriteId } from '../types/dog-profile';

export interface BreedPaths {
  body: string;
  head: string;
  earBack: string;
  earFront: string;
  tail: string;
  shadow: string;
}

// Simplified placeholder paths — replace with real breed artwork SVG paths.
// Each path is in a coordinate space of 180×180.

const SHIBA_PATHS: BreedPaths = {
  shadow:
    'M 50 160 Q 90 172 130 160 Q 140 170 90 175 Q 40 170 50 160 Z',
  tail:
    'M 130 110 Q 155 85 148 65 Q 145 55 138 68 Q 132 88 125 105 Z',
  body:
    'M 40 150 Q 35 100 50 80 Q 70 60 90 62 Q 110 60 130 80 Q 145 100 140 150 Q 115 158 65 158 Z',
  earBack:
    'M 58 72 Q 50 45 65 38 Q 75 35 78 55 Z',
  head:
    'M 55 95 Q 50 65 68 52 Q 80 45 90 46 Q 100 45 112 52 Q 130 65 125 95 Q 118 115 90 118 Q 62 115 55 95 Z',
  earFront:
    'M 62 78 Q 56 56 68 50 Q 76 48 78 65 Z',
};

const GOLDEN_PATHS: BreedPaths = {
  shadow:
    'M 45 162 Q 90 174 135 162 Q 146 172 90 177 Q 34 172 45 162 Z',
  tail:
    'M 132 115 Q 158 92 152 68 Q 148 56 140 70 Q 134 92 128 112 Z',
  body:
    'M 35 152 Q 30 98 48 76 Q 68 56 90 58 Q 112 56 132 76 Q 150 98 145 152 Q 118 162 62 162 Z',
  earBack:
    'M 54 75 Q 42 50 58 40 Q 70 36 74 58 Z',
  head:
    'M 50 98 Q 44 66 65 50 Q 78 42 90 44 Q 102 42 115 50 Q 136 66 130 98 Q 122 120 90 123 Q 58 120 50 98 Z',
  earFront:
    'M 58 82 Q 48 60 62 52 Q 72 48 76 68 Z',
};

const HUSKY_PATHS: BreedPaths = {
  shadow: SHIBA_PATHS.shadow,
  tail: 'M 128 112 Q 152 88 146 64 Q 142 52 135 65 Q 130 86 122 108 Z',
  body:
    'M 38 150 Q 33 98 50 78 Q 70 58 90 60 Q 110 58 130 78 Q 147 98 142 150 Q 116 160 64 160 Z',
  earBack:
    'M 60 70 Q 52 44 67 37 Q 77 33 80 53 Z',
  head:
    'M 53 96 Q 47 64 67 50 Q 79 43 90 44 Q 101 43 113 50 Q 133 64 127 96 Q 119 117 90 120 Q 61 117 53 96 Z',
  earFront:
    'M 63 76 Q 57 54 68 47 Q 77 44 80 62 Z',
};

const CORGI_PATHS: BreedPaths = {
  shadow: 'M 48 162 Q 90 174 132 162 Q 142 172 90 176 Q 38 172 48 162 Z',
  tail: 'M 128 108 Q 144 92 140 76 Q 137 68 132 78 Q 128 92 122 106 Z',
  body:
    'M 38 152 Q 33 106 48 86 Q 65 68 90 70 Q 115 68 132 86 Q 147 106 142 152 Q 116 160 64 160 Z',
  earBack:
    'M 55 68 Q 44 42 62 33 Q 74 28 78 52 Z',
  head:
    'M 50 97 Q 44 68 65 53 Q 78 46 90 47 Q 102 46 115 53 Q 136 68 130 97 Q 122 118 90 121 Q 58 118 50 97 Z',
  earFront:
    'M 58 74 Q 50 52 64 45 Q 74 41 78 60 Z',
};

const POODLE_PATHS: BreedPaths = {
  shadow: SHIBA_PATHS.shadow,
  tail: 'M 130 112 Q 148 96 145 78 Q 143 68 136 78 Q 132 95 126 110 Z',
  body:
    'M 40 150 Q 35 100 52 80 Q 72 60 90 62 Q 108 60 128 80 Q 145 100 140 150 Q 115 158 65 158 Z',
  earBack:
    'M 56 76 Q 44 52 60 42 Q 72 38 76 58 Z',
  head:
    'M 54 96 Q 48 66 67 52 Q 79 45 90 46 Q 101 45 113 52 Q 132 66 126 96 Q 118 117 90 120 Q 62 117 54 96 Z',
  earFront:
    'M 60 82 Q 50 60 63 52 Q 73 48 77 66 Z',
};

const SMALL_GENERIC_PATHS: BreedPaths = {
  shadow: 'M 55 158 Q 90 168 125 158 Q 134 167 90 172 Q 46 167 55 158 Z',
  tail: 'M 124 108 Q 140 92 136 78 Q 133 70 127 80 Q 123 93 118 106 Z',
  body:
    'M 44 148 Q 40 104 54 86 Q 70 68 90 70 Q 110 68 126 86 Q 140 104 136 148 Q 112 156 68 156 Z',
  earBack: 'M 60 74 Q 52 52 65 44 Q 74 40 77 58 Z',
  head:
    'M 53 96 Q 48 70 66 55 Q 78 48 90 49 Q 102 48 114 55 Q 132 70 127 96 Q 120 115 90 118 Q 60 115 53 96 Z',
  earFront: 'M 63 80 Q 57 60 67 52 Q 75 48 78 64 Z',
};

export const BREED_PATHS: Record<SpriteId, BreedPaths> = {
  shiba_inu: SHIBA_PATHS,
  golden_retriever: GOLDEN_PATHS,
  siberian_husky: HUSKY_PATHS,
  corgi: CORGI_PATHS,
  poodle: POODLE_PATHS,
  small_generic: SMALL_GENERIC_PATHS,
  medium_generic: GOLDEN_PATHS,
  large_generic: {
    ...GOLDEN_PATHS,
    body: 'M 30 155 Q 24 96 44 74 Q 65 52 90 54 Q 115 52 136 74 Q 156 96 150 155 Q 120 166 60 166 Z',
  },
};

export const BREED_DEFAULTS: Record<SpriteId, { coatColor: string; innerEarColor: string }> = {
  shiba_inu: { coatColor: '#C8843A', innerEarColor: '#F4C08A' },
  golden_retriever: { coatColor: '#D4A055', innerEarColor: '#F0CFA0' },
  siberian_husky: { coatColor: '#A0A0A8', innerEarColor: '#E8E8F0' },
  corgi: { coatColor: '#C87840', innerEarColor: '#F0C890' },
  poodle: { coatColor: '#D4B8D0', innerEarColor: '#F0E0F0' },
  small_generic: { coatColor: '#C49060', innerEarColor: '#ECC898' },
  medium_generic: { coatColor: '#C49060', innerEarColor: '#ECC898' },
  large_generic: { coatColor: '#C49060', innerEarColor: '#ECC898' },
};

const BREED_MAP: Record<string, SpriteId> = {
  'shiba inu': 'shiba_inu',
  shiba: 'shiba_inu',
  'golden retriever': 'golden_retriever',
  golden: 'golden_retriever',
  'siberian husky': 'siberian_husky',
  husky: 'siberian_husky',
  corgi: 'corgi',
  'pembroke welsh corgi': 'corgi',
  poodle: 'poodle',
  'toy poodle': 'poodle',
  'miniature poodle': 'poodle',
};

export function breedToSpriteId(breed: string, bodySize: 'small' | 'medium' | 'large'): SpriteId {
  const normalized = breed.toLowerCase().trim();
  if (BREED_MAP[normalized]) return BREED_MAP[normalized];

  // Partial match
  for (const [key, spriteId] of Object.entries(BREED_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return spriteId;
  }

  // Fallback by size
  if (bodySize === 'small') return 'small_generic';
  if (bodySize === 'large') return 'large_generic';
  return 'medium_generic';
}
