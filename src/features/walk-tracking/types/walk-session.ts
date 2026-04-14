export interface WalkSession {
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  distanceMeters: number | null;
}
