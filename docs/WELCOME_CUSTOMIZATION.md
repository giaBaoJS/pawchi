# Welcome Screen Customization Guide

Everything magical on the welcome screen — sparkles, halo, scan ring, background blobs — is driven by a handful of tunable constants. You don't need to understand Skia to edit them. This doc shows where each knob lives and what it does.

All files referenced below are in `src/features/welcome/components/`.

---

## 1. Sparkles ("paw dust") — `paw-dust.tsx`

The sparkles drift around the paw card. There are exactly **4 sparkle slots**. Each slot is either a single dot or a 4-dot "paw pad" cluster.

### Coordinate system

The Skia Canvas is `260 × 260` pixels. The **center** of the paw card sits at `(130, 130)` — that's `CENTER` in the file.

- `x` grows to the **right**
- `y` grows **downward** (top-left is `0, 0`)
- So `CENTER + 72` is 72px to the right of center; `CENTER - 42` is 42px above center.

The paw card itself is `140 × 140` centered on the canvas, so it occupies roughly `x ∈ [60, 200]`, `y ∈ [60, 200]`. Put sparkles **outside that box** (or slightly overlapping the edge) so they don't sit on top of the card.

### Editing existing sparkles

Find `SPARKLE_POSITIONS` near the top of `paw-dust.tsx`:

```ts
const SPARKLE_POSITIONS = [
  { x: CENTER + 72, y: CENTER - 42, r: 3.5, cluster: false },
  { x: CENTER - 68, y: CENTER - 50, r: 2.8, cluster: true  },
  { x: CENTER + 55, y: CENTER + 65, r: 3.0, cluster: false },
  { x: CENTER - 80, y: CENTER + 30, r: 2.5, cluster: true  },
] as const;
```

Per-sparkle fields:

| field     | what it does                                                          |
|-----------|-----------------------------------------------------------------------|
| `x`, `y`  | Position in canvas pixels. Use `CENTER ± offset` for readability.     |
| `r`       | Radius of the main dot. `2–4` looks subtle; `5+` gets chunky.         |
| `cluster` | `false` → single dot. `true` → paw-pad micro cluster (1 big + 3 small).|

**To move a sparkle**, tweak its `x` / `y`. Nothing else needs to change.

**To change its size**, tweak `r`. Clusters scale their small dots relative to `r`.

**To toggle shape**, flip `cluster` between `true` and `false`.

### Adding a 5th (or more) sparkle

Adding a slot requires a coordinated edit in two files because each sparkle is driven by its own shared value from `use-idle-loops.ts`.

1. **`hooks/use-idle-loops.ts`** — add `sparkle4` alongside `sparkle0–sparkle3`:
   - Add `const sparkle4 = useSharedValue(0);`
   - Add a matching loop in the `useEffect` (copy the `sparkle3` block and bump the delay, e.g. `+2000ms` offset).
   - Return `sparkle4` from the hook.
   - Also cancel it in the cleanup + AppState pause paths.

2. **`components/paw-dust.tsx`**:
   - Add `sparkle4` to the `PawDustProps` interface and destructure it.
   - Push it into the `sparkles` array.
   - Add a fifth `useDerivedValue` for its capped opacity (`op4`) and push it into `ops`.
   - Add a fifth entry to `SPARKLE_POSITIONS`.

3. **`components/scanner-core.tsx`** — pass `sparkle4={loops.sparkle4}` into `<PawDust>`.

> Why the duplication? Each sparkle needs its own independent ticker so they fade in/out at different times. Sharing one timer would make them all blink together.

### Making sparkles brighter / more visible

Inside `paw-dust.tsx`, each `useDerivedValue` multiplies the raw timer by `0.6`:

```ts
return sparkles[0].value * 0.6;   // 0.6 = max opacity
```

Raise to `0.8` for more presence, drop to `0.4` for whisper-subtle.

### Changing sparkle spawn cadence

Cadence lives in **`hooks/use-idle-loops.ts`** under each `sparkleN` loop. You'll see `withTiming(1, { duration: ... })` and `withDelay(...)` calls. Longer delays = rarer sparkles.

