export type Mood = 'happy' | 'content' | 'neutral' | 'sad' | 'hungry';

export interface PetState {
  hunger: number;
  happiness: number;
  energy: number;
  lastUpdatedAt: number;
}

export interface PetStateEvent {
  hunger?: number;
  happiness?: number;
  energy?: number;
}
