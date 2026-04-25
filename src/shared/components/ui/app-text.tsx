import { cn } from '@lib/cn';
import type { ComponentProps, ReactNode } from 'react';
import { Text } from 'react-native';
import { tv } from 'tailwind-variants';

import {
  FONT_BODY,
  FONT_HEADING,
  type FontFamilyName,
  type FontWeight,
} from '../../constants/fonts';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'label';

const text = tv({
  base: 'text-foreground',
  variants: {
    variant: {
      display: 'text-[40px] leading-[44px]',
      h1: 'text-3xl leading-9',
      h2: 'text-2xl leading-8',
      h3: 'text-xl leading-7',
      title: 'text-lg leading-6',
      body: 'text-base leading-6',
      bodySm: 'text-sm leading-5',
      caption: 'text-xs leading-4 text-foreground-secondary',
      label: 'text-sm leading-5',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

const VARIANT_DEFAULT_FONT: Record<Variant, FontFamilyName> = {
  display: 'heading',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  title: 'body',
  body: 'body',
  bodySm: 'body',
  caption: 'body',
  label: 'body',
};

const VARIANT_DEFAULT_WEIGHT: Record<Variant, FontWeight> = {
  display: 'regular',
  h1: 'regular',
  h2: 'regular',
  h3: 'regular',
  title: 'bold',
  body: 'regular',
  bodySm: 'regular',
  caption: 'regular',
  label: 'semibold',
};

interface AppTextProps extends Omit<ComponentProps<typeof Text>, 'children'> {
  children?: ReactNode;
  variant?: Variant;
  weight?: FontWeight;
  italic?: boolean;
  fontFamily?: FontFamilyName;
  className?: string;
}

function resolveFontFamily(
  fontFamily: FontFamilyName,
  weight: FontWeight,
  italic: boolean,
): string {
  if (fontFamily === 'heading') return FONT_HEADING;
  if (fontFamily !== 'body') return fontFamily;

  if (italic) {
    if (weight === 'bold' || weight === 'extrabold' || weight === 'black') {
      return FONT_BODY.boldItalic;
    }
    return FONT_BODY.italic;
  }
  return FONT_BODY[weight];
}

export function AppText({
  variant = 'body',
  weight,
  italic = false,
  fontFamily,
  className,
  style,
  children,
  ...rest
}: AppTextProps) {
  const resolvedFamily = fontFamily ?? VARIANT_DEFAULT_FONT[variant];
  const resolvedWeight = weight ?? VARIANT_DEFAULT_WEIGHT[variant];
  const family = resolveFontFamily(resolvedFamily, resolvedWeight, italic);

  return (
    <Text
      {...rest}
      className={cn(text({ variant }), className)}
      style={[{ fontFamily: family }, style]}
    >
      {children}
    </Text>
  );
}
