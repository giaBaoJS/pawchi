## ADDED Requirements

### Requirement: Start and end a walk session

The system SHALL allow the user to start a walk, run it in the foreground, and end it explicitly. A session SHALL record `startedAt`, `endedAt`, `durationSeconds`, and optional `distanceMeters`.

#### Scenario: Happy path
- **WHEN** the user taps "Start Walk" on the home hub
- **THEN** the system SHALL navigate to a full-screen walk timer showing elapsed time
- **AND** tapping "End Walk" SHALL stop the timer and navigate to a summary screen

#### Scenario: Minimum session length
- **WHEN** a session ends with `durationSeconds < 60`
- **THEN** the system SHALL show "Walks under 1 minute don't count — keep going!" and discard the session without paying rewards

### Requirement: Duration-based reward payout

On ending a valid walk, the system SHALL pay out bones and EXP proportional to duration. MVP formula: `bones = floor(durationMinutes * 2)`, `exp = floor(durationMinutes * 5)`, capped at `durationMinutes <= 60` per session to prevent grinding.

#### Scenario: 15-minute walk
- **WHEN** the user completes a 15-minute walk
- **THEN** the summary screen SHALL show `+30 bones` and `+75 EXP`
- **AND** those rewards SHALL be persisted via the `gamification` capability

### Requirement: Optional GPS distance

The system SHALL attempt to record distance via `expo-location` when the user has granted foreground location permission. If permission is absent, the walk SHALL still work in "duration-only" mode without errors or prompts mid-walk.

#### Scenario: No location permission
- **WHEN** the user starts a walk without granting location permission
- **THEN** the timer SHALL run normally and the summary SHALL hide the distance row
- **AND** no error banner SHALL be shown

#### Scenario: With location permission
- **WHEN** location permission is granted at walk start
- **THEN** the system SHALL sample the user's position while foreground and display accumulated distance in the timer

### Requirement: Walk cannot run in background

MVP scope: the walk SHALL require the app to remain in the foreground. If the app is backgrounded for more than 60 seconds during a walk, the system SHALL auto-end the walk using the last known duration.

#### Scenario: User backgrounds the app mid-walk
- **WHEN** the user backgrounds the app for 2 minutes during an active walk
- **THEN** on return the walk SHALL already be ended at the moment of backgrounding
- **AND** the summary screen SHALL show the reward for the partial duration
