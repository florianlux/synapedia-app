# Android Preview APK Build

Diese Anleitung beschreibt eine installierbare interne Android-Preview-APK fuer Synapedia. Ziel ist Alpha-Testing mit echten Geraeten, kein Play Store Release.

## Voraussetzungen

- Node.js und npm
- Expo Account
- EAS CLI: `npm install -g eas-cli`
- Zugriff auf das Expo/EAS-Projekt

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

Preview und Production Builds nutzen standardmaessig:

```bash
EXPO_PUBLIC_API_BASE_URL=https://synapedia.com
```

Der Wert ist in `eas.json` fuer `preview` und `production` gesetzt. Dev-Builds koennen lokal oder im LAN testen; Preview/Production duerfen nicht gegen localhost laufen.

## Preview APK bauen

```bash
eas build -p android --profile preview
```

Dieses Profil erzeugt eine interne Android-APK. Keinen Production- oder Play-Store-Upload fuer diese Phase starten.

## APK installieren und testen

- Nach erfolgreichem EAS Build den APK-Link aus der EAS-Ausgabe oeffnen.
- APK auf einem Android-Testgeraet installieren.
- Installation aus unbekannten Quellen erlauben, falls Android danach fragt.

## Smoke-Test nach Installation

- Home oeffnen.
- Wiki oeffnen.
- Live-Katalog laden.
- `Weitere laden` antippen.
- Suche testen: `MDMA`, `O-DSMT`, `Kratom`, `THC`.
- Detail oeffnen.
- Zuruecknavigation pruefen.
- Tabs `Check`, `Log` und `Guides` oeffnen.
- WLAN kurz deaktivieren und pruefen, dass die App nicht crasht.
- WLAN wieder aktivieren und Wiki/Detail erneut pruefen.

## Bekannte Einschraenkungen

- Interne Alpha, nicht fuer oeffentliche Verteilung.
- Keine medizinische Beratung.
- API kann sich noch aendern oder kurzzeitig stale sein.
- Play Store Release ist noch nicht Ziel dieser Phase.
