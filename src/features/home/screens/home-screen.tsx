import {
  DogAnimation,
  type DogAnimationRef,
} from "@features/dog/components/dog-animation";
import { DogSprite } from "@features/dog/components/dog-sprite";
import { useFormattedDogStats } from "@features/dog/hooks/use-dog-stats";
import { useDogOutfit, useDogProfile } from "@features/dog/stores/dog-store";
import {
  useGameActions,
  useGameActionState,
} from "@features/game/hooks/use-game-actions";
import { BreedChip } from "@shared/components/ui/breed-chip";
import { DogchiCard } from "@shared/components/ui/dogchi-card";
import { StageBg } from "@shared/components/ui/stage-bg";
import { StatBar } from "@shared/components/ui/stat-bar";
import { mediumHaptic } from "@shared/utils/haptics";
import { router } from "expo-router";
import { useToast } from "heroui-native";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const ACTION_LABELS: Record<"feed" | "play" | "sleep", string> = {
  feed: "🍖 Feed",
  play: "🎾 Play",
  sleep: "💤 Sleep",
};

function EmptyState() {
  const pulseScale = useSharedValue(1);

  pulseScale.value = withRepeat(
    withSequence(
      withTiming(1.08, { duration: 700 }),
      withTiming(1, { duration: 700 }),
    ),
    -1,
    false,
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View className="flex-1 bg-background items-center justify-center gap-6 px-8">
      <Animated.View style={animStyle}>
        <Pressable
          onPress={() => router.push("/scan")}
          className="bg-primary rounded-full w-24 h-24 items-center justify-center"
        >
          <Text style={{ fontSize: 40 }}>📷</Text>
        </Pressable>
      </Animated.View>
      <View className="items-center gap-2">
        <Text className="text-foreground text-xl font-extrabold">
          No dog yet!
        </Text>
        <Text className="text-foreground-secondary text-sm text-center">
          Snap a photo of your real dog to create your 2D companion.
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const profile = useDogProfile();
  const outfit = useDogOutfit();
  const stats = useFormattedDogStats();
  const { performAction } = useGameActions();
  const { canFeed, canSleep, feedCooldown, sleepCooldown } =
    useGameActionState();
  const animRef = useRef<DogAnimationRef>(null);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const { toast } = useToast();

  if (!profile) return <EmptyState />;

  // Capture as const so TypeScript narrows to DogProfile (non-null) in all closures below
  const dog = profile;

  function handleActionPress(action: "feed" | "play" | "sleep") {
    if (action === "feed" && !canFeed) {
      toast.show({
        label: "Feed cooldown",
        description: `Available in ${feedCooldown}`,
      });
      return;
    }
    if (action === "sleep" && !canSleep) {
      toast.show({
        label: "Sleep cooldown",
        description: `Available in ${sleepCooldown}`,
      });
      return;
    }

    const result = performAction(action);
    animRef.current?.triggerAction(action === "feed" ? "eat" : action);

    if (result?.didLevelUp) {
      toast.show({
        label: "🎉 Level Up!",
        description: `${dog.name} reached level ${dog.level + 1}!`,
      });
    }
  }

  function handlePetDog() {
    mediumHaptic();
    toast.show({ label: "🐾 Pet!", description: dog.personality.catchphrase });
  }

  function handleLongPressDog() {
    setShowSpeechBubble(true);
    setTimeout(() => setShowSpeechBubble(false), 3000);
  }

  const moodValue = stats.find((s) => s.label === "Mood")?.value ?? 80;

  return (
    <ScrollView className="flex-1 bg-background" bounces={false}>
      {/* Stage */}
      <StageBg height={260}>
        <View className="flex-1 items-center justify-end pb-4">
          {/* Dog name + chips */}
          <View className="absolute top-12 items-center gap-2">
            <Text className="text-foreground text-lg font-extrabold">
              {dog.name}
            </Text>
            <View className="flex-row gap-2">
              <BreedChip text={dog.breed} variant="breed" />
              <BreedChip text={`Lv. ${dog.level}`} variant="level" />
              <BreedChip
                text={dog.personality.type.replace("_", " ")}
                variant="personality"
              />
            </View>
          </View>

          {/* Sprite + Rive animation layered */}
          <Pressable
            onPress={handlePetDog}
            onLongPress={handleLongPressDog}
            className="items-center justify-center"
          >
            <DogSprite
              spriteId={dog.spriteId}
              coatColor={dog.coatColor}
              mood={moodValue}
              outfit={outfit}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <DogAnimation ref={animRef} mood={moodValue} size={180} />
            </View>
          </Pressable>

          {/* Speech bubble */}
          {showSpeechBubble && (
            <View className="absolute top-16 bg-white rounded-[16px] px-4 py-2 border border-border">
              <Text className="text-foreground text-sm font-semibold">
                {dog.personality.catchphrase}
              </Text>
            </View>
          )}
        </View>
      </StageBg>

      {/* Stat bars */}
      <View className="px-5 pt-5">
        <DogchiCard className="p-4 gap-3">
          {stats.map((stat) => (
            <StatBar
              key={stat.label}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </DogchiCard>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 px-5 pt-4 pb-8">
        {(["feed", "play", "sleep"] as const).map((action) => {
          const isDisabled =
            (action === "feed" && !canFeed) ||
            (action === "sleep" && !canSleep);
          const cooldownText =
            action === "feed" && !canFeed
              ? feedCooldown
              : action === "sleep" && !canSleep
                ? sleepCooldown
                : null;

          return (
            <Pressable
              key={action}
              onPress={() => handleActionPress(action)}
              className="flex-1 rounded-[40px] py-3 items-center"
              style={{ backgroundColor: isDisabled ? "#F2D8E1" : "#FFAFCC" }}
            >
              <Text className="text-foreground font-extrabold text-sm">
                {ACTION_LABELS[action]}
              </Text>
              {cooldownText !== null && (
                <Text className="text-muted text-xs">{cooldownText}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
