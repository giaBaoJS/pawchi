import { useEffect, useState } from 'react';
import { FEED_COOLDOWN_MS } from '@features/gamification/constants';
import { useFeedingStore } from '../stores/feeding-store';

export function useFeeding() {
  const lastFedAt = useFeedingStore((s) => s.lastFedAt);
  const feed = useFeedingStore((s) => s.feed);
  const [now, setNow] = useState(() => Date.now());

  const cooldownEnd = lastFedAt ? lastFedAt + FEED_COOLDOWN_MS : 0;
  const cooldownRemainingMs = Math.max(0, cooldownEnd - now);
  const canFeed = cooldownRemainingMs === 0;

  useEffect(() => {
    if (cooldownRemainingMs === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [cooldownRemainingMs]);

  return { canFeed, cooldownRemainingMs, feed };
}
