import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const CANVAS_SIZE = 260;
const CENTER = CANVAS_SIZE / 2;

interface HaloPulseProps {
  entryOpacity: SharedValue<number>;
  haloPulse: SharedValue<number>;
  color: string;
}

export function HaloPulse({ entryOpacity, haloPulse, color }: HaloPulseProps) {
  const outerOpacity = useDerivedValue(() => {
    'worklet';
    return entryOpacity.value * (0.12 + haloPulse.value * 0.10);
  });

  const innerOpacity = useDerivedValue(() => {
    'worklet';
    return entryOpacity.value * (0.20 + haloPulse.value * 0.12);
  });

  return (
    <Canvas
      style={{
        position: 'absolute',
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      }}
      pointerEvents="none"
    >
      {/* outer soft glow */}
      <Circle cx={CENTER} cy={CENTER} r={90} color={color} opacity={outerOpacity}>
        <BlurMask blur={35} style="normal" />
      </Circle>
      {/* inner warmer core */}
      <Circle cx={CENTER} cy={CENTER} r={58} color={color} opacity={innerOpacity}>
        <BlurMask blur={20} style="normal" />
      </Circle>
    </Canvas>
  );
}
