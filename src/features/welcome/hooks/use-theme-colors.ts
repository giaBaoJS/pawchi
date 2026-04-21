import { useCSSVariable } from 'uniwind';

export interface WelcomeThemeColors {
  primary: string;
  lavender: string;
  mood: string;
  peach: string;
  personality: string;
  foregroundSecondary: string;
  warning: string;
  cardAlt: string;
  foreground: string;
}

export function useWelcomeThemeColors(): WelcomeThemeColors {
  const primary = useCSSVariable('--color-primary') as string;
  const lavender = useCSSVariable('--color-lavender') as string;
  const mood = useCSSVariable('--color-mood') as string;
  const peach = useCSSVariable('--color-peach') as string;
  const personality = useCSSVariable('--color-personality') as string;
  const foregroundSecondary = useCSSVariable('--color-foreground-secondary') as string;
  const warning = useCSSVariable('--color-warning') as string;
  const cardAlt = useCSSVariable('--color-card-alt') as string;
  const foreground = useCSSVariable('--foreground') as string;
  return {
    primary,
    lavender,
    mood,
    peach,
    personality,
    foregroundSecondary,
    warning,
    cardAlt,
    foreground,
  };
}
