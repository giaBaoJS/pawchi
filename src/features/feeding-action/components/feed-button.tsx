import { Pressable, Text } from 'react-native';
import { useFeeding } from '../hooks/use-feeding';
import { FEED_COST_BONES } from '@features/gamification/constants';

interface FeedButtonProps {
  onFed?: () => void;
}

function formatCooldown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FeedButton({ onFed }: FeedButtonProps) {
  const { canFeed, cooldownRemainingMs, feed } = useFeeding();

  function handlePress() {
    if (!canFeed) return;
    const result = feed();
    if (result.ok) onFed?.();
  }

  const label = canFeed
    ? `Feed (${FEED_COST_BONES} 🦴)`
    : `Ready in ${formatCooldown(cooldownRemainingMs)}`;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!canFeed}
      className={`flex-1 rounded-2xl py-4 items-center ${
        canFeed ? 'bg-primary' : 'bg-card'
      }`}
    >
      <Text
        className={`font-extrabold text-base ${
          canFeed ? 'text-white' : 'text-foreground-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
