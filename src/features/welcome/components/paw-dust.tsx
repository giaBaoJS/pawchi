import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';

const CANVAS_SIZE = 260;
const CENTER = CANVAS_SIZE / 2;

// Fixed positions around the card at ~70–95px from center — deterministic, no Math.random()
const SPARKLE_POSITIONS = [
  { x: CENTER + 72, y: CENTER - 42, r: 3.5, cluster: false },
  { x: CENTER - 68, y: CENTER - 50, r: 2.8, cluster: true },
  { x: CENTER + 55, y: CENTER + 65, r: 3.0, cluster: false },
  { x: CENTER - 80, y: CENTER + 30, r: 2.5, cluster: true },
] as const;

// Paw-pad cluster: 1 large + 3 small dots in a diagonal arrangement
function PawCluster({
  cx,
  cy,
  baseR,
  opacity,
  color,
}: {
  cx: number;
  cy: number;
  baseR: number;
  opacity: SharedValue<number>;
  color: string;
}) {
  return (
    <Group opacity={opacity}>
      <Circle cx={cx} cy={cy} r={baseR} color={color} />
      <Circle
        cx={cx + baseR * 1.4}
        cy={cy - baseR * 0.8}
        r={baseR * 0.6}
        color={color}
      />
      <Circle
        cx={cx - baseR * 1.4}
        cy={cy - baseR * 0.8}
        r={baseR * 0.6}
        color={color}
      />
      <Circle cx={cx} cy={cy - baseR * 1.8} r={baseR * 0.6} color={color} />
    </Group>
  );
}

interface PawDustProps {
  sparkle0: SharedValue<number>;
  sparkle1: SharedValue<number>;
  sparkle2: SharedValue<number>;
  sparkle3: SharedValue<number>;
  color: string;
}

export function PawDust({
  sparkle0,
  sparkle1,
  sparkle2,
  sparkle3,
  color,
}: PawDustProps) {
  const sparkles = [sparkle0, sparkle1, sparkle2, sparkle3];

  // Derive capped opacities (max 0.6 so sparkles remain subtle)
  const op0 = useDerivedValue(() => {
    'worklet';
    return sparkles[0].value * 0.6;
  });
  const op1 = useDerivedValue(() => {
    'worklet';
    return sparkles[1].value * 0.6;
  });
  const op2 = useDerivedValue(() => {
    'worklet';
    return sparkles[2].value * 0.6;
  });
  const op3 = useDerivedValue(() => {
    'worklet';
    return sparkles[3].value * 0.6;
  });

  const ops = [op0, op1, op2, op3];

  return (
    <Canvas
      style={{
        position: 'absolute',
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      }}
      pointerEvents="none"
    >
      {SPARKLE_POSITIONS.map((pos, i) =>
        pos.cluster ? (
          <PawCluster
            key={i}
            cx={pos.x}
            cy={pos.y}
            baseR={pos.r}
            opacity={ops[i]}
            color={color}
          />
        ) : (
          <Circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={pos.r}
            color={color}
            opacity={ops[i]}
          />
        ),
      )}
    </Canvas>
  );
}
