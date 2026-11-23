import type { ChecklistItem } from '../types'

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'chk_aaa',
    step: 1,
    title: 'Alle 4 AAA-Akkus entnommen',
    detail: 'Rechner ist stromlos für sicheres Löten (CR2032 bleibt im Halter!).',
    critical: true,
  },
  {
    id: 'chk_nimh',
    step: 1,
    title: '4× NiMH-Akkus (1,2 V) statt Alkaline bereitgelegt',
    detail: 'Gesamtspannung ~4,8–5,4 V schont den ESP32-Spannungsregler.',
  },
  {
    id: 'chk_firmware',
    step: 1,
    title: 'ESP32-C3 vorab per USB-C geflasht & getestet',
    detail: 'WLAN-Hotspot und Gemini API funktionieren bereits auf dem Schreibtisch.',
  },
  {
    id: 'chk_pads',
    step: 2,
    title: 'TIP (TX), RING (RX) und SLEEVE (GND) per Multimeter ausgemessen',
    detail: 'Alle 3 Pads eindeutig mit Durchgang (< 0,5 Ω) identifiziert.',
    critical: true,
  },
  {
    id: 'chk_uart',
    step: 3,
    title: 'UART über Kreuz gelötet & R2/R3 (1 kΩ) geprüft',
    detail: 'Casio TIP → 1 kΩ → GPIO20 (RX) und Casio RING → 1 kΩ → GPIO21 (TX).',
    critical: true,
  },
  {
    id: 'chk_mosfet',
    step: 4,
    title: 'AO3401 (G/S/D) & 10 kΩ Pull-up (R1) korrekt verbunden',
    detail: 'Zwischen Pin 1 (Gate) und Pin 2 (Source) misst du ~10,0 kΩ.',
  },
  {
    id: 'chk_polarity',
    step: 5,
    title: 'Polung geprüft: D1 Silberring → ESP32 5V & C1 Minus-Streifen → GND',
    detail: 'Diodentest zeigt ~0,6 V in Richtung ESP32, OL rückwärts.',
    critical: true,
  },
  {
    id: 'chk_short',
    step: 6,
    title: 'Kurzschluss-Test vor dem ersten Einschalten bestanden',
    detail: 'Zwischen +V_BAT und -V_BAT kein Kurzschluss (> 100 kΩ / OL).',
    critical: true,
  },
  {
    id: 'chk_kapton',
    step: 6,
    title: 'Alles mit Kapton isoliert & rote Keramik-Antenne nach außen gerichtet',
    detail: 'Keine Kabel im Weg der 6 Schraubdome oder des Display-FFC.',
  },
  {
    id: 'chk_magnet',
    step: 7,
    title: 'Standby 0,00 mA & Magnet-Test (SW1 → blaue GPIO8-LED) erfolgreich',
    detail: 'Rechner schließt spaltfrei, Magnet schaltet ESP32 zuverlässig ein.',
  },
]
