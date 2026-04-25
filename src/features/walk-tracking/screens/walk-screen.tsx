import { Ionicons } from '@expo/vector-icons';
import { useDailyMissionsStore } from '@features/daily-missions/stores/daily-missions-store';
import { useGamificationStore } from '@features/gamification/stores/gamification-store';
import { IconCard } from '@shared/components/ui/icon-card';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import { useCSSVariable } from 'uniwind';
import { useWalkLocation } from '../hooks/use-walk-location';
import { useWalkTimer } from '../hooks/use-walk-timer';
import { computeWalkRewards } from '../utils/walk-rewards';

const BACKGROUND_END_MS = 60 * 1000;

export default function WalkScreen() {
  const [startedAt] = useState(() => Date.now());
  const [ended, setEnded] = useState(false);
  const { durationSeconds, elapsedLabel } = useWalkTimer(startedAt);
  const { distanceMeters, hasPermission } = useWalkLocation(!ended);
  const backgroundedAtRef = useRef<number | null>(null);
  const energyColor = useCSSVariable('--color-energy') as string;

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
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
      useDailyMissionsStore
        .getState()
        .recordEvent('walked-minutes', rewards.minutesCounted);
    }

    router.replace({
      pathname: '/walk-summary',
      params: {
        durationSeconds: String(duration),
        distanceMeters:
          distanceMeters != null ? String(Math.round(distanceMeters)) : '',
        bones: String(rewards.bones),
        exp: String(rewards.exp),
        tooShort: rewards.tooShort ? '1' : '0',
      },
    });
  }

  return (
    <KawaiiScreen>
      <View className="flex-1 items-center justify-center gap-8 px-6">
        <IconCard icon="walk" size="lg" tone="energy" />
        <AppText
          weight="extrabold"
          className="text-foreground-secondary uppercase tracking-widest text-xs"
        >
          Walking
        </AppText>
        <AppText
          weight="extrabold"
          className="text-foreground text-7xl -tracking-wider"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {elapsedLabel}
        </AppText>
        <View className="items-center gap-2">
          {hasPermission && distanceMeters != null ? (
            <View className="flex-row items-center gap-2 bg-overlay border border-border-soft px-4 py-2 rounded-full">
              <Ionicons name="location" size={14} color={energyColor} />
              <AppText weight="extrabold" className="text-foreground text-sm">
                {(distanceMeters / 1000).toFixed(2)} km
              </AppText>
            </View>
          ) : (
            <View className="bg-overlay border border-border-soft px-4 py-2 rounded-full">
              <AppText
                weight="bold"
                className="text-foreground-secondary text-xs"
              >
                Distance tracking off
              </AppText>
            </View>
          )}
          <AppText
            weight="medium"
            className="text-foreground-secondary text-xs"
          >
            {durationSeconds < 60
              ? 'Walk at least 1 min for rewards'
              : 'Earning bones + EXP'}
          </AppText>
        </View>
      </View>
      <View className="px-6 pb-4">
        <KawaiiButton
          tone="primary"
          onPress={() => endWalk()}
          label="End walk"
        />
      </View>
    </KawaiiScreen>
  );
}
