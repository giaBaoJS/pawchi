## ADDED Requirements

### Requirement: Feed action with cooldown

The system SHALL allow the user to feed the dog from the home hub. Each feed SHALL cost bones and be subject to a cooldown so the user cannot spam-feed.

- Cost: `5 bones` per feed
- Cooldown: `30 minutes` between feeds
- Effect: `hunger +30`, `happiness +10`

#### Scenario: Normal feed
- **WHEN** the user taps "Feed" with sufficient bones and no cooldown active
- **THEN** the system SHALL deduct 5 bones, emit a feeding event to `pet-state`, play a short animation, and start a 30-minute cooldown

#### Scenario: Cooldown active
- **WHEN** the user taps "Feed" within 30 minutes of the previous feed
- **THEN** the button SHALL be disabled and show the remaining time
- **AND** no bones SHALL be deducted

#### Scenario: Insufficient bones
- **WHEN** the user taps "Feed" with fewer than 5 bones
- **THEN** the button SHALL be disabled and show "Not enough bones — try a walk!"

### Requirement: Feeding logs count toward missions

Every successful feed SHALL emit a `{ type: 'fed', at: ISO }` event that the `daily-missions` capability can subscribe to. The event SHALL be persisted for the current day so missions survive app restarts.

#### Scenario: Feed twice, mission complete
- **WHEN** the "Feed 2 times" mission is active and the user feeds twice
- **THEN** the mission progress SHALL be `2/2` and the mission SHALL be marked complete
