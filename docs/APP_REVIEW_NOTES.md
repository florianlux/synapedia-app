# App Review Notizen

Use this copy as the basis for App Store Connect reviewer notes.

## Positioning

Synapedia is an educational reference app focused on psychoactive-substance risk awareness. It provides substance summaries, interaction risk context, recovery-oriented guides, and private local notes.

The app does not:

- diagnose, treat, prescribe, or provide individualized medical advice
- provide emergency response or monitoring
- encourage illegal substance use
- facilitate purchasing, selling, locating, or obtaining controlled substances
- provide dose optimization, recommended dose guidance, or prescription management
- use HealthKit, location tracking, advertising SDKs, or App Tracking Transparency

## Reviewer Test Flow

No account is required.

Suggested review steps:

1. Open Start and review the Sicherheit & Datenschutz screen.
2. Open MixCheck and choose a common pair such as `MDMA + LSD`.
3. Confirm that risk language is conservative and includes red-flag context.
4. Open Wiki and view a substance detail screen.
5. Open Guides and view a recovery guide.
6. Open Private Notizen and confirm notes are local and export is user-initiated.
7. Disable network and confirm local fallback content remains available.

## Content Boundary

Substance-related content is presented as educational risk context. The app intentionally uses uncertainty language such as "missing data does not mean safe" and highlights when professional or emergency help is appropriate.

## Backend Dependency

The app can use local curated fallback content. Live lookup requests may contact `https://synapedia.com` for Wiki, detail, guide, and MixCheck results. The API should be available during review.
