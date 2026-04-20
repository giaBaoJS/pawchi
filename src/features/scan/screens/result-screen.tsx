import { detectBreed } from '@/api/core/dog/queries';
import { Image } from '@shared/components/styled';
import { IconCard } from '@shared/components/ui/icon-card';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AIParseError, DogNotFoundError } from '../types/ai-types';
import type { BreedDetectionResult } from '../types/ai-types';

export default function ResultScreen() {
  const { base64, photoUri } = useLocalSearchParams<{
    base64: string;
    photoUri: string;
  }>();

  const { mutate, isPending, error, data } = useMutation({
    mutationFn: (): Promise<BreedDetectionResult> => detectBreed(base64),
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onRetake() {
    router.replace('/scan');
  }

  function onContinue() {
    if (!data) return;
    router.replace({
      pathname: '/name-dog',
      params: {
        breed: data.breed,
        bodySize: data.body_size,
        coatColor: data.coat_color,
        coatPattern: data.coat_pattern,
        photoUri,
      },
    });
  }

  if (isPending) return <LoadingView photoUri={photoUri} />;

  if (error) {
    const isDogNotFound = error instanceof DogNotFoundError;
    const isParseError = error instanceof AIParseError;
    return (
      <ErrorView
        isDogNotFound={isDogNotFound}
        message={isParseError ? 'AI response was invalid. Please try again.' : error.message}
        onRetake={onRetake}
      />
    );
  }

  if (!data) return null;

  return (
    <KawaiiScreen edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="overflow-hidden rounded-b-[32px]">
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: 320 }}
            contentFit="cover"
          />
        </View>

        <View className="px-5 pt-6 gap-5">
          <View className="items-center gap-2">
            <Text className="text-foreground text-3xl font-extrabold text-center -tracking-wide">
              {data.breed}
            </Text>
            <View className="bg-overlay border border-border-soft px-3.5 py-1.5 rounded-full">
              <Text className="text-foreground-secondary text-xs font-bold">
                {Math.round(data.confidence * 100)}% confident
              </Text>
            </View>
          </View>

          <View className="bg-overlay border border-border-soft rounded-3xl p-5 gap-3">
            <DetailRow label="Body size" value={capitalize(data.body_size)} />
            <DetailRow label="Coat color" value={data.coat_color} />
            <DetailRow label="Coat pattern" value={data.coat_pattern} />
          </View>

          <View className="gap-3">
            <KawaiiButton tone="primary" onPress={onContinue} label="Continue" />
            <KawaiiButton tone="soft" onPress={onRetake} label="Try another photo" />
          </View>
        </View>
      </ScrollView>
    </KawaiiScreen>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-foreground-secondary text-sm font-semibold">{label}</Text>
      <Text className="text-foreground font-extrabold text-sm">{value}</Text>
    </View>
  );
}

function LoadingView({ photoUri }: { photoUri: string }) {
  return (
    <KawaiiScreen edges={['top', 'bottom']}>
      <View className="overflow-hidden rounded-b-[32px]">
        <Image
          source={{ uri: photoUri }}
          style={{ width: '100%', height: 280, opacity: 0.55 }}
          contentFit="cover"
        />
      </View>
      <View className="flex-1 items-center justify-center gap-5 px-8">
        <IconCard icon="search" size="lg" tone="primary" />
        <Text className="text-foreground text-xl font-extrabold">Analyzing…</Text>
        <Text className="text-foreground-secondary text-sm text-center font-medium">
          Identifying your dog&apos;s breed
        </Text>
      </View>
    </KawaiiScreen>
  );
}

interface ErrorViewProps {
  isDogNotFound: boolean;
  message: string;
  onRetake: () => void;
}

function ErrorView({ isDogNotFound, message, onRetake }: ErrorViewProps) {
  return (
    <KawaiiScreen edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center gap-6 px-8">
        <IconCard
          icon={isDogNotFound ? 'paw-outline' : 'alert-circle-outline'}
          size="lg"
          tone="primary"
        />
        <View className="items-center gap-3">
          <Text className="text-foreground text-xl font-extrabold text-center">
            {isDogNotFound ? 'No dog found!' : 'Something went wrong'}
          </Text>
          <Text className="text-foreground-secondary text-sm text-center font-medium leading-5">
            {isDogNotFound
              ? 'We could not detect a dog in this photo. Make sure your dog is clearly visible.'
              : message}
          </Text>
        </View>
        <KawaiiButton tone="primary" onPress={onRetake} label="Try Again" className="px-8" />
      </View>
    </KawaiiScreen>
  );
}
