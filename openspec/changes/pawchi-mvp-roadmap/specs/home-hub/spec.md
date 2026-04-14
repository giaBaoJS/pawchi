## ADDED Requirements

### Requirement: Home hub composition

The system SHALL render a single scrollable home hub screen at `app/home.tsx` (or `app/(tabs)/index.tsx` if tabs are revived). It SHALL compose the following sections top-to-bottom:

1. Header: dog name, level, EXP progress bar, bones balance, streak flame
2. Stage: animated dog avatar with mood emotion
3. Stat bars: hunger, happiness, energy (three horizontal bars with labels and values)
4. Primary actions: `Walk` and `Feed` CTAs side-by-side
5. Mission list: three daily mission cards with progress bars

No other features (tabs, profile editing, settings) SHALL be reachable from the MVP hub.

#### Scenario: Hub mount with a saved profile
- **WHEN** the hub mounts and a profile exists
- **THEN** the header, stage, stat bars, action row, and mission list SHALL all render in the correct order
- **AND** the screen SHALL not display any loading spinner

### Requirement: Hub is the post-onboarding root

The system SHALL route users with a saved profile directly to the home hub on app launch. Users with no profile SHALL see the welcome screen.

#### Scenario: Returning user
- **WHEN** the app launches and a profile exists
- **THEN** the first rendered screen SHALL be the home hub, not the welcome screen

### Requirement: Actions respect their feature's disabled states

Walk and Feed CTAs SHALL reflect the state exposed by their respective features: feed disabled during cooldown or when bones are insufficient, walk disabled when a session is already in progress.

#### Scenario: Feed during cooldown
- **WHEN** the feeding cooldown is active
- **THEN** the Feed CTA SHALL be visually disabled and show the remaining time

### Requirement: Stat bars reflect live pet state

Stat bars SHALL subscribe to `pet-state` and re-render when values change. Bars SHALL use distinct colors per stat (hunger: orange, happiness: pink, energy: blue) and show both a numeric value and a visual fill.

#### Scenario: Feed animation updates bars
- **WHEN** the user feeds the dog
- **THEN** the hunger and happiness bars SHALL animate to their new values within 500ms
