## 1. Environment and config sanity check

- [x] 1.1 Confirm `.env` contains a working `OPENAI_API_KEY` (starts with `sk-`)
- [x] 1.2 Confirm [app.config.ts](app.config.ts) exposes it via `extra.openaiApiKey`
- [x] 1.3 Confirm [src/api/core/dog/queries.ts](src/api/core/dog/queries.ts) `getApiKey()` reads from `Constants.expoConfig?.extra?.openaiApiKey`
- [x] 1.4 Run `npx tsc --noEmit` as a baseline — note any existing errors so we can tell which are new

## 2. Strip the router down to the MVP flow

- [x] 2.1 Rewrite [app/_layout.tsx](app/_layout.tsx) to remove `AppDecayListener`, `useGameState`, the `hasCompletedOnboarding` redirect, and the `(tabs)` screen registration
- [x] 2.2 In the new `_layout.tsx`, keep only: `<AppQueryClientProvider>`, `<HeroUINativeProvider>`, `Uniwind.setTheme('light')`, and a Stack with three screens — `index`, `scan` (fullScreenModal), `result`
- [x] 2.3 Delete [app/onboarding.tsx](app/onboarding.tsx) (its welcome role is replaced by `app/index.tsx`)
- [x] 2.4 Leave [app/(tabs)/](app/(tabs)/) and [app/share.tsx](app/share.tsx) on disk but unregistered — they are parked, not deleted
- [x] 2.5 Verify `npx tsc --noEmit` still passes after the router changes

## 3. Welcome feature

- [x] 3.1 Create `src/features/welcome/screens/welcome-screen.tsx` — a single functional component, no hooks folder, no sub-components
- [x] 3.2 Render a hero (emoji 🐾 or 🐶), the app name "Pawchi", a one-line value prop ("Scan your dog, discover their breed."), and a single primary CTA "Scan my dog"
- [x] 3.3 Read `Constants.expoConfig?.extra?.openaiApiKey` on mount — if falsy, disable the CTA and render an inline warning: "OpenAI API key not configured — add it to .env and rebuild"
- [x] 3.4 On CTA press with key present, call `router.push('/scan')`
- [x] 3.5 Use only Uniwind className for styling; no `StyleSheet.create`
- [x] 3.6 Create `app/index.tsx` as a thin re-export of `WelcomeScreen` from `@features/welcome/screens/welcome-screen`
- [x] 3.7 Verify the welcome screen's import graph does NOT include `@features/dog`, `@features/game`, `@features/room`, `@features/wardrobe`

## 4. Welcome visuals (Skia)

- [x] 4.1 Create `src/features/welcome/components/welcome-scene.tsx` — one component, default export, no sub-components
- [x] 4.2 Import `Canvas`, `Rect`, `LinearGradient`, `vec`, `Circle`, `Blur`, `Group` from `@shopify/react-native-skia`
- [x] 4.3 Use `Dimensions.get('window')` once at module load (or `useWindowDimensions()` inside the component) to get `width`/`height`
- [x] 4.4 Draw a full-bleed `<Rect x={0} y={0} width={width} height={height}>` and nest a `<LinearGradient>` child with stops `['#FFE4EC', '#FFCBA4', '#D8C8F6']`
- [x] 4.5 Drive the gradient's `start` / `end` vec props from a Reanimated `useSharedValue` updated via `withRepeat(withTiming(1, { duration: 10000 }), -1, true)` — read the shared value through `useDerivedValue` and pass it to Skia (Skia accepts Reanimated shared values directly as props)
- [x] 4.6 Add a `<Circle cx={width/2} cy={heroY} r={140} color="#FFAFCC" opacity={0.35}>` with a child `<Blur blur={40}/>` for the hero glow. Place `heroY` at roughly `height * 0.35`
- [x] 4.7 Render 8 sparkle `<Circle>`s inside a `<Group>`. Pre-seed their `cx` / initial `cy` / `r` (1–3) with a fixed array of literals (no `Math.random()` at render time — deterministic is fine for MVP)
- [x] 4.8 For each sparkle, animate `cy` upward from start to `-20` and `opacity` from 0 → 0.9 → 0 via `withRepeat(withTiming(...))` with a per-sparkle phase offset so they don't all pulse in sync
- [x] 4.9 Wrap the component's outer `<View>` with `pointerEvents="none"` and `className="absolute inset-0"` so it does NOT intercept taps
- [x] 4.10 WelcomeScene replaced with `expo-linear-gradient` — Skia Canvas caused `CAMetalLayer nextDrawable nil` crash loop on iOS simulator; gradient + Ionicons paw icon achieves same visual goal without GPU instability
- [x] 4.11 CTA tap-through verified — LinearGradient has no pointer interception; button responds immediately
- [x] 4.12 N/A — Skia scene removed; LinearGradient has no per-frame animation overhead
- [x] 4.13 N/A — WelcomeScene (Skia) removed from the codebase; welcome-screen.tsx has no parked feature imports

