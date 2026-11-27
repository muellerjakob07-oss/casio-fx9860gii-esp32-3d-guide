import type { ChecklistItem } from '../types'

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'chk_aaa',
    step: 1,
    title: 'Alle 4 querliegenden AAA-Akkus entnommen',
    detail: 'Rechner ist komplett stromlos (dein Speicher bleibt im MXIC „9A“ Flash erhalten!).',
    critical: true,
  },
  {
    id: 'chk_firmware',
    step: 1,
    title: 'ESP32-C3 vorab per USB-C geflasht & mit 4× NiMH-Akkus geplant',
    detail: 'WLAN-Hotspot und Gemini API funktionieren bereits trocken auf dem Schreibtisch.',
  },
  {
    id: 'chk_ribbons',
    step: 2,
    title: 'Platinen in Vorderschale gelassen & JN701 / S30FE02 / P902 geschützt',
    detail: 'Weißes gelötetes FFC (JN701), braunes LCD-Flex (S30FE02) und rot/weiße Backlight-Drähte sind unversehrt.',
    critical: true,
  },
  {
    id: 'chk_pads',
    step: 2,
    title: 'Quadratische Goldpads an CN401 (oben links) per Multimeter ausgeklingelt',
    detail: 'TIP (TX), RING (RX, Pad „Y“) und SLEEVE (GND) eindeutig mit < 0,5 Ω zugeordnet.',
    critical: true,
  },
  {
    id: 'chk_uart',
    step: 3,
    title: 'UART entlang der linken Außenkante über R2 & R3 (1 kΩ) über Kreuz gelötet',
    detail: 'CN401 TIP → 1 kΩ → GPIO20 (RX) und CN401 RING → 1 kΩ → GPIO21 (TX).',
    critical: true,
  },
  {
    id: 'chk_mosfet',
    step: 4,
    title: '+V_BAT an T701/P701, −V_BAT an T702/P702, AO3401 & R1 (10 kΩ) verbunden',
    detail: 'Zwischen Gate (Pin 1) und Source (Pin 2) misst du ~10,0 kΩ; SW1 liegt im linken Seitenkanal.',
  },
  {
    id: 'chk_polarity',
    step: 5,
    title: 'Polung & Bauhöhe: D1 Silberring nach links (ESP 5V) & C1 flach liegend',
    detail: 'Weißer Minus-Streifen an C1 liegt an GND; Diodentest zeigt ~0,6 V zum ESP32.',
    critical: true,
  },
  {
    id: 'chk_kapton',
    step: 6,
    title: 'Testpunkte T703–T719 mit Kapton abgeklebt & Antenne frei nach links außen',
    detail: 'Kein Kurzschluss zur Tastenmatrix; ggf. 1–2 dünne Innenrippen der Rückschale geprüft.',
    critical: true,
  },
  {
    id: 'chk_short',
    step: 6,
    title: 'Kurzschluss-Check zwischen T701 (+V_BAT) und T702 (−V_BAT) bestanden',
    detail: 'Ohne Akkus > 100 kΩ / OL – bereit zum sicheren Einlegen der 4 NiMH-Akkus!',
    critical: true,
  },
  {
    id: 'chk_magnet',
    step: 7,
    title: 'Alle Zifferntasten sitzen, Standby = 0,00 mA & Magnet links außen schaltet ein',
    detail: 'Gehäuse schließt spaltfrei, Neodym-Magnet an linker Flanke lässt GPIO8 blau aufleuchten.',
  },
]
