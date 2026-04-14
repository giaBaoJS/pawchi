import { View, Text } from 'react-native';
import { useDogProfileStore } from '@features/dog-profile/stores/dog-profile-store';
import { useGamification } from '@features/gamification/hooks/use-gamification';
import { expForLevel } from '@features/gamification/utils/level-curve';

export function HubHeader() {
  const profileName = useDogProfileStore((s) => s.profile?.name ?? 'Your dog');
  const { bones, level, exp, streakDays } = useGamification();

  const levelFloor = expForLevel(level);
  const levelCeil = expForLevel(level + 1);
  const span = Math.max(1, levelCeil - levelFloor);
  const fraction = Math.min(1, Math.max(0, (exp - levelFloor) / span));
  const pct = `${Math.round(fraction * 100)}%` as const;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-foreground text-2xl font-extrabold">{profileName}</Text>
          <Text className="text-foreground-secondary text-xs">Level {level}</Text>
        </View>
        <View className="flex-row gap-4">
          <Badge icon="🦴" value={String(bones)} />
          <Badge icon="🔥" value={String(streakDays)} />
        </View>
      </View>
      <View className="h-2 bg-card rounded-full overflow-hidden">
        <View style={{ width: pct }} className="h-full bg-primary" />
      </View>
    </View>
  );
}

function Badge({ icon, value }: { icon: string; value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-base">{icon}</Text>
      <Text className="text-foreground font-bold text-sm">{value}</Text>
    </View>
  );
}
