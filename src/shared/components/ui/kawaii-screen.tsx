import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';

interface KawaiiScreenProps {
  children: ReactNode;
  edges?: readonly Edge[];
}

export function KawaiiScreen({
  children,
  edges = ['top', 'bottom'],
}: KawaiiScreenProps) {
  // All three tokens are declared in `@theme static` in global.css,
  // so they're guaranteed to resolve here — no undefined, no blank screen.
  const start = useCSSVariable('--color-card-alt') as string;
  const middle = useCSSVariable('--color-card') as string;
  const end = useCSSVariable('--color-lavender') as string;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[start, middle, end]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }} edges={edges}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
