import { Canvas, RoundedRect, Paint } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { cn } from '@lib/cn';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

const BAR_HEIGHT = 10;
const BAR_WIDTH = 200;

export function StatBar({ label, value, color }: StatBarProps) {
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
      pulseOpacity.value = withRepeat(withTiming(0.4, { duration: 600 }), -1, true);
    } else {
      pulseOpacity.value = withTiming(1);
    }
  }, [isWarning, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View className="gap-1">
      <Text className="text-foreground-secondary text-xs font-semibold">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Animated.View style={animatedStyle}>
          <Canvas style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
            {/* Track */}
            <RoundedRect x={0} y={0} width={BAR_WIDTH} height={BAR_HEIGHT} r={BAR_HEIGHT / 2}>
              <Paint color="#F2D8E1" />
            </RoundedRect>
            {/* Fill — driven by shared value via Skia prop */}
            <RoundedRect
              x={0}
              y={0}
              width={fillWidth}
              height={BAR_HEIGHT}
              r={BAR_HEIGHT / 2}
            >
              <Paint color={color} />
            </RoundedRect>
          </Canvas>
        </Animated.View>
        <Text className={cn('text-xs font-bold w-8 text-right', isWarning ? 'text-danger' : 'text-foreground-secondary')}>
          {Math.round(value)}
        </Text>
      </View>
    </View>
  );
}
