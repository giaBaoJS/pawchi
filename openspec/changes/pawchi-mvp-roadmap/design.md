## Context

The `mvp-welcome-and-scan` change shipped a one-shot welcome → scan → breed result demo. It has:

- Expo SDK 55, Expo Router v7, React 19.2, React Native 0.83.2
- `vision-camera` for capture (with simulator gallery fallback)
- TanStack Query with MMKV persistence layer (via `react-query-kit` in `src/api/`)
- Uniwind (Tailwind v4 for RN) for styling — though welcome/scan currently use inline styles due to the earlier `--spacing` CSS pipeline issue
- `heroui-native` compound components (Button, Dialog, BottomSheet)
- Reanimated v4 for animations (Skia is present but caused iOS simulator crashes and is not used on the welcome flow)
- Parked `app/(tabs)/` and `app/share.tsx` (unregistered, kept on disk)
- Breed detection via OpenAI GPT-4o vision API (`src/api/core/dog/queries.ts`)

There is no local persistence of anything the user creates, no recurring loop, no gamification. The solo developer wants the fastest coherent retention loop with minimum new services.

## Goals / Non-Goals

**Goals:**
- Ship a 7-screen MVP with one retention loop: open → see dog → feed or walk → earn bones/EXP → come back tomorrow for streak + missions
- 100% local-first: no backend, no auth, no cloud sync
- Work fully on iOS simulator so the solo dev can iterate without a physical device
- Reuse everything already installed — add at most 2 small dependencies
- Keep feature folders isolated per the project's import rules (`src/features/X` never imports from `src/features/Y`); cross-feature wiring lives in `app/home.tsx`
- Leave parked feature folders (`@features/dog`, `@features/game`, etc.) untouched — either revive or delete them in a future change, not this one

**Non-Goals:**
- Generative-AI avatars (future): MVP uses a curated sprite pack
- HealthKit step counting (future): MVP uses a stopwatch + optional `expo-location`
- Mini-games, multiplayer, social sharing, multi-dog households
- Backend sync or account system
- Android support (project is iOS-only per CLAUDE.md)
- Refactoring the parked `@features/dog`, `@features/game`, `@features/wardrobe` folders — this change writes new feature folders alongside them

## Decisions

### D1 — State: Zustand + MMKV, NOT TanStack Query

**Decision:** Persistent local state (dog profile, pet stats, gamification, missions) lives in Zustand stores backed by MMKV. TanStack Query stays for remote calls only (currently just the OpenAI vision call).

**Why:** The state is local, synchronous, reactive, and has no server to reconcile against. Forcing it through TanStack Query would require fake `queryFn`s and `setQueryData` everywhere — the project's own CLAUDE.md explicitly warns against this pattern. Zustand is 1.3kB, has built-in `persist` middleware that accepts MMKV as a storage adapter, and renders synchronously on cold start so the router can branch on "has profile?" without a loading screen.

**Alternatives considered:**
- TanStack Query with `setQueryData` — rejected; fights the library and hides bugs (CLAUDE.md forbids)
- `react-native-mmkv` raw with `useSyncExternalStore` — rejected; too much manual plumbing for multiple stores
- SQLite via `expo-sqlite` — rejected; overkill for ~5 kB of state, no querying needs

### D2 — One Zustand store per capability, composed at the app level

**Decision:** `dog-profile`, `pet-state`, `gamification`, `daily-missions`, `feeding-action`, and `walk-tracking` each own one Zustand store (e.g., `useDogProfileStore`, `usePetStateStore`). The home hub reads from all of them directly.

**Why:** Matches the project's feature-folder rule that "features never import from other features." Stores expose pure functions (`creditBones`, `applyPetStateEvent`) and the hub composes them. Cross-cutting events (a walk paying out bones + EXP) happen in the capability that initiates them by calling into the target store's exported function — NOT by the stores subscribing to each other.

**Trade-off:** A little coupling exists because `walk-tracking` imports `useGamificationStore.getState().creditBones` and `useDailyMissionsStore.getState().recordEvent`. Accept it — it's a one-way dependency graph (`walk → gamification, missions`; `feeding → pet-state, gamification, missions`) with no cycles. Document it in each store file's header comment.

### D3 — Decay is computed on read, not on a timer

