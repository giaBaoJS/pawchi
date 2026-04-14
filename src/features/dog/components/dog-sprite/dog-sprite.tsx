import { Canvas, Path, Oval, Paint, Skia } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { BREED_PATHS } from '../../constants/breeds';
import { darkenColor } from '@features/scan/utils/color-extractor';
import type { SpriteId } from '../../types/dog-profile';
import type { DogOutfit } from '../../types/dog-state';

const CANVAS_SIZE = 180;
const CHEEK_OPACITY = 0.4;

interface DogSpriteProps {
  spriteId: SpriteId;
  coatColor: string;
  mood: number;
  outfit: DogOutfit;
}

// React Compiler handles memoization — no React.memo needed
export function DogSprite({ spriteId, coatColor, mood, outfit }: DogSpriteProps) {
  const paths = useMemo(() => BREED_PATHS[spriteId], [spriteId]);

  const bodyPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color(coatColor));
    return p;
  }, [coatColor]);

  const shadePaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color(darkenColor(coatColor)));
    return p;
  }, [coatColor]);

  const darkPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color('#1C1210'));
    return p;
  }, []);

  const cheekPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color('#FF9966'));
    p.setAlphaf(CHEEK_OPACITY);
    return p;
  }, []);

  const shadowPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color('#000000'));
    p.setAlphaf(0.1);
    return p;
  }, []);

  const parsedPaths = useMemo(() => ({
    shadow: Skia.Path.MakeFromSVGString(paths.shadow) ?? Skia.Path.Make(),
    tail: Skia.Path.MakeFromSVGString(paths.tail) ?? Skia.Path.Make(),
    body: Skia.Path.MakeFromSVGString(paths.body) ?? Skia.Path.Make(),
    earBack: Skia.Path.MakeFromSVGString(paths.earBack) ?? Skia.Path.Make(),
    head: Skia.Path.MakeFromSVGString(paths.head) ?? Skia.Path.Make(),
    earFront: Skia.Path.MakeFromSVGString(paths.earFront) ?? Skia.Path.Make(),
  }), [paths]);

  const isSad = mood < 30;

  return (
    <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
      {/* Layer 1: Shadow */}
      <Path path={parsedPaths.shadow} paint={shadowPaint} />

      {/* Layer 2: Tail */}
      <Path path={parsedPaths.tail} paint={bodyPaint} />

      {/* Layer 3: Body */}
      <Path path={parsedPaths.body} paint={bodyPaint} />

      {/* Layer 4: Ears back */}
      <Path path={parsedPaths.earBack} paint={shadePaint} />

      {/* Layer 5: Head */}
      <Path path={parsedPaths.head} paint={bodyPaint} />

      {/* Layer 6: Ears front */}
      <Path path={parsedPaths.earFront} paint={cheekPaint} />

      {/* Layer 7: Face — eyes */}
      <Oval
        x={72}
        y={isSad ? 87 : 84}
        width={8}
        height={isSad ? 6 : 8}
        paint={darkPaint}
      />
      <Oval
        x={100}
        y={isSad ? 87 : 84}
        width={8}
        height={isSad ? 6 : 8}
        paint={darkPaint}
      />

      {/* Nose */}
      <Oval x={86} y={98} width={8} height={5} paint={darkPaint} />

      {/* Cheeks */}
      <Oval x={63} y={98} width={14} height={10} paint={cheekPaint} />
      <Oval x={103} y={98} width={14} height={10} paint={cheekPaint} />

      {/* Mouth — happy or sad */}
      {isSad ? (
        // Flat line for sad
        <Path
          path={Skia.Path.MakeFromSVGString('M 84 108 Q 90 106 96 108') ?? Skia.Path.Make()}
          paint={darkPaint}
        />
      ) : (
        // Curve for happy
        <Path
          path={Skia.Path.MakeFromSVGString('M 84 106 Q 90 113 96 106') ?? Skia.Path.Make()}
          paint={darkPaint}
        />
      )}

      {/* Outfit slot: hat — placeholder position, real items add their own paths */}
      {outfit.hat !== null && (
        <Oval x={72} y={40} width={36} height={20} paint={cheekPaint} />
      )}
    </Canvas>
  );
}
