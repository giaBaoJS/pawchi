## Context

Pawchi already has a welcome route at `app/index.tsx` → `src/features/welcome/screens/welcome-screen.tsx` with a static scene (`welcome-scene.tsx`). The project is on Expo SDK 55 with Reanimated v4, Skia, Uniwind (Tailwind v4), and HeroUI Native — all dependencies for this upgrade are already installed. Theme colors are CSS variables declared inside a single `@theme static { … }` block in `global.css` and are accessed at runtime via `useCSSVariable`.

The goal is a **premium, dreamy, pet-magical welcome** that feels alive but never busy. Motion is a composition of many small, slow loops plus one clean staggered entry. This is the user's first impression, so visual polish and perceived performance matter more than raw feature count.

## Goals / Non-Goals

**Goals:**
- Deliver an animated welcome screen matching the spec's visual and motion requirements.
- Keep the implementation maintainable: small files, one component per concern, hooks for logic.
- All colors sourced from existing theme tokens via `useCSSVariable` / Uniwind className.
- UI-thread animation only (Reanimated shared values + Skia value bindings).
- Expose a `simple` fallback mode for low-end devices or future A/B testing.

**Non-Goals:**
- No new theme tokens unless a current token obviously cannot cover a needed role (in which case add to `global.css` inside `@theme static`).
- No new dependencies.
- No changes to routing, auth, or any data flow.
- No dark-mode-specific art direction — reuse existing tokens which already adapt.
- No lottie or video assets.

## Decisions

### 1. Split responsibilities: Reanimated for layout/motion, Skia for visuals

- **Reanimated** powers: entry stagger, paw-card float, pill & text entry, CTA press, shimmer schedule (shared value driving Skia), particle lifecycle bookkeeping.
- **Skia** powers: background blobs, halo radial gradient, scan ring stroke, sparkle particles, CTA shimmer highlight band + optional bone trail.
- **Rationale**: Reanimated is the right tool for layout transforms and React state-adjacent animation because it composes with RN layout and Uniwind. Skia is the right tool for painted effects that would be awkward/expensive with `View` + gradients (blurred blobs, soft rings, particles, shimmer masks).
- **Alternative considered**: All-Reanimated with LinearGradient + opacity tricks — works but the halo/ring/shimmer quality would drop, and blob motion would require nested Views. Rejected.
- **Alternative considered**: All-Skia (including layout) via `Canvas` fullscreen — loses RN accessibility, complicates text and press handling. Rejected.

### 2. One shared Skia `Canvas` for background, one scoped Canvas for the scanner core

- Use a full-screen absolutely-positioned Skia `Canvas` behind everything for the background blobs.
- Use a second, smaller Canvas sized to the scanner core region for halo + scan ring + sparkles + optional bone trail. Keeps repaint area small.
- CTA shimmer uses a third, CTA-sized Canvas absolutely positioned over the button with `pointerEvents="none"`.
- **Rationale**: Scoped canvases minimise invalidation region each frame, avoiding full-screen repaint for micro effects.

### 3. Entry sequence orchestration via a single `useSharedValue<number>` timeline

- A `progress` shared value runs 0 → 1 over ~1600ms using `withTiming` with a gentle cubic curve.
- Each element derives its own opacity/translate from `progress` via `useDerivedValue` with per-element start/end windows (e.g., title enters in 0.35–0.55).
- **Rationale**: One timeline → one easy place to tune the entire entry feel. No cascading `setTimeout`s, no drift between elements. Easy to test a "replay" by resetting `progress`.
- **Alternative considered**: Sequential `withDelay` chains per element. More code, harder to tune globally. Rejected.

### 4. Idle loops as independent shared values with long periods

- `haloPulse` (3s), `float` (3s), `ringTicker` (every 5s emits a new ring), `sparkleTicker` (~every 4–8s, random jitter), `shimmerTicker` (every 6s).
- Each loop is started on mount after the entry completes (`progress.value === 1`).
- Ring and sparkle tickers push entries into a small pool (max 2 active rings, max 4 active sparkles). Old entries are recycled, no allocation churn.
- **Rationale**: Independent, slow loops compose a calm ambient feel and keep each concern isolated.

### 5. Shimmer implementation

- Shimmer is a Skia `LinearGradient` painted over a rounded-rect mask matching the CTA shape. A shared value drives the gradient's start/end X over ~900ms, then rests for the ticker period.
- Optional bone trail: a tiny custom `Path` (two circles + connecting rect — a stylised bone) follows the shimmer head at lower opacity and fades out within 250ms.
- Kept extremely subtle (max ~30% alpha on a soft warm accent token) so it reads as "premium sweep" not "toy".

### 6. Particles ("paw dust") as a capped pool

