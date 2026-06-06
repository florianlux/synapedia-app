# Mobile Alpha Smoke Test

Kurzcheck fuer die interne Android-Alpha mit Expo Go.

## Setup

- `npm install`, falls Dependencies fehlen.
- `npx expo start --go` im Ordner `synapedia-mobile` starten.
- Android-Geraet und Entwicklungsrechner ins gleiche WLAN bringen.
- QR-Code mit Expo Go oeffnen.

## Kernflows

- Home oeffnen und Hero, Schnellzugriff und Bottom Navigation pruefen.
- Wiki oeffnen.
- Erste Live-Katalog-Seite laden lassen.
- `Weitere laden` antippen und pruefen, dass neue Eintraege angehaengt werden.
- Suche testen: `MDMA`, `O-DSMT`, `Kratom`, `THC`.
- Ein Substance Detail oeffnen.
- Zuruecknavigation aus dem Detail pruefen.
- Tabs `Check`, `Log` und `Guides` oeffnen.
- WLAN am Android-Geraet kurz deaktivieren und pruefen, dass die App nicht crasht.
- Danach WLAN wieder aktivieren und Wiki/Detail erneut pruefen.

## Erwartete Fallbacks

- Bei Live-API-Fehlern bleiben lokale oder bereits geladene Daten sichtbar.
- Suche darf leer ausfallen, aber nicht crashen.
- Detailseiten zeigen Fallback-Texte, wenn Dauer, Risiken, Aliasse oder Summary fehlen.
- Fehlende Daten werden nicht als sicher dargestellt.

## Bekannte Einschraenkungen

- Synapedia Mobile ist keine medizinische Beratung.
- Die Dev-API kann stale, unvollstaendig oder kurzzeitig nicht erreichbar sein.
- Play Store Build und Store-Review sind nicht Ziel dieser Phase.