The `intensity` prop (see §5) also scales this.

---

## 2. Halo pulse — `halo-pulse.tsx`

The soft glow behind the paw card. Two concentric blurred circles that breathe in sync.

Tunables at the top of the file:

| constant              | what to change it for                        |
|-----------------------|----------------------------------------------|
| `OUTER_RADIUS` (90)   | How far the glow reaches.                    |
| `INNER_RADIUS` (58)   | Size of the hotter inner core.               |
| `OUTER_BLUR` (35)     | Softness of the outer glow. Higher = dreamier.|
| `INNER_BLUR` (20)     | Softness of inner core.                      |

The pulse amplitude (how much it grows/shrinks) is driven by `haloPulse` shared value from `use-idle-loops.ts`.

---

## 3. Scan ring — `scan-ring.tsx`

The expanding ring that pulses outward every few seconds. Pure Reanimated — no Skia.

Tunables:

| constant                | what it controls                                 |
|-------------------------|--------------------------------------------------|
| `RING_START_DIAMETER`   | How close to the paw card it starts (156).       |
| `RING_END_DIAMETER`     | How far out it expands (252).                    |
| `borderWidth: 1.5`      | Ring thickness.                                  |
| `opacity: 0.35 * (...)` | Peak opacity (`0.35`). Lower = ghostlier.        |

Cadence (how often a new ring emits) is controlled by the `scanRing` loop in `use-idle-loops.ts`.

---

## 4. Background blobs — `animated-background.tsx`

4 blurred pastel circles drifting across the full screen.

Edit the `BLOBS` array:

| field              | meaning                                                     |
|--------------------|-------------------------------------------------------------|
| `startX`, `startY` | Position as `0–1` fraction of screen (0.5, 0.5 = center).   |
| `radius`           | Blob size in pixels. `80–120` is typical.                   |
| `driftX`, `driftY` | How far the blob wanders (as fraction of screen).           |
| `period`           | Drift cycle duration in ms. `8000–12000` feels gentle.      |
| `phase`            | `0–1` offset into the cycle, so blobs aren't synced.        |

Colors come from `colors.lavender / mood / peach / personality` in `blobColors` — change the list to pick different theme tokens. **Never hard-code hex**; add a token in `global.css` if you need a new one.

Blur intensity is set by `<BlurMask blur={50} />`. Higher = softer, lower = more defined.

---

## 5. Intensity presets

The welcome screen accepts an `intensity` prop: `'off' | 'low' | 'normal' | 'high'`. These live in **`src/features/welcome/types/welcome.ts`** under `INTENSITY_CONFIGS` and tune:

- `floatAmplitude` — how much the paw card bobs
- `ringPeriod` — time between scan rings
- `sparkleInterval` — time between sparkle fade-ins
- `shimmerInterval` — time between CTA shimmer sweeps

Tweak these numbers to rebalance the overall vibe without touching any component.

`simple` prop (boolean) is a separate master-switch: when `true` it skips background blobs, scan rings, and sparkles entirely — useful for low-end devices or reduced-motion preferences.

---

## Quick recipe: "add a sparkle above the paw card"

1. Open `paw-dust.tsx`.
2. The top of the card is around `y = CENTER - 70`. Pick a spot, e.g. `(CENTER + 10, CENTER - 90)`.
3. You need a free slot. If you want to *replace* one, just edit an existing entry's `x` / `y`. If you want to *add*, follow the "Adding a 5th sparkle" steps above.
4. Reload — that's it.

## Quick recipe: "make the halo bigger and softer"

1. Open `halo-pulse.tsx`.
2. Bump `OUTER_RADIUS` from `90` → `110`.
3. Bump `OUTER_BLUR` from `35` → `45`.
4. Reload.

## Quick recipe: "rings should pulse faster"

1. Open `hooks/use-idle-loops.ts`.
2. Find the `scanRing` loop. Reduce the `withTiming` duration (e.g. `4000` → `2500`).
3. Or: change `INTENSITY_CONFIGS[intensity].ringPeriod` in `types/welcome.ts` if you want it scoped to a preset.
