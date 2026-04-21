export type WelcomeIntensity = 'off' | 'low' | 'normal' | 'high';

export interface WelcomeConfig {
  float: { amplitude: number; period: number };
  ring: { cadence: number; duration: number; maxRadius: number };
  sparkle: { cycle: number; on: number };
  shimmer: { interval: number; duration: number };
}

export const INTENSITY_CONFIGS: Record<WelcomeIntensity, WelcomeConfig> = {
  off: {
    float: { amplitude: 0, period: 3000 },
    ring: { cadence: 99999, duration: 1500, maxRadius: 100 },
    sparkle: { cycle: 99999, on: 800 },
    shimmer: { interval: 99999, duration: 900 },
  },
  low: {
    float: { amplitude: 4, period: 3500 },
    ring: { cadence: 7000, duration: 1500, maxRadius: 90 },
    sparkle: { cycle: 7000, on: 800 },
    shimmer: { interval: 8000, duration: 900 },
  },
  normal: {
    float: { amplitude: 6, period: 3000 },
    ring: { cadence: 5000, duration: 1500, maxRadius: 100 },
    sparkle: { cycle: 4500, on: 800 },
    shimmer: { interval: 6000, duration: 900 },
  },
  high: {
    float: { amplitude: 8, period: 2500 },
    ring: { cadence: 4000, duration: 1500, maxRadius: 110 },
    sparkle: { cycle: 3000, on: 900 },
    shimmer: { interval: 4000, duration: 900 },
  },
};

export interface WelcomeScreenProps {
  simple?: boolean;
  intensity?: WelcomeIntensity;
  isApiKeyMissing?: boolean;
}
