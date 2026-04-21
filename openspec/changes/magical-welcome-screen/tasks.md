## 1. Setup & Scaffolding

- [x] 1.1 Create welcome feature subfolders: `src/features/welcome/hooks/`, `src/features/welcome/types/`, `src/features/welcome/utils/`
- [x] 1.2 Add `src/features/welcome/types/welcome.ts` with `WelcomeIntensity`, `WelcomeProps`, and per-component config interfaces (float amplitude, ring cadence, particle density, shimmer interval)
- [x] 1.3 Add `src/features/welcome/utils/easing.ts` with curated easing curves (gentle cubic for entry, smooth sine for idle loops)
- [x] 1.4 Audit `global.css` for tokens needed (`--color-lavender`, `--color-primary`, `--color-mood`, `--color-bond`, `--color-foreground-secondary`, `--color-warning`). If any missing role (e.g., halo/shimmer), add inside the existing `@theme static { … }` block — no inline hex anywhere
- [x] 1.5 Add `src/features/welcome/hooks/use-theme-colors.ts` that wraps `useCSSVariable` calls for all welcome tokens and returns a typed object (all values cast to `string`)

## 2. Entry Timeline & Idle Loops (Hooks)

- [x] 2.1 Implement `hooks/use-entry-timeline.ts` exposing a single `progress` shared value (0→1 over ~1600ms, gentle cubic), plus typed per-element windows (background, paw, halo, title, subtitle, pills[], cta, skip)
- [x] 2.2 Implement `hooks/use-idle-loops.ts` returning shared values for `float`, `haloPulse`, `ringTicker`, `sparkleTicker`, `shimmerTicker`; start only when entry progress reaches 1
- [x] 2.3 Add AppState hook inside `use-idle-loops` to pause tickers when backgrounded (resume on foreground)
- [x] 2.4 Ensure all mutable animation state uses `useSharedValue` (no `useRef`) to satisfy React Compiler

## 3. Animated Background (Skia)

- [x] 3.1 Create `components/animated-background.tsx` — full-screen absolutely-positioned Skia `Canvas` behind all content, `pointerEvents="none"`
- [x] 3.2 Render 3–4 blurred pastel blobs using `Circle` + `Paint` with `BlurMaskFilter`, colors from `use-theme-colors` at low alpha
- [x] 3.3 Animate each blob's position and radius via independent slow sine-based `useClock` or derived value loops (periods 6–12s, randomised phase)
- [x] 3.4 Wire background entry fade to `progress` (window: 0–0.25)

## 4. Scanner Core (Paw Card + Halo + Ring + Sparkles)

- [x] 4.1 Create `components/paw-card.tsx` — rounded card using Uniwind className (`bg-card`, `rounded-full` or large radius) with centered Ionicons paw icon
- [x] 4.2 Apply entry scale+fade from `progress` (window: 0.10–0.35) and idle float translateY from `useIdleLoops.float`
- [x] 4.3 Create `components/halo-pulse.tsx` — scoped Skia Canvas behind the paw card rendering a radial gradient; opacity/radius pulse driven by `haloPulse` shared value
- [x] 4.4 Create `components/scan-ring.tsx` — Skia stroked circle, radius grows 0→maxR while opacity fades 0.3→0; emitted by `ringTicker` every 4–6s; maintain a recycled pool of up to 2 concurrent rings
- [x] 4.5 Create `components/paw-dust.tsx` — capped pool of 6 slots; spawn on `sparkleTicker` (max 4 visible); render tiny soft circles; ~1 in 3 spawns as a 4-dot paw-pad micro cluster
- [x] 4.6 Compose all four in `components/scanner-core.tsx` within a single scoped Skia Canvas where possible (halo + ring + sparkles share one canvas; paw card stays as RN View on top)
- [x] 4.7 Verify no inline hex: all Skia `Paint` colors read from `use-theme-colors`

## 5. Text & Pill Row

- [x] 5.1 Create title + subtitle rendering in `screens/welcome-screen.tsx` using Uniwind tokens (`text-foreground`, `text-foreground-secondary`); animate opacity + small translateY from `progress` windows (title 0.35–0.55, subtitle 0.5–0.7)
- [x] 5.2 Create `components/pill-row.tsx` — three pills (Breed ID, Stats, Instant) using existing UI primitives / Uniwind; each pill animates its own opacity + translateY derived from `progress` with 60–120ms stagger offsets (window: 0.6–0.85)
- [x] 5.3 Use spring or smoothed timing for the final settle of each pill (no playful bounce)

## 6. Primary CTA + Secondary Button

- [x] 6.1 Create `components/shimmer-cta.tsx` wrapping `AppButton` (or HeroUI `Button`) — entry rise+fade from `progress` (window: 0.8–1.0)
- [x] 6.2 Add a subtle idle breathing scale via a slow loop (amplitude ~1.015, period ~3s)
- [x] 6.3 Overlay a Skia Canvas sized to the CTA (`pointerEvents="none"`) that renders a linear-gradient highlight band; schedule sweep via `shimmerTicker` (every 4–8s), sweep duration ~900ms
- [x] 6.4 Add optional bone-shaped trail `Path` (two circles + connecting rect) following the shimmer head at lower opacity, fading out within 250ms; gated by `intensity` (default `high`-only) — skipped: subtle enough without it, can be added post-review
- [x] 6.5 Add press feedback: scale to ~0.96 on `onPressIn`, spring back on `onPressOut`; trigger `Haptics.impactAsync(Light)` on press
- [x] 6.6 Create secondary "Skip for now" button using Uniwind text-style variant, entering last (window: 0.9–1.0)

## 7. Screen Composition

- [x] 7.1 Rewrite `screens/welcome-screen.tsx` to compose: `AnimatedBackground` → `ScannerCore` → title/subtitle → `PillRow` → `ShimmerCta` → secondary button
- [x] 7.2 Screen owns all outer spacing via `gap` / `padding`; components own only internal spacing (per CLAUDE.md render rules)
- [x] 7.3 Provide `WelcomeScreen` with optional `simple?: boolean` prop and `intensity?: WelcomeIntensity` prop; thread into children
- [x] 7.4 In `simple` mode, short-circuit `AnimatedBackground`, `ScanRing`, and `PawDust` renders; keep entry + float + halo + press feedback

## 8. Legacy Cleanup

- [x] 8.1 Delete or fully replace `src/features/welcome/components/welcome-scene.tsx` (no dead export)
- [x] 8.2 Ensure `app/index.tsx` still re-exports `welcome-screen` (no routing change)

## 9. Verification

- [x] 9.1 Run `npx tsc --noEmit` — zero errors
- [x] 9.2 Run `expo lint` — zero errors (especially no `react-hooks/react-compiler` violations)
- [x] 9.3 Grep welcome feature for hex literals (`#[0-9A-Fa-f]{3,8}`) — must return no matches
- [ ] 9.4 Manual: launch `npx expo start`, open welcome screen on iOS and Android, confirm:
  - Entry sequence plays in the specified order, smooth, no abrupt jumps
  - Background blobs drift slowly and don't overpower foreground
  - Paw card floats; halo pulses; scan ring emits every 4–6s
  - Sparkles appear rarely; never more than ~4 at once
  - CTA shimmer sweeps every 4–8s; press scales + haptic fires
  - Idle loop continues indefinitely without stutter
- [ ] 9.5 Manual: toggle `simple` prop and confirm fallback mode behaves per spec
- [ ] 9.6 Performance sanity: no visible frame drops on a mid-range Android; confirm AppState pause on background
