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

Production builds use:

```bash
eas build --profile production --platform android
```
