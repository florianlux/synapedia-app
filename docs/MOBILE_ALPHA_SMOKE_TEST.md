# Synapedia Mobile Alpha v0.2 Smoke Test

Kurzcheck fuer Android und iOS Preview Builds. Ziel ist interne Alpha-Qualitaet: keine Crashes, klare Fallbacks, ruhiger Harm-Reduction-Ton.

## Setup

```bash
cd /Users/florianlux/Developer/synapedia_app_v1/synapedia-mobile
npm install
npm run typecheck
npm run lint
npx expo-doctor
npx expo start -- --port 8081 --localhost
```

`npm test` existiert aktuell nicht.

## Android Test

- Fuer Expo Go: `npm run android`
- Fuer installierbare interne APK: `eas build --platform android --profile preview`
- API-Basis fuer Preview: `EXPO_PUBLIC_API_BASE_URL=https://synapedia.com`

## iOS Test

- Lokaler Simulator/Expo Start: `npm run ios`
- Internes iOS Preview Build fuer Geraete: `eas build --platform ios --profile preview`
- Simulator-Build bei Bedarf: `eas build --platform ios --profile ios-simulator`

## Kernflows

- Home oeffnen: Hero, Quick Actions, Safety & Privacy, Bottom Navigation pruefen.
- Wiki oeffnen: kuratierte Profile sichtbar, Live-Katalog synchronisiert, SourceBadge plausibel.
- Wiki Search testen: `MDMA`, `O-DSMT`, `Kratom`, `THC`, leere Treffer.
- Substance Detail oeffnen: Hero, Quick Facts, Risiko, Risikokontext, Interaktionen und Related Actions pruefen.
- Check oeffnen: zwei Substanzen manuell waehlen und Popular Pair antippen.
- Check Ergebnis pruefen: Risikostufe, Mechanismen, Red Flags, Evidenz/Quelle, lokale/offline SourceBadge.
- Notes / Private Check-in oeffnen: Validierung, lokales Speichern, Loeschen mit Bestaetigung, CSV-Export pruefen.
- Guides oeffnen: Liste, Red-Flag-/Phasen-Pills, Detailseite, Red-Flag-Box und Related Actions pruefen.
- Safety & Privacy oeffnen: Scope, Privacy und API-Hinweise pruefen.

## Offline/Fallback

- Netzwerk am Geraet deaktivieren.
- Home darf nicht crashen.
- Wiki muss lokale Referenzdaten zeigen.
- Substance Detail muss lokale oder Route-Fallback-Daten zeigen.
- Check muss bekannte lokale Paare wie `MDMA + LSD` und `Kokain + Alkohol` anzeigen.
- Guides muessen lokale Inhalte zeigen.
- Notes muessen weiterhin lokal funktionieren.
- Netzwerk wieder aktivieren und Wiki/Check erneut testen.

## Bekannte Grenzen

- Educational reference only, keine medizinische Beratung und kein Notfalldienst.
- Backend-Logging/Retention muss fuer Privacy Labels separat verifiziert werden.
- API kann kurzzeitig stale oder nicht erreichbar sein; lokale Fallbacks sind Teil des Produkts.
- App Store Review und externe TestFlight-Metadaten sind eigene Readiness-Schritte.
