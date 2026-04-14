import type { ImageSourcePropType } from 'react-native';

export type AvatarId =
  | 'shiba-inu'
  | 'golden-retriever'
  | 'labrador'
  | 'poodle'
  | 'french-bulldog'
  | 'beagle'
  | 'dachshund'
  | 'german-shepherd'
  | 'corgi'
  | 'husky'
  | 'chihuahua'
  | 'pug'
  | 'generic-small'
  | 'generic-medium'
  | 'generic-large';

export const SPRITE_MAP: Record<AvatarId, ImageSourcePropType> = {
  'shiba-inu': require('../../../../assets/avatars/shiba-inu.png'),
  'golden-retriever': require('../../../../assets/avatars/golden-retriever.png'),
  labrador: require('../../../../assets/avatars/labrador.png'),
  poodle: require('../../../../assets/avatars/poodle.png'),
  'french-bulldog': require('../../../../assets/avatars/french-bulldog.png'),
  beagle: require('../../../../assets/avatars/beagle.png'),
  dachshund: require('../../../../assets/avatars/dachshund.png'),
  'german-shepherd': require('../../../../assets/avatars/german-shepherd.png'),
  corgi: require('../../../../assets/avatars/corgi.png'),
  husky: require('../../../../assets/avatars/husky.png'),
  chihuahua: require('../../../../assets/avatars/chihuahua.png'),
  pug: require('../../../../assets/avatars/pug.png'),
  'generic-small': require('../../../../assets/avatars/generic-small.png'),
  'generic-medium': require('../../../../assets/avatars/generic-medium.png'),
  'generic-large': require('../../../../assets/avatars/generic-large.png'),
};
