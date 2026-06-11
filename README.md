# Synapedia Mobile

Expo mobile app for Synapedia internal testing.

## Environment

The app uses the public read-only Synapedia mobile API. No API keys or secrets are required in the client.

```bash
EXPO_PUBLIC_API_BASE_URL=https://synapedia.com
```

Keep this value available in local `.env` files and EAS environment settings for release builds. The legacy `EXPO_PUBLIC_SYNAPEDIA_API_URL` name is still accepted, but `EXPO_PUBLIC_API_BASE_URL` takes precedence.

## Development

```bash
npm install
npx expo start
```

## Internal Builds

```bash
eas build --profile preview --platform android
```

iOS preview builds use:

```bash
eas build --profile preview --platform ios
```

iOS simulator builds use:

```bash
eas build --profile ios-simulator --platform ios
```

Production builds use:

```bash
eas build --profile production --platform android
```

## iOS TestFlight

The iOS app uses the Expo production profile for App Store/TestFlight binaries.

```bash
npm run typecheck
npm run lint
npx expo-doctor
npx expo config --type public
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production --latest
```

`ios.buildNumber` starts at `1` in `app.json`; the production EAS profile has `autoIncrement: true`.
Before the first non-interactive submit, add the App Store Connect app ID to `submit.production.ios.ascAppId`
or let EAS prompt interactively.

Review positioning:

- Synapedia is a harm-reduction information tool, not medical advice.
- App Store age rating should be conservative because the app contains frequent substance/drug-use references and safety/medical context.
- No camera, location, HealthKit, tracking, or account permissions are used in the current app.
- Private Check-in data is local to the device unless the user explicitly exports/shares it.
