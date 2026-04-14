## Why

Pawchi's previous change (`mvp-welcome-and-scan`) shipped a one-shot "photo → breed" demo, but there is no retained dog, no reason to come back tomorrow, and no loop that rewards real-life dog care. To hit the product vision — a kawaii virtual pet that bonds users to their real dog through walks and feeding — we need a minimum coherent loop: create a persistent dog profile, walk it, feed it, watch its state change, and earn rewards that level it up. Without this loop, retention is zero.

This change is the MVP roadmap that turns the current breed-scan demo into a daily-driver pet app. It is scoped so a solo developer can ship it.

## What Changes

- Turn breed scan result into a **saved dog profile** (name, breed, avatar, stats) persisted locally — today the result screen is throwaway.
- Generate a **stylized 2D avatar** for the dog from the breed result. MVP uses a curated sprite library keyed by breed + size; generative AI is future work.
- Introduce a **pet state model** (`hunger`, `happiness`, `energy`) that decays over real time and is the heartbeat of the home screen.
- Add a **walk-tracking** flow with Start/End, duration, optional distance, and reward payout. MVP uses timer + optional GPS; HealthKit integration is future.
- Add a **feeding** action with a simple cooldown that boosts `hunger`/`happiness` and consumes bones.
- Add a **daily-missions** system (walk N minutes, feed M times) with progress tracking and rewards.
- Add a **gamification** layer: level, EXP curve, bones (currency), daily streak counter.
- Replace the parked tabs with a **home hub** showing the animated dog, three stat bars, primary Walk/Feed CTAs, and active missions.
- **BREAKING**: the throwaway result screen no longer ends the flow — first successful scan routes into "Name your dog" → home hub. Subsequent app opens skip welcome if a profile exists.
- Parked `app/(tabs)/` and `app/share.tsx` are unregistered but NOT deleted; this change does not touch them.

## Capabilities

### New Capabilities

- `dog-profile`: create, persist, and read the user's single active dog profile (name, breed, body size, coat, createdAt, avatarId).
- `dog-avatar`: map a breed-detection result to a curated 2D kawaii sprite (MVP) so the profile renders a cute dog immediately after scan.
- `pet-state`: model hunger/happiness/energy with time-based decay, bounds, and event-driven updates; expose a read/write API that the home screen and actions consume.
- `walk-tracking`: start/end a walk session, measure duration (and distance when available), pay out bones + EXP on completion.
- `feeding-action`: apply a feed action with cooldown + bone cost, updating `hunger` and `happiness` and logging the event for missions.
- `daily-missions`: declare daily mission definitions, compute progress from gameplay events, mark complete and pay out rewards, reset at local midnight.
- `gamification`: level curve from EXP, bones wallet, daily streak tracking; the single source of truth for "progression" numbers shown in the UI.
- `home-hub`: the main screen that composes dog-avatar + pet-state + walk-tracking + feeding + daily-missions + gamification into one scrollable hub.

### Modified Capabilities

- `breed-result-screen`: on successful detection, instead of being a terminal state, hand the result to `dog-profile` creation flow and navigate into the home hub. (This capability currently lives in `openspec/changes/mvp-welcome-and-scan/specs/breed-result-screen/` — the delta applies once that change is archived.)

## Impact

- **Code**: net-new `src/features/dog-profile/`, `src/features/dog-avatar/`, `src/features/pet-state/`, `src/features/walk-tracking/`, `src/features/feeding/`, `src/features/daily-missions/`, `src/features/gamification/`, `src/features/home-hub/`. Re-registers `app/(tabs)/_layout.tsx` (or a single `app/home.tsx`) as the post-onboarding root.
- **Persistence**: introduces local-first storage. Zustand + MMKV (already in the stack via React Query's persist layer) for reactive state; MMKV for raw profile/stats. No backend.
- **Dependencies**: add `expo-location` (walk GPS, optional), `date-fns` (streak math). A curated avatar sprite pack lives in `assets/avatars/`. No new paid services.
- **Router**: `app/_layout.tsx` gains a "has profile?" redirect — welcome is skipped when a profile exists. The parked tabs may be revived as the hub shell.
- **Out of scope (future work)**: generative-AI avatar creation, HealthKit step integration, mini-games, cloud sync, multi-dog households, social/share features.
