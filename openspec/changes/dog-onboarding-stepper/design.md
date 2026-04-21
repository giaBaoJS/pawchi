## Context

The onboarding flow currently jumps straight from the scan result into a single-question "name your dog" screen. Product wants a 3-step flow (Name → DOB → Gender) with a **polished animated progress indicator** that matches the app's kawaii aesthetic. Theme tokens, Reanimated v4.2.1, `@shopify/react-native-skia` 2.6.2, and Ionicons are already wired in. The user explicitly asked for the indicator pattern name and implementation approach.

**Pattern naming.** The correct industry term is **"animated segmented step progress indicator"** (aka "step progress indicator" / "onboarding stepper"). "Step tab bar" implies tappable navigation between peers — this flow is linear with forward/back, so _stepper_ is accurate.

## Goals / Non-Goals

**Goals:**
- Reusable `KawaiiStepper` component in `src/shared/components/ui/` driven by `steps` + `currentStep`.
- Smooth 60fps animations on UI thread (Reanimated only).
- Use existing theme tokens; no new colors.
- Restructure `name-dog-screen.tsx` into 3 internal steps — no new routes.
- Premium micro-interactions: active bounce, connector fill interpolation, icon cross-fade.

**Non-Goals:**
- Tap-to-jump between steps (linear flow only for v1).
- Horizontal swipe gesture between steps (Next/Back buttons only).
- Persisting partial onboarding state across app kills.
- Internationalization of labels beyond what already exists.

## Decisions

### D1. Reanimated only — no Skia
A stepper is 3 circles + 2 rectangular connector segments. Every primitive (scale, backgroundColor, width%, opacity) is a standard RN style animatable by Reanimated's `useAnimatedStyle`. Skia adds a `<Canvas>` tree, GPU compositing, and a second rendering pipeline with **zero visual gain** at this fidelity. We reserve Skia for stat bars / circular progress where curved gradient fills justify the cost.

**Alternatives considered:** Skia-drawn connector with animated gradient stops — rejected as overkill; pure `withTiming`(interpolated width %) on a `<View>` gives identical perceived smoothness.

### D2. Completion derived from `currentStep` by default
API accepts optional `completedSteps` but defaults to `currentStep` (every index `< currentStep` is completed). Simpler caller ergonomics; explicit override remains for edge cases (e.g., skipped optional step).

### D3. Animation choreography
- **Circle scale**: `withSpring(isActive ? 1.15 : 1, { damping: 12, stiffness: 180 })` — gives the premium bounce.
- **Background color**: `withTiming` over 260ms with `Easing.out(Easing.cubic)` interpolating via `interpolateColor` between upcoming → active → completed.
- **Connector fill**: shared `progress` value per segment animated with `withTiming(targetFraction, { duration: 420, easing: Easing.inOut(Easing.cubic) })`. Rendered as absolute-positioned filled `<View>` with `width: progress * 100%` over the grey track.
- **Icon swap**: cross-fade (old icon `opacity → 0`, new icon `opacity → 1`) + 0.8→1 scale. Two `<Animated.View>` stacked, toggled by `completed` flag.

### D4. Icon choices
Ionicons `paw` for upcoming/active (on-brand, already used on welcome screen), `checkmark` for completed. Users can override via `step.icon` (Ionicons glyph name) or `step.renderIcon?: (state) => ReactNode` escape hatch.

### D5. Screen restructure strategy
Introduce a local `step: 0 | 1 | 2` state in `name-dog-screen.tsx`. Render `<KawaiiStepper>` at top; body is a switch on `step` showing NameField / DobField / GenderField. Primary button label: "Next" → "Next" → "Save". Back button decrements `step`, routes back at `step === 0`. All collected state lives in a single `useState<Partial<DogProfile>>` object, committed on final Save.

**Alternative:** three sub-routes under `app/` — rejected; user explicitly said "in 1 screen only, no new screen."

### D6. Data model extension
Extend `DogProfile` with `dob: number` and `gender: 'male' | 'female'`. Both required on creation. No migration concern — local store; existing profiles (from prior builds) get defaulted at read time or user is prompted to re-onboard (cheap — single dog per user).

## Risks / Trade-offs

- **[Risk]** Reanimated `interpolateColor` on 3 circles + icon swap may cause jank on low-end Android → **Mitigation**: keep all animations on UI thread (no JS callbacks during anim); cap durations ≤420ms; profile with Perf Monitor if reports come in.
- **[Risk]** Users on existing builds with a partial `DogProfile` (no dob/gender) → **Mitigation**: mark fields optional at the type level via a migration flag, OR force re-onboarding (acceptable — single-pet app, pre-launch).
- **[Trade-off]** Linear-only stepper (no tap-to-jump) is less flexible, but keeps component simple and matches v1 product intent. Can add `onStepPress` prop later without breaking API.
- **[Risk]** DOB picker UX varies by platform → **Mitigation**: use `@react-native-community/datetimepicker` (standard, already transitively available via Expo modules) or a simple month/year spinner; confirm in tasks.

## Open Questions

- Do we need a DOB picker library, or is a minimal custom year/month selector enough for v1? (Lean: custom selector — fewer deps, better aesthetic control.)
- Should `gender` allow a third "prefer not to say" option? (Default: no, two options; revisit if product asks.)
