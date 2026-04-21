import { useEffect } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { entryCubic } from '../utils/easing';

export const ENTRY_DURATION = 1600;

export interface EntryTimeline {
  progress: SharedValue<number>;
  background: SharedValue<number>;
  paw: SharedValue<number>;
  halo: SharedValue<number>;
  title: SharedValue<number>;
  subtitle: SharedValue<number>;
  pill0: SharedValue<number>;
  pill1: SharedValue<number>;
  pill2: SharedValue<number>;
  cta: SharedValue<number>;
  skip: SharedValue<number>;
}

export function useEntryTimeline(): EntryTimeline {
  const progress = useSharedValue(0);

  const background = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.0) / 0.5));
  });
  const paw = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.1) / 0.25));
  });
  const halo = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.25) / 0.2));
  });
  const title = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.35) / 0.2));
  });
  const subtitle = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.5) / 0.2));
  });
  const pill0 = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.6) / 0.2));
  });
  const pill1 = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.67) / 0.2));
  });
  const pill2 = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.74) / 0.2));
  });
  const cta = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.8) / 0.2));
  });
  const skip = useDerivedValue(() => {
    'worklet';
    return Math.max(0, Math.min(1, (progress.value - 0.9) / 0.1));
  });

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: ENTRY_DURATION,
      easing: entryCubic,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    progress,
    background,
    paw,
    halo,
    title,
    subtitle,
    pill0,
    pill1,
    pill2,
    cta,
    skip,
  };
}
