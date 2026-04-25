import { MeshGradientView } from 'expo-mesh-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { WelcomeThemeColors } from '../hooks/use-theme-colors';

// ─── Geometry ────────────────────────────────────────────────────────────
// We pin every mesh vertex. No point ever moves, so the screen borders stay
// perfectly stable — no bulging, no warping. The "motion" is purely color
// breathing inside a rigid mesh.
const COLUMNS = 3;
const ROWS = 3;

const BASE_POINTS: Array<[number, number]> = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [0, 0.5],
  [0.5, 0.5],
  [1, 0.5],
  [0, 1],
  [0.5, 1],
  [1, 1],
];

// ─── Color breathing ─────────────────────────────────────────────────────
// Each of the 9 vertices crossfades between two palette indices over time.
// The weight is sin(2π·f·t + phase) remapped to [0..1]. Since we use an
// unbounded monotonic clock (`performance.now()`), there is no loop boundary
// — the colors drift forever with no visible reset.
interface VertexCycle {
  a: number; // palette index
  b: number; // palette index
  freq: number; // cycles per second
  phase: number; // radians
}

// Per-vertex cycle spec. Corners mix more slowly so the border color stays
// calm; interior vertices breathe a bit more to create internal motion.
// Frequencies are all ≤ 0.1 Hz and mutually irrational-ish so the full pattern
// never visibly repeats.
const CYCLES: VertexCycle[] = [
  { a: 0, b: 1, freq: 0.03, phase: 0.0 }, // TL corner
  { a: 2, b: 0, freq: 0.05, phase: 0.7 }, // top mid
  { a: 0, b: 3, freq: 0.04, phase: 1.4 }, // TR corner
  { a: 1, b: 4, freq: 0.06, phase: 0.3 }, // left mid
  { a: 2, b: 4, freq: 0.09, phase: 1.1 }, // CENTER — most motion
  { a: 3, b: 1, freq: 0.07, phase: 2.0 }, // right mid
  { a: 0, b: 2, freq: 0.04, phase: 0.9 }, // BL corner
  { a: 4, b: 1, freq: 0.05, phase: 1.7 }, // bottom mid
  { a: 0, b: 3, freq: 0.03, phase: 2.4 }, // BR corner
];

// ─── Color math ──────────────────────────────────────────────────────────
// Expand #rgb / #rrggbb into an [r,g,b] triple. Any non-hex input (e.g. rgba)
// falls back to opaque white so we never throw at runtime.
function parseHex(hex: string): [number, number, number] {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return [255, 255, 255];
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function lerp(a: number, b: number, w: number) {
  return a + (b - a) * w;
}

function toHex(n: number) {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
}

function mixHex(a: string, b: string, w: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return `#${toHex(lerp(ar, br, w))}${toHex(lerp(ag, bg, w))}${toHex(lerp(ab, bb, w))}`;
}

// ─── Component ───────────────────────────────────────────────────────────
interface AnimatedBackgroundProps {
  entryOpacity: SharedValue<number>;
  colors: WelcomeThemeColors;
  /** Seconds of simulated time per real second. Default 1. Try 0.4–1.4. */
  speed?: number;
  /** Frames per second for color updates. Default 20 — color breathing doesn't need 60. */
  fps?: number;
}

const TARGET_BORDER_RADIUS = 0;

export function AnimatedBackground({
  entryOpacity,
  colors,
  speed = 1,
  fps = 20,
}: AnimatedBackgroundProps) {
  const palette = useMemo(
    () => [
      colors.cardAlt,
      colors.peach,
      colors.lavender,
      colors.mood,
      colors.personality,
    ],
    [
      colors.cardAlt,
      colors.peach,
      colors.lavender,
      colors.mood,
      colors.personality,
    ],
  );

  const computeColors = useMemo(
    () => (t: number) =>
      CYCLES.map(({ a, b, freq, phase }) => {
        const w = (Math.sin(t * freq * Math.PI * 2 + phase) + 1) * 0.5;
        return mixHex(palette[a], palette[b], w);
      }),
    [palette],
  );

  const [meshColors, setMeshColors] = useState<string[]>(() =>
    computeColors(0),
  );

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    const frameInterval = 1000 / fps;

    const tick = () => {
      const now = performance.now();
      if (now - lastTickRef.current >= frameInterval) {
        lastTickRef.current = now;
        const t = (now / 1000) * speed;
        setMeshColors(computeColors(t));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    start();
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') start();
      else stop();
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [speed, fps, computeColors]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, containerStyle]}
      pointerEvents="none"
    >
      <MeshGradientView
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: TARGET_BORDER_RADIUS },
        ]}
        columns={COLUMNS}
        rows={ROWS}
        points={BASE_POINTS}
        colors={meshColors}
        smoothsColors
        ignoresSafeArea
      />
    </Animated.View>
  );
}
