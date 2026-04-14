## Context

The previous session built a Tamagotchi-scale app (sprite rendering, personality engine, decay loop, mini-games, wardrobe, room, share card). That scope is unvalidated — we do not yet know whether users will even point the camera at their dog. This change rips the user-facing flow back to three screens (`welcome` → `scan` → `result`) and uses **only** the breed-detection half of the OpenAI pipeline. Everything else is parked in the repo but unreachable from the router.

**Current state of the repo (relevant parts):**
- Expo SDK 55, React Native 0.83.4, Expo Router v7, iOS-only.
- Uniwind (Tailwind v4 for RN) for styling; HeroUI Native for compound components.
- TanStack Query v5 + MMKV already wired in `src/api/index.tsx`.
- `react-native-vision-camera` + `expo-image-picker` + `expo-image-manipulator` already installed and working.
- `src/api/core/dog/queries.ts` already has a working `detectBreed()` function that calls GPT-4o with an image URL and returns `BreedDetectionResult`.
- `.env` loaded via `app.config.ts` → `extra.openaiApiKey`, read in `getApiKey()` with fall-through to `expo-secure-store`.
- `src/features/scan/screens/scan-screen.tsx` is already a working camera/gallery screen — it does not need rewriting, only its downstream result handler changes.

**Stakeholder:** the solo developer (the user). Ship target: smallest possible MVP this session, tested on-device via iOS simulator or `expo run ios`.

## Goals / Non-Goals

**Goals:**
- 3 screens total in the MVP flow: `welcome`, `scan`, `result`.
- Welcome screen that boots straight to a single "Scan my dog" CTA — no multi-step onboarding, no `useCompleteOnboarding()` gate.
- Preserve the existing camera/gallery + preprocessing code path — it already works.
- Breed detection via **GPT-4o** `chat/completions` with `image_url` (`detail: low` to keep token cost under 1k per call).
- Result screen shows breed name, confidence, body size, coat color text, and the photo. Retake returns to scan.
- Graceful error states: no dog found, network failure, missing API key, parse error.
- Zero new dependencies. Zero native module changes (no re-prebuild required).

**Non-Goals:**
- 2D dog **character** rendering (the old `DogSprite` Skia component, Rive animation). Note: Skia is still used on the welcome screen for ambient visuals (gradient, glow, sparkles) — see D7.
- 3D model rendering on any screen via `react-native-filament` or similar. See D7.
- Personality generation / catchphrases / stats.
- Game loop, decay, levels, XP, stats bars.
- Wardrobe, room, share card, profile tab, tabs at all.
- Saving the dog to persistent state. The MVP scan is ephemeral — nothing is written to the dog store. (If the user wants to keep the result across cold starts, that is a follow-up change.)
- Any backend service. All OpenAI calls are made directly from the device.

## Decisions

### D1. Router shape: flat stack, no tabs, no gate

**Decision:** `app/_layout.tsx` becomes a plain Stack with three screens: `index` (welcome), `scan` (fullScreenModal), `result`. No `AppDecayListener`, no `Redirect` based on `gameState.hasCompletedOnboarding`, no `(tabs)` registration.

**Alternatives considered:**
- Keep the onboarding gate and just point it at a different destination. Rejected — the gate reads from `game-store`, which pulls in game types, MMKV cold-start, and the decay engine. That is exactly the surface area we are trying to cut.
- Delete `app/(tabs)/` entirely. Rejected — parked code does no harm as long as it is not registered in the stack. Deleting it would force us to also delete all the dog/game/room/wardrobe features, which the user has not asked for.

**Consequence:** MVP cold start → `app/index.tsx` (welcome) immediately. `app/(tabs)/`, `app/onboarding.tsx`, `app/share.tsx` remain on disk but are unregistered.

### D2. Welcome screen is a single file, not a feature folder

**Decision:** `src/features/welcome/screens/welcome-screen.tsx`, re-exported by `app/index.tsx`. One file. No hooks folder, no components folder. Just a hero + CTA.

