# CASIO fx-9860GII × ESP32-C3 SuperMini — 1:1 Interaktive 3D-Bauanleitung

Interaktive, anfängerfreundliche 3D-Bauanleitungs-Web-App (auf Deutsch) für den unsichtbaren Hardware-Umbau eines realen **CASIO fx-9860GII (USB Power Graphic 2, Platinen-Revision `CY802-1` + `GY493-E4W`)** mit einem **ESP32-C3 SuperMini**, um per WLAN über HTTPS Fragen an die **Google Gemini API** zu senden und die Antworten auf dem originalen **128 × 64 Monochrom-LCD** anzuzeigen.

## 1:1 Hardware-Abgleich nach echtem Teardown

- **Zweistufiger Platinen-Aufbau (`1 Three.js-Einheit = 1 mm`):**
  - **Obere CPU-Platine (`CY802-1 / RJA532593-001V01`):** Sitzt ~6 mm erhöht auf dem gestanzten Stahl-Displayrahmen (inkl. seitlicher Schraublaschen). Oben **links** die 2,5-mm-Buchse **`CN401`** samt den quadratischen Gold-Prüfpads und den rot/weißen Backlight-Drähten **`P902`**, mittig das braune Polyimid-Displaykabel **`S30FE02`**, oben **rechts** die Mini-USB-Buchse **`CN102`**, darunter die beiden abgerundet-quadratischen COBs (`U101`, `U301`), der nichtflüchtige **Macronix NOR-Flash-Chip (`MXIC`, Markierung „9A“ — kein CR2032 nötig!)**, der blaue liegende Elko **`C302`** und rechts das fest verlötete weiße 21-polige Verbindungs-Flachbandkabel **`JN701`**.
  - **Untere Tastenplatine (`GY493-E4W / RJA520455-001V02`):** Liegt 6 mm tiefer hinter der Tastaturmatte, mit allen weißen Siebdruck-Abstandsfeldern, den 19 goldenen Testpunkten **`T701`–`T719`** sowie rechts den beiden direkt aufgelöteten Batteriefedern **`P702` (`−V_BAT` Kegelfeder / Pad `T702`)** und **`P701` (`+V_BAT` Spiralfeder / Pad `T701`)** für die **4 querliegenden AAA-NiMH-Zellen**.
- **Angepasster Einbauplan in der 6-mm-Stufen-Nische:**
  - **ESP32-C3 SuperMini (`22,5 × 18,0 mm`):** Liegt flach über einer Lage **Kapton-Band** (zum Schutz der Tasten-Testpunkte `T703–T719`) links im 6-mm-Stufengraben zwischen CPU-Platine und Batteriewanne; die **rote Keramik-WLAN-Antenne** zeigt frei zur **linken ABS-Außenwand**.
  - **Kurze linke UART-Führung:** Direkt von `CN401` (oben links) entlang der linken Platinenkante über `R2`/`R3` (`1 kΩ`) zu `GPIO20`/`GPIO21` — komplett fernab vom gelöteten weißen FFC `JN701`.
  - **Magnet-Reedschalter `SW1`:** Sitzt im freien linken Seitenkanal neben den querliegenden AAA-Akkus.
- **Integrierter Original-Foto-Abgleich:** Über den Button **„Original-Fotos“** in der oberen Leiste lassen sich die realen Teardown-Fotos direkt mit dem 3D-Modell vergleichen.

## Schaltplan-Übersicht (8 Verbindungen)

| # | Leitung | Farbe | Reale Verbindung (`CY802-1` / `GY493-E4W`) |
|---|---------|-------|---------------------------------------------|
| 1 | TX-Daten | Blau | `CN401` TIP-Goldpad (oben links) → `R2 (1 kΩ)` → ESP32 `GPIO20 (RX)` |
| 2 | RX-Daten | Grün | `CN401` RING-Goldpad `Y` (oben links) → `R3 (1 kΩ)` → ESP32 `GPIO21 (TX)` |
| 3 | Daten-Masse | Schwarz | `CN401` SLEEVE-Massepad → innen um Stufe → ESP32 `GND` |
| 4 | Batterie-Masse | Schwarz | Tastenplatine Pad `T702` / Feder `P702` (`−V_BAT`) → ESP32 `GND` |
| 5 | Batterie-Plus | Rot | Tastenplatine Pad `T701` / Feder `P701` (`+V_BAT`) → `AO3401 Pin 2 (Source)` |
| 6 | Gate-Steuerung | Gelb/Orange | `AO3401 Source` → `R1 (10 kΩ)` → `AO3401 Gate` → `SW1` (linker Kanal) → `GND` |
| 7 | Geschaltetes 5V | Rot-Orange | `AO3401 Pin 3 (Drain)` → `D1 (1N4007, Silberring links zum ESP)` → ESP32 `5V` |
| 8 | Puffer-Elko | Rot/Schwarz | `C1 (100 µF / 10 V, flach liegend)` parallel zwischen ESP32 `5V (+)` und `GND (−)` |

## Lokal starten

```bash
npm install
npm run dev
```

Produktions-Build & Vorschau:

```bash
npm run lint
npm run build
npm run preview
```
