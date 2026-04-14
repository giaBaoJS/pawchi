import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { FeedButton } from '@features/feeding-action/components/feed-button';

export function ActionRow() {
  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={() => router.push('/walk')}
        className="flex-1 bg-primary rounded-2xl py-4 items-center"
      >
        <Text className="text-white font-extrabold text-base">Walk</Text>
      </Pressable>
      <FeedButton />
    </View>
  );
}
