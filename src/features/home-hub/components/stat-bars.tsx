import { usePetState } from '@features/pet-state/hooks/use-pet-state';
import { StatBar } from '@shared/components/ui/stat-bar';
import { View } from 'react-native';

export function StatBars() {
  const { hunger, happiness, energy } = usePetState();
  return (
    <View className="bg-overlay border border-border-soft rounded-3xl p-4 gap-4">
      <StatBar label="Hunger" value={hunger} tone="hunger" />
      <StatBar label="Happiness" value={happiness} tone="mood" />
      <StatBar label="Energy" value={energy} tone="energy" />
    </View>
  );
}
