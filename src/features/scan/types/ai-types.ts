import type { PersonalityType, SpriteId } from '@features/dog/types/dog-profile';

export interface BreedDetectionResult {
  has_dog: boolean;
  breed: string;
  confidence: number;
  body_size: 'small' | 'medium' | 'large';
  coat_color: string;
  coat_pattern: string;
  temperament_keywords: string[];
}

export interface PersonalityGenerationResult {
  name: string;
  title: string;
  personality_type: PersonalityType;
  catchphrase: string;
  stats: {
    energy: number;
    affection: number;
    mischief: number;
    appetite: number;
  };
}

export interface AIPipelineResult {
  breed: string;
  spriteId: SpriteId;
  coatColor: string;
  bodySize: 'small' | 'medium' | 'large';
  personality: PersonalityGenerationResult;
}

export class DogNotFoundError extends Error {
  constructor() {
    super('No dog detected in the photo');
    this.name = 'DogNotFoundError';
  }
}

export class AIParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIParseError';
  }
}
