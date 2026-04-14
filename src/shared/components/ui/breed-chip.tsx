import { View, Text } from 'react-native';
import { tv } from 'tailwind-variants';
import { cn } from '@lib/cn';

const chip = tv({
  base: 'rounded-full px-3 py-1 self-start',
  variants: {
    variant: {
      breed: 'bg-warning',
      personality: 'bg-personality',
      level: 'bg-mood',
      alert: 'bg-danger',
    },
  },
  defaultVariants: {
    variant: 'breed',
  },
});

const label = tv({
  base: 'text-xs font-extrabold',
  variants: {
    variant: {
      breed: 'text-foreground',
      personality: 'text-foreground',
      level: 'text-foreground',
      alert: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'breed',
  },
});

interface BreedChipProps {
  text: string;
  variant?: 'breed' | 'personality' | 'level' | 'alert';
  className?: string;
}

export function BreedChip({ text, variant = 'breed', className }: BreedChipProps) {
  return (
    <View className={cn(chip({ variant }), className)}>
      <Text className={label({ variant })}>{text}</Text>
    </View>
  );
}
