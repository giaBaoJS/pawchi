export type BodySize = 'small' | 'medium' | 'large';

export interface DogProfile {
  id: string;
  name: string;
  dob: number;
  gender: 'male' | 'female';
  breed: string;
  bodySize: BodySize;
  coatColor: string;
  coatPattern: string;
  avatarId: string;
  photoUri: string;
  createdAt: number;
}
