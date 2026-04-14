import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Image } from '@shared/components/styled';
import { SPRITE_MAP, type AvatarId } from '../constants/sprite-map';

export type DogMood = 'happy' | 'content' | 'neutral' | 'sad' | 'hungry';

interface DogAvatarProps {
  avatarId: AvatarId;
  size?: number;
  mood?: DogMood;
}

export function DogAvatar({ avatarId, size = 200 }: DogAvatarProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Image
        source={SPRITE_MAP[avatarId]}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </Animated.View>
  );
}
