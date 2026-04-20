import type { StatTone } from '@shared/components/ui/stat-bar';
import { useDogStats } from '../stores/dog-store';

export interface FormattedStat {
  label: string;
  value: number;
  tone: StatTone;
}

export function useFormattedDogStats(): FormattedStat[] {
  const stats = useDogStats();

  return [
    { label: 'Hunger', value: stats.hunger, tone: 'hunger' },
    { label: 'Mood', value: stats.mood, tone: 'mood' },
    { label: 'Energy', value: stats.energy, tone: 'energy' },
    { label: 'Bond', value: stats.bond, tone: 'bond' },
  ];
}
