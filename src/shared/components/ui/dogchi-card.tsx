import { View } from 'react-native';
import { cn } from '@lib/cn';
import type { ReactNode } from 'react';

interface DogchiCardProps {
  children: ReactNode;
  className?: string;
}

export function DogchiCard({ children, className }: DogchiCardProps) {
  return (
    <View
      className={cn('bg-card rounded-[20px] border border-border', className)}
    >
      {children}
    </View>
  );
}
