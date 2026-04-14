/**
 * XP threshold to reach a given level.
 * Formula: level × level × 20 + 30  (quadratic growth)
 */
export function xpThresholdForLevel(level: number): number {
  return level * level * 20 + 30;
}

/**
 * Returns true if the dog should level up with the new XP total.
 */
export function shouldLevelUp(currentLevel: number, currentXp: number, addedXp: number): boolean {
  const totalXp = currentXp + addedXp;
  return totalXp >= xpThresholdForLevel(currentLevel);
}
