# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

- **Start dev server:** `npx expo start`
- **iOS:** `expo run ios`
- **Lint:** `expo lint` (eslint 9 flat config via eslint-config-expo)
- **Type check:** `npx tsc --noEmit`
- **Prebuild (after native changes):** `npx expo prebuild --clean --platform ios`

## Architecture

Expo SDK 55 app with Expo Router v7 (file-based routing), React Native 0.83.2, React 19.2. New Architecture enabled. **iOS-only** — HealthKit is Apple-only, no Android native code.

### Installed Dependencies

Already in project — do NOT re-install:

- `react-native-reanimated` 4.2.1
- `react-native-gesture-handler` ~2.30.0
- `react-native-worklets` 0.7.2
- `react-native-screens`, `react-native-safe-area-context`
- `expo-image` (use via `@shared/components/styled` wrapper — better caching and Uniwind className support)
- `expo-haptics`, `expo-router`, `@react-navigation/bottom-tabs`
- `uniwind` — Tailwind CSS v4 for React Native (className-based styling)
- `heroui-native` — Pre-built compound UI components (Button, Dialog, BottomSheet, Toast, Spinner)
- `tailwind-variants` — Variant-based className composition via `tv()`
- `tailwind-merge` + `clsx` — className merging via `cn()` utility
- `@legendapp/list` — High-performance list (replaces FlatList)
- `@tanstack/react-query` v5 — Server state management
- `@gorhom/bottom-sheet` — Native bottom sheet (used alongside HeroUI BottomSheet)

### Styling — Uniwind + HeroUI Native

**All styling uses Tailwind `className` via Uniwind.** No `StyleSheet.create()`, no Tamagui, no inline style objects for static values.

- **Theme tokens** are CSS custom properties defined in `global.css` (light/dark variants)
- **className merging**: Use `cn()` from `src/lib/cn.ts` for conditional/conflicting classes
- **Variants**: Use `tv()` from `tailwind-variants` for component variant systems
- **Theme switching**: `Uniwind.setTheme('dark' | 'light')` in root layout
- **CSS variable access**: `useCSSVariable('--color-background')` from `uniwind` for non-className props (e.g., tab bar colors)

**Token mapping** (use in className):
- `bg-background`, `bg-card`, `bg-card-alt`, `bg-primary`, `bg-danger`, `bg-success`, `bg-warning`, `bg-info`
- `text-foreground`, `text-foreground-secondary`, `text-muted`, `text-primary`, `text-danger`, `text-success`, `text-warning`
- `border-border`

**Uniwind rules:**
- React Native core components (`View`, `Text`, `Pressable`, `ScrollView`) support `className` natively — do NOT wrap with `withUniwind()`
- Only non-RN components need `withUniwind()` — e.g., `expo-image`'s `Image` (wrapped in `src/shared/components/styled.ts`)
- No dynamic className construction: `className={\`bg-${color}\`}` won't work — use mapping objects or ternaries with complete strings
- For non-style color props (`tintColor`, `placeholderTextColor`), use `{propName}ClassName` with `accent-` prefix

**HeroUI Native components** (compound pattern with subcomponents):
- `Button` + `Button.Label` — in `src/shared/components/ui/app-button.tsx`
- `Dialog` + `.Trigger`, `.Portal`, `.Content`, `.Title`, `.Description`, `.Actions`, `.BlurBackdrop`
- `BottomSheet` + `.Trigger`, `.Portal`, `.Content`, `.Title`, `.Description`, `.Actions`, `.BlurBackdrop`
- `Toast` + `.Icon`, `.Title`, `.Description` — imperative via `showToast()`
- `Spinner` — loading indicator
- Provider: `<HeroUINativeProvider>` wraps app in root layout

### Routing

- `app/_layout.tsx` — Root layout with Stack navigator, Uniwind theme switching, HeroUINativeProvider, QueryClientProvider
- `app/(tabs)/_layout.tsx` — Bottom tab navigator using NativeTabs, reads colors via `useCSSVariable`
- Path aliases: `@/*` → `./src/*`, `@features/*` → `./src/features/*`, `@shared/*` → `./src/shared/*`, `@lib/*` → `./src/lib/*`

### Native Modules

TurboModules as local packages created with `create-react-native-library` (builder-bob):

- `modules/health-module/` — Steps tracking via HealthKit (fetch + live observer)
- `modules/meal-module/` — Food tracking via HealthKit (create, query, addImage)

