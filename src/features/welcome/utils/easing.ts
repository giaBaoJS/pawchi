import { Easing } from 'react-native-reanimated';

export const entryCubic = Easing.bezier(0.25, 0.46, 0.45, 0.94);
export const idleSine = Easing.inOut(Easing.sin);
export const pillSettle = Easing.bezier(0.22, 1, 0.36, 1);
export const ringDecay = Easing.out(Easing.quad);
