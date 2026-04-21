import { Ionicons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

const CIRCLE_SIZE = 52;
const CIRCLE_BORDER = 3;
const CONNECTOR_HEIGHT = 3;
const HALO_SIZE = 72;

export interface StepState {
  isCompleted: boolean;
  isActive: boolean;
  isUpcoming: boolean;
}

export interface StepConfig {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  renderIcon?: (state: StepState) => ReactNode;
}

interface KawaiiStepperProps {
  steps: StepConfig[];
  currentStep: number;
  completedSteps?: number;
}

const TIMING = {
  duration: 260,
  easing: Easing.out(Easing.cubic),
};

export function KawaiiStepper({
  steps,
  currentStep,
  completedSteps = currentStep,
}: KawaiiStepperProps) {
  const primary = useCSSVariable('--color-primary') as string;
  const mood = useCSSVariable('--color-mood') as string;
  const border = useCSSVariable('--color-border-soft') as string;
  const upcomingIcon = useCSSVariable(
    '--color-foreground-secondary',
  ) as string;
  const surface = useCSSVariable('--color-background') as string;

  return (
    <View className="w-full">
      <View className="flex-row items-center">
        {steps.map((step, index) => {
          const state: StepState = {
            isCompleted: index < completedSteps,
            isActive: index === currentStep,
            isUpcoming: index > currentStep,
          };
          const isLast = index === steps.length - 1;
          const nextCompleted = index < completedSteps;

          return (
            <View
              key={step.id}
              className="flex-row items-center"
              style={isLast ? undefined : { flex: 1 }}
            >
              <StepCircle
                step={step}
                state={state}
                primary={primary}
                mood={mood}
                border={border}
                surface={surface}
                upcomingIcon={upcomingIcon}
              />
              {isLast ? null : (
                <StepConnector
                  isCompleted={nextCompleted}
                  mood={mood}
                  border={border}
                />
              )}
            </View>
          );
        })}
      </View>

      <View className="mt-1 flex-row items-start">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;
          return (
            <View
              key={step.id}
              className="flex-row items-start"
              style={isLast ? undefined : { flex: 1 }}
            >
              <View style={{ width: HALO_SIZE, alignItems: 'center' }}>
                <Text
                  className={
                    isActive
                      ? 'text-foreground text-xs font-extrabold text-center'
                      : 'text-foreground-secondary text-xs font-semibold text-center'
                  }
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {isLast ? null : <View style={{ flex: 1 }} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface StepCircleProps {
  step: StepConfig;
  state: StepState;
  primary: string;
  mood: string;
  border: string;
  surface: string;
  upcomingIcon: string;
}

function StepCircle({
  step,
  state,
  primary,
  mood,
  border,
  surface,
  upcomingIcon,
}: StepCircleProps) {
  const { isActive, isCompleted } = state;
  const targetProgress = isCompleted ? 2 : isActive ? 1 : 0;
  const colorProgress = useSharedValue(targetProgress);
  const scale = useSharedValue(isActive ? 1.08 : 1);
  const haloOpacity = useSharedValue(isActive ? 1 : 0);
  const haloScale = useSharedValue(isActive ? 1 : 0.7);
  const checkOpacity = useSharedValue(isCompleted ? 1 : 0);
  const iconOpacity = useSharedValue(isCompleted ? 0 : 1);

  useEffect(() => {
    colorProgress.value = withTiming(targetProgress, TIMING);
    scale.value = withSpring(isActive ? 1.08 : 1, {
      damping: 12,
      stiffness: 180,
    });
    haloOpacity.value = withTiming(isActive ? 1 : 0, TIMING);
    haloScale.value = withSpring(isActive ? 1 : 0.7, {
      damping: 14,
      stiffness: 160,
    });
    checkOpacity.value = withTiming(isCompleted ? 1 : 0, TIMING);
    iconOpacity.value = withTiming(isCompleted ? 0 : 1, TIMING);
  }, [
    checkOpacity,
    colorProgress,
    haloOpacity,
    haloScale,
    iconOpacity,
    isActive,
    isCompleted,
    scale,
    targetProgress,
  ]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      colorProgress.value,
      [0, 1, 2],
      [border, primary, mood],
    ),
    transform: [{ scale: scale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value * 0.28,
    transform: [{ scale: haloScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: 0.7 + checkOpacity.value * 0.3 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: 0.7 + iconOpacity.value * 0.3 }],
  }));

  const iconColor = isActive ? primary : upcomingIcon;

  return (
    <View
      style={{
        width: HALO_SIZE,
        height: HALO_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: HALO_SIZE,
            height: HALO_SIZE,
            borderRadius: HALO_SIZE / 2,
            backgroundColor: primary,
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            borderWidth: CIRCLE_BORDER,
            backgroundColor: surface,
            alignItems: 'center',
            justifyContent: 'center',
          },
          borderStyle,
        ]}
      >
        <Animated.View style={[{ position: 'absolute' }, checkStyle]}>
          <Ionicons name="checkmark" size={24} color={mood} />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute' }, iconStyle]}>
          {step.renderIcon ? (
            step.renderIcon(state)
          ) : (
            <Ionicons
              name={step.icon ?? 'paw'}
              size={22}
              color={iconColor}
            />
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

interface StepConnectorProps {
  isCompleted: boolean;
  mood: string;
  border: string;
}

function StepConnector({ isCompleted, mood, border }: StepConnectorProps) {
  const progress = useDerivedValue(() =>
    withTiming(isCompleted ? 1 : 0, {
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
    }),
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={{
        flex: 1,
        height: CONNECTOR_HEIGHT,
        backgroundColor: border,
        borderRadius: CONNECTOR_HEIGHT / 2,
        marginHorizontal: -6,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: mood,
            borderRadius: CONNECTOR_HEIGHT / 2,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
