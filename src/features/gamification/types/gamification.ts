export interface GamificationState {
  bones: number;
  exp: number;
  streakDays: number;
  lastOpenDay: string | null;
}

export type DebitResult = { ok: true } | { ok: false; reason: 'insufficient' };
