import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-8 gap-8">
        <View className="items-center gap-2">
          <Text style={{ fontSize: 60 }}>{tooShort ? '⏱️' : '🎉'}</Text>
          <Text className="text-foreground text-2xl font-extrabold">
            {tooShort ? 'Walk too short' : 'Walk complete!'}
          </Text>
        </View>

        <View className="bg-card rounded-3xl p-5 gap-4">
          <Row label="Duration" value={formatDuration(duration)} />
          {distance != null ? (
            <Row label="Distance" value={`${(distance / 1000).toFixed(2)} km`} />
          ) : null}
          <Row label="Bones earned" value={tooShort ? '—' : `+${bones} 🦴`} />
          <Row label="EXP earned" value={tooShort ? '—' : `+${exp}`} />
        </View>

        {tooShort ? (
          <Text className="text-foreground-secondary text-center text-sm">
            Walks under 1 minute don&apos;t count.
          </Text>
        ) : null}

        <View className="flex-1" />

        <Pressable
          onPress={() => router.replace('/home')}
          className="bg-primary rounded-[40px] py-4 items-center"
        >
          <Text className="text-white font-extrabold text-base">Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-foreground-secondary text-sm">{label}</Text>
      <Text className="text-foreground font-bold text-sm">{value}</Text>
    </View>
  );
}
