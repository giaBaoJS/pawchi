export interface GameState {
  lastFedAt: number | null;
  lastPlayedAt: number | null;
  lastSleptAt: number | null;
  lastDecayTick: number;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_GAME_STATE: GameState = {
  lastFedAt: null,
  lastPlayedAt: null,
  lastSleptAt: null,
  lastDecayTick: Date.now(),
  hasCompletedOnboarding: false,
};
