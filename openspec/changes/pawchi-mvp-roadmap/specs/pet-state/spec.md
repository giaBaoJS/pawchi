## ADDED Requirements

### Requirement: Three-stat model

The system SHALL represent pet state as three integers in `[0, 100]`: `hunger`, `happiness`, `energy`. Values SHALL be clamped on every write.

#### Scenario: Out-of-range write
- **WHEN** an action attempts to set `happiness` to 120
- **THEN** the stored value SHALL be 100

### Requirement: Time-based decay

The system SHALL decay each stat over real time. Decay SHALL be computed lazily on read from `lastUpdatedAt` so the app does not need a background timer and works after a cold start.

- `hunger`: decreases by 10 per hour (from 100 toward 0)
- `happiness`: decreases by 5 per hour
- `energy`: decreases by 5 per hour when awake, regenerates +10 per hour when `isSleeping` is true

#### Scenario: Reopening the app after 3 hours
- **WHEN** the user closes the app with `hunger: 80` and reopens it 3 hours later
- **THEN** the displayed `hunger` SHALL be 50
- **AND** `lastUpdatedAt` SHALL be rewritten to now

#### Scenario: Stat cannot go below zero
- **WHEN** decay math produces a negative value
- **THEN** the stored value SHALL be 0

### Requirement: Event-driven stat updates

The system SHALL apply stat deltas in response to gameplay events emitted by other capabilities (feeding, walking). All deltas SHALL go through a single `applyPetStateEvent()` entry point so every write clamps, persists, and notifies subscribers.

#### Scenario: Feeding event
- **WHEN** `feeding-action` emits `{ type: 'fed', hunger: +30, happiness: +10 }`
- **THEN** `applyPetStateEvent` SHALL clamp and persist the new values and notify React subscribers

### Requirement: Mood derivation

The system SHALL derive a mood label (`"happy" | "content" | "neutral" | "sad" | "hungry"`) from the three stats. The home hub SHALL use this label to pick the avatar emotion.

#### Scenario: Very hungry
- **WHEN** `hunger < 20`
- **THEN** mood SHALL be `"hungry"` regardless of other stats
