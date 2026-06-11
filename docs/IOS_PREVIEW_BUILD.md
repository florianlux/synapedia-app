# iOS Preview- und Simulator-Build

Diese Anleitung beschreibt interne iOS Builds für Simulator und echte Testgeräte. Ziel ist MVP-Testing, kein App Store Release.

## Voraussetzungen

- Node.js und npm
- Expo Account
- EAS CLI: `npm install -g eas-cli`
- Zugriff auf das Expo/EAS-Projekt
- Apple Developer Team mit interner Distribution über EAS Credentials

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

Preview-Builds nutzen:

```bash
EXPO_PUBLIC_API_BASE_URL=https://synapedia.com
```

Der Wert ist in `eas.json` für `preview`, `ios-simulator` und `production` gesetzt. Keine API-Secrets in die App legen.

## Validierung vor Build

```bash
npm run typecheck
npm run lint
npx expo-doctor
npx expo config --type public
npx eas config --platform ios --profile preview --json
npx eas config --platform ios --profile ios-simulator --json
```

`npm test` ist aktuell nicht definiert.

## iOS Preview-Build Für Geräte

```bash
eas build --platform ios --profile preview
```

Das `preview`-Profil baut eine interne iOS-Distribution für Geräte. Es ist nicht für App Store Submission gedacht.
Ein echtes iPhone Preview-/TestFlight-Setup benötigt einen Apple Developer Account.

## iOS Simulator Build

```bash
eas build --platform ios --profile ios-simulator
```

Der Simulator Build läuft lokal auf einem Mac-Simulator und ist der nächste manuelle Test vor echter Geräteverteilung.

## Nach Installation Testen

- Start und Sicherheit & Datenschutz öffnen.
- Wiki Search und Live-Katalog testen.
- Substance Detail öffnen und zurück navigieren.
- MixCheck mit Popular Pair und manueller Auswahl testen.
- Private Notizen lokal speichern, löschen und CSV exportieren.
- Guides und Guide Detail testen.
- Prüfen, dass auf Start, Wiki, Check, Notizen, Guides, Guide Detail und Substance Detail keine Inhalte von der Bottom Tab Bar verdeckt werden.
- Netzwerk deaktivieren und lokale Fallbacks prüfen.

## Bekannte Grenzen

- Keine medizinische Beratung, keine Notfallversorgung.
- Backend-Logging für Privacy Labels separat verifizieren.
- App Store Review Metadaten, Screenshots und Age Rating sind nicht durch den Preview-Build abgedeckt.
