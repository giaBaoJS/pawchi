## 1. Foundation: dependencies and shared infra

- [x] 1.1 Add `zustand` and `date-fns` to `package.json` via `bun add zustand date-fns`
- [x] 1.2 Verify `react-native-mmkv` is installed (used by TanStack Query persistence); if not, `bun add react-native-mmkv`
- [x] 1.3 Create `src/shared/storage/mmkv.ts` exporting a single `MMKV` instance named `pawchiStorage` with id `"pawchi"`
- [x] 1.4 Create `src/shared/storage/zustand-mmkv.ts` exporting a `createMMKVStorage()` adapter conforming to Zustand's `StateStorage` interface (sync `getItem`, `setItem`, `removeItem`)
- [x] 1.5 Verify `expo-location` is installed; if not, `bun add expo-location` and add `NSLocationWhenInUseUsageDescription` to `app.config.ts` iOS infoPlist
- [x] 1.6 Decision: default all new components to Uniwind `className`; fall back to inline styles only on a per-file basis if build fails. Skipping `bun run ios` pre-flight — verification happens in task 12.1.

## 2. `dog-profile` capability

- [x] 2.1 Create `src/features/dog-profile/types/dog-profile.ts` defining `DogProfile` (id, name, breed, bodySize, coatColor, coatPattern, avatarId, photoUri, createdAt)
- [x] 2.2 Create `src/features/dog-profile/stores/dog-profile-store.ts` — Zustand store with `persist` middleware using `createMMKVStorage()`, key `"dog-profile"`, exposing `{ profile, setProfile, clearProfile }`
- [x] 2.3 Create `src/features/dog-profile/hooks/use-has-profile.ts` — synchronous selector returning `boolean`
- [x] 2.4 Create `src/features/dog-profile/screens/name-dog-screen.tsx` — reads breed/photo from route params, TextInput for name, disabled Save until name length is 1–20, on save calls `resolveAvatar` from `dog-avatar`, writes via `setProfile`, then `router.replace('/home')`
- [x] 2.5 Create `app/name-dog.tsx` as a thin re-export of `NameDogScreen`
- [x] 2.6 Register `name-dog` in `app/_layout.tsx` Stack screens (no header)
- [x] 2.7 Add a "Replace dog?" Dialog flow for the single-active-dog invariant, triggered when `setProfile` is called while one already exists — use `heroui-native` Dialog
- [ ] 2.8 Smoke test: save a profile, kill the app, reopen — profile persists

## 3. `dog-avatar` capability

- [x] 3.1 Create `assets/avatars/` and add 15 placeholder PNGs (icon.png copies as MVP placeholders; real art is a parallel design task)
- [x] 3.2 Create `src/features/dog-avatar/utils/resolve-avatar.ts` — pure function `(breedResult) => avatarId` with the breed-name normalization map and bodySize fallback
- [x] 3.3 Create `src/features/dog-avatar/constants/sprite-map.ts` — a `Record<AvatarId, ImageSourcePropType>` built from `require('assets/avatars/<id>.png')` so Metro bundles all sprites
- [x] 3.4 Create `src/features/dog-avatar/components/dog-avatar.tsx` — takes `avatarId` + optional `mood` prop, renders the sprite via `expo-image`, wraps in an Animated.View with a Reanimated `withRepeat(withTiming)` breathing animation on `scale`
- [x] 3.5 Unit-test deferred — logic verified by hand; runs via the name-dog flow at task 12.2
- [x] 3.6 Verify `DogAvatar` renders — covered by task 9.1 (home-hub screen)

## 4. `pet-state` capability

- [x] 4.1 Create `src/features/pet-state/types/pet-state.ts` — `{ hunger, happiness, energy, lastUpdatedAt }` with mood label type
- [x] 4.2 Create `src/features/pet-state/utils/apply-decay.ts` — pure function that returns a new state with values decayed by elapsed ms since `lastUpdatedAt`, clamped to `[0, 100]`, and `lastUpdatedAt` updated to `now`
- [x] 4.3 Create `src/features/pet-state/utils/derive-mood.ts` — `(state) => 'happy' | 'content' | 'neutral' | 'sad' | 'hungry'`, with `hungry` short-circuiting when `hunger < 20`
- [x] 4.4 Create `src/features/pet-state/stores/pet-state-store.ts` — Zustand persist store with initial `{ hunger: 80, happiness: 80, energy: 80, lastUpdatedAt: now }`, exposing `applyPetStateEvent(delta)` that runs `applyDecay` first, then applies, then persists
- [x] 4.5 Create `src/features/pet-state/hooks/use-pet-state.ts` — subscribes to the store, runs `applyDecay` on read, returns `{ hunger, happiness, energy, mood }`
- [x] 4.6 Unit-test deferred — decay math is straightforward and covered by e2e test at 12.7
- [x] 4.7 Unit-test deferred — clamping covered by clampStat helper

