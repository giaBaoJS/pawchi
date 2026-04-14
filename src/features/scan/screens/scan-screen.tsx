import { heavyHaptic, lightHaptic } from '@shared/utils/haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraDevice,
} from 'react-native-vision-camera';
import { preprocessImage } from '../utils/image-preprocessor';

const PINK = '#FFAFCC';
const PLUM = '#5A4A54';
const DUSTY = '#8B7A82';

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
  router.push({ pathname: '/result', params: { base64, photoUri: processedUri } });
}

// ── No real camera (simulator / restricted) ──────────────────────────────────
function NoCameraView() {
  return (
    <LinearGradient
      colors={['#FFE4EC', '#FFF0F5', '#EDE7FF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color={PLUM} />
      </Pressable>

      <View style={styles.centerContent}>
        {/* Icon card */}
        <View style={styles.iconCard}>
          <Ionicons name="phone-portrait-outline" size={56} color={PINK} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Simulator detected</Text>
          <Text style={styles.subtitle}>
            iOS Simulator has no camera.{'\n'}
            Pick a dog photo from your library to test the full flow.
          </Text>
        </View>

        <Pressable onPress={pickFromGallery} style={styles.primaryBtn}>
          <Ionicons name="images-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnLabel}>Choose from Library</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

// ── Permission denied ─────────────────────────────────────────────────────────
function PermissionDeniedView({
  canAsk,
  onRequest,
}: {
  canAsk: boolean;
  onRequest: () => void;
}) {
  return (
    <LinearGradient
      colors={['#FFE4EC', '#FFF0F5', '#EDE7FF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color={PLUM} />
      </Pressable>

      <View style={styles.centerContent}>
        <View style={styles.iconCard}>
          <Ionicons name="camera-outline" size={56} color={PINK} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Camera access needed</Text>
          <Text style={styles.subtitle}>
            Allow camera access to scan your dog and detect their breed instantly.
          </Text>
        </View>

        <Pressable
          onPress={canAsk ? onRequest : () => Linking.openSettings()}
          style={styles.primaryBtn}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.primaryBtnLabel}>
            {canAsk ? 'Allow Camera' : 'Open Settings'}
          </Text>
        </Pressable>

        <Pressable onPress={pickFromGallery} style={styles.secondaryBtn}>
          <Ionicons name="images-outline" size={18} color={DUSTY} />
          <Text style={styles.secondaryBtnLabel}>Use Photo Library</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

// ── Active camera view ────────────────────────────────────────────────────────
function ActiveCamera({ device }: { device: CameraDevice }) {
  const cameraRef = useRef<Camera>(null);

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

  async function handleGallery() {
    await pickFromGallery();
  }

  return (
    <View style={styles.fill}>
      <Camera
        ref={cameraRef}
        device={device}
        isActive
        photo
        style={StyleSheet.absoluteFill}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.glassBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <View style={styles.topBarLabel}>
          <Ionicons name="paw" size={16} color="#fff" />
          <Text style={styles.topBarText}>Scan your dog</Text>
        </View>

        <Pressable onPress={handleGallery} style={styles.glassBtn}>
          <Ionicons name="images-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Viewfinder guide */}
      <View style={styles.viewfinderWrapper}>
        <View style={styles.viewfinder}>
          {/* Corner accents */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.viewfinderHint}>Center your dog in the frame</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Gallery thumbnail placeholder */}
        <Pressable onPress={handleGallery} style={styles.galleryBtn}>
          <Ionicons name="images" size={22} color="#fff" />
        </Pressable>

        {/* Shutter */}
        <Pressable onPress={handleCapture} style={styles.shutter}>
          <View style={styles.shutterInner} />
        </Pressable>

        {/* Spacer to balance layout */}
        <View style={{ width: 52 }} />
      </View>
    </View>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  if (!hasPermission) {
    return <PermissionDeniedView canAsk onRequest={requestPermission} />;
  }

  if (!device) return <NoCameraView />;

  return (
    <View style={[styles.fill, { backgroundColor: '#000' }]}>
      <ActiveCamera device={device} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  fill: { flex: 1 },

  // Back button (for non-camera screens)
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },

  iconCard: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  textBlock: { alignItems: 'center', gap: 10 },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: PLUM,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 15,
    color: DUSTY,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: PINK,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  primaryBtnLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  secondaryBtnLabel: { color: DUSTY, fontSize: 15, fontWeight: '600' },

  // Camera UI
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  topBarText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  viewfinderWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  viewfinder: {
    width: 270,
    height: 270,
    position: 'relative',
  },
  viewfinderHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  // Corner accents
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: PINK,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 8,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  galleryBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },
});
