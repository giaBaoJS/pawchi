## ADDED Requirements

### Requirement: Create dog profile from scan result

The system SHALL turn a successful breed-detection result into a persisted dog profile containing at minimum: `id`, `name`, `breed`, `bodySize`, `coatColor`, `avatarId`, `photoUri`, `createdAt`. The profile SHALL be created only after the user confirms a name.

#### Scenario: User names their dog after a successful scan
- **WHEN** the breed result screen shows a detected breed and the user taps "Continue"
- **THEN** the system SHALL navigate to a "Name your dog" screen with the breed and photo visible
- **AND** the "Save" button SHALL be disabled until the name is between 1 and 20 characters

#### Scenario: User saves the profile
- **WHEN** the user enters a valid name and taps "Save"
- **THEN** the system SHALL persist a dog profile with a generated `id`, the entered name, the breed result, and an `avatarId` chosen by the `dog-avatar` capability
- **AND** the system SHALL navigate to the home hub

### Requirement: Single-active-dog invariant

The MVP SHALL support exactly one active dog profile per device. Creating a new profile when one already exists SHALL overwrite the previous profile after an explicit confirmation.

#### Scenario: Second scan while a profile exists
- **WHEN** a profile already exists and the user completes another successful scan
- **THEN** the system SHALL show a confirmation dialog "Replace <old name> with the new dog?"
- **AND** proceeding SHALL overwrite the profile and reset stats to defaults

### Requirement: Read the active profile

The system SHALL expose a synchronous read of the active profile so the router and home hub can branch on "has profile?" without a loading state on cold start.

#### Scenario: Cold start with a saved profile
- **WHEN** the app launches and a profile exists in local storage
- **THEN** the router SHALL skip the welcome screen and navigate to the home hub
- **AND** the home hub SHALL render the dog immediately without a spinner

#### Scenario: Cold start with no profile
- **WHEN** the app launches and no profile exists
- **THEN** the router SHALL show the welcome screen
