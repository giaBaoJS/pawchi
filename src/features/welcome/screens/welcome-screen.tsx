import { View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';

const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
const apiKey = extra?.openaiApiKey;

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#FFE4EC', '#FFF0F5', '#EDE7FF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 80, paddingBottom: 56 }}>

        {/* ── Top spacer ── */}
        <View />

        {/* ── Hero ── */}
        <View style={{ alignItems: 'center', gap: 28 }}>
          {/* Icon card */}
          <View style={{
            width: 140,
            height: 140,
            borderRadius: 44,
            backgroundColor: 'rgba(255,255,255,0.72)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FFAFCC',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
          }}>
            <Ionicons name="paw" size={72} color="#FFAFCC" />
          </View>

          {/* Brand + tagline */}
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 52, fontWeight: '800', color: '#5A4A54', letterSpacing: -1 }}>
              Pawchi
            </Text>
            <Text style={{ fontSize: 16, color: '#8B7A82', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Snap a photo,{'\n'}discover your dog&apos;s breed.
            </Text>
          </View>

          {/* Feature pills */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['🐶 Breed ID', '📊 Stats', '✨ Instant'].map((label) => (
              <View key={label} style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'rgba(255,175,204,0.3)',
              }}>
                <Text style={{ fontSize: 13, color: '#8B7A82', fontWeight: '600' }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={{ width: '100%', gap: 12 }}>
          <Button
            onPress={() => router.push('/scan')}
            isDisabled={!apiKey}
            style={{
              backgroundColor: apiKey ? '#FFAFCC' : '#FFAFCC80',
              borderRadius: 999,
              paddingVertical: 18,
              alignItems: 'center',
              shadowColor: '#FFAFCC',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
            }}
          >
            <Button.Label style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>
              Scan my dog
            </Button.Label>
          </Button>

          <Button
            onPress={() => router.replace('/home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.54)',
              borderRadius: 999,
              paddingVertical: 18,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(90,74,84,0.16)',
            }}
          >
            <Button.Label style={{ color: '#5A4A54', fontSize: 16, fontWeight: '800' }}>
              Skip for now
            </Button.Label>
          </Button>

          {!apiKey && (
            <Text style={{ color: '#FF8FAB', fontSize: 12, textAlign: 'center', fontWeight: '500', paddingHorizontal: 16 }}>
              OpenAI API key not configured — add it to .env and rebuild
            </Text>
          )}
        </View>

      </View>
    </LinearGradient>
  );
}
