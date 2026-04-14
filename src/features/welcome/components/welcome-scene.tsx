import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Rect,
  LinearGradient,
  vec,
  Circle,
  BlurMask,
  Group,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Fixed sparkle seed data — deterministic, no Math.random() at render
const SPARKLES = [
  { cx: 0.12, cy: 0.15, r: 2.5, delay: 0 },
  { cx: 0.78, cy: 0.22, r: 1.8, delay: 800 },
  { cx: 0.35, cy: 0.08, r: 3.0, delay: 1600 },
  { cx: 0.62, cy: 0.45, r: 1.5, delay: 400 },
  { cx: 0.88, cy: 0.60, r: 2.0, delay: 2200 },
  { cx: 0.20, cy: 0.55, r: 2.8, delay: 1200 },
  { cx: 0.50, cy: 0.30, r: 1.2, delay: 2800 },
  { cx: 0.72, cy: 0.10, r: 2.2, delay: 600 },
];

function Sparkle({
  cx,
  startCy,
  r,
  delay,
}: {
  cx: number;
  startCy: number;
  r: number;
  delay: number;
}) {
  const cy = useSharedValue(startCy);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const duration = 3000 + delay * 0.3;
    cy.value = withDelay(
      delay,
      withRepeat(
        withTiming(-20, { duration, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: duration * 0.4 }),
          withTiming(0.9, { duration: duration * 0.2 }),
          withTiming(0, { duration: duration * 0.4 }),
        ),
        -1,
        false,
      ),
    );
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Circle cx={cx} cy={cy} r={r} color="#FFAFCC" opacity={opacity} />;
}

export function WelcomeScene() {
  const { width, height } = useWindowDimensions();
  const heroY = height * 0.35;

  // Gradient animation — slow 10s loop cycling the angle
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 10000 }), -1, true);
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gradientStart = useDerivedValue(() =>
    vec(width * 0.5 * progress.value, 0),
  );
  const gradientEnd = useDerivedValue(() =>
    vec(width * (1 - 0.5 * progress.value), height),
  );

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <Canvas style={{ flex: 1 }}>
        {/* Animated pastel gradient background */}
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={['#FFE4EC', '#FFCBA4', '#D8C8F6']}
          />
        </Rect>

        {/* Radial glow behind hero */}
        <Circle cx={width / 2} cy={heroY} r={140} color="#FFAFCC" opacity={0.35}>
          <BlurMask blur={40} style="normal" />
        </Circle>

        {/* Drifting sparkles */}
        <Group>
          {SPARKLES.map((s, i) => (
            <Sparkle
              key={i}
              cx={s.cx * width}
              startCy={s.cy * height}
              r={s.r}
              delay={s.delay}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}
