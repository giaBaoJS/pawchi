import type { AvatarId } from '../constants/sprite-map';

interface BreedResult {
  breed: string;
  bodySize: 'small' | 'medium' | 'large';
}

const BREED_MAP: Record<string, AvatarId> = {
  'shiba inu': 'shiba-inu',
  shiba: 'shiba-inu',
  'golden retriever': 'golden-retriever',
  golden: 'golden-retriever',
  labrador: 'labrador',
  'labrador retriever': 'labrador',
  lab: 'labrador',
  poodle: 'poodle',
  'toy poodle': 'poodle',
  'standard poodle': 'poodle',
  'french bulldog': 'french-bulldog',
  frenchie: 'french-bulldog',
  beagle: 'beagle',
  dachshund: 'dachshund',
  'german shepherd': 'german-shepherd',
  gsd: 'german-shepherd',
  corgi: 'corgi',
  'pembroke welsh corgi': 'corgi',
  husky: 'husky',
  'siberian husky': 'husky',
  chihuahua: 'chihuahua',
  pug: 'pug',
};

export function resolveAvatar(result: BreedResult | string): AvatarId {
  const breed = typeof result === 'string' ? result : result.breed;
  const normalized = breed.trim().toLowerCase();
  const direct = BREED_MAP[normalized];
  if (direct) return direct;

  for (const [key, id] of Object.entries(BREED_MAP)) {
    if (normalized.includes(key)) return id;
  }

  if (typeof result === 'object') {
    switch (result.bodySize) {
      case 'small':
        return 'generic-small';
      case 'large':
        return 'generic-large';
      default:
        return 'generic-medium';
    }
  }
  return 'generic-medium';
}
