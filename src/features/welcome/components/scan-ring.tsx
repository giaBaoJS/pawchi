import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

// Scanner core container is 260×260 (see scanner-core.tsx).
// The ring starts just outside the 140-px paw card and expands
// outward via `transform: scale` — no Skia, no derived radius.
const CONTAINER_SIZE = 260;
const RING_START_DIAMETER = 156;
const RING_END_DIAMETER = 252;
const RING_END_SCALE = RING_END_DIAMETER / RING_START_DIAMETER;
const RING_INSET = (CONTAINER_SIZE - RING_START_DIAMETER) / 2;

interface ScanRingProps {
  scanRing: SharedValue<number>;
  color: string;
}

export function ScanRing({ scanRing, color }: ScanRingProps) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - scanRing.value),
    transform: [{ scale: 1 + scanRing.value * (RING_END_SCALE - 1) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute rounded-full"
      style={[
        {
          left: RING_INSET,
          top: RING_INSET,
          width: RING_START_DIAMETER,
          height: RING_START_DIAMETER,
          borderWidth: 1.5,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}
