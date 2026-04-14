import { View, Text } from 'react-native';
import { useDailyMissions } from '@features/daily-missions/hooks/use-daily-missions';
import { MissionCard } from '@features/daily-missions/components/mission-card';

export function MissionList() {
  const missions = useDailyMissions();
  return (
    <View className="gap-3">
      <Text className="text-foreground text-base font-extrabold">Daily missions</Text>
      {missions.map((m) => (
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
