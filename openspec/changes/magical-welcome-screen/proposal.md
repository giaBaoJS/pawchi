## Why

The current welcome screen is the first impression users get of Pawchi, but it's static and doesn't convey the warm, dreamy, pet-magical tone the app is going for. A polished, alive-feeling welcome establishes emotional trust before users scan their dog, lifts perceived app quality, and differentiates Pawchi from generic onboarding screens.

## What Changes

- Replace the existing static welcome screen (`src/features/welcome/screens/welcome-screen.tsx` + `welcome-scene.tsx`) with a fully animated, layered implementation.
- Add a Skia-powered **animated pastel background** with slowly drifting, breathing blobs.
- Add a **scanner core** component around the paw icon card: floating motion, soft halo pulse, periodic airy scan ring, and rare "paw dust" sparkle particles.
- Add a **staggered entry sequence** (background → paw card → halo → title → subtitle → pills → CTA) using Reanimated.
- Add a **shimmer sweep** on the primary CTA "Scan my dog" with an optional subtle bone-shaped light trail and a polished press animation.
- Add an **idle animation loop** that keeps the screen gently alive after entry.
- Introduce reusable, configurable primitives (intensity/timing props, theme-token sourced colors via `useCSSVariable`) under the welcome feature folder.
- No gameplay, routing, or data behavior changes — this is purely a presentation upgrade.

## Capabilities

### New Capabilities
- `magical-welcome-screen`: Animated, dreamy welcome screen experience composed of a live pastel background, a magical paw scanner core, staggered text/pill entry, and an inviting shimmer CTA — built with Reanimated (motion) and Skia (visual effects).

### Modified Capabilities
<!-- None — this is a visual upgrade of an existing screen, not a behavior change to a tracked capability spec. -->

## Impact

- **Code**: `app/index.tsx` (unchanged wrapper), `src/features/welcome/screens/welcome-screen.tsx` (rewritten), `src/features/welcome/components/*` (new animated components), welcome feature `hooks/`, `types/`, `utils/` (new).
- **Dependencies**: Uses already-installed `react-native-reanimated`, `@shopify/react-native-skia`, `expo-haptics`, `@expo/vector-icons`, Uniwind, HeroUI Native. No new packages.
- **Theme**: All colors sourced from `global.css` tokens via `useCSSVariable` and Uniwind className — no inline hex.
- **Performance**: Animations run on UI thread (Reanimated shared values, Skia value bindings). Particle count and ring cadence are capped to stay idle-cheap on mid-range Android devices.
- **Risk**: Low — isolated to welcome route; no API/state changes. Visual regression possible, mitigated by keeping a simplified fallback path.
