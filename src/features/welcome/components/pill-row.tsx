import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const PILLS = [
  { icon: 'paw' as const, label: 'Breed ID' },
  { icon: 'stats-chart' as const, label: 'Stats' },
  { icon: 'sparkles' as const, label: 'Instant' },
];

const TRANSLATE_DISTANCE = 14;

interface AnimatedPillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  progress: SharedValue<number>;
  color: string;
}

function AnimatedPill({ icon, label, progress, color }: AnimatedPillProps) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * TRANSLATE_DISTANCE }],
  }));

  return (
    <Animated.View
      className="bg-overlay-soft border-border-soft flex-row items-center gap-1.5 rounded-full border px-3.5 py-2"
      style={style}
    >
      <Ionicons name={icon} size={13} color={color} />
      <Text className="text-[13px] font-semibold" style={{ color }}>
        {label}
      </Text>
    </Animated.View>
  );
}

interface PillRowProps {
  pill0: SharedValue<number>;
  pill1: SharedValue<number>;
  pill2: SharedValue<number>;
  color: string;
}

export function PillRow({ pill0, pill1, pill2, color }: PillRowProps) {
  const progresses = [pill0, pill1, pill2];

  return (
    <View className="flex-row flex-wrap justify-center gap-2.5">
      {PILLS.map((pill, i) => (
        <AnimatedPill
          key={pill.label}
          icon={pill.icon}
          label={pill.label}
          progress={progresses[i]}
          color={color}
        />
      ))}
    </View>
  );
}
