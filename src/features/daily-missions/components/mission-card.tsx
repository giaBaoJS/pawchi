import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
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
        <AppText weight="extrabold" className="text-foreground text-sm">
          {def.title}
        </AppText>
        {completed ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={16} color={successColor} />
            <AppText weight="extrabold" className="text-success text-xs">
              Done
            </AppText>
          </View>
        ) : (
          <AppText weight="bold" className="text-foreground-secondary text-xs">
            {progress} / {def.target}
          </AppText>
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
          <AppText
            weight="semibold"
            className="text-foreground-secondary text-xs"
          >
            +{def.reward.bones}
          </AppText>
        </View>
        <AppText className="text-muted text-xs">·</AppText>
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={12} color={primaryColor} />
          <AppText
            weight="semibold"
            className="text-foreground-secondary text-xs"
          >
            +{def.reward.exp} EXP
          </AppText>
        </View>
      </View>
    </View>
  );
}
