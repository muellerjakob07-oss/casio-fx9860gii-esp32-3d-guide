# CASIO fx-9860GII × ESP32-C3 SuperMini — Interaktive 3D-Bauanleitung

Interaktive, anfängerfreundliche 3D-Bauanleitungs-Web-App (auf Deutsch) für den unsichtbaren Hardware-Umbau eines **CASIO fx-9860GII** Grafikrechners mit einem **ESP32-C3 SuperMini**, um per WLAN über HTTPS Fragen an die **Google Gemini API** zu senden und die Antworten auf dem originalen **128 × 64 Monochrom-LCD** anzuzeigen.

## Features

- **100 % prozedurale 3D-Baugruppen (Maßstab 1 Einheit = 1 mm):**
  - **CASIO fx-9860GII** (`184 × 91,5 × 21,2 mm`): Vorder- und Rückschale, 6 animierte Kreuzschlitzschrauben, Batteriefach mit 4 herausnehmbaren **AAA-NiMH-Akkus (`1.2V NiMH`)** & konischen Spiralfedern, **CR2032-RAM-Backup-Halter**, freie **Einbaunische** (`28 × 22 × 7 mm`) sowie ein echtes, animiertes **128 × 64 Monochrom-STN-Display**.
  - **CASIO Hauptplatine (FR4):** Smaragdgrüner Lötstopplack, Mini-USB, 2,5-mm-TRS-Buchse mit 3 beschrifteten Gold-Lötpads (`TIP = TX`, `RING = RX`, `SLEEVE = GND`), 2 COB-Vergüsse, weißes 24-poliges **Display-Flachbandkabel (FFC)** inkl. Warnhinweis.
  - **ESP32-C3 SuperMini (`22,5 × 18,0 × 1,0 mm`):** USB-C, `BOOT`/`RST`-Taster, 45° gedrehter `ESP32-C3 QFN32`-Chip, `ME6211`-LDO, leuchtende blaue `GPIO8`-Status-LED, rote Keramik-WLAN-Antenne mit **Antenna Keep-Out-Zone** und alle **16 anklickbaren Gold-Rand-Pads**.
  - **Schutz- & Schalt-Elektronik:** `AO3401` (`A19T`) P-Kanal-MOSFET, `R1` (`10 kΩ`), `R2` & `R3` (`1 kΩ`), `D1` (`1N4007` mit silbernem Kathoden-Ring), `C1` (`100 µF / 10 V`), Magnet-Reedschalter `SW1` mit beweglichen Kontaktzungen, Neodym-Magnet und bernsteinfarbenes **Kapton-Band**.
- **8 geführte Bauschritte** mit butterweichen Kamera-Fahrten, Multimeter-Durchgangsprüfung (Schritt 2), Kapton-Einbau (Schritt 6), Magnet-Test (Schritt 7) und Live-Gemini-Simulation (Schritt 8).
- **Interaktives Steuerungs-HUD:** Stufenlose Explosionsansicht (0–100 %), Gehäuse-Röntgenblick (0–100 %), Live-Schalter **Magnet / SW1** (`0,00 mA` Standby vs. `4,50 V / ~85 mA` aktiv), 4 Kamera-Presets, Studio Dark/Light-Modus, Bauteil- & Pin-Inspektor sowie eine persistente Anfänger-Checkliste.

## Schaltplan-Übersicht (8 Verbindungen)

| # | Leitung | Farbe | Verbindung |
|---|---------|-------|------------|
| 1 | TX-Daten | Blau | Casio 2,5 mm `TIP (TX)` → `R2 (1 kΩ)` → ESP32 `GPIO20 (RX)` |
| 2 | RX-Daten | Grün | Casio 2,5 mm `RING (RX)` → `R3 (1 kΩ)` → ESP32 `GPIO21 (TX)` |
| 3 | Daten-Masse | Schwarz | Casio 2,5 mm `SLEEVE (GND)` → ESP32 `GND` |
| 4 | Batterie-Masse | Schwarz | Batteriefach `-V_BAT` → ESP32 `GND` |
| 5 | Batterie-Plus | Rot | Batteriefach `+V_BAT (4,8–6,0 V)` → `AO3401 Pin 2 (Source)` |
| 6 | Gate-Steuerung | Gelb/Orange | `AO3401 Source` → `R1 (10 kΩ)` → `AO3401 Pin 1 (Gate)` → `SW1` → `GND` |
| 7 | Geschaltetes 5V | Rot-Orange | `AO3401 Pin 3 (Drain)` → `D1 (1N4007, Silberring zum ESP)` → ESP32 `5V` |
| 8 | Puffer-Elko | Rot/Schwarz | `C1 (100 µF / 10 V)` parallel zwischen ESP32 `5V (+)` und `GND (-)` |

## Tech-Stack

- **Vite + React 19 + TypeScript**
- **Three.js + `@react-three/fiber` + `@react-three/drei`**
- **Tailwind CSS v4 + `lucide-react`**

## Lokal starten

```bash
npm install
npm run dev
```

Produktions-Build erstellen und testen:

```bash
npm run lint
npm run build
npm run preview
```