**Decision:** `pet-state` stores `{ hunger, happiness, energy, lastUpdatedAt }`. Every read runs `applyDecay(state, now)` which computes elapsed time and clamps.

**Why:** No background timers needed. Works correctly after cold start, app kill, and long backgrounding. Matches how games handle offline progression.

**Rule:** Writes (`applyPetStateEvent`) always do `state = applyDecay(state, now)` first, then apply the event delta. This guarantees time pressure is never "banked" by spamming events.

### D4 — Curated sprite library for avatars (not generative AI)

**Decision:** Ship a hand-curated set of ~15 kawaii dog sprites bundled as PNGs in `assets/avatars/`. `resolveAvatar(breedResult)` is a pure function: breed name → `avatarId` → `require('./assets/avatars/<id>.png')`. Unknown breeds fall back to `generic-{small,medium,large}.png`.

**Why:**
- Zero runtime cost, zero network, works offline, deterministic
- No moderation problem (generative output can produce weird/offensive results)
- No per-user API cost — OpenAI image generation is ~$0.04/image
- Artist-controllable and on-brand
- Fits in the MVP timeline; generative can be layered in later without changing the store shape (just swap `resolveAvatar`)

**Alternatives considered:**
- **OpenAI DALL-E 3 / gpt-image-1**: Pros — unique per dog, "wow" factor. Cons — $0.04/image, 10-30s latency, content moderation, requires caching pipeline, inconsistent style. Rejected for MVP, earmarked for future.
- **Stable Diffusion on-device via CoreML / `react-native-stable-diffusion`**: Pros — free after initial model download. Cons — 500MB+ model, slow on older iPhones, still inconsistent style. Rejected.
- **Rule-based SVG composition** (body shape + ear shape + coat color layers): Pros — variety, on-brand. Cons — requires an illustrator to build a layered component system, weeks of design work. Rejected for MVP; could replace the curated pack later.

**Sprite catalog (MVP):** `shiba-inu`, `golden-retriever`, `labrador`, `poodle`, `french-bulldog`, `beagle`, `dachshund`, `german-shepherd`, `corgi`, `husky`, `chihuahua`, `pug`, `generic-small`, `generic-medium`, `generic-large`.

### D5 — Walk tracking: foreground-only stopwatch + optional GPS

**Decision:** The walk screen runs a Reanimated-driven stopwatch based on `Date.now()` diff from `startedAt`. When foreground location permission is granted, it also samples `Location.watchPositionAsync` and sums `Location.distanceBetween` segments.

**Why:**
- Background walk tracking on iOS requires `UIBackgroundModes: location` entitlement, a "blue bar" indicator, and specific privacy strings — complexity the MVP does not need
- The user vision is "tap start / tap end" — implicitly a foreground action
- Auto-ending on background preserves the reward for the duration the user actually tracked

**Trade-off:** Users who background the app mid-walk don't get credit for the extra time. Acceptable for MVP; add background mode in a future change only if retention data shows it's needed.

**Non-goal:** Speed, calories, route map. Just duration + distance.

### D6 — Daily reset is lazy, keyed by local date string

**Decision:** `daily-missions` stores `{ dateKey: 'YYYY-MM-DD', missions: [...] }`. Every read checks `dateKey === format(now, 'yyyy-MM-dd')`; if not, the store re-initializes from the mission catalog and resets progress.

**Why:** No midnight timer, no `setInterval`, survives device sleep, handles timezone shifts and DST. `date-fns` already in the project or will be added.

### D7 — `gamification` is the single source of truth for progression numbers

**Decision:** Bones, EXP, level, and streak live in `useGamificationStore`. Walk and feeding actions call `creditBones` / `debitBones` / `addExp` on it. The hub header reads these directly via a selector.

**Why:** Prevents the classic "three different places show three different bone counts" bug. Matches how HP/currency systems work in any mature game.

### D8 — Router: "has profile?" gate in `app/_layout.tsx`

**Decision:** The root layout reads `useDogProfileStore.getState().profile` synchronously at render, and conditionally sets the initial route: `"home"` if a profile exists, otherwise `"index"` (welcome).

**Why:** Zustand-with-MMKV makes this synchronous — no loading state needed. The Stack's `initialRouteName` gets set once. On first profile save, the dog-profile flow calls `router.replace('/home')` to move past the scan screens.

