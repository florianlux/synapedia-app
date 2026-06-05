# Synapedia Mobile

Expo mobile app for Synapedia internal testing.

## Environment

The app uses the public read-only Synapedia mobile API. No API keys or secrets are required in the client.

```bash
EXPO_PUBLIC_SYNAPEDIA_API_URL=https://synapedia.com
```

Keep this value available in local `.env` files and EAS environment settings for release builds.

## Development

```bash
npm install
npx expo start
```

## Internal Builds

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

Production/TestFlight builds use:

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```
