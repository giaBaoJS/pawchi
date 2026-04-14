import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_DISPLAY_NAME ?? 'Pawchi',
  slug: process.env.EAS_SLUG ?? 'pawchi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: process.env.DEEP_LINK_SCHEME ?? 'pawchi',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: process.env.IOS_BUNDLE_ID ?? 'com.paulnguyen.pawchi',
    buildNumber: process.env.IOS_BUILD_NUMBER ?? '1',
    supportsTablet: false,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Pawchi uses your location during walks to measure distance.',
    },
  },
  android: {
    package: process.env.PACKAGE_ID ?? 'com.paulnguyen.pawchi',
  },
  extra: {
    apiUrl: process.env.API_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    appEnv: process.env.APP_ENV ?? 'DEV',
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  owner: process.env.EAS_OWNER ?? 'paulnguyen',
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFF9FB',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    'expo-secure-store',
    'expo-sharing',
    [
      'expo-media-library',
      {
        photosPermission: 'Allow Pawchi to save your dog card to photos.',
        savePhotosPermission: 'Allow Pawchi to save your dog card to photos.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Pawchi to access your photos to pick a dog photo.',
      },
    ],
    [
      'react-native-vision-camera',
      {
        cameraPermissionText: 'Allow Pawchi to use your camera to snap your dog.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
