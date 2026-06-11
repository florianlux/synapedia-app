# App Privacy Notizen

These notes map the current mobile implementation to App Store Connect privacy labels. Backend logging must be verified before public App Store submission.

## Current App Code

Found in code:

- Local private notes via `@react-native-async-storage/async-storage`
- User-initiated CSV export via `expo-file-system` and `expo-sharing`
- API lookups to `https://synapedia.com`
- Browser opening support via `expo-web-browser`

Not found in code:

- account creation or login
- advertising SDKs
- analytics SDKs
- App Tracking Transparency / IDFA access
- HealthKit
- location APIs
- camera or microphone APIs
- contact access

## Likely Privacy Label Answers

- Tracking: No
- Contact Info: Not collected
- Identifiers: Not collected by app code; verify backend logs
- Diagnostics: Not collected by app code; verify build/runtime services
- Usage Data: Requires backend verification because searches and lookup/check requests contact `synapedia.com`
- User Content: Not collected by developer in app code; Private Notizen entries stay on-device unless the user exports them
- Health Data: Not collected by developer in app code; Private Notizen entries are local only
- Location Data: Not collected

## Backend Verification Required

Before external TestFlight or App Store submission, verify:

- whether API requests are logged
- whether search terms, substance slugs, or MixCheck pairs are retained
- whether IP addresses or user agents are retained
- whether logs are linked to device, account, or other identifiers
- retention period and deletion process

Do not claim "Data Not Collected" unless backend logs are confirmed to be either absent or outside Apple's collected-data definition for this app.
