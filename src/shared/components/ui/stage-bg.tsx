import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useCSSVariable } from 'uniwind';

interface StageBgProps {
  children?: ReactNode;
  height?: number;
}

export function StageBg({ children, height = 240 }: StageBgProps) {
  const cardAlt = useCSSVariable('--color-card-alt') as string;
  const peach = useCSSVariable('--color-peach') as string;
  const personality = useCSSVariable('--color-personality') as string;

  return (
    <LinearGradient
      colors={[cardAlt, peach, personality]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height, width: '100%', overflow: 'hidden' }}
    >
      {children}
    </LinearGradient>
  );
}
