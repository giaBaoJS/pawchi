## ADDED Requirements

### Requirement: Welcome screen is the cold-start destination

The system SHALL route the user directly to the welcome screen on every cold start, without any onboarding gate, tab bar, or persisted "has seen onboarding" flag.

#### Scenario: Fresh install cold start

- **WHEN** the app launches with no prior state
- **THEN** the root router SHALL render the welcome screen at the `/` route
- **AND** no redirect SHALL occur to `/onboarding`, `/(tabs)`, or any other route

#### Scenario: Warm start after previous scan

- **WHEN** the user has completed a scan in a previous session and reopens the app
- **THEN** the root router SHALL still render the welcome screen
- **AND** no previous breed result SHALL be surfaced on the welcome screen

### Requirement: Welcome screen displays value prop and CTAs

The welcome screen SHALL display the app name, a one-sentence value proposition, a primary CTA labelled "Scan my dog" that navigates to the scan route, and a secondary CTA labelled "Skip for now" that navigates directly to the home route.

#### Scenario: Tap the primary CTA with API key present

- **WHEN** the user taps the "Scan my dog" button and `OPENAI_API_KEY` is configured
- **THEN** the app SHALL navigate to `/scan` via `router.push`

#### Scenario: Tap the primary CTA with API key missing

- **WHEN** the user taps the "Scan my dog" button and `OPENAI_API_KEY` is absent from `Constants.expoConfig?.extra`
- **THEN** the button SHALL be disabled
- **AND** an inline warning SHALL read "OpenAI API key not configured — add it to .env and rebuild"

#### Scenario: Tap the secondary CTA

- **WHEN** the user taps the "Skip for now" button
- **THEN** the app SHALL navigate to `/home` via `router.replace`

### Requirement: Welcome screen renders without pulling game/dog state

The welcome screen SHALL NOT import from `@features/game`, `@features/dog`, `@features/room`, `@features/wardrobe`, or call any TanStack Query hook that reads from the parked stores.

#### Scenario: Dependency check

- **WHEN** the welcome screen module is imported
- **THEN** its import graph SHALL NOT include `game-store`, `dog-store`, `room-store`, `wardrobe-store`, or any of the parked feature folders

### Requirement: Welcome screen renders a Skia ambient visual layer

The welcome screen SHALL render a non-interactive ambient visual layer behind the text and CTA, implemented with `@shopify/react-native-skia`. The layer SHALL be composed of three elements: an animated pastel gradient background, a radial glow behind the hero, and a small number of drifting particle sparkles. The layer SHALL be a separate component at `src/features/welcome/components/welcome-scene.tsx` and SHALL be absolutely positioned to fill the screen.

#### Scenario: Gradient background animates

- **WHEN** the welcome screen is visible
- **THEN** a full-bleed Skia `Canvas` SHALL render a gradient cycling through the kawaii palette (`#FFE4EC`, `#FFCBA4`, `#D8C8F6`)
- **AND** the gradient SHALL animate on a loop of 8–12 seconds
- **AND** the animation SHALL be driven by a Reanimated shared value on the UI thread, not a JS `setInterval`

#### Scenario: Hero glow is visible

- **WHEN** the welcome screen is visible
- **THEN** a soft radial glow SHALL be rendered behind the hero emoji / mascot position
- **AND** the glow SHALL use the primary pink tone (`#FFAFCC`) with low alpha (≤ 0.4)

#### Scenario: Sparkles drift upward

- **WHEN** the welcome screen is visible
- **THEN** no more than 10 particle sparkles SHALL be drawn on the canvas
- **AND** each sparkle SHALL drift upward and fade out on a loop via Reanimated shared values
- **AND** the total frame budget of the welcome scene SHALL remain at 60fps on iPhone 12 and newer

### Requirement: Welcome visual layer is pointer-transparent

The Skia visual layer SHALL NOT intercept taps. The welcome CTA and any other interactive element SHALL remain fully tappable even while the visual layer is rendering above them in z-order.

#### Scenario: CTA remains tappable

- **WHEN** the user taps the "Scan my dog" button
- **THEN** the tap SHALL reach the button handler regardless of the visual layer's render state
- **AND** no part of the Skia canvas SHALL swallow touch events (use `pointerEvents: 'none'` on the visual layer's wrapper)
