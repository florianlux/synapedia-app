# Synapedia iOS TestFlight Readiness

Use this checklist before uploading the first iOS build to App Store Connect.

## Build Configuration

- Confirm `npx expo config --type public` resolves `ios.bundleIdentifier` as `com.synapedia.app`.
- Confirm `ios.buildNumber` is unique for the upload. Production EAS builds use `autoIncrement`.
- Confirm `EXPO_PUBLIC_API_BASE_URL=https://synapedia.com` is configured for the production EAS profile.
- Confirm App Store Connect has an app record for the bundle identifier before submitting.
- For non-interactive submit, set `submit.production.ios.ascAppId` in `eas.json` or provide it via EAS prompts.

## iOS Smoke Test

- Home opens in dark theme and the primary MixCheck CTA navigates to Check.
- Wiki opens with local curated substances before or during live sync.
- Wiki search works for `MDMA`, `Kokain`, `Ketamin`, and `LSD`.
- Substance detail opens from Wiki and shows source/fallback status.
- Substance detail back button returns to Wiki or falls back to the Wiki tab.
- MixCheck popular pairs populate both slots.
- MixCheck shows success for known local pairs such as `MDMA + LSD` and `Kokain + Alkohol`.
- MixCheck no-data states say missing data is not safety clearance.
- Guides list opens with local content if live data is unavailable.
- Guide detail loading/error/fallback states do not crash.
- Private Check-in persists entries locally after app restart.
- Private Check-in export/share is user-initiated only.
- Disable network and confirm Home, Wiki local data, Guides local data, and known MixCheck local pairs remain usable.

## App Store Review Notes

- Position as an informational harm-reduction tool, not medical diagnosis, treatment, emergency response, or professional advice.
- Use a conservative age rating because the app contains frequent references to drugs/substances and medical-adjacent safety context.
- Avoid marketing language that encourages substance use or implies combinations are safe.
- Privacy questionnaire should state that the current app code does not collect account, location, health, tracking, or analytics data.
- Local Private Check-in data is stored on-device and is only shared if the user explicitly exports it.
- Export compliance: `ITSAppUsesNonExemptEncryption` is set to `false`; the app uses standard platform/network encryption only.
