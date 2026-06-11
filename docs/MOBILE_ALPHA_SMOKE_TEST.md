# Synapedia Mobile MVP Smoke Test

Kurzcheck für Android, iOS Simulator und iOS Preview-Builds. Ziel ist MVP-Qualität: klare Startlogik, keine Tabbar-Überdeckung, stabile Fallbacks und ruhiger Harm-Reduction-Ton.

## Setup

```bash
cd /Users/florianlux/Developer/synapedia_app_v1/synapedia-mobile
npm install
npm run typecheck
npm run lint
npx expo-doctor
npx expo config --type public
npx eas config --platform ios --profile preview --json
npx eas config --platform ios --profile ios-simulator --json
npx expo start -- --port 8081 --localhost
```

`npm test` existiert aktuell nicht.

## Android Test

- Für Expo Go: `npm run android`
- Für installierbare interne APK: `eas build --platform android --profile preview`
- API-Basis für Preview: `EXPO_PUBLIC_API_BASE_URL=https://synapedia.com`

## iOS Test

- Lokaler Simulator/Expo Start: `npm run ios`
- Internes iOS Preview-Build für Geräte: `eas build --platform ios --profile preview`
- Simulator-Build bei Bedarf: `eas build --platform ios --profile ios-simulator`

## Kernflows

- Start öffnen: Nutzen nach wenigen Sekunden klar, MixCheck CTA sichtbar, keine Tabbar-Überdeckung.
- MixCheck öffnen: Substanz A/B wählen, Ergebnis anzeigen, Red Flags und Quelle prüfen.
- Wiki öffnen: Suche nutzen, kuratierte Profile sichtbar, Live-Katalog synchronisiert, SourceBadge plausibel.
- Wiki Search testen: `MDMA`, `O-DSMT`, `Kratom`, `THC`, leere Treffer.
- Substance Detail öffnen: Kurzüberblick, Risiken, MixCheck-Aktion, Guides-Aktion, Quellenhinweis prüfen.
- Guides öffnen: Liste, Red-Flag-/Phasen-Pills, Detailseite, Red-Flag-Box und Related Actions prüfen.
- Guide Detail öffnen: MixCheck öffnen, Wiki öffnen, private Notiz erstellen.
- Private Notizen öffnen: Validierung, lokales Speichern, Löschen mit Bestätigung, CSV-Export prüfen.
- Sicherheit & Datenschutz öffnen: Scope, Privacy und API-Hinweise prüfen.
- Letzten Inhalt auf allen Tabs prüfen: nichts darf hinter der Bottom Tab Bar verschwinden.

## Offline/Fallback

- Netzwerk am Gerät deaktivieren.
- Start darf nicht crashen.
- Wiki muss lokale Referenzdaten zeigen.
- Substance Detail muss lokale oder Route-Fallback-Daten zeigen.
- Check muss bekannte lokale Paare wie `MDMA + LSD` und `Kokain + Alkohol` anzeigen.
- Guides müssen lokale Inhalte zeigen.
- Notizen müssen weiterhin lokal funktionieren.
- Netzwerk wieder aktivieren und Wiki/Check erneut testen.

## Bekannte Grenzen

- Nur Wissens- und Harm-Reduction-Kontext, keine medizinische Beratung und keine Notfallversorgung.
- Backend-Logging/Retention muss für Privacy Labels separat verifiziert werden.
- API kann kurzzeitig stale oder nicht erreichbar sein; lokale Fallbacks sind Teil des Produkts.
- App Store Review und externe TestFlight-Metadaten sind eigene Readiness-Schritte.
