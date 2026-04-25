import { View, Pressable, ScrollView, Alert } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import { router } from 'expo-router';
import { Image } from '@shared/components/styled';
import { DogchiCard } from '@shared/components/ui/dogchi-card';
import { BreedChip } from '@shared/components/ui/breed-chip';
import { StageBg } from '@shared/components/ui/stage-bg';
import { DogSprite } from '@features/dog/components/dog-sprite';
import {
  useDogProfile,
  useDogOutfit,
  useClearDog,
} from '@features/dog/stores/dog-store';
import { xpThresholdForLevel } from '@features/game/utils/level-system';

export default function ProfileScreen() {
  const profile = useDogProfile();
  const outfit = useDogOutfit();
  const clearDog = useClearDog();

  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4 px-8">
        <AppText style={{ fontSize: 60 }}>🐾</AppText>
        <AppText
          weight="extrabold"
          className="text-foreground text-xl text-center"
        >
          No dog yet
        </AppText>
        <AppText className="text-foreground-secondary text-sm text-center">
          Scan your dog to create your digital companion.
        </AppText>
        <Pressable
          onPress={() => router.push('/scan')}
          className="bg-primary rounded-[40px] px-10 py-4"
        >
          <AppText weight="extrabold" className="text-white">
            Scan My Dog
          </AppText>
        </Pressable>
      </View>
    );
  }

  const xpThreshold = xpThresholdForLevel(profile.level);
  const xpProgress = Math.min(1, profile.xp / xpThreshold);

  function handleResetDog() {
    Alert.alert(
      'Reset Dog',
      `Are you sure you want to remove ${profile?.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            clearDog();
            router.replace('/scan');
          },
        },
      ],
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" bounces={false}>
      {/* Stage */}
      <StageBg height={200}>
        <View className="flex-1 items-center justify-center">
          <DogSprite
            spriteId={profile.spriteId}
            coatColor={profile.coatColor}
            mood={80}
            outfit={outfit}
          />
        </View>
      </StageBg>

      <View className="px-5 pt-5 gap-4 pb-10">
        {/* Identity */}
        <View className="items-center gap-2">
          <AppText fontFamily="heading" className="text-foreground text-2xl">
            {profile.name}
          </AppText>
          <AppText className="text-foreground-secondary text-sm">
            {profile.personality.title}
          </AppText>
          <View className="flex-row gap-2 flex-wrap justify-center">
            <BreedChip text={profile.breed} variant="breed" />
            <BreedChip
              text={profile.personality.type.replace('_', ' ')}
              variant="personality"
            />
          </View>
        </View>

        {/* XP bar */}
        <DogchiCard className="p-4 gap-2">
          <View className="flex-row justify-between">
            <AppText weight="bold" className="text-foreground">
              Level {profile.level}
            </AppText>
            <AppText className="text-muted text-sm">
              {profile.xp} / {xpThreshold} XP
            </AppText>
          </View>
          <View className="h-3 bg-card-alt rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${xpProgress * 100}%` }}
            />
          </View>
        </DogchiCard>

        {/* Real photo */}
        <DogchiCard className="overflow-hidden">
          <Image
            source={{ uri: profile.photoUri }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
          />
          <View className="p-3">
            <AppText
              weight="semibold"
              className="text-foreground-secondary text-xs text-center"
            >
              The real {profile.name} 🐶
            </AppText>
          </View>
        </DogchiCard>

        {/* Personality stats */}
        <DogchiCard className="p-4 gap-2">
          <AppText weight="bold" className="text-foreground mb-1">
            Personality Stats
          </AppText>
          {Object.entries(profile.personality.stats).map(([key, value]) => (
            <View key={key} className="flex-row items-center gap-3">
              <AppText className="text-foreground-secondary text-sm capitalize w-20">
                {key}
              </AppText>
              <View className="flex-1 h-2 bg-card-alt rounded-full overflow-hidden">
                <View
                  className="h-full bg-personality rounded-full"
                  style={{ width: `${value}%` }}
                />
              </View>
              <AppText className="text-muted text-xs w-8 text-right">
                {value}
              </AppText>
            </View>
          ))}
        </DogchiCard>

        {/* Share button */}
        <Pressable
          onPress={() => router.push('/share')}
          className="bg-primary rounded-[40px] py-4 items-center"
        >
          <AppText weight="extrabold" className="text-white text-base">
            🎴 Share Card
          </AppText>
        </Pressable>

        {/* Danger zone */}
        <Pressable onPress={handleResetDog} className="py-3 items-center">
          <AppText weight="semibold" className="text-danger text-sm">
            Remove my dog
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}
