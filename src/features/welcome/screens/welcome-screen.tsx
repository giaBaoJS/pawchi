import { AppText } from '@shared/components/ui/app-text';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';
import { AnimatedBackground } from '../components/animated-background';
import { PillRow } from '../components/pill-row';
import { ScannerCore } from '../components/scanner-core';
import { ShimmerCta } from '../components/shimmer-cta';
import { useEntryTimeline } from '../hooks/use-entry-timeline';
import { useIdleLoops } from '../hooks/use-idle-loops';
import { useWelcomeThemeColors } from '../hooks/use-theme-colors';
import type { WelcomeScreenProps } from '../types/welcome';
import { INTENSITY_CONFIGS } from '../types/welcome';

const extra = Constants.expoConfig?.extra as
  | Record<string, string | undefined>
  | undefined;
const API_KEY = extra?.openaiApiKey;

const TITLE_TRANSLATE = 16;
const SUBTITLE_TRANSLATE = 12;

export default function WelcomeScreen({
  simple = false,
  intensity = 'normal',
}: WelcomeScreenProps) {
  const colors = useWelcomeThemeColors();
  const config = INTENSITY_CONFIGS[intensity];
  const entry = useEntryTimeline();
  const loops = useIdleLoops(config, !simple || intensity !== 'off');

  const isApiKeyMissing = !API_KEY;

  const gradientStart = useCSSVariable('--color-card-alt') as string;
  const gradientMiddle = useCSSVariable('--color-card') as string;
  const gradientEnd = useCSSVariable('--color-lavender') as string;

  const titleStyle = useAnimatedStyle(() => ({
    opacity: entry.title.value,
    transform: [{ translateY: (1 - entry.title.value) * TITLE_TRANSLATE }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: entry.subtitle.value,
    transform: [
      { translateY: (1 - entry.subtitle.value) * SUBTITLE_TRANSLATE },
    ],
  }));

  const skipStyle = useAnimatedStyle(() => ({
    opacity: entry.skip.value,
    transform: [{ translateY: (1 - entry.skip.value) * 8 }],
  }));

  const shimmerOverlay = 'rgba(255,255,255,0.38)';

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" />

      {/* Layer 0: gradient backdrop — fills entire screen including safe areas */}
      <LinearGradient
        colors={[gradientStart, gradientMiddle, gradientEnd]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Layer 1: animated pastel blobs — also full-screen, sibling of SafeAreaView */}
      {!simple && (
        <AnimatedBackground entryOpacity={entry.background} colors={colors} />
      )}

      {/* Layer 2: foreground content inside safe area */}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-between px-8 pt-20 pb-14">
          {/* top spacer — keeps hero in upper-center via space-between */}
          <View />

          {/* hero block */}
          <View className="items-center gap-6">
            <ScannerCore
              entryPaw={entry.paw}
              entryHalo={entry.halo}
              loops={loops}
              config={config}
              colors={colors}
              simple={simple}
            />

            <View className="items-center gap-2.5">
              <Animated.View style={titleStyle}>
                <AppText
                  fontFamily="heading"
                  className="text-foreground text-[52px]"
                >
                  Pawchi
                </AppText>
              </Animated.View>

              <Animated.View style={subtitleStyle}>
                <AppText
                  weight="bold"
                  className="text-muted text-center text-base leading-6"
                >
                  Snap a photo,{'\n'}discover your dog&apos;s breed.
                </AppText>
              </Animated.View>
            </View>

            <PillRow
              pill0={entry.pill0}
              pill1={entry.pill1}
              pill2={entry.pill2}
              color={colors.foregroundSecondary}
            />
          </View>

          {/* CTA block */}
          <View className="w-full gap-3">
            <ShimmerCta
              label="Scan my dog"
              onPress={() => router.push('/scan')}
              isDisabled={isApiKeyMissing}
              entryProgress={entry.cta}
              shimmer={loops.shimmer}
              ctaBreath={loops.ctaBreath}
              overlayColor={shimmerOverlay}
              tone="primary"
            />

            <Animated.View style={skipStyle}>
              <KawaiiButton
                tone="soft"
                label="Skip for now"
                onPress={() => router.replace('/home')}
                className="w-full"
              />
            </Animated.View>

            {isApiKeyMissing && (
              <Animated.View style={skipStyle}>
                <AppText
                  weight="medium"
                  className="text-primary px-4 text-center text-xs"
                >
                  OpenAI API key not configured — add it to .env and rebuild
                </AppText>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
