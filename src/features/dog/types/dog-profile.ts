export type PersonalityType =
  | 'tsundere'
  | 'hype_man'
  | 'gentle_giant'
  | 'drama_queen'
  | 'zen_master'
  | 'gremlin';

export type SpriteId =
  | 'shiba_inu'
  | 'golden_retriever'
  | 'siberian_husky'
  | 'corgi'
  | 'poodle'
  | 'small_generic'
  | 'medium_generic'
  | 'large_generic';

export interface DogPersonality {
  type: PersonalityType;
  name: string;
  title: string;
  catchphrase: string;
  stats: {
    energy: number;
    affection: number;
    mischief: number;
    appetite: number;
  };
}

export interface DogProfile {
  name: string;
  breed: string;
  spriteId: SpriteId;
  coatColor: string;
  bodySize: 'small' | 'medium' | 'large';
  personality: DogPersonality;
  level: number;
  xp: number;
  photoUri: string;
}
