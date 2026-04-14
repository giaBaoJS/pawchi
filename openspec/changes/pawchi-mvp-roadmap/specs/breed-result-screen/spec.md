## MODIFIED Requirements

### Requirement: Result screen does not write to dog store

The result screen SHALL display the ephemeral breed detection result. On the user's explicit "Continue" action, it SHALL hand the result to the `dog-profile` creation flow rather than writing directly to any store from within the screen. The breed result SHALL NOT be persisted automatically on mount.

#### Scenario: Automatic persistence is forbidden
- **WHEN** the mutation resolves successfully
- **THEN** the screen SHALL NOT call any persistence API in its `onSuccess` handler
- **AND** no dog profile SHALL exist in local storage until the user taps "Continue"

#### Scenario: Dependency check
- **WHEN** the result screen module is imported
- **THEN** its import graph SHALL NOT include `pet-state`, `gamification`, `daily-missions`, or `home-hub`

### Requirement: Result screen displays breed, confidence, body size, and coat color

On successful detection, the result screen SHALL display the breed name, confidence (as a percentage), body size, coat color, coat pattern, and the user's original photo, AND SHALL display a primary "Continue" CTA that routes to the `dog-profile` naming flow with the result in the navigation params.

#### Scenario: Successful result render
- **WHEN** the mutation resolves with a valid `BreedDetectionResult`
- **THEN** the screen SHALL render the breed name as a prominent heading
- **AND** SHALL render the confidence formatted as a whole-number percentage (e.g. "92% confident")
- **AND** SHALL render the body size as a label ("Small", "Medium", or "Large")
- **AND** SHALL render the coat color and pattern as text
- **AND** SHALL render the photo via `expo-image` with `contentFit: "cover"`
- **AND** SHALL render a primary "Continue" button

#### Scenario: Continue routes to naming flow
- **WHEN** the user taps "Continue" on a successful result
- **THEN** the router SHALL navigate to the dog-profile naming screen with `breed`, `bodySize`, `coatColor`, `coatPattern`, and `photoUri` as params
- **AND** the result screen SHALL be removed from the back stack via `router.replace`
