## ADDED Requirements

### Requirement: Bones wallet

The system SHALL maintain a single `bones` integer wallet. Bones SHALL only be modified via `creditBones(n)` and `debitBones(n)`. Debit SHALL fail when balance is insufficient.

#### Scenario: Credit from walk
- **WHEN** `creditBones(30)` is called and the current balance is 10
- **THEN** the new balance SHALL be 40

#### Scenario: Insufficient debit
- **WHEN** `debitBones(5)` is called and the balance is 2
- **THEN** the call SHALL return `{ ok: false, reason: 'insufficient' }` and the balance SHALL remain 2

### Requirement: EXP and level curve

The system SHALL maintain `exp` (integer) and derive `level` from a simple curve: `level = floor(sqrt(exp / 50)) + 1`. Every stat read SHALL expose `level`, `exp`, and `expToNextLevel`.

#### Scenario: First level-up
- **WHEN** EXP crosses from 49 to 50
- **THEN** level SHALL become 2
- **AND** a toast SHALL announce "Level up! Level 2"

#### Scenario: expToNextLevel derivation
- **WHEN** `exp = 75`
- **THEN** `level` SHALL be 2 and `expToNextLevel` SHALL be the integer EXP needed to reach level 3

### Requirement: Daily streak

The system SHALL maintain a `streakDays` counter that increments by 1 when the user opens the app on a calendar day adjacent to `lastOpenDay`, resets to 1 when a day is skipped, and holds when the app is opened multiple times on the same day.

#### Scenario: Second consecutive day
- **WHEN** `lastOpenDay` is yesterday and the user opens the app today
- **THEN** `streakDays` SHALL increment by 1

#### Scenario: Missed a day
- **WHEN** `lastOpenDay` is the day before yesterday and the user opens the app today
- **THEN** `streakDays` SHALL reset to 1

#### Scenario: Multiple opens same day
- **WHEN** `lastOpenDay` is today and the user opens the app again
- **THEN** `streakDays` SHALL NOT change

### Requirement: Single source of truth

All screens displaying "progression" numbers (bones, level, EXP, streak) SHALL read from the gamification capability — no duplicated state in other features.

#### Scenario: Walk completion updates the hub header
- **WHEN** a walk ends and credits bones + EXP
- **THEN** the home hub header SHALL re-render with the new bones and level without a manual refresh
