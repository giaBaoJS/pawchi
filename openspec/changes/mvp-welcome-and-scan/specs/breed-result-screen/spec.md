## ADDED Requirements

### Requirement: Result screen runs the breed detection mutation on mount

The result screen SHALL receive `base64` and `photoUri` as route params, wrap `detectBreed(base64)` in a `useMutation` from `@tanstack/react-query`, and trigger the mutation exactly once on mount.

#### Scenario: Mount with valid params

- **WHEN** the result screen mounts with both `base64` and `photoUri` params present
- **THEN** it SHALL call `mutate()` once
- **AND** SHALL NOT call it again on re-render

#### Scenario: Mutation in-flight

- **WHEN** the mutation is in its pending state
- **THEN** the result screen SHALL render a loading view with the user's photo visible and a "Analyzing your dog…" label
- **AND** SHALL NOT render the breed details

### Requirement: Result screen displays breed, confidence, body size, and coat color

On successful detection, the result screen SHALL display the breed name, confidence (as a percentage), body size, coat color, coat pattern, and the user's original photo.

#### Scenario: Successful result render

- **WHEN** the mutation resolves with a valid `BreedDetectionResult`
- **THEN** the screen SHALL render the breed name as a prominent heading
- **AND** SHALL render the confidence formatted as a whole-number percentage (e.g. "92% confident")
- **AND** SHALL render the body size as a label ("Small", "Medium", or "Large")
- **AND** SHALL render the coat color and pattern as text
- **AND** SHALL render the photo via `expo-image` with `contentFit: "cover"`

### Requirement: Result screen does not write to dog store

The result screen SHALL NOT call `useSetDogProfile`, `setDogProfile`, `useDogState`, or any mutation from `@features/dog/stores/dog-store`. The breed result SHALL be ephemeral for the lifetime of the screen.

#### Scenario: Dependency check

- **WHEN** the result screen module is imported
- **THEN** its import graph SHALL NOT include `dog-store`, `game-store`, or any personality/sprite module

### Requirement: Result screen handles the three error types distinctly

The result screen SHALL distinguish between `DogNotFoundError`, `AIParseError`, and generic `Error`, and render a matching error view for each with a "Try another photo" CTA that returns to the scan route.

#### Scenario: No dog in photo

- **WHEN** the mutation rejects with `DogNotFoundError`
- **THEN** the screen SHALL render a dog-specific empty state: "No dog found! Make sure your dog is clearly visible."
- **AND** SHALL render a "Try another photo" button that calls `router.replace('/scan')`

#### Scenario: Parse failure

- **WHEN** the mutation rejects with `AIParseError`
- **THEN** the screen SHALL render "AI response was invalid. Please try again."
- **AND** SHALL render a "Try another photo" button

#### Scenario: Network or unknown error

- **WHEN** the mutation rejects with a generic `Error`
- **THEN** the screen SHALL render the error's message (or "Something went wrong" if the message is empty)
- **AND** SHALL render a "Try another photo" button

### Requirement: Retake navigation replaces history

The "Try another photo" action and any explicit retake button SHALL use `router.replace('/scan')`, NOT `router.push`, so that the back stack does not accumulate stale result screens.

#### Scenario: Tap retake

- **WHEN** the user taps "Try another photo" on any result state (success or error)
- **THEN** the router SHALL call `router.replace('/scan')`
- **AND** on the next scan, pressing the system back button SHALL return to the welcome screen, not to the previous result
