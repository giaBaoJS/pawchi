import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';

const SHIMMER_WIDTH_MULTIPLIER = 2.5;
const SPRING_CONFIG = { damping: 18, stiffness: 280 };

interface ShimmerCtaProps {
  label: string;
  onPress?: () => void;
  isDisabled?: boolean;
  entryProgress: SharedValue<number>;
  shimmer: SharedValue<number>;
  ctaBreath: SharedValue<number>;
  overlayColor: string;
  tone?: 'primary' | 'soft' | 'ghost';
}

export function ShimmerCta({
  label,
  onPress,
  isDisabled,
  entryProgress,
  shimmer,
  ctaBreath,
  overlayColor,
  tone = 'primary',
}: ShimmerCtaProps) {
  const [btnWidth, setBtnWidth] = useState(0);
  const pressed = useSharedValue(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setBtnWidth(e.nativeEvent.layout.width);
  };

  const handlePressIn = () => {
    pressed.value = withSpring(1, SPRING_CONFIG);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, SPRING_CONFIG);
  };

  const breathScale = useDerivedValue(() => {
    'worklet';
    return 1 + ctaBreath.value * 0.012;
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entryProgress.value,
    transform: [
      { translateY: (1 - entryProgress.value) * 12 },
      { scale: breathScale.value * (1 - pressed.value * 0.04) },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    if (btnWidth === 0) return { transform: [{ translateX: -btnWidth * SHIMMER_WIDTH_MULTIPLIER }] };
    const offset = shimmer.value * btnWidth;
    return {
      transform: [{ translateX: offset - btnWidth * 0.5 }],
    };
  });

  const shimmerW = btnWidth * SHIMMER_WIDTH_MULTIPLIER;

  return (
    <Animated.View style={[{ width: '100%' }, containerStyle]}>
      <View style={{ overflow: 'hidden', borderRadius: 999 }} onLayout={handleLayout}>
        <KawaiiButton
          tone={tone}
          label={label}
          onPress={onPress}
          isDisabled={isDisabled}
          className="w-full"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />

        {/* Shimmer overlay — only rendered once we know the width */}
        {btnWidth > 0 && !isDisabled && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: shimmerW,
              },
              shimmerStyle,
            ]}
          >
            <LinearGradient
              colors={['transparent', overlayColor, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}
