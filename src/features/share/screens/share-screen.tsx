import { View, Text, Pressable, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image } from '@shared/components/styled';
import { BreedChip } from '@shared/components/ui/breed-chip';
import { DogSprite } from '@features/dog/components/dog-sprite';
import { useDogProfile, useDogOutfit } from '@features/dog/stores/dog-store';
import { useShareCard } from '../hooks/use-share-card';

function ShareCardContent() {
  const profile = useDogProfile();
  const outfit = useDogOutfit();

  if (!profile) return null;

  return (
    <View
      style={{ width: 375, height: 375 }}
      className="bg-background rounded-[24px] overflow-hidden"
    >
      {/* Header */}
      <View className="items-center pt-4 pb-2">
        <Text className="text-primary text-xl font-extrabold">Pawchi 🐾</Text>
      </View>

      {/* Middle row */}
      <View className="flex-1 flex-row px-4 gap-3">
        {/* Real photo */}
        <View className="flex-1 rounded-[16px] overflow-hidden relative">
          <Image
            source={{ uri: profile.photoUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View className="absolute bottom-2 left-2">
            <BreedChip text="Real" variant="breed" />
          </View>
        </View>

        {/* 2D character */}
        <LinearGradient
          colors={['#FFE4EC', '#FFCBA4', '#D8C8F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          <DogSprite
            spriteId={profile.spriteId}
            coatColor={profile.coatColor}
            mood={80}
            outfit={outfit}
          />
          <View className="absolute bottom-2 right-2">
            <BreedChip text="Digital" variant="personality" />
          </View>
        </LinearGradient>
      </View>

      {/* Footer */}
      <View className="items-center py-3 gap-1">
        <Text className="text-foreground text-base font-extrabold">{profile.name}</Text>
        <View className="flex-row gap-2">
          <BreedChip text={profile.breed} variant="breed" />
          <BreedChip text={`Lv. ${profile.level}`} variant="level" />
        </View>
        <Text className="text-muted text-xs mt-1">pawchi.app</Text>
      </View>
    </View>
  );
}

export default function ShareScreen() {
  const profile = useDogProfile();
  const { viewShotRef, shareCard, saveToPhotos, copyImage } = useShareCard();

  if (!profile) {
    router.replace('/home');
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Back button */}
      <View className="flex-row items-center px-5 pt-14 pb-4">
        <Pressable onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-foreground-secondary font-semibold">← Back</Text>
        </Pressable>
        <Text className="text-foreground text-lg font-extrabold">Share Card</Text>
      </View>

      {/* Preview */}
      <View className="items-center px-5">
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
        >
          <ShareCardContent />
        </ViewShot>
      </View>

      {/* Hidden off-screen capture target at 3x density */}
      <View style={{ position: 'absolute', top: -9999, left: -9999, opacity: 0 }} pointerEvents="none">
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile', width: 1125, height: 1125 }}
        >
          <ShareCardContent />
        </ViewShot>
      </View>

      {/* Actions */}
      <View className="gap-3 px-5 pt-6">
        <Pressable onPress={shareCard} className="bg-primary rounded-[40px] py-4 items-center">
          <Text className="text-white font-extrabold text-base">🔗 Share</Text>
        </Pressable>
        <Pressable onPress={saveToPhotos} className="bg-card border border-border rounded-[40px] py-4 items-center">
          <Text className="text-foreground font-bold text-base">📸 Save to Photos</Text>
        </Pressable>
        <Pressable onPress={copyImage} className="bg-card border border-border rounded-[40px] py-4 items-center">
          <Text className="text-foreground font-bold text-base">📋 Copy Image</Text>
        </Pressable>
      </View>
    </View>
  );
}
