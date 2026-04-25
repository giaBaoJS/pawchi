import { useDailyMissionsStore } from '@features/daily-missions/stores/daily-missions-store';
import { todayKey } from '@features/daily-missions/utils/today-key';
import { DogAvatar } from '@features/dog-avatar/components/dog-avatar';
import type { AvatarId } from '@features/dog-avatar/constants/sprite-map';
import { useDogProfileStore } from '@features/dog-profile/stores/dog-profile-store';
import { useGamificationStore } from '@features/gamification/stores/gamification-store';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { ActionRow } from '../components/action-row';
import { HubHeader } from '../components/hub-header';
import { MissionList } from '../components/mission-list';
import { StatBars } from '../components/stat-bars';

export default function HomeScreen() {
  const avatarId = useDogProfileStore(
    s => (s.profile?.avatarId as AvatarId | undefined) ?? 'generic-medium',
  );

  useEffect(() => {
    const key = todayKey();
    useGamificationStore.getState().tickStreak(key);
    useDailyMissionsStore.getState().resetIfNewDay();
    useDailyMissionsStore.getState().recordEvent('opened-app', 1);
  }, []);

  return (
    <KawaiiScreen>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <HubHeader />
        <View className="items-center py-2">
          <DogAvatar avatarId={avatarId} size={220} />
        </View>
        <StatBars />
        <ActionRow />
        <MissionList />
      </ScrollView>
    </KawaiiScreen>
  );
}
