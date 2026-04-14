## ADDED Requirements

### Requirement: Scan screen offers both camera capture and gallery pick

The scan screen SHALL present an active camera viewfinder (using `react-native-vision-camera`) with a capture shutter button, and SHALL also expose a gallery button that launches `expo-image-picker` to pick from the photo library.

#### Scenario: Capture via camera

- **WHEN** the user taps the shutter button with camera permission granted
- **THEN** the app SHALL call `camera.takePhoto({ flash: 'off' })`
- **AND** the app SHALL preprocess the resulting file into base64 under 400KB via `preprocessImage()`
- **AND** the app SHALL navigate to `/result` with `{ base64, photoUri }` as route params

#### Scenario: Pick from gallery

- **WHEN** the user taps the gallery icon
- **THEN** the app SHALL call `ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 1 })`
- **AND** on a non-cancelled result, the app SHALL preprocess the picked image via `preprocessImage()`
- **AND** the app SHALL navigate to `/result` with `{ base64, photoUri }` as route params

#### Scenario: Cancel the gallery picker

- **WHEN** the user opens the gallery picker and cancels
- **THEN** the app SHALL remain on the scan screen
- **AND** no navigation SHALL occur

### Requirement: Camera permissions are requested lazily

The scan screen SHALL check camera permission on mount and request it only if not already granted. No permission request SHALL occur outside the scan screen.

#### Scenario: Permission not yet requested

- **WHEN** the user arrives at the scan screen for the first time and `hasPermission` is `false`
- **THEN** the scan screen SHALL render a "Camera access needed" view with an "Allow Camera" button
- **AND** tapping "Allow Camera" SHALL call `requestPermission()`

#### Scenario: Permission permanently denied

- **WHEN** the user has previously denied camera permission and iOS will not re-prompt
- **THEN** the scan screen SHALL render an "Open Settings" button that calls `Linking.openSettings()`

### Requirement: Image preprocessing before upload

The app SHALL preprocess every captured or picked photo by resizing and compressing it (via `expo-image-manipulator`) so the resulting base64 payload is less than 400KB before it is sent to OpenAI.

#### Scenario: Quality step-down on oversized image

- **WHEN** an image preprocessed at quality 0.85 exceeds 400KB
- **THEN** the preprocessor SHALL retry at quality 0.75
- **AND** if still oversized, SHALL retry at quality 0.65
- **AND** SHALL return the first result that fits

#### Scenario: Preprocessing returns uri and base64

- **WHEN** preprocessing completes
- **THEN** the returned object SHALL contain `{ base64, uri }` where `uri` is a local file path suitable for `<Image source={{ uri }} />`
