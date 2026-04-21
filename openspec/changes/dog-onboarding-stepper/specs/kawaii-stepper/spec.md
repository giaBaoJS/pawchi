## ADDED Requirements

### Requirement: Reusable animated stepper component
The system SHALL provide a `KawaiiStepper` component that renders a horizontal row of step circles connected by animated progress lines, driven by `steps` and `currentStep` props.

#### Scenario: Render with three steps at index 0
- **WHEN** `KawaiiStepper` is rendered with `steps.length === 3` and `currentStep === 0`
- **THEN** three circles are displayed in a horizontal row
- **AND** the first circle is in the active state
- **AND** the remaining two circles are in the upcoming state
- **AND** two connector segments are rendered between circles, both at 0% fill

#### Scenario: Advance current step
- **WHEN** `currentStep` prop changes from `0` to `1`
- **THEN** the first circle transitions to the completed state (green background, check icon)
- **AND** the second circle transitions to the active state with a spring-scaled bounce
- **AND** the first connector segment animates from 0% to 100% fill

### Requirement: Step visual states
The component SHALL render three distinct visual states per step: completed, active, upcoming.

#### Scenario: Completed step appearance
- **WHEN** a step's index is less than `currentStep` (or included in `completedSteps`)
- **THEN** its circle SHALL use the `--color-mood` (green) background token
- **AND** show the Ionicons `checkmark` icon in white

#### Scenario: Active step appearance
- **WHEN** a step's index equals `currentStep`
- **THEN** its circle SHALL be scaled to approximately 1.15× and use the `--color-primary` background token
- **AND** show the configured icon (default Ionicons `paw`) in white

#### Scenario: Upcoming step appearance
- **WHEN** a step's index is greater than `currentStep`
- **THEN** its circle SHALL use an overlay/soft background token with `--color-border-soft` border
- **AND** show the configured icon in `--color-foreground-secondary` at 1× scale

### Requirement: Animated transitions
All state changes SHALL animate on the UI thread using `react-native-reanimated` — no JS-driven animations, no Skia.

#### Scenario: Circle scale animation
- **WHEN** a step becomes active
- **THEN** its scale animates via `withSpring` with a subtle bounce (damping ~12, stiffness ~180)

#### Scenario: Connector fill animation
- **WHEN** a connector transitions between fill fractions
- **THEN** its filled inner view width animates via `withTiming` over ~420ms with ease-in-out cubic

#### Scenario: Icon swap animation
- **WHEN** a step transitions between upcoming/active and completed
- **THEN** the old icon cross-fades out while the new icon cross-fades in
- **AND** neither icon appears or disappears instantaneously

### Requirement: Configurable step data
The component SHALL accept a `steps` prop defining each step's `id`, `label`, and optional `icon` (Ionicons glyph name) or `renderIcon` escape hatch.

#### Scenario: Custom icon per step
- **WHEN** a step provides `icon: 'heart'`
- **THEN** that Ionicons glyph is rendered in place of the default paw for upcoming/active states
- **AND** completed state still overrides to the check icon

### Requirement: Theme token usage only
The component SHALL read all colors from existing CSS variables via `useCSSVariable` or Tailwind className tokens. It SHALL NOT hardcode hex values.

#### Scenario: No inline hex
- **WHEN** the component source is inspected
- **THEN** no `#RRGGBB` or `rgb()` literal appears outside `useCSSVariable` fallbacks