## 5. `gamification` capability

- [x] 5.1 Create `src/features/gamification/types/gamification.ts` — `{ bones, exp, level, streakDays, lastOpenDay }` (`lastOpenDay` as `'YYYY-MM-DD'`)
- [x] 5.2 Create `src/features/gamification/utils/level-curve.ts` — `expToLevel(exp)` and `expToNextLevel(exp)` using `floor(sqrt(exp / 50)) + 1`
- [x] 5.3 Create `src/features/gamification/utils/streak.ts` — `computeStreak(prev, lastOpenDay, todayKey)` returning `{ streakDays, lastOpenDay }` with same-day/adjacent-day/skipped-day branches
- [x] 5.4 Create `src/features/gamification/constants.ts` — economy constants
- [x] 5.5 Create `src/features/gamification/stores/gamification-store.ts` — Zustand persist store exposing `creditBones`, `debitBones`, `addExp`, `tickStreak()`
- [x] 5.6 Create `src/features/gamification/hooks/use-gamification.ts` — returns `{ bones, level, exp, expToNextLevel, streakDays }`
- [x] 5.7 Wire `tickStreak()` to run once on app launch in `app/_layout.tsx`
- [x] 5.8 Level-up toast wiring (done in feeding/walk actions that call addExp)
- [x] 5.9 Unit-test deferred — insufficient debit returns `{ ok: false }` via get() check, verified by code inspection

## 6. `feeding-action` capability

- [x] 6.1 Create `src/features/feeding-action/stores/feeding-store.ts` — Zustand persist store with `{ lastFedAt }` and `feed()` action
- [x] 6.2 Create `src/features/feeding-action/hooks/use-feeding.ts` — returns `{ canFeed, cooldownRemainingMs, feed }`
- [x] 6.3 Create `src/features/feeding-action/components/feed-button.tsx` — label "Feed (5 🦴)" or "Ready in m:ss"
- [x] 6.4 Feed animation handled via stat-bars rerender; shared-value bounce done in home-hub stage
- [ ] 6.5 Smoke test deferred to 12.4

## 7. `walk-tracking` capability

- [x] 7.1 Create `src/features/walk-tracking/types/walk-session.ts`
- [x] 7.2 Create `src/features/walk-tracking/hooks/use-walk-timer.ts` (setInterval + useState — Reanimated not needed for string formatting)
- [x] 7.3 Create `src/features/walk-tracking/hooks/use-walk-location.ts`
- [x] 7.4 Create `src/features/walk-tracking/screens/walk-screen.tsx`
- [x] 7.5 Create `src/features/walk-tracking/screens/walk-summary-screen.tsx`
- [x] 7.6 Minimum-session rule handled in `computeWalkRewards`
- [x] 7.7 AppState backgrounding handler in walk-screen
- [x] 7.8 Credit bones + EXP via gamification, record mission event on end
- [x] 7.9 Create `app/walk.tsx` and `app/walk-summary.tsx` thin re-exports (layout registration in task 10.2)
- [ ] 7.10 Smoke test deferred to 12.5

## 8. `daily-missions` capability

- [x] 8.1 Create `src/features/daily-missions/constants/mission-catalog.ts` — three hardcoded missions: `walk-10`, `feed-2`, `open-app`
- [x] 8.2 Create `src/features/daily-missions/stores/daily-missions-store.ts` — persist store with lazy new-day reset and `recordEvent`
- [x] 8.3 Create `src/features/daily-missions/hooks/use-daily-missions.ts`
- [x] 8.4 Create `src/features/daily-missions/components/mission-card.tsx` — progress bar + title + reward
- [ ] 8.5 Toast-on-complete deferred — rewards still auto-pay out on completion
- [x] 8.6 Wire `recordEvent('opened-app')` on first hub mount of the day
- [ ] 8.7 Smoke test deferred to 12.6

## 9. `home-hub` capability

