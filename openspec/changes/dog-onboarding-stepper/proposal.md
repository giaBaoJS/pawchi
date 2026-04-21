## Why

The current dog onboarding flow (`name-dog-screen.tsx`) collects only the dog's name in a single screen, but the product now needs Dog Name → DOB → Gender as a multi-step flow. Without a visible, animated progress indicator users lose context of where they are, and the kawaii pet-app aesthetic calls for a playful, polished stepper rather than a generic progress bar.

## What Changes

- Add a reusable **animated step progress indicator** component (`KawaiiStepper`) under `src/shared/components/ui/` built with `react-native-reanimated` v4 (no Skia — unnecessary overhead for a 3-dot stepper with a line).
- Component API: `steps: StepConfig[]`, `currentStep: number`, optional `completedSteps?: number` (derived from `currentStep` when absent), optional per-step icon overrides.
- Visual states per step:
  - **Completed**: green (`--color-mood`) circle + check icon (Ionicons `checkmark`).
  - **Active**: primary-tinted circle, scaled up ~1.15×, subtle bounce on enter, paw icon.
  - **Upcoming**: soft/overlay background + `--color-foreground-secondary` paw icon at normal scale.
- Animated connector segments fill from upcoming → completed via `withTiming` on a `useDerivedValue` width fraction; icons cross-fade + scale; active circle uses `withSpring` for bounce.
- Convert `name-dog-screen.tsx` into a **3-step in-screen flow** (Dog Name, DOB, Gender) using local state — NO new route/screen file. Stepper renders at the top; body switches between three form sections; primary button advances / saves on final step; back button decrements step or exits.
- DOB collected via a simple date picker; Gender via two-option segmented choice (Male / Female). Both persisted into the existing `DogProfile` type — add `dob: number` (ms epoch) and `gender: 'male' | 'female'` fields.

## Capabilities

### New Capabilities
- `kawaii-stepper`: Reusable animated multi-step progress indicator for onboarding flows.
- `dog-onboarding-flow`: Multi-step dog profile creation (name, DOB, gender) rendered inside a single screen with the stepper.

### Modified Capabilities
<!-- none — no existing specs -->

## Impact

- **New**: `src/shared/components/ui/kawaii-stepper.tsx` (+ internal `step-circle.tsx`, `step-connector.tsx` if split).
- **Modified**: `src/features/dog-profile/screens/name-dog-screen.tsx` — restructured into multi-step internal state machine; imports `KawaiiStepper`.
- **Modified**: `src/features/dog-profile/types/dog-profile.ts` — add `dob: number` and `gender: 'male' | 'female'` fields.
- **Modified**: scan flow's result screen params & navigation — no change needed; existing params still forward through to the (now multi-step) name screen.
- **Theme**: uses existing tokens (`--color-primary`, `--color-mood`, `--color-overlay`, `--color-border-soft`, `--color-foreground-secondary`). No new colors introduced.
- **Dependencies**: none added. `react-native-reanimated` v4.2.1 and `@expo/vector-icons` already installed.
