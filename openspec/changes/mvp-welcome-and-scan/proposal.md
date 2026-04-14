## Why

The previous iteration built 14 features in parallel (dog sprite, Rive animation, wardrobe, room, mini-games, share cards, decay engine) and the app is now too far ahead of validated product value. We need to shrink the MVP to the one hypothesis we actually want to test: **can a user point the camera at their dog, get a breed back, and feel delighted enough to want more?** Everything that is not part of that single moment should be dormant or removed from the user-facing flow. If the scan moment lands, we expand. If it doesn't, nothing else matters.

## What Changes

- Replace the 3-step onboarding slider with a single **Welcome screen**: hero, one-line value prop, and a single "Scan my dog" CTA.
- Add a **Skia visual layer** to the welcome screen — an animated pastel gradient background, a soft radial glow behind the hero emoji, and optional drifting particle sparkles. Skia is already installed; no new dependency and no prebuild required.
- Keep the existing `scan-screen.tsx` camera + gallery picker, but simplify it so it goes straight to a breed-only result (no personality generation, no coat-color extraction, no sprite rendering).
- Replace the `result-screen.tsx` pipeline with a **breed-only** result: breed name, confidence, body size, coat color (as text), and a simple photo card.
- **BREAKING**: the scan flow no longer writes a `DogProfile` to the dog store, no longer calls `generatePersonality()`, and no longer renders `DogSprite` or `DogAnimation`. Those modules stay in the repo but are unused by the MVP flow.
- **BREAKING**: the root `_layout.tsx` gate no longer routes through `/onboarding` based on `hasCompletedOnboarding` from the game store. The MVP has no tabs, no game loop, and no decay listener. The root stack becomes: `welcome` (index) → `scan` → `result`.
- Remove MVP dependency on `game-store`, `dog-store`, `room-store`, `wardrobe`, Skia sprite, Rive animation, decay engine. They are not deleted — they are parked for post-MVP.
- Add a thin OpenAI key check on welcome screen so we fail fast with a friendly message if `.env` is missing `OPENAI_API_KEY`.

## Capabilities

### New Capabilities

- `welcome-screen`: Single-screen entry point that introduces the app and launches the scan flow, including a Skia-driven animated visual layer (gradient, glow, sparkles).
- `dog-photo-capture`: Capture a dog photo via camera OR pick from the photo library, with permissions handling and image preprocessing before upload.
- `breed-detection`: Send the preprocessed photo to GPT-4o and return a structured breed result, with error handling for "no dog found" and parse failures.
- `breed-result-screen`: Display the detected breed, confidence, body size, coat color, and the user's photo, with a retake CTA.

### Modified Capabilities

<!-- None — this is a fresh spec-driven rewrite of the user-facing flow. Existing specs folder is empty. -->

## Impact

**Affected code (rewritten / simplified):**
- [app/_layout.tsx](app/_layout.tsx) — strip decay listener, game gate, onboarding redirect; register `index`, `scan`, `result` screens only.
- [app/(tabs)/](app/(tabs)/) — remove from MVP router (parked, not deleted).
- [app/onboarding.tsx](app/onboarding.tsx) — deleted or replaced by `app/index.tsx` welcome.
- [app/index.tsx](app/index.tsx) — **new**, thin wrapper around `WelcomeScreen`.
- [src/features/welcome/screens/welcome-screen.tsx](src/features/welcome/screens/welcome-screen.tsx) — **new**.
- [src/features/scan/screens/scan-screen.tsx](src/features/scan/screens/scan-screen.tsx) — kept, but its `handleCapture`/`handleGallery` paths still route to `/result` with `base64` + `photoUri` params.
- [src/features/scan/screens/result-screen.tsx](src/features/scan/screens/result-screen.tsx) — simplified to breed-only; no personality call, no sprite, no dog store writes.
- [src/api/core/dog/queries.ts](src/api/core/dog/queries.ts) — `detectBreed()` kept as-is; `generatePersonality()` is no longer called from the MVP flow.

**APIs:**
- OpenAI `gpt-4o` `chat/completions` with image_url (single call per scan).
- API key loaded from `expo-constants` `extra.openaiApiKey` via `app.config.ts` → `.env`. No remote backend in the MVP.

**Dependencies (no new installs required):**
- `react-native-vision-camera` — already installed.
- `expo-image-picker` — already installed.
- `expo-image-manipulator` — already installed (for preprocessing).
- `expo-constants`, `expo-secure-store` — already installed.
- `@tanstack/react-query` — used for the `useMutation` that wraps the breed call.
- `@shopify/react-native-skia` — already installed; used by the welcome screen's visual layer (animated gradient, radial glow, particle sparkles).

**Explicitly deferred:**
- `react-native-filament` — considered for a 3D dog on the welcome screen. Rejected for MVP: requires prebuild, adds ~5MB, and needs a rigged `.glb` dog model we do not have yet. Revisit as its own change once we have a dog asset and want to put it on the result screen.

**Parked (not in MVP flow but kept in repo):**
- `src/features/dog/`, `src/features/game/`, `src/features/room/`, `src/features/wardrobe/`, `src/features/profile/`, `src/features/home/`, `src/features/share/`
- `src/api/core/dog/queries.ts#generatePersonality`
- Skia + Rive + LegendList + gesture-handler usage on the user-facing path
