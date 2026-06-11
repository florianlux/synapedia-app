# Android Preview APK Build

Diese Anleitung beschreibt eine installierbare interne Android-Preview-APK für Synapedia. Ziel ist Alpha-Testing mit echten Geräten, kein Play Store Release.

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

Der Wert ist in `eas.json` für `preview` und `production` gesetzt. Dev-Builds können lokal oder im LAN testen; Preview/Production duerfen nicht gegen localhost laufen.

## Preview APK bauen

```bash
eas build -p android --profile preview
```

Dieses Profil erzeugt eine interne Android-APK. Keinen Production- oder Play-Store-Upload für diese Phase starten.

## APK installieren und testen

- Nach erfolgreichem EAS Build den APK-Link aus der EAS-Ausgabe öffnen.
- APK auf einem Android-Testgeraet installieren.
- Installation aus unbekannten Quellen erlauben, falls Android danach fragt.

## Smoke-Test nach Installation

- Start öffnen.
- Wiki öffnen.
- Live-Katalog laden.
- `Weitere laden` antippen.
- Suche testen: `MDMA`, `O-DSMT`, `Kratom`, `THC`.
- Detail öffnen.
- Zurücknavigation prüfen.
- Tabs `Check`, `Log` und `Guides` öffnen.
- WLAN kurz deaktivieren und prüfen, dass die App nicht crasht.
- WLAN wieder aktivieren und Wiki/Detail erneut prüfen.

## Bekannte Einschraenkungen

- Interne Alpha, nicht für öffentliche Verteilung.
- Keine medizinische Beratung.
- API kann sich noch aendern oder kurzzeitig stale sein.
- Play Store Release ist noch nicht Ziel dieser Phase.