Each module: codegen spec in `src/NativeXxx.ts` → ObjC++ bridge (`.h` + `.mm`) with `getTurboModule:` → Pure Swift HealthKit logic. Linked via `link:./modules/<n>` in package.json.

### Code Organization — Feature-Based

Structure code by **feature**, not by type. Each feature owns its components, hooks, types, and utils.

**Key rule:** Screens that compose multiple features are **app-level** — they live directly in `app/` and import from features. Features never import from other features. Only `app/` and `src/shared/` can cross feature boundaries.

```
app/(tabs)/
├── _layout.tsx                        ← tab navigator config only
├── index.tsx                          ← HomeScreen
├── activity.tsx                       ← Trip history
├── promotions.tsx                     ← Promotions
├── account.tsx                        ← User account

src/features/auth/
├── screens/                           ← sign-in, sign-up, otp, forgot-password
├── hooks/                             ← use-sign-in, use-auth-state, use-otp
├── schemas/                           ← Zod validation
└── types/

src/features/home/
├── components/                        ← home-header, quick-actions, promo-banner, etc.
└── hooks/                             ← use-home-data

src/features/booking/
├── components/                        ← booking-sheet, ride-live-activity
├── hooks/                             ← use-booking-sheet, use-location-search, use-route
├── screens/                           ← search-location-screen
└── types/

src/features/activity/
├── hooks/                             ← use-activity
└── screens/                           ← activity-screen

src/features/promotions/
├── hooks/                             ← use-promotions
└── screens/

src/features/account/
├── screens/                           ← account, edit-profile, payment-methods, etc.
└── hooks/

src/shared/
├── components/
│   ├── ui/                            ← AppButton, AppInput, AppCard, ScreenHeader, etc.
│   ├── buttons/                       ← Pressable wrapper
│   ├── styled.ts                      ← withUniwind wrappers (expo-image)
│   ├── animated-blur-view.tsx         ← Reanimated BlurView for dialogs
│   └── animated-splash.tsx
├── hooks/
├── types/
└── utils/
    └── haptics.ts                     ← Haptic feedback utilities

src/api/                               ← API layer (TanStack Query)
├── index.ts                           ← QueryClient + MMKV persistence
├── keys/                              ← Query/mutation key constants
├── core/                              ← API call implementations by domain
├── types/                             ← Request/response DTOs
├── endpoints/                         ← URL constants
└── mocks/                             ← Mock data

src/lib/
├── api-client.ts                      ← Typed fetch-based API client
├── cn.ts                              ← className merge utility (clsx + tailwind-merge)
├── i18n.ts                            ← i18next initialization
└── mapbox.ts                          ← Mapbox setup

src/locales/                           ← i18n (en, vi)
```

**Import direction rules:**

- `app/` screens → can import from any feature + shared
- `src/features/X/` → can import from `src/shared/` only, NEVER from `src/features/Y/`
- `src/shared/` → never imports from features

**Hook rules:**

- **Don't create wrapper hooks that just combine unrelated hooks.** If a screen uses `useSteps()` and `useMeals()`, call them separately in the screen — don't create a `useHomeScreen()` that wraps both. They're independent.
- **Only create a screen hook when there's actual screen-specific logic** (state that coordinates between features, derived values, complex event handling). Just importing 2 hooks doesn't justify a wrapper.
- **Feature-specific actions belong in feature hooks.** E.g., `onAddMeal` (navigating to add meal screen) belongs in a meals feature hook like `use-meal-navigation.ts`, not in an app-level screen hook.

**Rules:**

- **Feature folders own everything related to that feature** — screens, components, hooks, types, utils. Don't scatter them across global folders.
- **`src/shared/`** is for code used by 2+ features. If only one feature uses it, it belongs in that feature folder.
- **`app/` is routes-only.** Thin wrappers that re-export from `src/features/*/screens/`.
- **Function params:** When a function has 3+ params, group into an object/interface.
- **Types/interfaces:** In separate files within the feature's `types/` folder. Never inline.
- **Utils:** In the feature's `utils/` folder. Cross-feature utils go in `src/shared/utils/`.
- **Screen components are UI-only.** All logic in colocated hooks.
- **Components with hooks become folders** with barrel `index.ts`. Simple components stay as single files.
- **File naming:** kebab-case (e.g., `step-counter.tsx`, `use-steps.ts`)
- **One component per file.** Never define multiple components in the same file.
- **Minimal comments.** No obvious comments. Only comment **why**, never **what**. JSDoc is fine on exported public APIs only.
- **TypeScript:** Strict mode, `strictNullChecks`, no `any`, `import type {}` enforced
- **Components never import native modules directly** — hooks are the boundary
- **Theme:** CSS variables in `global.css`, accessed via Tailwind className tokens (`bg-primary`, `text-foreground`, etc.)
- **Images:** Use `expo-image` via `Image` from `@shared/components/styled` — NOT `<Image>` from `react-native` or directly from `expo-image`

