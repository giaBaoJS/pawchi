## ADDED Requirements

### Requirement: Multi-step dog onboarding in a single screen
The system SHALL collect Name, DOB, and Gender across three in-screen steps rendered inside `name-dog-screen.tsx` — without introducing new routes.

#### Scenario: Initial render shows step 1
- **WHEN** the user arrives at `name-dog-screen` from the scan result
- **THEN** the `KawaiiStepper` SHALL render at the top of the screen with `currentStep === 0`
- **AND** the body SHALL show the dog-name text input
- **AND** the primary action label SHALL be "Next"

#### Scenario: Advancing steps
- **WHEN** the user taps "Next" with a valid name entered
- **THEN** `currentStep` advances to 1 and the body shows the DOB picker
- **AND** tapping "Next" again advances to step 2 (Gender)
- **AND** on step 2 the primary action SHALL be labeled "Save"

#### Scenario: Back navigation within the flow
- **WHEN** the user taps Back on step 1 or step 2
- **THEN** `currentStep` decrements by 1 without leaving the screen
- **AND** previously entered values are preserved

#### Scenario: Back navigation on first step
- **WHEN** the user taps Back on step 0
- **THEN** the router navigates back to the scan result

### Requirement: Step validation
Each step SHALL validate its own input before allowing advance to the next step.

#### Scenario: Name step validation
- **WHEN** the trimmed name is empty or longer than 20 characters
- **THEN** the "Next" button is disabled

#### Scenario: DOB step validation
- **WHEN** no DOB has been selected
- **THEN** the "Next" button is disabled

#### Scenario: Gender step validation
- **WHEN** no gender option is selected
- **THEN** the "Save" button is disabled

### Requirement: Extended dog profile data
The `DogProfile` type SHALL include `dob: number` (milliseconds epoch) and `gender: 'male' | 'female'`, and these fields SHALL be persisted when the onboarding flow is saved.

#### Scenario: Save commits full profile
- **WHEN** the user taps Save on the final step with all fields valid
- **THEN** the profile saved to `useDogProfileStore` SHALL include `name`, `dob`, and `gender`
- **AND** the router SHALL dismiss the scan stack and replace with `/home`

### Requirement: Replace-profile confirmation preserved
When an existing profile is present, saving a new one SHALL still prompt for confirmation.

#### Scenario: Replace prompt on save
- **WHEN** `existingProfile` is non-null and the user taps Save on the final step
- **THEN** the replace confirmation dialog SHALL open
- **AND** confirming replaces the profile and proceeds to `/home`
- **AND** cancelling dismisses the dialog without losing step data
