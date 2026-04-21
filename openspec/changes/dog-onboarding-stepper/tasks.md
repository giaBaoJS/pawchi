## 1. Data model

- [x] 1.1 Extend `DogProfile` in `src/features/dog-profile/types/dog-profile.ts` with `dob: number` and `gender: 'male' | 'female'`
- [x] 1.2 Verify `useDogProfileStore` still persists correctly via MMKV (no migration needed if stored profiles are cleared)

## 2. KawaiiStepper component

- [x] 2.1 Create `src/shared/components/ui/kawaii-stepper.tsx` with `KawaiiStepperProps` (`steps`, `currentStep`, optional `completedSteps`)
- [x] 2.2 Define `StepConfig` type: `{ id: string; label: string; icon?: keyof typeof Ionicons.glyphMap; renderIcon?: (state) => ReactNode }`
- [x] 2.3 Implement `<StepCircle>` with `useSharedValue` for scale + color progress; animate via `useAnimatedStyle` + `withSpring`/`withTiming`
- [x] 2.4 Implement `<StepConnector>` as a track `<View>` with an inner animated `<View>` whose width animates via `withTiming` (420ms, ease-in-out cubic)
- [x] 2.5 Implement icon cross-fade: two stacked `<Animated.View>` with opacity shared values (check vs paw)
- [x] 2.6 Read colors via `useCSSVariable` for `--color-primary`, `--color-mood`, `--color-overlay`, `--color-border-soft`, `--color-foreground-secondary`; no hex literals
- [x] 2.7 Render step labels below each circle using existing Tailwind tokens (`text-foreground-secondary`, `text-xs`, `font-semibold`)

## 3. Onboarding screen restructure

- [x] 3.1 Add local state in `name-dog-screen.tsx`: `step: 0 | 1 | 2`, `dob: number | null`, `gender: 'male' | 'female' | null`
- [x] 3.2 Render `<KawaiiStepper>` at the top with steps Name, DOB, Gender
- [x] 3.3 Extract `<NameStep>`, `<DobStep>`, `<GenderStep>` sub-views within the file; switch on `step`
- [x] 3.4 Build `<DobStep>` — simple date selector (month/year picker or `@react-native-community/datetimepicker` if already present) styled with theme tokens
- [x] 3.5 Build `<GenderStep>` — two-option selector (Male / Female) using `KawaiiButton` variants or a segmented control styled with theme tokens
- [x] 3.6 Per-step validation controlling primary button disabled state
- [x] 3.7 Primary button: label "Next" on steps 0/1, "Save" on step 2; handler advances step or calls `onSave`
- [x] 3.8 Back button: decrements `step`, or calls `router.back()` when at step 0
- [x] 3.9 On Save: build full `DogProfile` with `dob`, `gender`, commit via `setProfile`, preserve existing replace-dialog behavior

## 4. Polish

- [x] 4.1 Add light haptic on step advance/back; medium haptic on final Save
- [x] 4.2 Ensure `KeyboardAvoidingView` still works on the Name step and doesn't interfere with DOB/Gender steps
- [ ] 4.3 Verify stepper renders correctly on small screens (iPhone SE) — labels don't wrap awkwardly
- [x] 4.4 Lint clean (`expo lint`) and typecheck clean (`npx tsc --noEmit`)

## 5. Verification

- [ ] 5.1 Manual run on iOS simulator: complete flow Name → DOB → Gender → Save lands on `/home` with full profile
- [ ] 5.2 Back navigation preserves entered values across steps
- [ ] 5.3 Replace-dialog still triggers when an existing profile is present
- [ ] 5.4 Animations feel smooth (no frame drops) on physical device if available
