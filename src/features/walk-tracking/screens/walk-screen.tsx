import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGamificationStore } from '@features/gamification/stores/gamification-store';
import { useDailyMissionsStore } from '@features/daily-missions/stores/daily-missions-store';
import { useWalkTimer } from '../hooks/use-walk-timer';
import { useWalkLocation } from '../hooks/use-walk-location';
import { computeWalkRewards } from '../utils/walk-rewards';

const BACKGROUND_END_MS = 60 * 1000;

export default function WalkScreen() {
  const [startedAt] = useState(() => Date.now());
  const [ended, setEnded] = useState(false);
  const { durationSeconds, elapsedLabel } = useWalkTimer(startedAt);
  const { distanceMeters, hasPermission } = useWalkLocation(!ended);
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        backgroundedAtRef.current = Date.now();
      } else if (state === 'active' && backgroundedAtRef.current) {
        const away = Date.now() - backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (away >= BACKGROUND_END_MS && !ended) {
          endWalk(Date.now() - away);
        }
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended]);

  function endWalk(endTimestamp?: number) {
    if (ended) return;
    setEnded(true);
    const endedAt = endTimestamp ?? Date.now();
    const duration = Math.floor((endedAt - startedAt) / 1000);
    const rewards = computeWalkRewards(duration);

    if (!rewards.tooShort) {
      useGamificationStore.getState().creditBones(rewards.bones);
      useGamificationStore.getState().addExp(rewards.exp);
      useDailyMissionsStore.getState().recordEvent('walked-minutes', rewards.minutesCounted);
    }

    router.replace({
      pathname: '/walk-summary',
      params: {
        durationSeconds: String(duration),
        distanceMeters: distanceMeters != null ? String(Math.round(distanceMeters)) : '',
        bones: String(rewards.bones),
        exp: String(rewards.exp),
        tooShort: rewards.tooShort ? '1' : '0',
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center gap-8 px-6">
        <Text className="text-foreground-secondary uppercase tracking-widest text-sm">
          Walking
        </Text>
        <Text className="text-foreground text-7xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
          {elapsedLabel}
        </Text>
        <View className="items-center gap-1">
          {hasPermission && distanceMeters != null ? (
            <Text className="text-foreground-secondary text-base">
              {(distanceMeters / 1000).toFixed(2)} km
            </Text>
          ) : (
            <Text className="text-foreground-secondary text-sm">
              Distance tracking off
            </Text>
          )}
          <Text className="text-foreground-secondary text-xs">
            {durationSeconds < 60 ? 'Walk at least 1 min for rewards' : 'Earning bones + EXP'}
          </Text>
        </View>
      </View>
      <View className="px-6 pb-4">
        <Pressable
          onPress={() => endWalk()}
          className="bg-primary rounded-[40px] py-4 items-center"
        >
          <Text className="text-white font-extrabold text-base">End walk</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
