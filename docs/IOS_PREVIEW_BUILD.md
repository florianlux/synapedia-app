# iOS Preview Build

Diese Anleitung beschreibt ein internes iOS Preview Build fuer echte Testgeraete. Ziel ist Alpha-v0.2-Testing, kein App Store Release.

## Voraussetzungen

- Node.js und npm
- Expo Account
- EAS CLI: `npm install -g eas-cli`
- Zugriff auf das Expo/EAS-Projekt
- Apple Developer Team mit interner Distribution ueber EAS Credentials

## Setup

```bash
cd /Users/florianlux/Developer/synapedia_app_v1/synapedia-mobile
npm install
eas login
```

Falls das Projekt auf einem neuen Rechner noch nicht mit EAS verbunden ist:

```bash
eas build:configure
```

## Environment

Preview Builds nutzen:

```bash
EXPO_PUBLIC_API_BASE_URL=https://synapedia.com
```

Der Wert ist in `eas.json` fuer `preview`, `ios-simulator` und `production` gesetzt. Keine API-Secrets in die App legen.

## Validierung Vor Build

```bash
npm run typecheck
npm run lint
npx expo-doctor
npx expo config --type public
```

`npm test` ist aktuell nicht definiert.

## iOS Preview Build Fuer Geraete

```bash
eas build --platform ios --profile preview
```

Das `preview`-Profil baut eine interne iOS-Distribution fuer Geraete. Es ist nicht fuer App Store Submission gedacht.

## iOS Simulator Build

```bash
eas build --platform ios --profile ios-simulator
```

## Nach Installation Testen

- Home und Safety & Privacy oeffnen.
- Wiki Search und Live-Katalog testen.
- Substance Detail oeffnen und zurueck navigieren.
- MixCheck mit Popular Pair und manueller Auswahl testen.
- Private Check-in lokal speichern, loeschen und CSV exportieren.
- Guides und Guide Detail testen.
- Netzwerk deaktivieren und lokale Fallbacks pruefen.

## Bekannte Grenzen

- No medical advice, no emergency service.
- Backend-Logging fuer Privacy Labels separat verifizieren.
- App Store Review Metadaten, Screenshots und Age Rating sind nicht durch den Preview Build abgedeckt.
