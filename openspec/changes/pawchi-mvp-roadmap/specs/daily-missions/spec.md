## ADDED Requirements

### Requirement: Daily mission set

The system SHALL present exactly three daily missions each day, drawn from a fixed catalog for MVP:

1. Walk for at least 10 minutes
2. Feed the dog 2 times
3. Open the app (freebie — rewards a streak, always completes on first open)

Each mission SHALL have a `title`, `targetValue`, `reward` (bones + EXP), and a `progress` value that is computed from gameplay events.

#### Scenario: Open the home hub
- **WHEN** the home hub mounts on a new local day
- **THEN** the system SHALL render exactly three mission cards with progress bars
- **AND** mission #3 ("Open the app") SHALL already be marked complete

### Requirement: Daily reset at local midnight

The system SHALL reset mission progress when the local calendar date changes. Completed missions from yesterday SHALL NOT carry over. Missions SHALL reset lazily on first read of a new day, not via a background timer.

#### Scenario: User opens app on a new day
- **WHEN** yesterday had "Feed 2 times" at `2/2` complete and the user opens the app the next day
- **THEN** today's "Feed 2 times" mission SHALL show `0/2` progress

### Requirement: Mission rewards are claim-on-complete

When a mission transitions from in-progress to complete, the system SHALL automatically pay out its reward via `gamification`. The user SHALL see a toast "Mission complete! +X bones, +Y EXP".

#### Scenario: Walk crosses the 10-minute threshold
- **WHEN** a walk ends with duration ≥ 10 minutes and the mission was not yet complete
- **THEN** the mission SHALL flip to complete
- **AND** a toast SHALL announce the reward
- **AND** `gamification` SHALL receive the bones and EXP delta exactly once

### Requirement: Mission state is persisted

Mission progress and completion state SHALL be persisted to local storage so closing and reopening the app within the same day preserves progress.

#### Scenario: App restart mid-day
- **WHEN** the user has walked 5 minutes toward the walk mission and restarts the app
- **THEN** on reopen the mission SHALL still show 5/10 minutes of progress