**Alternatives considered:**
- Put the welcome directly in `app/index.tsx`. Rejected — violates the `app/ = routes only` rule in CLAUDE.md.
- Reuse the existing 3-step `onboarding.tsx` and delete the middle two steps. Rejected — the existing file has Reanimated slider + camera permission request baked in. It is cheaper to delete it than to carve it down.

### D3. Result screen is breed-only — no AI fanout, no store write

**Decision:** The new `result-screen.tsx` pipeline does exactly one thing: `detectBreed(base64) → BreedDetectionResult → render`. It does not call `generatePersonality()`, does not call `extractDominantColor()`, does not call `setDogProfile()`, does not render `DogSprite`. The old file is rewritten (not branched) to enforce the discipline.

**Alternatives considered:**
- Keep the full pipeline and hide the personality/sprite UI behind a feature flag. Rejected — the flag itself is more code than the feature it gates, and the full pipeline makes two OpenAI calls where one would do.
- Cache the last breed result in MMKV. Rejected for MVP — not needed for the core hypothesis (does the scan moment delight).

**Consequence:** `generatePersonality()`, `extractDominantColor()`, `useSetDogProfile()`, and `DogSprite` become dead code from the MVP flow's perspective. They are kept in the repo but are only reachable by direct import from non-MVP code. A follow-up change can revive them.

### D4. API key sourcing: `.env` → `extra.openaiApiKey` → `expo-secure-store` fallback

**Decision:** Leave `getApiKey()` in `src/api/core/dog/queries.ts` unchanged. The key is injected at build time via `app.config.ts`:

```ts
extra: {
  openaiApiKey: process.env.OPENAI_API_KEY,
}
```

The welcome screen performs a cheap "is the key present?" check on mount. If missing, it shows an inline "API key not configured" banner under the CTA and disables the button.

**Alternatives considered:**
- Ship the key in source. Rejected — `.env` is already in `.gitignore`, this is the whole reason `app.config.ts` was wired up last turn.
- Prompt the user to paste the key into `expo-secure-store` on first run. Rejected for MVP — developer-only build; a dev key via `.env` is simpler.

**Risk:** the key ships inside the app bundle. Acceptable for a developer-only iOS build with no distribution. **Do not build for TestFlight without moving to a proxy.** Flagged in Risks below.

### D5. State management: `useMutation`, not global state

**Decision:** The breed detection call is wrapped in `useMutation({ mutationFn: () => detectBreed(base64) })` inside `result-screen.tsx`. No custom hook, no query options file, no invalidation. The result is held in `data` for the lifetime of the screen and discarded on unmount.

**Alternatives considered:**
- `useQuery` with a stable key like `['breed', base64Hash]`. Rejected — queries are for data that outlives the screen. The breed result is ephemeral in the MVP.
- Move the call into a feature hook `use-breed-detection.ts`. Rejected — one caller, one call site, no logic to share. Premature abstraction per CLAUDE.md.

### D6. Preprocessing stays as-is

**Decision:** Keep `src/features/scan/utils/image-preprocessor.ts` exactly as written. It already quality-steps (85 → 75 → 65) until base64 < 400KB, which is what GPT-4o with `detail: low` needs to stay under 1k input tokens.

### D7. Welcome visuals via Skia, not Filament

**Decision:** The welcome screen gets an ambient visual layer drawn with `@shopify/react-native-skia` (already installed), composed of three elements, all non-interactive and non-blocking:

1. **Animated pastel gradient background** — a full-bleed `Canvas` with a `LinearGradient` (or `RadialGradient`) whose stops cycle slowly through the kawaii palette (`#FFE4EC` → `#FFCBA4` → `#D8C8F6`). Animation driven by a Reanimated shared value via `useClock` / `useDerivedValue`, ~8–12s loop.
2. **Radial glow behind the hero** — a circular `Blur` + radial `Shader` centred behind the hero emoji, using the primary pink `#FFAFCC` with low alpha. Static or gently pulsing via `withRepeat(withTiming(...))`.
3. **Optional particle sparkles** — 6–10 small circles with randomised start positions, drifting upward via `withRepeat(withTiming({ translateY: -H, opacity: fadeOut }))`. Low count keeps us off the JS thread.

All three live in one component `src/features/welcome/components/welcome-scene.tsx`, absolutely positioned behind the welcome screen's text/CTA. The welcome screen itself stays a plain `View` with Uniwind classes on top.

