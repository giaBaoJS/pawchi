import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { IdleLoops } from '../hooks/use-idle-loops';
import type { WelcomeThemeColors } from '../hooks/use-theme-colors';
import type { WelcomeConfig } from '../types/welcome';
import { HaloPulse } from './halo-pulse';
import { PawCard } from './paw-card';
import { PawDust } from './paw-dust';
import { ScanRing } from './scan-ring';

const CANVAS_SIZE = 260;
const CARD_SIZE = 140;
const CARD_OFFSET = (CANVAS_SIZE - CARD_SIZE) / 2;

interface ScannerCoreProps {
  entryPaw: SharedValue<number>;
  entryHalo: SharedValue<number>;
  loops: IdleLoops;
  config: WelcomeConfig;
  colors: WelcomeThemeColors;
  simple: boolean;
}

export function ScannerCore({
  entryPaw,
  entryHalo,
  loops,
  config,
  colors,
  simple,
}: ScannerCoreProps) {
  return (
    <View style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
      {/* Halo behind everything */}
      <HaloPulse
        entryOpacity={entryHalo}
        haloPulse={loops.haloPulse}
        color={colors.primary}
      />

      {/* Scan ring — hidden in simple mode */}
      {!simple && (
        <ScanRing scanRing={loops.scanRing} color={colors.lavender} />
      )}

      {/* Paw-dust sparkles — hidden in simple mode */}
      {!simple && (
        <PawDust
          sparkle0={loops.sparkle0}
          sparkle1={loops.sparkle1}
          sparkle2={loops.sparkle2}
          sparkle3={loops.sparkle3}
          color={colors.primary}
        />
      )}

      {/* Paw card — absolutely centered over canvas */}
      <View
        style={{
          position: 'absolute',
          left: CARD_OFFSET,
          top: CARD_OFFSET,
          width: CARD_SIZE,
          height: CARD_SIZE,
        }}
      >
        <PawCard entryProgress={entryPaw} float={loops.float} config={config} />
      </View>
    </View>
  );
}
