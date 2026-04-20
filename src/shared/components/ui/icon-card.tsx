import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { tv } from 'tailwind-variants';
import { useCSSVariable } from 'uniwind';

interface IconCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'primary' | 'mood' | 'energy' | 'hunger' | 'personality';
}

const card = tv({
  base: 'items-center justify-center bg-overlay border border-border-soft',
  variants: {
    size: {
      sm: 'w-12 h-12 rounded-2xl',
      md: 'w-20 h-20 rounded-3xl',
      lg: 'w-[140px] h-[140px] rounded-[44px]',
    },
  },
});

const TONE_TO_VAR = {
  primary: '--color-primary',
  mood: '--color-mood',
  energy: '--color-energy',
  hunger: '--color-hunger',
  personality: '--color-personality',
} as const;

const SIZE_TO_ICON: Record<NonNullable<IconCardProps['size']>, number> = {
  sm: 22,
  md: 36,
  lg: 72,
};

const SHADOW_BY_SIZE = {
  sm: { offsetY: 4, opacity: 0.22, radius: 12, elevation: 4 },
  md: { offsetY: 6, opacity: 0.3, radius: 18, elevation: 6 },
  lg: { offsetY: 8, opacity: 0.35, radius: 24, elevation: 10 },
} as const;

export function IconCard({ icon, size = 'md', tone = 'primary' }: IconCardProps) {
  const iconColor = useCSSVariable(TONE_TO_VAR[tone]) as string;
  const shadowColor = useCSSVariable(TONE_TO_VAR[tone]) as string;
  const shadow = SHADOW_BY_SIZE[size];

  return (
    <View
      className={card({ size })}
      style={{
        shadowColor,
        shadowOffset: { width: 0, height: shadow.offsetY },
        shadowOpacity: shadow.opacity,
        shadowRadius: shadow.radius,
        elevation: shadow.elevation,
      }}
    >
      <Ionicons name={icon} size={SIZE_TO_ICON[size]} color={iconColor} />
    </View>
  );
}
