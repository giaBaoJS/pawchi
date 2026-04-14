import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';

interface StageBgProps {
  children?: ReactNode;
  height?: number;
}

export function StageBg({ children, height = 240 }: StageBgProps) {
  return (
    <LinearGradient
      colors={['#FFE4EC', '#FFCBA4', '#D8C8F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height, width: '100%', overflow: 'hidden' }}
    >
      {children}
    </LinearGradient>
  );
}
