import { IconCard } from '@shared/components/ui/icon-card';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { WelcomeConfig } from '../types/welcome';

const CARD_SIZE = 140;

interface PawCardProps {
  entryProgress: SharedValue<number>;
  float: SharedValue<number>;
  config: WelcomeConfig;
}

export function PawCard({ entryProgress, float, config }: PawCardProps) {
  const translateY = useDerivedValue(() => {
    'worklet';
    return float.value * config.float.amplitude;
  });

  const style = useAnimatedStyle(() => ({
    opacity: entryProgress.value,
    transform: [
      { scale: 0.7 + entryProgress.value * 0.3 },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[{ width: CARD_SIZE, height: CARD_SIZE }, style]}>
      <IconCard icon="paw" size="lg" tone="primary" />
    </Animated.View>
  );
}
