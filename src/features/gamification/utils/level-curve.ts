export function expToLevel(exp: number): number {
  return Math.floor(Math.sqrt(exp / 50)) + 1;
}

export function expForLevel(level: number): number {
  const base = level - 1;
  return base * base * 50;
}

export function expToNextLevel(exp: number): number {
  const nextLevel = expToLevel(exp) + 1;
  return Math.max(0, expForLevel(nextLevel) - exp);
}
