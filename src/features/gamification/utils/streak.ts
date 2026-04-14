import { differenceInCalendarDays, parseISO } from 'date-fns';

interface StreakResult {
  streakDays: number;
  lastOpenDay: string;
}

export function computeStreak(
  prevStreak: number,
  lastOpenDay: string | null,
  todayKey: string,
): StreakResult {
  if (!lastOpenDay) {
    return { streakDays: 1, lastOpenDay: todayKey };
  }
  if (lastOpenDay === todayKey) {
    return { streakDays: Math.max(prevStreak, 1), lastOpenDay };
  }
  const diff = differenceInCalendarDays(parseISO(todayKey), parseISO(lastOpenDay));
  if (diff === 1) {
    return { streakDays: prevStreak + 1, lastOpenDay: todayKey };
  }
  return { streakDays: 1, lastOpenDay: todayKey };
}
