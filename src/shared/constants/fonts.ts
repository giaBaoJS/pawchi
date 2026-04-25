export const FONT_HEADING = 'CherryBombOne-Regular';

export const FONT_BODY = {
  light: 'Nunito-Light',
  regular: 'Nunito-Regular',
  medium: 'Nunito-Medium',
  semibold: 'Nunito-SemiBold',
  bold: 'Nunito-Bold',
  extrabold: 'Nunito-ExtraBold',
  black: 'Nunito-Black',
  italic: 'Nunito-Italic',
  boldItalic: 'Nunito-BoldItalic',
} as const;

export type FontWeight = keyof typeof FONT_BODY;
export type FontFamilyName = 'heading' | 'body' | (string & {});
