import { Canvas, Paint, RoundedRect } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';
import { cn } from '@lib/cn';

export type StatTone = 'hunger' | 'mood' | 'energy' | 'bond' | 'personality';

interface StatBarProps {
  label: string;
  value: number;
  tone: StatTone;
}

const TONE_TO_VAR: Record<StatTone, string> = {
  hunger: '--color-hunger',
  mood: '--color-mood',
  energy: '--color-energy',
  bond: '--color-bond',
  personality: '--color-personality',
};

const BAR_HEIGHT = 12;
const BAR_WIDTH = 220;

export function StatBar({ label, value, tone }: StatBarProps) {
  const fillColor = useCSSVariable(TONE_TO_VAR[tone]) as string;
  const trackColor = useCSSVariable('--color-border-soft') as string;
  const fillWidth = useSharedValue((value / 100) * BAR_WIDTH);
  const pulseOpacity = useSharedValue(1);
  const isWarning = value < 25;

  useEffect(() => {
    fillWidth.value = withSpring((value / 100) * BAR_WIDTH, {
      damping: 18,
      stiffness: 120,
    });
  }, [value, fillWidth]);

  useEffect(() => {
    if (isWarning) {
      pulseOpacity.value = withRepeat(withTiming(0.45, { duration: 600 }), -1, true);
    } else {
      pulseOpacity.value = withTiming(1);
    }
  }, [isWarning, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground-secondary text-xs font-semibold uppercase tracking-wider">
          {label}
        </Text>
        <Text
          className={cn(
            'text-xs font-extrabold',
            isWarning ? 'text-danger' : 'text-foreground',
          )}
        >
          {Math.round(value)}
        </Text>
      </View>
      <Animated.View style={animatedStyle}>
        <Canvas style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
          <RoundedRect x={0} y={0} width={BAR_WIDTH} height={BAR_HEIGHT} r={BAR_HEIGHT / 2}>
            <Paint color={trackColor} />
          </RoundedRect>
          <RoundedRect x={0} y={0} width={fillWidth} height={BAR_HEIGHT} r={BAR_HEIGHT / 2}>
            <Paint color={fillColor} />
          </RoundedRect>
        </Canvas>
      </Animated.View>
    </View>
  );
}