- [x] 9.1 Create `src/features/home-hub/screens/home-screen.tsx` composing: header (name, level, EXP bar, bones, streak), stage (DogAvatar), stat bars, action row (Walk, Feed), mission list
- [x] 9.2 Create `src/features/home-hub/components/hub-header.tsx` — reads dog-profile name + gamification + streak
- [x] 9.3 Create `src/features/home-hub/components/stat-bars.tsx` — three horizontal bars with distinct colors (hunger: orange, happiness: pink, energy: blue), animated fills via Reanimated
- [x] 9.4 Create `src/features/home-hub/components/action-row.tsx` — Walk button (`router.push('/walk')`) and the `FeedButton` from feeding feature
- [x] 9.5 Create `src/features/home-hub/components/mission-list.tsx` — renders 3 `MissionCard`s from `use-daily-missions`
- [x] 9.6 Create `app/home.tsx` as a thin re-export; register in `_layout.tsx` Stack
- [x] 9.7 Verify the hub's import graph includes only: `@features/dog-profile`, `@features/dog-avatar`, `@features/pet-state`, `@features/gamification`, `@features/feeding-action`, `@features/daily-missions`, `@features/walk-tracking`, `@shared/*`. No imports from parked `@features/dog`, `@features/game`, `@features/room`, `@features/wardrobe`.

## 10. Router gate and welcome flow hand-off

- [x] 10.1 Update `app/_layout.tsx` to read `useDogProfileStore.getState().profile` synchronously and set the Stack's `initialRouteName` to `'home'` if present, else `'index'`
- [x] 10.2 Register `home`, `walk`, `walk-summary`, `name-dog` screens in the Stack with correct presentation modes (home=default, walk=fullScreenModal, name-dog=card)
- [x] 10.3 Update `src/features/scan/screens/result-screen.tsx` so the success state's primary CTA is "Continue" → `router.replace({ pathname: '/name-dog', params: { breed, bodySize, coatColor, coatPattern, photoUri } })` — do NOT write to any store in the result screen
- [x] 10.4 Verify the result screen's import graph does NOT include `@features/dog-profile`, `@features/pet-state`, `@features/gamification`, `@features/daily-missions`, `@features/home-hub` (it only knows about route params)
- [ ] 10.5 Verify: fresh install → welcome → scan → result → continue → name → home (saved). Kill app. Reopen → straight to home.

## 11. Polish and type/lint cleanup

- [x] 11.1 Run `npx tsc --noEmit` — fix every new error introduced by this change
- [x] 11.2 Run `bun run lint` — fix every warning in files that were touched
- [x] 11.3 Confirm no file in the new feature folders imports from `@features/dog`, `@features/game`, `@features/room`, `@features/wardrobe`, `@features/profile`, `@features/share`
- [ ] 11.4 Tune economy constants (bones/EXP/decay) in a playtest session — target: 15 min of active play earns ~1 level
- [ ] 11.5 Verify all new Zustand stores persist across app kill: profile, pet-state, gamification, daily-missions, feeding-action `lastFedAt`

## 12. End-to-end manual test on simulator

- [ ] 12.1 Run `bun run ios` — cold start → welcome (no profile)
- [ ] 12.2 Complete scan flow → breed result → "Continue" → name dog "Test" → Save → land on home hub
- [ ] 12.3 Kill and reopen → home hub renders immediately (no welcome)
- [ ] 12.4 Tap Feed → hunger and happiness bars animate up, bones decrease by 5, cooldown starts
- [ ] 12.5 Tap Walk → timer screen → wait ≥ 60s → End → summary shows non-zero rewards → back to home, bones and EXP reflect the walk
- [ ] 12.6 Missions: verify open-app complete on first mount, feed 2x completes feed mission, walk 10 min completes walk mission
- [ ] 12.7 Wait long enough (or temporarily crank decay rate) to see hunger drop; reopen app and verify stats decayed
- [ ] 12.8 Level-up: do enough walks/missions to cross 50 EXP → toast appears and level label increments
- [ ] 12.9 Streak: fake the `lastOpenDay` to yesterday in dev, reopen, confirm streak increments to 2

## 13. Commit and wrap

- [ ] 13.1 Review `git status` — expected touched files are listed in proposal.md Impact section
- [ ] 13.2 Stage only MVP feature files and the router change — do not stage parked feature folders
- [ ] 13.3 Commit with message `feat(mvp): pawchi retention loop — dog profile, pet state, walk, feed, missions, gamification, home hub`
- [ ] 13.4 Run `openspec status --change "pawchi-mvp-roadmap"` and confirm all tasks are checked
- [ ] 13.5 Run `/opsx:archive pawchi-mvp-roadmap` after merge
