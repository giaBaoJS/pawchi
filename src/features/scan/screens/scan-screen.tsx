import { Ionicons } from '@expo/vector-icons';
import { IconCard } from '@shared/components/ui/icon-card';
import { KawaiiButton } from '@shared/components/ui/kawaii-button';
import { KawaiiScreen } from '@shared/components/ui/kawaii-screen';
import { heavyHaptic, lightHaptic } from '@shared/utils/haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@shared/components/ui/app-text';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraDevice,
} from 'react-native-vision-camera';
import { useCSSVariable } from 'uniwind';
import { preprocessImage } from '../utils/image-preprocessor';

async function pickFromGallery() {
  lightHaptic();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
  });
  if (result.canceled || result.assets.length === 0) return;
  const { uri } = result.assets[0];
  const { base64, uri: processedUri } = await preprocessImage(uri);
  router.push({
    pathname: '/result',
    params: { base64, photoUri: processedUri },
  });
}

function BackButton() {
  const fg = useCSSVariable('--color-foreground') as string;
  return (
    <Pressable
      onPress={() => router.back()}
      className="absolute top-14 left-5 z-10 w-10 h-10 rounded-full bg-overlay-soft items-center justify-center"
    >
      <Ionicons name="chevron-back" size={22} color={fg} />
    </Pressable>
  );
}

function NoCameraView() {
  return (
    <KawaiiScreen edges={['top', 'bottom']}>
      <BackButton />
      <View className="flex-1 items-center justify-center px-8">
        <IconCard icon="phone-portrait-outline" size="lg" tone="primary" />
        <AppText
          fontFamily="heading"
          className="mt-7 text-foreground text-2xl text-center"
        >
          Simulator detected
        </AppText>
        <AppText
          weight="medium"
          className="mt-2.5 text-foreground-secondary text-base text-center leading-6"
        >
          iOS Simulator has no camera.{'\n'}
          Pick a dog photo from your library to test the full flow.
        </AppText>
        <View className="h-7" />
        <View className="w-full">
          <KawaiiButton
            tone="primary"
            onPress={pickFromGallery}
            label="Choose from Library"
          />
        </View>
      </View>
    </KawaiiScreen>
  );
}

interface PermissionDeniedViewProps {
  canAsk: boolean;
  onRequest: () => void;
}

function PermissionDeniedView({
  canAsk,
  onRequest,
}: PermissionDeniedViewProps) {
  const muted = useCSSVariable('--color-foreground-secondary') as string;
  return (
    <KawaiiScreen edges={['top', 'bottom']}>
      <BackButton />
      <View className="flex-1 items-center justify-center px-8">
        <IconCard icon="camera-outline" size="lg" tone="primary" />
        <AppText
          fontFamily="heading"
          className="mt-7 text-foreground text-2xl text-center"
        >
          Camera access needed
        </AppText>
        <AppText
          weight="medium"
          className="mt-2.5 text-foreground-secondary text-base text-center leading-6"
        >
          Allow camera access to scan your dog and detect their breed instantly.
        </AppText>
        <View className="h-7" />
        <View className="w-full">
          <KawaiiButton
            tone="primary"
            onPress={canAsk ? onRequest : () => Linking.openSettings()}
            label={canAsk ? 'Allow Camera' : 'Open Settings'}
          />
        </View>
        <Pressable
          onPress={pickFromGallery}
          className="mt-3 flex-row items-center py-3"
        >
          <Ionicons name="images-outline" size={18} color={muted} />
          <AppText
            weight="semibold"
            className="ml-2 text-foreground-secondary text-sm"
          >
            Use Photo Library
          </AppText>
        </Pressable>
      </View>
    </KawaiiScreen>
  );
}

function ActiveCamera({ device }: { device: CameraDevice }) {
  const cameraRef = useRef<Camera>(null);
  const cornerColor = useCSSVariable('--color-primary') as string;

  async function handleCapture() {
    heavyHaptic();
    try {
      const photo = await cameraRef.current?.takePhoto({ flash: 'off' });
      if (!photo) return;
      const { base64, uri } = await preprocessImage(`file://${photo.path}`);
      router.push({ pathname: '/result', params: { base64, photoUri: uri } });
    } catch {
      // Error surfaced on result screen
    }
  }

  return (
    <View className="flex-1">
      <Camera
        ref={cameraRef}
        device={device}
        isActive
        photo
        style={StyleSheet.absoluteFill}
      />

      <View className="absolute top-14 left-0 right-0 flex-row items-center justify-between px-5 z-10">
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-black/35 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <View className="flex-row items-center bg-black/30 px-3.5 py-2 rounded-full">
          <Ionicons name="paw" size={16} color="#fff" />
          <AppText weight="semibold" className="ml-1.5 text-white text-sm">
            Scan your dog
          </AppText>
        </View>

        <Pressable
          onPress={pickFromGallery}
          className="w-11 h-11 rounded-full bg-black/35 items-center justify-center"
        >
          <Ionicons name="images-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      <View className="absolute inset-0 items-center justify-center">
        <View className="w-[270px] h-[270px] relative">
          <View
            className="absolute top-0 left-0 w-6 h-6 rounded-tl-lg"
            style={{
              borderTopWidth: 3,
              borderLeftWidth: 3,
              borderColor: cornerColor,
            }}
          />
          <View
            className="absolute top-0 right-0 w-6 h-6 rounded-tr-lg"
            style={{
              borderTopWidth: 3,
              borderRightWidth: 3,
              borderColor: cornerColor,
            }}
          />
          <View
            className="absolute bottom-0 left-0 w-6 h-6 rounded-bl-lg"
            style={{
              borderBottomWidth: 3,
              borderLeftWidth: 3,
              borderColor: cornerColor,
            }}
          />
          <View
            className="absolute bottom-0 right-0 w-6 h-6 rounded-br-lg"
            style={{
              borderBottomWidth: 3,
              borderRightWidth: 3,
              borderColor: cornerColor,
            }}
          />
        </View>
        <AppText
          weight="semibold"
          className="mt-6 text-white/85 text-sm text-center"
        >
          Center your dog in the frame
        </AppText>
      </View>

      <View className="absolute bottom-14 left-0 right-0 flex-row items-center justify-between px-12">
        <Pressable
          onPress={pickFromGallery}
          className="w-13 h-13 rounded-2xl bg-black/35 items-center justify-center"
        >
          <Ionicons name="images" size={22} color="#fff" />
        </Pressable>

        <Pressable
          onPress={handleCapture}
          className="w-20 h-20 rounded-full bg-white/25 border-[3px] border-white/80 items-center justify-center"
        >
          <View className="w-[62px] h-[62px] rounded-full bg-white" />
        </Pressable>

        <View className="w-13" />
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  if (!hasPermission) {
    return <PermissionDeniedView canAsk onRequest={requestPermission} />;
  }

  if (!device) return <NoCameraView />;

  return (
    <View className="flex-1 bg-black">
      <ActiveCamera device={device} />
    </View>
  );
}
