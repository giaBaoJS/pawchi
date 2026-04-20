import { Ionicons } from '@expo/vector-icons';
import { FeedButton } from '@features/feeding-action/components/feed-button';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

export function ActionRow() {
  const iconColor = useCSSVariable('--color-primary') as string;
  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={() => router.push('/walk')}
        className="flex-1 bg-overlay border border-border-soft rounded-3xl py-4 items-center justify-center gap-1"
      >
        <Ionicons name="walk" size={26} color={iconColor} />
        <Text className="text-foreground font-extrabold text-sm">Walk</Text>
      </Pressable>
      <FeedButton />
    </View>
  );
}
