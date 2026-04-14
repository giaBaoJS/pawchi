## ADDED Requirements

### Requirement: detectBreed calls GPT-4o with a preprocessed image

The system SHALL call `POST https://api.openai.com/v1/chat/completions` with `model: "gpt-4o"`, a single user message containing an `image_url` block (`data:image/jpeg;base64,...`, `detail: "low"`) and a text block instructing the model to return ONLY valid JSON matching a fixed shape.

#### Scenario: Successful breed detection

- **WHEN** `detectBreed(base64)` is called with a valid image of a dog and the OpenAI API key is configured
- **THEN** the function SHALL send a request with `Authorization: Bearer <key>`
- **AND** SHALL parse the response content as JSON
- **AND** SHALL return an object of shape `{ has_dog: true, breed, confidence, body_size, coat_color, coat_pattern, temperament_keywords }`

### Requirement: JSON response parsing is resilient to markdown fences

The response parser SHALL strip triple-backtick fences (with or without a `json` language tag) before attempting `JSON.parse`, and SHALL throw `AIParseError` with the raw text (truncated to 100 chars) if parsing fails.

#### Scenario: Response wrapped in ```json ... ```

- **WHEN** the model returns its JSON inside a markdown code fence
- **THEN** the parser SHALL strip the fence and successfully parse the inner JSON

#### Scenario: Response is not valid JSON

- **WHEN** the model returns a non-JSON string (e.g. a natural-language refusal)
- **THEN** the parser SHALL throw `AIParseError` whose message contains the first 100 characters of the raw text

### Requirement: No-dog-found is a distinct error

If the parsed response has `has_dog === false`, `detectBreed` SHALL throw `DogNotFoundError` instead of returning a malformed result. Callers SHALL be able to distinguish this via `error instanceof DogNotFoundError`.

#### Scenario: Empty scene photo

- **WHEN** the model returns `{ "has_dog": false, ... }` for a photo with no dog
- **THEN** `detectBreed` SHALL throw `DogNotFoundError`
- **AND** the error SHALL NOT be retried by the retry helper

### Requirement: Network errors are retried with exponential backoff

Transient errors (network failures, 429, 5xx) SHALL be retried up to 2 additional times with delays of 1s and 2s. After the final retry, the last error SHALL be re-thrown to the caller.

#### Scenario: First call fails, second succeeds

- **WHEN** the first OpenAI call throws a network error
- **THEN** the retry helper SHALL wait 1 second and retry
- **AND** on success, the successful response SHALL be returned to the caller

#### Scenario: All retries fail

- **WHEN** the call and both retries all fail
- **THEN** the retry helper SHALL throw the last captured error
- **AND** the caller SHALL surface the error via the mutation's `error` state

### Requirement: API key sourcing precedence

The system SHALL resolve the OpenAI API key in this order: (1) `expo-secure-store` under the key `"openai_api_key"`, (2) `Constants.expoConfig?.extra?.openaiApiKey`. If neither is present, it SHALL throw `new Error('OpenAI API key not configured')` before making any network call.

#### Scenario: Key loaded from .env via app.config

- **WHEN** `OPENAI_API_KEY` is set in `.env`, wired through `app.config.ts` into `extra.openaiApiKey`, and no secure-store value exists
- **THEN** `getApiKey()` SHALL return the value from `Constants.expoConfig.extra.openaiApiKey`

#### Scenario: No key configured

- **WHEN** both secure-store and `extra.openaiApiKey` are absent
- **THEN** `getApiKey()` SHALL throw with message `"OpenAI API key not configured"`
- **AND** the caller SHALL surface this error to the UI without making a network request