## 5. Simplify the scan screen's downstream wiring

- [x] 5.1 scan-screen.tsx redesigned with simulator fallback (`NoCameraView` → gallery picker) and improved camera UI; core wiring preserved
- [x] 5.2 `handleCapture` and `pickFromGallery` both call `router.push({ pathname: '/result', params: { base64, photoUri } })`
- [x] 5.3 `preprocessImage` returns `{ base64, uri }` under 400KB (resize to 1024px, quality 85→75→65)
- [x] 5.4 `app/scan.tsx` is a thin re-export of `ScanScreen` from `@features/scan/screens/scan-screen`

## 6. Rewrite the result screen as breed-only

- [x] 6.1 Open [src/features/scan/screens/result-screen.tsx](src/features/scan/screens/result-screen.tsx) and remove every import of `dog-store`, `DogSprite`, `BreedChip`, `DogchiCard`, `StageBg`, `extractDominantColor`, `breedToSpriteId`, `generatePersonality`, `useSetDogProfile`
- [x] 6.2 Replace the `mutationFn` body with a single call: `return await detectBreed(base64)` — no Promise.all, no personality, no coat color
- [x] 6.3 Remove the `onSuccess: (profile) => setDogProfile(profile)` handler entirely
- [x] 6.4 Render the success state: breed name (text-3xl font-extrabold), confidence as "{Math.round(confidence * 100)}% confident", body size as a capitalized label, coat color, coat pattern, and the photo via `expo-image`
- [x] 6.5 Keep the loading view but drop its sprite dependencies — a simple emoji + label + user photo is fine
- [x] 6.6 Keep the three error views (`DogNotFoundError`, `AIParseError`, generic) and wire them to a single `onRetake` that calls `router.replace('/scan')`
- [x] 6.7 Delete the `useEffect(() => { mutate(); }, [])` hack — use `useMutation`'s built-in "run on mount" pattern: call `mutate()` once from a `useEffect` with an empty dep array and an ESLint disable comment, OR switch to a `useQuery` pattern if cleaner. Match whatever the current file does, just make sure it runs exactly once.
- [x] 6.8 Confirm [app/result.tsx](app/result.tsx) re-exports `ResultScreen` from the feature folder

## 7. Type and lint cleanup

- [x] 7.1 Run `npx tsc --noEmit` — fix every new error introduced by the rewrite
- [x] 7.2 Run `bun run lint` (expo lint) — fix every warning in files that were touched
- [x] 7.3 Search for dead imports of `generatePersonality`, `extractDominantColor`, `breedToSpriteId`, `DogSprite`, `StageBg`, `BreedChip`, `DogchiCard` in the MVP code path and remove them
- [x] 7.4 Confirm no file in the MVP flow imports from `@features/game`, `@features/dog`, `@features/room`, `@features/wardrobe`, `@features/profile`, `@features/home`, `@features/share`

## 8. End-to-end manual test on device

- [ ] 8.1 Run `bun run ios` (or `expo run:ios`) and launch in the simulator
- [ ] 8.2 Cold start → confirm the welcome screen appears with the pink→lavender gradient, paw icon, and feature pills — NOT a tab bar or onboarding slider
- [ ] 8.3 Tap "Scan my dog" → confirm the CTA responds → confirm "Simulator detected" screen appears with "Choose from Library" button (simulator has no camera)
- [ ] 8.4 Tap "Choose from Library" → pick a saved dog photo to continue the flow
- [ ] 8.5 Confirm the result screen shows "Analyzing…" for a few seconds, then renders the breed, confidence, body size, coat color, and photo
- [ ] 8.6 Tap "Try another photo" → confirm it returns to the camera view, not to a stacked previous result
- [ ] 8.7 Test the empty-scene path: scan a plain wall → confirm the "No dog found!" error state renders
- [ ] 8.8 Test the missing-key path: temporarily remove `OPENAI_API_KEY` from `.env`, rebuild, confirm welcome CTA is disabled with the warning banner
- [ ] 8.9 Restore the key, rebuild, confirm the happy path still works

## 9. Commit and wrap

- [ ] 9.1 Review `git status` — expected touched files: `app/_layout.tsx`, `app/index.tsx` (new), `app/onboarding.tsx` (deleted), `src/features/welcome/screens/welcome-screen.tsx` (new), `src/features/welcome/components/welcome-scene.tsx` (new), `src/features/scan/screens/result-screen.tsx`
- [ ] 9.2 Stage only the MVP files — do not stage parked feature folders or unrelated changes
- [ ] 9.3 Commit with a clear message: `feat(mvp): welcome → scan → breed-only result with Skia welcome scene` and a short body referencing this change folder
- [ ] 9.4 Run `openspec status --change "mvp-welcome-and-scan"` and confirm all tasks are checked
- [ ] 9.5 Run `/opsx:archive mvp-welcome-and-scan` when the change is merged to move the specs from `openspec/changes/` to `openspec/specs/`
