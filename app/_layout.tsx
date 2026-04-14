import '../global.css';

import { Stack } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { Uniwind } from 'uniwind';
import { AppQueryClientProvider } from '@/api';
import { useDogProfileStore } from '@features/dog-profile/stores/dog-profile-store';

Uniwind.setTheme('light');

export default function RootLayout() {
  const hasProfile = useDogProfileStore.getState().profile !== null;

  return (
    <AppQueryClientProvider>
      <HeroUINativeProvider>
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName={hasProfile ? 'home' : 'index'}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="scan"
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="result" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="name-dog" />
          <Stack.Screen name="home" />
          <Stack.Screen
            name="walk"
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="walk-summary" />
        </Stack>
      </HeroUINativeProvider>
    </AppQueryClientProvider>
  );
}