### Rendering Rules

- **Components own internal spacing only — never outer margin/padding.** Components should be layout-agnostic. No `margin`, `marginTop`, `marginBottom`, `padding` on the outermost container of a component. The screen/parent controls all spacing between components via `gap`, `padding`, or wrapper styles. This keeps components reusable — they don't assume where they'll be placed.

  ```tsx
  // GOOD — screen controls spacing
  <View className="gap-6 p-4">
    <StepCounter />
    <MealList />
  </View>

  // BAD — component has outer margin baked in
  const StepCounter = () => (
    <View className="mb-6">...</View>
  );
  ```

- **No nested ternaries in JSX.** Never `{a ? (b ? <X/> : <Y/>) : <Z/>}`. This is unreadable.
- **Use early returns** for conditional rendering. Check edge cases first, return early, then render the happy path.
- **Extract conditional sections into small components** when the JSX for each branch is more than a few lines.
- **Simple single ternaries are OK** when both branches are short: `{hasImage ? <Image /> : <Placeholder />}`. But never nest them.

## React Compiler

Enabled via `app.config.ts` (Expo SDK 55 built-in support). Do NOT also configure it in `babel.config.js` — having it in both places causes `useMemoCache of null` crash.

- `app.config.ts` — has the React Compiler config (Expo handles it)
- `babel.config.js` — only `babel-preset-expo` preset. NO `react-compiler` in preset options. NO `react-native-reanimated/plugin` (Reanimated v4 uses Metro config instead).

**Rules:**

- NO `React.memo()`, `useMemo()`, `useCallback()` — compiler handles memoization
- All components must be pure (same inputs → same output)
- Never mutate props, state, or hook return values
- Never read/write refs during render
- If `react-hooks/react-compiler` ESLint rule flags a component, fix the root cause
- For gesture-handler hooks that access shared values in gesture callbacks: use Reanimated `useSharedValue` instead of `useRef` to avoid compiler ref-access errors

## TanStack Query

Server state management with `@tanstack/react-query` v5. Persistence via MMKV + lz-string compression.

### QueryClient Setup (`src/api/index.ts`)

- `PersistQueryClientProvider` wraps the app — persists `auth` and `language` keys across app launches
- `staleTime: Infinity`, `gcTime: Infinity` — intentional for offline-first with MMKV
- Selective dehydration: only allowed keys persist, everything else is ephemeral

### API Client (`src/lib/api-client.ts`)

Typed fetch-based client — **no axios**:

```tsx
// Usage
const user = await apiClient<UserResponse>('/api/user/profile');
const result = await apiClient<LoginResponse>('/auth/login', {
  method: 'POST',
  body: { username, password },
});
```

- Auto-attaches `Authorization: Bearer <token>` from query cache
- 401 → auto-refresh token with dedup (concurrent requests wait for single refresh)
- Throws typed `ApiError` with `status`, `body`, `code`

### Query/Mutation Best Practices

**DO:**

```tsx
// Separate query config from consumption using queryOptions()
// src/api/core/user/queries.ts
export const userInfoQueryOptions = queryOptions({
  queryKey: [queryKeys.userInfo],
  queryFn: () => apiClient<UserInfoResponse>('/api/user/profile'),
});

// src/features/account/hooks/use-user-info.ts
export const useUserInfo = () => useQuery(userInfoQueryOptions);

// Always use useMutation for write operations
export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [mutationKeys.signIn],
    mutationFn: (data: SignInRequest) =>
      apiClient<SignInResponse>('/auth/login', { method: 'POST', body: data }),
    onSuccess: (data) => {
      queryClient.setQueryData([queryKeys.auth], data);
    },
  });
};

// Use array query keys for parametric queries
queryKey: ['booking', bookingId]
queryKey: ['posts', { page, limit }]

// Invalidate related queries after mutations
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [queryKeys.userInfo] });
}
```

**DON'T:**

