import { View, Text } from 'react-native';
import { usePetState } from '@features/pet-state/hooks/use-pet-state';

interface BarProps {
  label: string;
  value: number;
  fillClass: string;
}

function Bar({ label, value, fillClass }: BarProps) {
  const pct = `${Math.max(0, Math.min(100, value))}%` as const;
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-foreground-secondary text-xs font-semibold">{label}</Text>
        <Text className="text-foreground text-xs font-bold">{value}</Text>
      </View>
      <View className="h-3 bg-card rounded-full overflow-hidden">
        <View style={{ width: pct }} className={`h-full ${fillClass}`} />
      </View>
    </View>
  );
}

export function StatBars() {
  const { hunger, happiness, energy } = usePetState();
  return (
    <View className="gap-3">
      <Bar label="Hunger" value={hunger} fillClass="bg-warning" />
      <Bar label="Happiness" value={happiness} fillClass="bg-danger" />
      <Bar label="Energy" value={energy} fillClass="bg-info" />
    </View>
  );
}
