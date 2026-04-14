export type BodySize = 'small' | 'medium' | 'large';

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  bodySize: BodySize;
  coatColor: string;
  coatPattern: string;
  avatarId: string;
  photoUri: string;
  createdAt: number;
}
