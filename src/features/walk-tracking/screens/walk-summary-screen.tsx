import { IconCard } from '@shared/components/ui/icon-card';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

export default function WalkSummaryScreen() {
  const params = useLocalSearchParams<{
    durationSeconds: string;
    distanceMeters: string;
    bones: string;
    exp: string;
    tooShort: string;
  }>();

  const duration = Number(params.durationSeconds ?? '0');
  const distance = params.distanceMeters ? Number(params.distanceMeters) : null;
  const bones = Number(params.bones ?? '0');
  const exp = Number(params.exp ?? '0');
  const tooShort = params.tooShort === '1';

  return (
    <KawaiiScreen>
      <View className="flex-1 px-6 pt-8 gap-8">
        <View className="items-center gap-3">
          <IconCard
            icon={tooShort ? 'time-outline' : 'sparkles'}
            size="lg"
            tone={tooShort ? 'personality' : 'primary'}
          />
          <AppText
            fontFamily="heading"
            className="text-foreground text-2xl -tracking-wide"
          >
            {tooShort ? 'Walk too short' : 'Walk complete!'}
          </AppText>
        </View>

        <View className="bg-overlay border border-border-soft rounded-3xl p-5 gap-4">
          <Row label="Duration" value={formatDuration(duration)} />
          {distance != null ? (
            <Row
              label="Distance"
              value={`${(distance / 1000).toFixed(2)} km`}
            />
          ) : null}
          <Row label="Bones earned" value={tooShort ? '—' : `+${bones}`} />
          <Row label="EXP earned" value={tooShort ? '—' : `+${exp}`} />
        </View>

        {tooShort ? (
          <AppText
            weight="medium"
            className="text-foreground-secondary text-center text-sm"
          >
            Walks under 1 minute don&apos;t count.
          </AppText>
        ) : null}

        <View className="flex-1" />

        <KawaiiButton
          tone="primary"
          onPress={() => router.replace('/home')}
          label="Back to home"
        />
      </View>
    </KawaiiScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <AppText weight="semibold" className="text-foreground-secondary text-sm">
        {label}
      </AppText>
      <AppText weight="extrabold" className="text-foreground text-sm">
        {value}
      </AppText>
    </View>
  );
}
