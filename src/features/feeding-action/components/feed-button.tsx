import { Ionicons } from '@expo/vector-icons';
import { FEED_COST_BONES } from '@features/gamification/constants';
import { Pressable, View } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import { useCSSVariable } from 'uniwind';
import { cn } from '@lib/cn';
import { useFeeding } from '../hooks/use-feeding';

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
  const activeColor = useCSSVariable('--color-hunger') as string;
  const mutedColor = useCSSVariable('--color-muted') as string;

  function handlePress() {
    if (!canFeed) return;
    const result = feed();
    if (result.ok) onFed?.();
  }

  const label = canFeed
    ? `Feed · ${FEED_COST_BONES}`
    : formatCooldown(cooldownRemainingMs);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!canFeed}
      className={cn(
        'flex-1 rounded-3xl py-4 items-center justify-center gap-1 border',
        canFeed
          ? 'bg-overlay border-border-soft'
          : 'bg-overlay-soft border-border-soft',
      )}
    >
      <View className="flex-row items-center gap-1">
        <Ionicons
          name="restaurant"
          size={26}
          color={canFeed ? activeColor : mutedColor}
        />
      </View>
      <AppText
        className={cn(
          'font-extrabold text-sm',
          canFeed ? 'text-foreground' : 'text-foreground-secondary',
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