```tsx
// DON'T use manual try/catch for API calls — use useMutation
const handleSubmit = async () => {
  try {
    const result = await apiClient('/auth/login', ...);  // BAD
    setData(result);
  } catch (e) { setError(e); }
};

// DON'T set queryFn: () => null as a default — hides missing implementations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { queryFn: () => null },  // BAD — silent bugs
  },
});

// DON'T inline queryFn in every hook — extract to queryOptions()
export const useUserInfo = () =>
  useQuery({
    queryKey: [queryKeys.userInfo],
    queryFn: async () => {                    // BAD — not reusable
      return apiClient<UserInfo>('/api/user');
    },
  });

// DON'T use setQueryData for write operations — use useMutation
const login = async (creds) => {
  const data = await apiClient('/auth/login', ...);
  queryClient.setQueryData([queryKeys.auth], data);  // BAD — bypasses mutation queue
};

// DON'T forget to handle loading/error states from mutations
const { mutate } = useSignIn();
mutate(data);  // BAD — no isPending or error feedback

// GOOD
const { mutate, isPending, error } = useSignIn();
```

### Query Key Convention

```tsx
// src/api/keys/query.ts
export const queryKeys = {
  auth: 'auth',
  userInfo: 'userInfo',
  language: 'language',
  // Parametric keys use arrays at call sites:
  // ['booking', id], ['posts', { page }]
} as const;
```

## Animation

- ALL animations use `react-native-reanimated` v4 — NEVER the old `Animated` API from `react-native`
- Use `useSharedValue`, `withTiming`, `withSpring`, `useDerivedValue`
- Custom drawing (circular progress) uses `@shopify/react-native-skia` — Skia accepts Reanimated shared values directly as props
- In gesture handlers, use `useSharedValue` (not `useRef`) for mutable state — avoids React Compiler ref-access errors and runs on UI thread
- Reanimated v4 configured via Metro config (NOT babel plugin)
- HeroUI Dialog/BottomSheet blur backdrops use `AnimatedBlurView` with `useDialogAnimation().progress`

## Build Configuration

- `global.css` — Tailwind v4 + Uniwind + HeroUI Native styles, theme CSS variables
- `metro.config.js` — `withUniwindConfig(wrapWithReanimatedMetroConfig(config))` (Uniwind outermost)
- `babel.config.js` — `babel-preset-expo` only (no Tamagui, no Reanimated plugin)
- `tsconfig.json` — includes `uniwind-types.d.ts`
- `app.config.ts` — React Compiler, Firebase, Mapbox, multi-environment (dev/staging/prod)

## Native Module Standards

- `RCT_EXPORT_MODULE()` — never `RCT_EXTERN_MODULE`
- Every `.mm` file must have `getTurboModule:` returning the codegen JSI binding
- No `RCT_EXTERN_METHOD` — codegen protocol defines signatures
- Swift classes are pure (no React Native imports) — ObjC++ bridge delegates to them
- `[weak self]` in ALL HealthKit closures
- `HKObserverQuery` `completionHandler()` must be called in every code path
- Descriptive error codes: "HEALTHKIT_NOT_AVAILABLE", "QUERY_FAILED", etc.
- After native code changes: `npx expo prebuild --clean --platform ios`
- Each builder-bob module with Swift + ObjC++ needs a manual umbrella header: `modules/<module>/ios/<module_name_underscored>.h` that imports the ObjC header (e.g., `#import "HealthModule.h"`). Without this, `-Swift.h` compilation fails.

## Performance

- `LegendList` from `@legendapp/list` with `keyExtractor` + `recycleItems={true}` — never `FlatList`, never `ScrollView` + `.map()`
- Explicit `width`/`height` on all images. Use `expo-image` via `@shared/components/styled` for automatic caching + Uniwind className.
- No memory leaks: unsubscribe observers on unmount, `[weak self]` in native closures
- Use Reanimated (UI thread) for all animations — never block JS thread
- Use `tv()` from `tailwind-variants` for variant-based className — avoids runtime style computation

## Skills

The following agent skills are installed globally. Reference them when writing or reviewing code:

**Core (always apply):**

- **vercel-react-best-practices**: Re-render prevention, bundle optimization, request waterfall elimination
- **vercel-composition-patterns**: Compound components, prop drilling avoidance, flexible API design
- **react-native-best-practices** (Software Mansion): JS thread optimization, native profiling, Hermes config, app size reduction
- **reanimated-skia-performance**: Performance patterns for Reanimated + Skia animations

**React Native / Expo specific:**

- **vercel-react-native-skills**: React Native patterns for Vercel ecosystem
- **building-native-ui**: Native UI component best practices
- **expo-dev-client**: Expo dev client configuration and usage
- **uniwind**: Tailwind CSS v4 styling for React Native
- **heroui-native**: HeroUI Native component library
