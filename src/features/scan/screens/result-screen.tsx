import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Image } from '@shared/components/styled';
import { detectBreed } from '@/api/core/dog/queries';
import { DogNotFoundError, AIParseError } from '../types/ai-types';
import type { BreedDetectionResult } from '../types/ai-types';

export default function ResultScreen() {
  const { base64, photoUri } = useLocalSearchParams<{ base64: string; photoUri: string }>();

  const { mutate, isPending, error, data } = useMutation({
    mutationFn: (): Promise<BreedDetectionResult> => detectBreed(base64),
  });

  useEffect(() => {
    mutate();
  // Run once on mount
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
    <ScrollView className="flex-1 bg-background">
      {/* Photo */}
      <Image
        source={{ uri: photoUri }}
        style={{ width: '100%', height: 280 }}
        contentFit="cover"
      />

      <View className="px-5 pt-6 gap-5 pb-12">
        {/* Breed name + confidence */}
        <View className="items-center gap-2">
          <Text className="text-foreground text-3xl font-extrabold text-center">
            {data.breed}
          </Text>
          <Text className="text-foreground-secondary text-base font-semibold">
            {Math.round(data.confidence * 100)}% confident
          </Text>
        </View>

        {/* Breed details */}
        <View className="bg-card rounded-3xl p-5 gap-3">
          <DetailRow label="Body size" value={capitalize(data.body_size)} />
          <DetailRow label="Coat color" value={data.coat_color} />
          <DetailRow label="Coat pattern" value={data.coat_pattern} />
        </View>

        {/* Primary continue CTA */}
        <Pressable
          onPress={onContinue}
          className="bg-primary rounded-[40px] py-4 items-center"
        >
          <Text className="text-white font-extrabold text-base">Continue</Text>
        </Pressable>

        <Pressable onPress={onRetake} className="py-2 items-center">
          <Text className="text-foreground-secondary font-semibold">Try another photo</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-foreground-secondary text-sm">{label}</Text>
      <Text className="text-foreground font-semibold text-sm">{value}</Text>
    </View>
  );
}

function LoadingView({ photoUri }: { photoUri: string }) {
  return (
    <View className="flex-1 bg-background">
      <Image
        source={{ uri: photoUri }}
        style={{ width: '100%', height: 280, opacity: 0.5 }}
        contentFit="cover"
      />
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text style={{ fontSize: 60 }}>🔍</Text>
        <Text className="text-foreground font-extrabold text-xl">Analyzing...</Text>
        <Text className="text-foreground-secondary text-sm text-center">
          Identifying your dog&apos;s breed via GPT-4o
        </Text>
      </View>
    </View>
  );
}

interface ErrorViewProps {
  isDogNotFound: boolean;
  message: string;
  onRetake: () => void;
}

function ErrorView({ isDogNotFound, message, onRetake }: ErrorViewProps) {
  return (
    <View className="flex-1 bg-background items-center justify-center gap-6 px-8">
      <Text style={{ fontSize: 60 }}>{isDogNotFound ? '🐕' : '⚠️'}</Text>
      <View className="items-center gap-3">
        <Text className="text-foreground text-xl font-extrabold text-center">
          {isDogNotFound ? 'No dog found!' : 'Something went wrong'}
        </Text>
        <Text className="text-foreground-secondary text-sm text-center">
          {isDogNotFound
            ? 'We could not detect a dog in this photo. Make sure your dog is clearly visible.'
            : message}
        </Text>
      </View>
      <Pressable onPress={onRetake} className="bg-primary rounded-[40px] px-10 py-4">
        <Text className="text-white font-extrabold">Try Again</Text>
      </Pressable>
    </View>
  );
}
