import { resolveAvatar } from '@features/dog-avatar/utils/resolve-avatar';
import { Image } from '@shared/components/styled';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { Dialog } from 'heroui-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCSSVariable } from 'uniwind';
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
  const placeholder = useCSSVariable('--color-muted') as string;

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
    <KawaiiScreen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-6 pt-8 gap-8">
          <View className="items-center gap-3">
            {photoUri ? (
              <View className="rounded-full p-1.5 bg-overlay border border-border-soft">
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 140, height: 140, borderRadius: 70 }}
                  contentFit="cover"
                />
              </View>
            ) : null}
            <View className="bg-overlay border border-border-soft px-4 py-1.5 rounded-full">
              <Text className="text-foreground-secondary text-xs font-bold">{breed}</Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-foreground text-2xl font-extrabold text-center -tracking-wide">
              What&apos;s your dog&apos;s name?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter a name"
              autoFocus
              maxLength={20}
              className="bg-overlay border border-border-soft rounded-2xl px-5 py-4 text-foreground text-lg text-center"
              placeholderTextColor={placeholder}
              returnKeyType="done"
              onSubmitEditing={onSave}
            />
            <Text className="text-foreground-secondary text-xs text-center font-medium">
              1–20 characters
            </Text>
          </View>

          <View className="flex-1" />

          <KawaiiButton
            tone={isValid ? 'primary' : 'soft'}
            isDisabled={!isValid}
            onPress={onSave}
            label="Save"
          />
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
              <View className="flex-1">
                <KawaiiButton
                  tone="soft"
                  label="Cancel"
                  onPress={() => setShowReplaceDialog(false)}
                />
              </View>
              <View className="flex-1">
                <KawaiiButton
                  tone="primary"
                  label="Replace"
                  onPress={() => {
                    setShowReplaceDialog(false);
                    commit();
                  }}
                />
              </View>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </KawaiiScreen>
  );
}
