import { useEffect } from 'react';
import { AppState } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { WelcomeConfig } from '../types/welcome';
import { ENTRY_DURATION } from './use-entry-timeline';
import { idleSine, ringDecay } from '../utils/easing';

const IDLE_START_DELAY = ENTRY_DURATION + 200;

const SPARKLE_FADE = 300;
const SPARKLE_STAGGER = 1000;

export interface IdleLoops {
  float: SharedValue<number>;     // -1 → 1, drives translateY
  haloPulse: SharedValue<number>; // 0 → 1, drives halo opacity pulse
  scanRing: SharedValue<number>;  // 0 → 1, ring expansion progress
  sparkle0: SharedValue<number>;  // 0 → 1 → 0, life cycle
  sparkle1: SharedValue<number>;
  sparkle2: SharedValue<number>;
  sparkle3: SharedValue<number>;
  shimmer: SharedValue<number>;   // -1 → 1, shimmer sweep X
  ctaBreath: SharedValue<number>; // 0 → 1, CTA breathing scale
}

function makeSparkleLoop(cycle: number, on: number, startDelay: number) {
  const pause = cycle - on - SPARKLE_FADE * 2;
  return withDelay(
    startDelay,
    withRepeat(
      withSequence(
        withTiming(1, { duration: SPARKLE_FADE }),
        withTiming(1, { duration: Math.max(0, on - SPARKLE_FADE * 2) }),
        withTiming(0, { duration: SPARKLE_FADE }),
        withDelay(Math.max(0, pause), withTiming(0, { duration: 16 })),
      ),
      -1,
      false,
    ),
  );
}

export function useIdleLoops(config: WelcomeConfig, enabled: boolean = true): IdleLoops {
  const float = useSharedValue(-1);
  const haloPulse = useSharedValue(0);
  const scanRing = useSharedValue(0);
  const sparkle0 = useSharedValue(0);
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);
  const shimmer = useSharedValue(-1.5);
  const ctaBreath = useSharedValue(0);

  function startAll() {
    float.value = withRepeat(
      withTiming(1, { duration: config.float.period / 2, easing: idleSine }),
      -1,
      true,
    );

    haloPulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: idleSine }),
      -1,
      true,
    );

    const ringPause = config.ring.cadence - config.ring.duration;
    scanRing.value = withRepeat(
      withSequence(
        withTiming(1, { duration: config.ring.duration, easing: ringDecay }),
        withDelay(Math.max(0, ringPause), withTiming(0, { duration: 16 })),
      ),
      -1,
      false,
    );

    if (config.sparkle.cycle < 99000) {
      sparkle0.value = makeSparkleLoop(config.sparkle.cycle, config.sparkle.on, 0);
      sparkle1.value = makeSparkleLoop(config.sparkle.cycle, config.sparkle.on, SPARKLE_STAGGER);
      sparkle2.value = makeSparkleLoop(config.sparkle.cycle, config.sparkle.on, SPARKLE_STAGGER * 2);
      sparkle3.value = makeSparkleLoop(config.sparkle.cycle, config.sparkle.on, SPARKLE_STAGGER * 3);
    }

    if (config.shimmer.interval < 99000) {
      const shimmerPause = config.shimmer.interval - config.shimmer.duration;
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: config.shimmer.duration, easing: Easing.out(Easing.quad) }),
          withDelay(Math.max(0, shimmerPause), withTiming(-1.5, { duration: 16 })),
        ),
        -1,
        false,
      );
    }

    ctaBreath.value = withRepeat(
      withTiming(1, { duration: 3000, easing: idleSine }),
      -1,
      true,
    );
  }

  function stopAll() {
    cancelAnimation(float);
    cancelAnimation(haloPulse);
    cancelAnimation(scanRing);
    cancelAnimation(sparkle0);
    cancelAnimation(sparkle1);
    cancelAnimation(sparkle2);
    cancelAnimation(sparkle3);
    cancelAnimation(shimmer);
    cancelAnimation(ctaBreath);
  }

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(startAll, IDLE_START_DELAY);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        stopAll();
      } else if (state === 'active') {
        startAll();
      }
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
      stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { float, haloPulse, scanRing, sparkle0, sparkle1, sparkle2, sparkle3, shimmer, ctaBreath };
}
