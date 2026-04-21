## ADDED Requirements

### Requirement: Animated Pastel Background

The welcome screen SHALL render a soft, pastel, living background built with Skia that breathes and drifts slowly behind all foreground content, using colors sourced from app theme tokens.

#### Scenario: Idle breathing background

- **WHEN** the welcome screen is mounted and fully entered
- **THEN** two or more Skia-rendered pastel blobs SHALL drift with slow, independent motion (cycle duration >= 6s) and gently scale/opacity-pulse to create a breathing feel
- **AND** blob colors MUST be resolved via `useCSSVariable` against theme tokens (never hardcoded hex)

#### Scenario: Background does not overpower content

- **WHEN** foreground elements are visible
- **THEN** the background SHALL remain at reduced opacity and blur such that title, paw card, pills, and CTA remain clearly legible

### Requirement: Scanner Core (Paw Card with Halo, Scan Ring, and Paw Dust)

The screen SHALL render a centered paw icon card that functions as a "magic scanner core" with a floating motion, a pulsing halo, a periodic scan ring, and rare sparkle particles.

#### Scenario: Paw card floats gently

- **WHEN** the welcome screen is idle
- **THEN** the paw card SHALL translate vertically in a smooth loop (amplitude small, duration >= 2.5s) driven by Reanimated shared values

#### Scenario: Halo pulses behind card

- **WHEN** the welcome screen is idle
- **THEN** a Skia radial-gradient halo SHALL pulse in opacity and/or radius behind the paw card on a slow loop

#### Scenario: Periodic scan ring radiates outward

- **WHEN** the welcome screen has completed entry animation
- **THEN** a soft airy ring SHALL emit from the paw card center every 4–6 seconds, expanding outward while fading to zero opacity
- **AND** the ring MUST be rendered with Skia (stroke + opacity animation), not a hard neon glow

#### Scenario: Rare paw-dust sparkles

- **WHEN** the screen is idle
- **THEN** small sparkle particles SHALL appear near the paw card on a low-frequency schedule (at most a few visible at once) and fade out softly
- **AND** particle count MUST be capped to preserve performance

### Requirement: Staggered Entry Animation

The screen SHALL present a cohesive staggered entry animation that introduces elements in a specific order with smooth timing.

#### Scenario: Entry order

- **WHEN** the welcome screen first mounts
- **THEN** elements SHALL animate in this order: (1) background fade, (2) paw card scale+fade, (3) halo settle, (4) "Pawchi" title, (5) subtitle, (6) three pill tags staggered, (7) primary CTA rise+fade, (8) secondary button
- **AND** timing between steps SHALL be smooth with no abrupt jumps and no overly playful bounce

#### Scenario: Pills stagger

- **WHEN** the pill row enters
- **THEN** each pill (Breed ID, Stats, Instant) SHALL animate with a small upward translate + fade, offset by 60–120ms per pill, settling via spring or smoothed timing

### Requirement: Primary CTA Shimmer and Press Feedback

The primary CTA "Scan my dog" SHALL feel inviting with a soft breathing presence, a periodic shimmer sweep, and a polished press animation.

#### Scenario: Periodic shimmer sweep

- **WHEN** the CTA is idle
- **THEN** a subtle highlight band SHALL sweep horizontally across the CTA every 4–8 seconds, rendered via Skia
- **AND** the shimmer MAY leave a very brief bone-shaped highlight trail, which MUST disappear within 250ms

#### Scenario: Press feedback

- **WHEN** the user presses the CTA
- **THEN** the CTA SHALL scale down slightly (approx 0.96) with a quick spring and trigger a light haptic via `expo-haptics`
- **AND** on release the CTA SHALL return to rest

### Requirement: Idle Animation Loop

The screen SHALL maintain a continuous, non-busy idle loop after entry completes.

#### Scenario: Idle composition

- **WHEN** the entry animation has finished
- **THEN** background drift, paw float, halo pulse, periodic scan ring, occasional CTA shimmer, and rare paw-dust sparkles SHALL continue indefinitely until unmount
- **AND** no individual effect SHALL run faster than its specified cadence so the overall screen reads as calm

### Requirement: Theme Token Sourcing

All colors used in the welcome screen (including Skia Paint colors, gradients, ring strokes, particles, shimmer) SHALL be resolved from CSS variables declared in `global.css` via `useCSSVariable` or via Uniwind className tokens.

#### Scenario: No inline hex colors

- **WHEN** reviewing the welcome feature source
- **THEN** no hex literal color constants SHALL exist in component or utility files
- **AND** every Skia color SHALL be produced by casting the result of `useCSSVariable('--color-…')` to string

### Requirement: Performance and Maintainability

The welcome screen SHALL run animations on the UI thread and expose configurable intensity/timing.

#### Scenario: UI-thread animation

- **WHEN** animations are running
- **THEN** all motion SHALL be driven by Reanimated shared values or Skia clocks, with no `Animated` (legacy) usage and no per-frame JS-thread work for rendering

#### Scenario: Configurable intensity

- **WHEN** a developer imports the welcome components
- **THEN** intensity/timing (particle density, ring cadence, float amplitude, shimmer interval) SHALL be tunable via component props with sensible defaults

### Requirement: Simplified Fallback Mode

The welcome screen SHALL support a simplified presentation that preserves a premium feel while disabling heavier Skia effects.

#### Scenario: Enable simple mode

- **WHEN** the welcome screen is rendered with a "simple" prop or an environment flag
- **THEN** background blobs, scan ring, and sparkle particles SHALL be disabled
- **AND** the staggered entry, paw float, halo pulse, and CTA press feedback SHALL still play
