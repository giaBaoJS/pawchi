## ADDED Requirements

### Requirement: Map breed to a curated sprite

The system SHALL map a breed-detection result to a deterministic `avatarId` pointing at a curated 2D kawaii sprite bundled with the app. The mapping SHALL never fail: unknown breeds SHALL fall back to a generic "mixed" sprite of the detected body size.

#### Scenario: Known breed
- **WHEN** the breed result is "Shiba Inu"
- **THEN** `resolveAvatar(result)` SHALL return the `shiba-inu` avatarId
- **AND** the sprite SHALL render at the home hub within one frame of mount

#### Scenario: Unknown breed
- **WHEN** the breed result is a breed not in the sprite library
- **THEN** `resolveAvatar(result)` SHALL return a generic sprite matching the detected `bodySize` (small/medium/large)
- **AND** the returned avatarId SHALL be stable across calls with the same input

### Requirement: Avatar renders without network

The avatar rendering component SHALL work fully offline. All sprites SHALL be bundled into the app binary via `require()` so there is no runtime download.

#### Scenario: Airplane mode
- **WHEN** the device is offline and the home hub mounts
- **THEN** the dog sprite SHALL render without error

### Requirement: Avatar has idle animation

The avatar SHALL play a subtle idle animation (breathing or bounce) driven by Reanimated shared values. The animation SHALL NOT block the JS thread and SHALL NOT require Skia.

#### Scenario: Home hub visible
- **WHEN** the home hub is the active screen
- **THEN** the dog sprite SHALL continuously play its idle animation on the UI thread