- Pre-allocate 6 slots of `{ x, y, life, seed }` shared values. At most 4 visible. Spawn rate 0.25 Hz with random offset.
- Rendered as tiny Skia `Circle`s with soft blur via `Paint` `BlurStyle.Solid` + opacity-over-life.
- Occasional (~1 in 3) particle uses a 4-dot paw-pad micro cluster rendered as 4 small circles. Reads as a paw silhouette at a glance without being literal.

### 7. Component structure

```
src/features/welcome/
├── screens/
│   └── welcome-screen.tsx          ← composes the layout; no motion logic
├── components/
│   ├── animated-background.tsx     ← full-screen Skia blobs
│   ├── scanner-core.tsx            ← paw card + halo + ring + sparkles
│   ├── paw-card.tsx                ← the rounded card w/ Ionicons paw (floats)
│   ├── halo-pulse.tsx              ← Skia radial-gradient halo
│   ├── scan-ring.tsx               ← Skia expanding ring
│   ├── paw-dust.tsx                ← Skia particle canvas
│   ├── pill-row.tsx                ← three pills with staggered entry
│   ├── shimmer-cta.tsx             ← CTA + Skia shimmer overlay
│   └── welcome-scene.tsx           ← (kept) legacy; replaced by new composition
├── hooks/
│   ├── use-entry-timeline.ts       ← single progress shared value + windows
│   ├── use-idle-loops.ts           ← float, halo, ring, sparkle, shimmer tickers
│   └── use-theme-colors.ts         ← centralises useCSSVariable for welcome
├── types/
│   └── welcome.ts                  ← prop/config interfaces (intensity/timing)
└── utils/
    └── easing.ts                   ← curated easing curves used across welcome
```

- `welcome-screen.tsx` stays layout-only, imports `useEntryTimeline` and passes the `progress` shared value down. Each child also consumes idle loop shared values where relevant.
- Components never import native modules directly — all color reads go through `use-theme-colors`.

### 8. Props & configurability

Each animated component accepts an optional `intensity?: 'off' | 'low' | 'normal' | 'high'` and timing overrides. Defaults map to `normal`. `WelcomeScreen` accepts `simple?: boolean` to activate the fallback mode described in the spec (disables blobs/ring/sparkles, keeps entry + float + halo + press).

### 9. Theme tokens

Use existing tokens where possible:
- Background blobs → `--color-lavender`, `--color-primary`, `--color-mood`, `--color-bond` at low alpha.
- Halo → `--color-primary` (warm) at low alpha.
- Scan ring → `--color-foreground-secondary` at low alpha — airy, not neon.
- Sparkles → `--color-foreground` at low alpha.
- Shimmer → `--color-warning` or `--color-primary` (lightened via alpha).

If any role truly lacks a suitable token, add to `global.css` inside the existing `@theme static { … }` block (e.g., `--color-halo`, `--color-shimmer`) — do NOT introduce inline hex.

## Risks / Trade-offs

- **Risk**: Skia + Reanimated together can regress on older Android if too many canvases repaint simultaneously.
  → **Mitigation**: Three small scoped canvases (background, scanner core, CTA) with capped particle pool and long loop periods. `simple` prop disables heavier canvases.
- **Risk**: CSS variable reads returning unexpected values breaking Skia color parsing.
  → **Mitigation**: Always cast `useCSSVariable(...) as string`. No hex fallbacks per CLAUDE.md — `@theme static` guarantees resolution.
- **Risk**: Entry timeline windows drifting out of sync with design intent after future tweaks.
  → **Mitigation**: All windows live in one typed config object in `use-entry-timeline.ts`.
- **Risk**: Shimmer or bone trail reads as cheesy if alpha/speed is wrong.
  → **Mitigation**: Shipped defaults tuned low; `intensity='low'` available; bone trail gated behind explicit prop (default off in `normal`, on in `high`).
- **Risk**: React Compiler flags any accidental ref-access in gesture/animation callbacks.
  → **Mitigation**: Use `useSharedValue` exclusively for mutable animation state (per CLAUDE.md). No `useRef` for animated values.
- **Trade-off**: Single shared entry timeline vs. per-element sequencing — less flexibility per element, but far simpler to tune. Accepted.
- **Trade-off**: Running idle loops indefinitely on the welcome screen burns a bit of battery vs. a static screen. Accepted for first-impression impact; mitigated by the fact that users typically leave this screen in seconds.

## Open Questions

- Should idle loops pause when the app backgrounds? (Default: yes, via `AppState` check in `use-idle-loops`. Confirm before shipping.)
- Do we want the bone trail on in `normal` intensity or only `high`? (Defaulting to `high`-only; revisit after first design review.)