**Alternative considered:** A gate component that renders a spinner until MMKV rehydrates. Rejected — MMKV is already synchronous, adding a spinner would be worse UX.

### D9 — Home hub lives at `app/home.tsx`, NOT in `(tabs)`

**Decision:** MVP ships one screen — `app/home.tsx` — composing the feature components. The parked `app/(tabs)/` folder stays unregistered.

**Why:** The product vision mentions one main hub. Tabs imply multiple top-level screens (profile, wardrobe, settings) that the MVP does not yet need. When those are added, the hub becomes a tab in `(tabs)/index.tsx` with zero rewrite — just a file move.

**Trade-off:** We don't get a free tab bar for navigation affordance. Accept: MVP actions (Walk, Feed) are CTAs on the hub itself, and the only other screens are full-screen modals over the hub (walk timer, feed animation).

### D10 — Styling: Uniwind className where it works, inline styles where it doesn't

**Decision:** Write all new components with Uniwind `className`. If the CSS pipeline error from the previous session returns, fall back to inline styles (as welcome-screen.tsx currently does) on a per-file basis rather than blocking the feature.

**Why:** The project mandates className, but we can't let a build issue block product work. A task in tasks.md ("verify Uniwind pipeline") is where we decide which mode to commit to.

## Risks / Trade-offs

- **[Curated sprites feel generic]** → Mitigation: ship with 15 breeds that cover ~70% of scans and a warm "generic" fallback. User's real photo stays visible in the profile header so the app still feels "theirs."
- **[MMKV rehydration race on first launch]** → Mitigation: Zustand `persist` middleware uses synchronous MMKV storage adapter; we render only after the first tick. Add a smoke test: cold-start the app with a saved profile and assert the hub appears without a spinner.
- **[Expo-location permission denial breaks walk flow]** → Mitigation: walk falls back gracefully to duration-only mode; no errors, no blocking prompts.
- **[Decay feels punishing if user skips a day]** → Mitigation: floor the decay at 0 and cap daily drop so stats never go below 20 on a single missed day. Balance these constants (tasks include a "playtest + tune" task).
- **[Cross-feature store imports violate the import rule]** → Mitigation: document in each store that it can be imported by other features' actions (specifically `creditBones`, `applyPetStateEvent`, `recordEvent`). This is the pragmatic exception; keep it explicit.
- **[Uniwind CSS pipeline may still be unstable]** → Mitigation: every new component uses className first; if build breaks, fall back to inline and log the file in a follow-up "migrate to Uniwind" task.
- **[Bones/EXP economy is unbalanced]** → Mitigation: numbers are constants in one file (`src/features/gamification/constants.ts`) so a tuning pass is a single file change.

## Migration Plan

1. Wait until `mvp-welcome-and-scan` is merged (or merge this on top of it — the breed-result delta assumes `breed-result-screen/spec.md` is archived to `openspec/specs/breed-result-screen/spec.md` before apply).
2. Land this change feature-by-feature in the order listed in tasks.md: `dog-profile` → `dog-avatar` → `pet-state` → `gamification` → `feeding-action` → `walk-tracking` → `daily-missions` → `home-hub` → router gate.
3. No backward compatibility needed: fresh installs see the welcome flow; there are no existing users to migrate.
4. Rollback: revert the router gate commit — the welcome → scan → result flow still works standalone.

## Open Questions

- **Q1:** Should the "Name your dog" screen be its own route or a BottomSheet inside the result screen? Either works; default to a dedicated route (`app/name-dog.tsx`) unless the BottomSheet animation feels smoother in dogfooding.
- **Q2:** Where does the user retake a photo for an existing profile? MVP answer: they can't — deleting and rescanning is the only path, behind a Settings link we haven't built yet. Defer to a future change.
- **Q3:** Do we need a "sleep" action to regenerate energy, or does energy regenerate automatically over time? MVP answer: automatic regen when `!isAwake` — but there's no UI to toggle awake. Simplest v0: skip `energy` regen entirely, let it drift down; a future change adds sleep/rest.
- **Q4:** Does `streakDays` affect anything other than a display number? MVP answer: display only. Future: streak milestones give bone bonuses.
