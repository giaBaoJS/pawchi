import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useCSSVariable } from 'uniwind';
import type { MissionDef } from '../constants/mission-catalog';

interface MissionCardProps {
  def: MissionDef;
  progress: number;
  completed: boolean;
}

export function MissionCard({ def, progress, completed }: MissionCardProps) {
  const fraction = Math.min(1, progress / def.target);
  const pct = `${Math.round(fraction * 100)}%` as const;
  const successColor = useCSSVariable('--color-success') as string;
  const primaryColor = useCSSVariable('--color-primary') as string;
  const personalityColor = useCSSVariable('--color-personality') as string;

  return (
    <View className="bg-overlay border border-border-soft rounded-3xl p-4 gap-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground font-extrabold text-sm">{def.title}</Text>
        {completed ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={16} color={successColor} />
            <Text className="text-success text-xs font-extrabold">Done</Text>
          </View>
        ) : (
          <Text className="text-foreground-secondary text-xs font-bold">
            {progress} / {def.target}
          </Text>
        )}
      </View>
      <View className="h-2 bg-card-alt rounded-full overflow-hidden">
        <View
          style={{ width: pct }}
          className={completed ? 'h-full bg-success' : 'h-full bg-primary'}
        />
      </View>
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1">
          <Ionicons name="paw" size={12} color={personalityColor} />
          <Text className="text-foreground-secondary text-xs font-semibold">
            +{def.reward.bones}
          </Text>
        </View>
        <Text className="text-muted text-xs">·</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={12} color={primaryColor} />
          <Text className="text-foreground-secondary text-xs font-semibold">
            +{def.reward.exp} EXP
          </Text>
        </View>
      </View>
    </View>
  );
}
