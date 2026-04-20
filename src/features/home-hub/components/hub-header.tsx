import { Ionicons } from '@expo/vector-icons';
import { useDogProfileStore } from '@features/dog-profile/stores/dog-profile-store';
import { useGamification } from '@features/gamification/hooks/use-gamification';
import { expForLevel } from '@features/gamification/utils/level-curve';
import { Text, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

export function HubHeader() {
  const profileName = useDogProfileStore((s) => s.profile?.name ?? 'Your dog');
  const { bones, level, exp, streakDays } = useGamification();
  const boneColor = useCSSVariable('--color-personality') as string;
  const flameColor = useCSSVariable('--color-danger') as string;

  const levelFloor = expForLevel(level);
  const levelCeil = expForLevel(level + 1);
  const span = Math.max(1, levelCeil - levelFloor);
  const fraction = Math.min(1, Math.max(0, (exp - levelFloor) / span));
  const pct = `${Math.round(fraction * 100)}%` as const;

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between">
        <View className="gap-0.5">
          <Text className="text-foreground text-2xl font-extrabold -tracking-wide">
            {profileName}
          </Text>
          <View className="bg-overlay border border-border-soft self-start px-2.5 py-0.5 rounded-full">
            <Text className="text-foreground-secondary text-xs font-bold">
              Level {level}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Badge iconName="paw" iconColor={boneColor} value={String(bones)} />
          <Badge iconName="flame" iconColor={flameColor} value={String(streakDays)} />
        </View>
      </View>
      <View className="h-2.5 bg-overlay border border-border-soft rounded-full overflow-hidden">
        <View style={{ width: pct }} className="h-full bg-primary" />
      </View>
    </View>
  );
}

interface BadgeProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
}

function Badge({ iconName, iconColor, value }: BadgeProps) {
  return (
    <View className="flex-row items-center gap-1 bg-overlay border border-border-soft px-3 py-1.5 rounded-full">
      <Ionicons name={iconName} size={14} color={iconColor} />
      <Text className="text-foreground font-extrabold text-xs">{value}</Text>
    </View>
  );
}