**Alternatives considered:**
- **`react-native-filament`** (3D): rejected. Requires `expo prebuild --clean`, adds ~5MB to the bundle, needs a rigged `.glb` dog model we do not have, and the welcome screen does not need 3D — it needs atmosphere. Parked as a future change for the result screen once we own a dog asset.
- **Lottie** (`lottie-react-native`): rejected. Would need a dependency install, a prebuild, and an `.lottie`/`.json` animation file we do not have. Skia is already here and can do the same ambient effect with ~150 lines of procedural code and no asset pipeline.
- **Plain CSS gradient background** via Uniwind / `expo-linear-gradient`: rejected. Gradient-only is fine but flat; the moving highlight and glow are what make it feel alive, and that requires a drawing surface.
- **`expo-linear-gradient` + Reanimated `useAnimatedStyle`**: rejected. Can animate stop positions but cannot cheaply do radial glow + particles in the same canvas, so we'd be mixing two rendering systems.

**Performance budget:** The welcome scene MUST stay at 60fps on an iPhone 12 or newer. Enforced by keeping the particle count ≤ 10, running all animations on the UI thread via Reanimated shared values passed directly into Skia props, and avoiding per-frame JS closures. If profiling shows frame drops we cut particles first, glow second, gradient last.

**Consequence:** `@shopify/react-native-skia` is now also a welcome-path dependency (it was already on the scan/result path before being cut — now we bring it back purely for ambience, not for sprite rendering). No new install, no prebuild. Filament stays out of the repo entirely until we have a reason to add it.

## Risks / Trade-offs

- **[Risk: API key in app bundle]** → Mitigation: explicitly dev-only build; do not publish. Flagged in the welcome screen with a subtle "DEV" label if `APP_ENV !== 'PROD'`. When we want to ship, swap `src/api/core/dog/queries.ts` to point at a proxy endpoint and regenerate the key.
- **[Risk: Network failure mid-scan]** → Mitigation: `detectBreed()` already retries twice with exponential backoff. The result screen surfaces the final error via `error instanceof Error ? error.message : 'Unknown error'`.
- **[Risk: GPT-4o returns invalid JSON]** → Mitigation: `parseJSON()` in `queries.ts` strips markdown fences and throws `AIParseError`, which the result screen renders as a friendly "try again" message.
- **[Risk: User takes a selfie / empty scene]** → Mitigation: the prompt asks for `has_dog`, and `detectBreed()` throws `DogNotFoundError` if false. The result screen shows a dog-specific error state with a "Retake" CTA.
- **[Risk: `.env` not loaded]** → Mitigation: welcome screen checks `Constants.expoConfig?.extra?.openaiApiKey` on mount and disables the CTA if absent.
- **[Trade-off: No persistence]** → Consequence: closing the app loses the result. Accepted for MVP. Scan is fast (~5s) so re-scanning is not a hardship.
- **[Trade-off: Parked code remains in the repo]** → Consequence: TypeScript still compiles everything under `src/features/**`, which may surface drift. Accepted because the parked code is not in the user-facing flow and `expo lint` will still catch breakage.

## Migration Plan

This is a local developer-only rewrite of the user-facing flow. There is no production deployment to migrate. Steps:

1. Pull the branch, run `bun install` (no new deps), no `expo prebuild` needed.
2. Ensure `.env` has `OPENAI_API_KEY=sk-...`.
3. Run `bun run ios`. The app should open to the welcome screen, not a tab bar.
4. Tap "Scan my dog" → camera → capture → result → retake. End-to-end test in ~30 seconds.

**Rollback:** `git revert` the change. The parked features are untouched, so the previous tab-bar flow comes right back.

## Open Questions

- Should the welcome screen show a sample dog photo / illustration, or just emoji + text? Leaning emoji for MVP speed, can replace with an asset later.
- Should the result screen have a "Save" button that writes to MMKV for later recall? Not in MVP scope; flagged as a natural next change.
- After retake, should we go back to scan or forward to a new scan modal? Going back is simpler and matches user expectation — `router.replace('/scan')`.
