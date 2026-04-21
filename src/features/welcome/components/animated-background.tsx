import { BlurMask, Canvas, Circle, Group } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { WelcomeThemeColors } from '../hooks/use-theme-colors';

// Each blob traces a wide Lissajous-style path across the whole screen.
// x(t) = centerX + ampX * sin(2π · freqX · t + phaseX)
// y(t) = centerY + ampY * sin(2π · freqY · t + phaseY)
// Different freqX/freqY per blob produces gentle wave-like, non-repeating paths.
// All coordinates are 0–1 fractions of the screen. `period` is how long one
// base cycle takes — bigger = slower drift.
interface BlobConfig {
  centerX: number;
  centerY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phaseX: number; // radians
  phaseY: number;
  radius: number; // px
  period: number; // ms for one base cycle (freq = 1)
}

const BLOBS: BlobConfig[] = [
  {
    centerX: 0.5,
    centerY: 0.4,
    ampX: 0.45,
    ampY: 0.35,
    freqX: 1,
    freqY: 0.7,
    phaseX: 0,
    phaseY: Math.PI / 2,
    radius: 130,
    period: 18000,
  },
  {
    centerX: 0.5,
    centerY: 0.55,
    ampX: 0.4,
    ampY: 0.4,
    freqX: 0.8,
    freqY: 1.1,
    phaseX: Math.PI * 0.8,
    phaseY: 0,
    radius: 110,
    period: 22000,
  },
  {
    centerX: 0.5,
    centerY: 0.5,
    ampX: 0.5,
    ampY: 0.45,
    freqX: 1.2,
    freqY: 0.9,
    phaseX: Math.PI * 1.4,
    phaseY: Math.PI * 0.3,
    radius: 100,
    period: 16000,
  },
  {
    centerX: 0.5,
    centerY: 0.5,
    ampX: 0.42,
    ampY: 0.5,
    freqX: 0.6,
    freqY: 1.3,
    phaseX: Math.PI * 0.4,
    phaseY: Math.PI,
    radius: 90,
    period: 20000,
  },
];

interface BlobProps {
  cfg: BlobConfig;
  color: string;
  width: number;
  height: number;
}

function Blob({ cfg, color, width, height }: BlobProps) {
  // t goes 0 → 1 over `period` ms and loops forever.
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration: cfg.period,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cx = useDerivedValue(() => {
    'worklet';
    const angle = t.value * Math.PI * 2 * cfg.freqX + cfg.phaseX;
    return (cfg.centerX + Math.sin(angle) * cfg.ampX) * width;
  });

  const cy = useDerivedValue(() => {
    'worklet';
    const angle = t.value * Math.PI * 2 * cfg.freqY + cfg.phaseY;
    return (cfg.centerY + Math.sin(angle) * cfg.ampY) * height;
  });

  // Subtle opacity breathing so blobs feel alive, not static.
  const opacity = useDerivedValue(() => {
    'worklet';
    const angle = t.value * Math.PI * 2;
    return 0.2 + Math.sin(angle) * 0.06;
  });

  return (
    <Circle cx={cx} cy={cy} r={cfg.radius} color={color} opacity={opacity}>
      <BlurMask blur={60} style="normal" />
    </Circle>
  );
}

interface AnimatedBackgroundProps {
  entryOpacity: SharedValue<number>;
  colors: WelcomeThemeColors;
}

export function AnimatedBackground({
  entryOpacity,
  colors,
}: AnimatedBackgroundProps) {
  const { width, height } = useWindowDimensions();

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
  }));

  const blobColors = ['red', 'blue', 'yellow', 'green'];

  return (
    <Animated.View
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
        containerStyle,
      ]}
      pointerEvents="none"
    >
      <Canvas style={{ flex: 1 }}>
        <Group>
          {BLOBS.map((cfg, i) => (
            <Blob
              key={i}
              cfg={cfg}
              color={blobColors[i]}
              width={width}
              height={height}
            />
          ))}
        </Group>
      </Canvas>
    </Animated.View>
  );
}
