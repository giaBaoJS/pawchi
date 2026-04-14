import { View, Text } from 'react-native';
import type { MissionDef } from '../constants/mission-catalog';

interface MissionCardProps {
  def: MissionDef;
  progress: number;
  completed: boolean;
}

export function MissionCard({ def, progress, completed }: MissionCardProps) {
  const fraction = Math.min(1, progress / def.target);
  const pct = `${Math.round(fraction * 100)}%` as const;
  return (
    <View className="bg-card rounded-2xl px-4 py-3 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground font-semibold text-sm">{def.title}</Text>
        {completed ? (
          <Text className="text-success text-xs font-bold">✓ Done</Text>
        ) : (
          <Text className="text-foreground-secondary text-xs">
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
      <Text className="text-foreground-secondary text-xs">
        Reward: +{def.reward.bones} 🦴  ·  +{def.reward.exp} EXP
      </Text>
    </View>
  );
}
