import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Dialog } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@shared/components/styled';
import { resolveAvatar } from '@features/dog-avatar/utils/resolve-avatar';
import { useDogProfileStore } from '../stores/dog-profile-store';
import type { BodySize, DogProfile } from '../types/dog-profile';

interface NameDogParams {
  breed: string;
  bodySize: BodySize;
  coatColor: string;
  coatPattern: string;
  photoUri: string;
}

export default function NameDogScreen() {
  const params = useLocalSearchParams<Record<keyof NameDogParams, string>>();
  const [name, setName] = useState('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const existingProfile = useDogProfileStore((s) => s.profile);
  const setProfile = useDogProfileStore((s) => s.setProfile);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 20;

  const breed = params.breed ?? 'Mixed Breed';
  const bodySize = (params.bodySize as BodySize) ?? 'medium';
  const coatColor = params.coatColor ?? '';
  const coatPattern = params.coatPattern ?? '';
  const photoUri = params.photoUri ?? '';

  function commit() {
    const profile: DogProfile = {
      id: `dog_${Date.now()}`,
      name: trimmed,
      breed,
      bodySize,
      coatColor,
      coatPattern,
      avatarId: resolveAvatar({ breed, bodySize }),
      photoUri,
      createdAt: Date.now(),
    };
    setProfile(profile);
    router.replace('/home');
  }

  function onSave() {
    if (!isValid) return;
    if (existingProfile) {
      setShowReplaceDialog(true);
      return;
    }
    commit();
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-6 pt-6 gap-6">
          <View className="items-center gap-3">
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: 140, height: 140, borderRadius: 70 }}
                contentFit="cover"
              />
            ) : null}
            <Text className="text-foreground-secondary text-base">{breed}</Text>
          </View>

          <View className="gap-3">
            <Text className="text-foreground text-2xl font-extrabold text-center">
              What&apos;s your dog&apos;s name?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter a name"
              autoFocus
              maxLength={20}
              className="bg-card rounded-2xl px-5 py-4 text-foreground text-lg"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              onSubmitEditing={onSave}
            />
            <Text className="text-foreground-secondary text-xs text-center">
              1–20 characters
            </Text>
          </View>

          <View className="flex-1" />

          <Pressable
            onPress={onSave}
            disabled={!isValid}
            className={`rounded-[40px] py-4 items-center ${
              isValid ? 'bg-primary' : 'bg-card'
            }`}
          >
            <Text
              className={`font-extrabold text-base ${
                isValid ? 'text-white' : 'text-foreground-secondary'
              }`}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Dialog isOpen={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Replace your dog?</Dialog.Title>
            <Dialog.Description>
              You already have {existingProfile?.name}. Saving {trimmed} will replace them.
              Progress stays with your account.
            </Dialog.Description>
            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setShowReplaceDialog(false)}
                className="flex-1 bg-card rounded-2xl py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowReplaceDialog(false);
                  commit();
                }}
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Replace</Text>
              </Pressable>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </SafeAreaView>
  );
}
