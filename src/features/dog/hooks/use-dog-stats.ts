import { useCSSVariable } from 'uniwind';
import { useDogStats } from '../stores/dog-store';

export interface FormattedStat {
  label: string;
  value: number;
  color: string;
}

export function useFormattedDogStats(): FormattedStat[] {
  const stats = useDogStats();

  const hungerColor = (useCSSVariable('--color-hunger') as string | undefined) ?? '#FFCBA4';
  const moodColor = (useCSSVariable('--color-mood') as string | undefined) ?? '#B9E4C9';
  const energyColor = (useCSSVariable('--color-energy') as string | undefined) ?? '#BDE0FE';
  const bondColor = (useCSSVariable('--color-bond') as string | undefined) ?? '#FFAFCC';

  return [
    { label: 'Hunger', value: stats.hunger, color: hungerColor },
    { label: 'Mood',   value: stats.mood,   color: moodColor   },
    { label: 'Energy', value: stats.energy, color: energyColor },
    { label: 'Bond',   value: stats.bond,   color: bondColor   },
  ];
}
