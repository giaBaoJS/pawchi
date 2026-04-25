import { View } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import { useDailyMissions } from '@features/daily-missions/hooks/use-daily-missions';
import { MissionCard } from '@features/daily-missions/components/mission-card';

export function MissionList() {
  const missions = useDailyMissions();
  return (
    <View className="gap-3">
      <AppText weight="extrabold" className="text-foreground text-base">
        Daily missions
      </AppText>
      {missions.map(m => (
        <MissionCard
          key={m.def.id}
          def={m.def}
          progress={m.progress.progress}
          completed={m.progress.completed}
        />
      ))}
    </View>
  );
}
