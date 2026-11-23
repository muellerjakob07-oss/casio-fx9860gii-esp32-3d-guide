import type { ComponentSpec } from '../types'
import { CASIO_PORTS, ESP32_PINS, ESP_PAD, MOD_PARTS } from './geometryLayout'

const BASE_COMPONENTS: Record<string, ComponentSpec> = {
  casio_housing: {
    id: 'casio_housing',
    name: 'CASIO fx-9860GII Gehäuse (Vorder- & Rückschale)',
    shortName: 'Gehäuse',
    category: 'Taschenrechner',
    dimensions: '184,0 × 91,5 × 21,2 mm',
    summary:
      'Zweiteiliges ABS-Kunststoffgehäuse mit 6 Schraubdomen, integriertem 4×AAA-Batteriefach und einem perfekten Hohlraum rechts neben den Batterien.',
    purpose:
      'Schützt die gesamte Elektronik komplett unsichtbar. Da das Gehäuse aus nicht-leitendem ABS besteht, dringen sowohl WLAN-Funkwellen als auch das Magnetfeld für SW1 mühelos hindurch.',
    multimeterValue: 'Isolator (> 20 MΩ) – keine leitfähige Beschichtung innen',
    solderTip:
      'Halte deinen heißen Lötkolben immer mindestens 15 mm von den Gehäusewänden entfernt – ABS-Kunststoff schmilzt bereits ab ca. 200 °C!',
    focusCamera: { position: [86, 138, 128], target: [0, 8, 2], fov: 35 },
    badgeColor: '#64748b',
  },
  casio_back_shell: {
    id: 'casio_back_shell',
    name: 'CASIO Rückschale & 6 Kreuzschlitzschrauben',
    shortName: 'Rückschale',
    category: 'Taschenrechner',
    dimensions: '184,0 × 91,5 × 10,6 mm (6× PH0 Schrauben)',
    summary:
      'Untere Gehäusehälfte mit separatem Batteriefachdeckel. Wird über 6 versenkte Schrauben mit den Schraubdomen der Vorderschale verbunden.',
    purpose:
      'Verschließt den Umbau absolut spurlos. Im Röntgenmodus kannst du hier jederzeit kontrollieren, ob Kabel oder der 100-µF-Elko kollisionsfrei sitzen.',
    multimeterValue: 'Mechanische Prüfung: schließt plan ohne Spalt und ohne Druck',
    solderTip:
      'Verwende einen exakt passenden PH0-Schraubendreher, damit du die kleinen Schraubenköpfe nicht runddrehst.',
    focusCamera: { position: [92, 118, 110], target: [0, 14, 12], fov: 35 },
    badgeColor: '#64748b',
  },
  casio_lcd: {
    id: 'casio_lcd',
    name: '128 × 64 Monochrom-STN-LCD-Modul',
    shortName: '128×64 LCD',
    category: 'Taschenrechner',
    dimensions: '66 × 44 mm Modul (58 × 29 mm aktive Fläche)',
    summary:
      'Kontrastreiches grafisches Punktmatrix-Display des fx-9860GII. Über ein eigenes Casio-Add-in (C / SDK) zeigt es direkt den Antworttext der Gemini API an.',
    purpose:
      'Zeigt deine eingegebene Frage sowie den komplett formatierten, scrollbaren Rechenweg von Gemini gestochen scharf im nativen Taschenrechner-Look.',
    multimeterValue: 'Nicht direkt messen – Ansteuerung erfolgt intern über Casio CPU',
    solderTip:
      'Das Display muss für diesen Umbau niemals ausgebaut werden! Achte nur darauf, das weiße Flachbandkabel auf der Rückseite nicht zu verletzen.',
    focusCamera: { position: [28, 118, -12], target: [0, 8, -52], fov: 32 },
    badgeColor: '#0ea5e9',
  },
  battery_pack: {
    id: 'battery_pack',
    name: '4× AAA NiMH-Akkupack in Reihenschaltung',
    shortName: '4× AAA NiMH',
    category: 'Taschenrechner',
    dimensions: '4 × (Ø 10,5 × 44,5 mm)',
    summary:
      'Vier in Serie geschaltete 1,2-V-NiMH-Akkus mit vernickelten Spiralfedern liefern zusammen ~4,8–5,2 V (voll geladen max. ~5,5 V).',
    purpose:
      'Versorgt sowohl den Casio als auch (sobald SW1 per Magnet geschlossen wird) deinen ESP32-C3 SuperMini über den AO3401-Schalter und die 1N4007-Diode.',
    pinout: [
      { pin: '+V_BAT (rechts oben)', signal: '+4,8 bis +5,4 V DC', color: '#ef4444', note: 'Geht an AO3401 Pin 2 (Source)' },
      { pin: '-V_BAT (links oben)', signal: '0 V / GND', color: '#334155', note: 'Geht an ESP32 GND' },
    ],
    multimeterValue: '4,8 V – 5,4 V DC (NiMH) • bei Alkaline max. 6,2 V (Diode zwingend!)',
    solderTip:
      'Nimm zum Löten an den Metall-Kontaktblechen IMMER alle Batterien heraus und löte schnell (< 3 Sekunden), damit das Kunststoff-Batteriefach nicht weich wird.',
    focusCamera: { position: [-44, 88, 112], target: [-14, 10, 56], fov: 34 },
    badgeColor: '#22c55e',
  },
  cr2032: {
    id: 'cr2032',
    name: 'CR2032 Backup-Knopfzelle (3 V Lithium)',
    shortName: 'CR2032 Backup',
    category: 'Taschenrechner',
    dimensions: 'Ø 20,0 × 3,2 mm im runden Halter',
    summary:
      'Stützbatterie auf der Casio-Hauptplatine. Hält den RAM-Inhalt und gespeicherte Add-ins am Leben, wenn du die 4 AAA-Akkus wechselst.',
    purpose:
      'Wird für den Umbau NICHT angezapft und NICHT entfernt! Sie schützt dein Casio-Add-in vor Datenverlust während der gesamten Bastelarbeit.',
    multimeterValue: '2,9 V – 3,2 V DC (unter 2,7 V gelegentlich tauschen – nur wenn AAA drin sind!)',
    solderTip:
      'Niemals an eine Lithium-Knopfzelle löten! Halte Abstand mit Lötkolben und metallischen Werkzeugen, um keinen Kurzschluss zu erzeugen.',
    focusCamera: { position: [-48, 60, 42], target: [-24, 8, 14], fov: 30 },
    badgeColor: '#f59e0b',
  },
  casio_pcb: {
    id: 'casio_pcb',
    name: 'CASIO fx-9860GII Hauptplatine (FR4 PCB)',
    shortName: 'Hauptplatine',
    category: 'Hauptplatine',
    dimensions: '82 × 112 × 1,6 mm (Smaragdgrüner Lötstopplack)',
    summary:
      'Zweiseitige grüne FR4-Platine mit SuperH-CPU (COB-Verguss), RAM/Flash, Mini-USB, 2,5-mm-Serial-Port und vergoldeten Lötpads.',
    purpose:
      'Wir greifen auf der Platinenrückseite ausschließlich die 3 großen, robusten Lötpads der 2,5-mm-Klinkenbuchse ab – kein riskantes Mikro-Löten an CPU-Beinchen nötig!',
    multimeterValue: 'Logikpegel der seriellen Schnittstelle: 3,3 V TTL (kompatibel mit ESP32-C3!)',
    solderTip:
      'Arbeite mit 320–340 °C, etwas Flussmittel (Kolophonium) und bleifreiem oder Sn60Pb40-Lötzinn (Ø 0,5 mm).',
    focusCamera: { position: [12, 175, -8], target: [0, 8, -18], fov: 36 },
    badgeColor: '#10b981',
  },
  mini_usb: {
    id: 'mini_usb',
    name: 'Mini-USB-Buchse (Typ Mini-B)',
    shortName: 'Mini-USB',
    category: 'Hauptplatine',
    dimensions: '7,7 × 3,9 × 9,2 mm',
    summary:
      'Originale USB-Datenschnittstelle des fx-9860GII zum Übertragen von Add-ins (.g1a) vom PC.',
    purpose:
      'Bleibt durch den Umbau zu 100 % unangetastet und voll funktionsfähig – du kannst weiterhin jederzeit Programme per PC auf den Rechner laden.',
    multimeterValue: 'Gehäuseschirm liegt auf GND (< 0,5 Ω zu SLEEVE)',
    solderTip: 'Hier musst du nichts anlöten.',
    focusCamera: { position: [-32, 46, -112], target: [-16, 10, -86], fov: 30 },
    badgeColor: '#94a3b8',
  },
  jack_25mm: {
    id: 'jack_25mm',
    name: '2,5-mm-3-Pin-Klinkenbuchse (TRS Serial Port)',
    shortName: '2,5mm Buchse',
    category: 'Hauptplatine',
    dimensions: '6,5 × 5,2 × 11,5 mm (3-polig TRS)',
    summary:
      'Die originale serielle 3-Pin-Kommunikationsbuchse oben am Casio arbeitet nativ mit 3,3-V-UART – ideal für den direkten Anschluss an den ESP32-C3!',
    purpose:
      'Liefert TX, RX und GND auf drei großen, extrem anfängerfreundlichen Lötpads auf der Platinenrückseite.',
    pinout: [
      { pin: 'TIP (Spitze)', signal: 'TX — Daten VOM Casio (3,3 V TTL)', color: '#3b82f6', note: 'Über R2 (1 kΩ) an ESP32 GPIO20 (RX)' },
      { pin: 'RING (Mitte)', signal: 'RX — Daten ZUM Casio (3,3 V TTL)', color: '#22c55e', note: 'Über R3 (1 kΩ) an ESP32 GPIO21 (TX)' },
      { pin: 'SLEEVE (Schaft)', signal: 'GND — Gemeinsame Masse', color: '#334155', note: 'Direkt an ESP32 GND' },
    ],
    multimeterValue: 'Durchgang < 0,5 Ω vom eingesteckten 2,5-mm-Stecker zu jedem der 3 Pads',
    solderTip:
      'Miss die 3 Pads vor dem Löten immer einmal selbst mit dem Durchgangsprüfer aus, damit du dir 100 % sicher bist.',
    focusCamera: { position: [44, 48, -106], target: CASIO_PORTS.PAD_RING_RX, fov: 28 },
    badgeColor: '#3b82f6',
  },
  pad_tip: {
    id: 'pad_tip',
    name: 'Lötpad TIP (Spitze) = Casio TX',
    shortName: 'TIP (TX)',
    category: 'Pin / Lötpad',
    dimensions: 'Vergoldetes Oval-Lötpad (~2,6 × 1,8 mm)',
    summary: 'Ausgangsleitung der seriellen Schnittstelle des CASIO fx-9860GII (3,3 V TTL).',
    purpose:
      'Sendet deine eingetippte Sachaufgabe vom Taschenrechner über R2 (1 kΩ) an den Empfangspin GPIO20 (RX) des ESP32-C3.',
    multimeterValue: 'Ruhepegel bei aktivem Port: ~3,3 V DC • Durchgang zu Stecker-Spitze < 0,5 Ω',
    solderTip: 'Kurz vorverzinnen, blauen Draht flach anlegen, 2 Sekunden erhitzen – fertig ist ein glänzender Lötkegel.',
    focusCamera: { position: [38, 32, -88], target: CASIO_PORTS.PAD_TIP_TX, fov: 25 },
    badgeColor: '#3b82f6',
  },
  pad_ring: {
    id: 'pad_ring',
    name: 'Lötpad RING (Mitte) = Casio RX',
    shortName: 'RING (RX)',
    category: 'Pin / Lötpad',
    dimensions: 'Vergoldetes Oval-Lötpad (~2,6 × 1,8 mm)',
    summary: 'Eingangsleitung der seriellen Schnittstelle des CASIO fx-9860GII (3,3 V TTL).',
    purpose:
      'Empfängt die fertige Gemini-Antwort vom ESP32-C3 (GPIO21 TX) sicher über den 1-kΩ-Schutzwiderstand R3.',
    multimeterValue: 'Durchgang zum mittleren Ring des 2,5-mm-Steckers < 0,5 Ω',
    solderTip: 'Achte darauf, dass kein Lötzinn-Brücklein zu den benachbarten Pads TIP oder SLEEVE entsteht!',
    focusCamera: { position: [34, 32, -92], target: CASIO_PORTS.PAD_RING_RX, fov: 25 },
    badgeColor: '#22c55e',
  },
  pad_sleeve: {
    id: 'pad_sleeve',
    name: 'Lötpad SLEEVE (Schaft) = GND',
    shortName: 'SLEEVE (GND)',
    category: 'Pin / Lötpad',
    dimensions: 'Vergoldetes Oval-Lötpad (~2,6 × 1,8 mm)',
    summary: 'Gemeinsamer Massebezugspunkt (0 V) der seriellen Casio-Schnittstelle.',
    purpose:
      'Stellt sicher, dass Casio und ESP32-C3 exakt dasselbe 0-V-Bezugspotential haben – ohne saubere Daten-Masse kommen nur Zeichensalat oder Fehler an.',
    multimeterValue: '< 0,5 Ω zum Schaft des 2,5-mm-Steckers und zu Batteriefach -V_BAT',
    solderTip: 'Da GND an größere Kupferflächen angeschlossen ist, braucht dieses Pad evtl. 1 Sekunde länger Wärme.',
    focusCamera: { position: [30, 32, -96], target: CASIO_PORTS.PAD_SLEEVE_GND, fov: 25 },
    badgeColor: '#475569',
  },
  ffc_cable: {
    id: 'ffc_cable',
    name: '24-poliges Display-Flachbandkabel (FFC)',
    shortName: 'Display-FFC',
    category: 'Hauptplatine',
    dimensions: '22 mm breit • 24 feine Leiterbahnen',
    summary:
      'Verbindet das 128×64-LCD auf der Vorderseite mit der Hauptplatine. Extrem empfindlich gegen Knicken oder Zug!',
    purpose:
      'WARNUNG: Nicht knicken, nicht abziehen und niemals mit dem Lötkolben berühren! Verlege alle neuen Drähte weiträumig außen am rechten Platinenrand vorbei.',
    multimeterValue: 'Nicht messen – unberührt lassen!',
    solderTip: 'Halte beim Arbeiten in der Nähe sicherheitshalber 2 cm Abstand.',
    focusCamera: { position: [24, 58, -18], target: [0, 8, -46], fov: 30 },
    badgeColor: '#ef4444',
  },
  cob_cpu: {
    id: 'cob_cpu',
    name: 'Casio Haupt-CPU & RAM (Chip-on-Board Epoxid-Verguss)',
    shortName: 'CPU / RAM COB',
    category: 'Hauptplatine',
    dimensions: 'Ø 18 mm & Ø 13,5 mm Epoxid-Verguss',
    summary:
      'Die SuperH-32-Bit-CPU und der Speicher sitzen direkt unter schwarzem Schutz-Epoxidharz auf der Hauptplatine.',
    purpose:
      'Führt dein Casio-OS und das Gemini-Client-Add-in aus. Unsere 1-kΩ-Schutzwiderstände schützen genau diese internen I/O-Pins vor Fehlströmen.',
    multimeterValue: 'Geschützt unter Epoxidharz',
    solderTip: 'Keine Kabel über die erhöhten Epoxid-Kuppeln führen, damit die Rückschale sauber aufliegt.',
    focusCamera: { position: [22, 68, 8], target: [2, 8, -26], fov: 32 },
    badgeColor: '#334155',
  },
  niche: {
    id: 'niche',
    name: 'Einbaunische (Freier Hohlraum neben Batteriefach)',
    shortName: 'Einbaunische',
    category: 'Taschenrechner',
    dimensions: 'ca. 28 × 22 × 7 mm',
    summary:
      'Von Werk aus ungenutzter Hohlraum direkt rechts neben dem 4×AAA-Batteriefach – wie maßgeschneidert für den ESP32-C3 SuperMini!',
    purpose:
      'Nimmt den isolierten ESP32-C3 samt AO3401, D1, C1 und SW1 komplett unsichtbar auf, mit freier Sicht der roten Keramik-Antenne durch die Außenwand.',
    multimeterValue: 'Bauhöhe kontrollieren: alles unter 7 mm Höhe einbauen (C1 liegend!)',
    solderTip: 'C1 (100 µF) unbedingt flach liegend anlöten, sonst steht er an der Rückschale an.',
    focusCamera: { position: [68, 62, 88], target: [28, 8, 56], fov: 32 },
    badgeColor: '#0ea5e9',
  },
  esp32_board: {
    id: 'esp32_board',
    name: 'ESP32-C3 SuperMini (RISC-V WLAN-Mikrocontroller)',
    shortName: 'ESP32-C3 SuperMini',
    category: 'ESP32-C3',
    dimensions: '22,5 × 18,0 × 1,0 mm (16 Rand-Pads)',
    summary:
      'Ultrakonpaktes 32-Bit-RISC-V-Board mit 2,4-GHz-WLAN, Hardware-TLS für HTTPS, 4 MB Flash, USB-C, ME6211-LDO, blauer GPIO8-LED und roter Keramik-Antenne.',
    purpose:
      'Das Gehirn des Umbaus: Empfängt den Text vom Casio über UART (GPIO20), verbindet sich mit deinem Handy-Hotspot/WLAN, ruft die Google Gemini API per HTTPS auf und sendet die Lösung über GPIO21 zurück.',
    pinout: [
      { pin: '5V (Rechts #1)', signal: 'Versorgung (+4,5 V von D1)', color: '#ef4444', note: 'Max. 6,0 V! Immer über D1 + C1 betreiben' },
      { pin: 'GND (Rechts #2)', signal: 'Masse (0 V)', color: '#334155', note: 'Sternpunkt für Batterie, Casio, C1, SW1' },
      { pin: 'GPIO8 (Links #4)', signal: 'Interne blaue Status-LED', color: '#38bdf8', note: 'Leuchtet bei aktivem WLAN/Boot (Active-Low)' },
      { pin: 'GPIO20 (Links #7)', signal: 'UART0 RX', color: '#3b82f6', note: '← von Casio TIP (TX) über R2 (1 kΩ)' },
      { pin: 'GPIO21 (Links #8)', signal: 'UART0 TX', color: '#22c55e', note: '→ zu Casio RING (RX) über R3 (1 kΩ)' },
    ],
    multimeterValue: 'Im Betrieb: 5V-Pin = ~4,50 V • 3V3-Pin = exakt 3,30 V (±2 %)',
    solderTip:
      'Flashe die Firmware unbedingt ZUERST bequem per USB-C am PC und teste WLAN + Gemini API auf dem Schreibtisch, bevor du das Board einlötest!',
    focusCamera: { position: [56, 48, 86], target: [28, 9, 58], fov: 28 },
    badgeColor: '#0284c7',
  },
  esp32_antenna: {
    id: 'esp32_antenna',
    name: 'Rote Keramik-WLAN-Antenne (2,4 GHz)',
    shortName: 'WLAN-Antenne',
    category: 'ESP32-C3',
    dimensions: '3,2 × 1,6 × 1,2 mm + Keep-Out-Zone',
    summary:
      'Hocheffiziente SMD-Keramikantenne an der Unterkante des SuperMini-Boards.',
    purpose:
      'Sendet und empfängt deine verschlüsselten HTTPS-Datenpakete zur Gemini API. Muss beim Einbau zwingend zur rechten Kunststoff-Außenwand zeigen!',
    multimeterValue: 'HF-Pfad – nicht mit Multimeter messen',
    solderTip:
      'Kein Lötzinn, kein Draht und keine Metallfolie darf die rote Antenne oder ihre Keep-Out-Zone überdecken.',
    focusCamera: { position: [62, 34, 72], target: ESP_PAD.ANTENNA_WORLD, fov: 26 },
    badgeColor: '#dc2626',
  },
  esp32_led: {
    id: 'esp32_led',
    name: 'Blaue Status-LED (GPIO8)',
    shortName: 'GPIO8 LED',
    category: 'ESP32-C3',
    dimensions: '0603 SMD LED (Active-Low an GPIO8)',
    summary:
      'Onboard-Status-LED des ESP32-C3 SuperMini. Leuchtet blau, wenn das Modul per Magnet eingeschaltet wird und blinkt beim WLAN-Transfer.',
    purpose:
      'Perfekte Funktionskontrolle beim Test: Ein kurzes blaues Aufblitzen (durch den Kunststoff leicht schimmernd oder im Test) bestätigt sofort, dass Stromversorgung und SW1 funktionieren.',
    multimeterValue: 'GPIO8 = 0 V wenn LED AN, 3,3 V wenn LED AUS',
    solderTip: 'Bereits ab Werk auf dem Board verlötet – optional in der Firmware deaktivierbar für 100 % Stealth.',
    focusCamera: { position: [44, 34, 76], target: ESP_PAD.LED_GPIO8_WORLD, fov: 25 },
    badgeColor: '#38bdf8',
  },
  ao3401: {
    id: 'ao3401',
    name: 'AO3401 P-Kanal-MOSFET (Aufdruck „A19T“)',
    shortName: 'AO3401 MOSFET',
    category: 'Schutz-Elektronik',
    dimensions: 'SOT-23 SMD-Gehäuse (2,9 × 1,3 × 1,1 mm)',
    summary:
      'Winziger, extrem niederohmiger P-Kanal-Leistungs-MOSFET (R_DS(on) ≈ 50 mΩ, bis 4 A) als verlustfreier High-Side-Stromschalter.',
    purpose:
      'Trennt den ESP32-C3 im ausgeschalteten Zustand physisch von der Batterie (+V_BAT). So beträgt der Ruhestrom exakt 0,00 mA – deine Akkus halten genauso lang wie original!',
    pinout: [
      { pin: 'Pin 1 (links oben)', signal: 'Gate (G)', color: '#f59e0b', note: 'Über R1 (10 kΩ) an Source + über SW1 an GND' },
      { pin: 'Pin 2 (links unten)', signal: 'Source (S)', color: '#ef4444', note: 'Eingang direkt von Batteriefach +V_BAT' },
      { pin: 'Pin 3 (rechts einzeln)', signal: 'Drain (D)', color: '#ea580c', note: 'Geschalteter Ausgang → zur Anode von D1 (1N4007)' },
    ],
    multimeterValue: 'SW1 offen: V_GS = 0 V, Drain = 0 V • SW1 zu: V_GS = -5,2 V, Drain = +5,2 V',
    solderTip:
      'Nutze eine feine Lötspitze, klebe den AO3401 kopfüber oder auf ein Stückchen Lochraster/Kapton fest und löte max. 2 Sekunden pro Beinchen.',
    focusCamera: { position: [24, 24, 48], target: MOD_PARTS.AO3401.CENTER, fov: 24 },
    badgeColor: '#f59e0b',
  },
  r1_10k: {
    id: 'r1_10k',
    name: 'R1: 10 kΩ Pull-up-Widerstand',
    shortName: 'R1 (10 kΩ)',
    category: 'Schutz-Elektronik',
    dimensions: 'Axial 1/4 W (Farbringe: Braun-Schwarz-Orange-Gold)',
    summary:
      'Präzisions-Widerstand zwischen Source (Pin 2) und Gate (Pin 1) des AO3401-MOSFETs.',
    purpose:
      'Hält das MOSFET-Gate zuverlässig auf Batteriespannung, solange kein Magnet in der Nähe ist. Verhindert zufälliges Einschalten durch statische Ladung und garantiert 0,00 mA Ruhestrom.',
    multimeterValue: '9,5 kΩ – 10,5 kΩ (Braun=1, Schwarz=0, Orange=×1000, Gold=±5 %)',
    solderTip:
      'Widerstände haben keine Polung – die Einbaurichtung ist egal! Beinchen kurz abknipsen und sauber an Pin 1 und Pin 2 löten.',
    focusCamera: { position: [20, 26, 48], target: MOD_PARTS.R1_10K.CENTER, fov: 24 },
    badgeColor: '#d97706',
  },
  r2_1k: {
    id: 'r2_1k',
    name: 'R2: 1 kΩ UART-Schutzwiderstand (TX-Leitung)',
    shortName: 'R2 (1 kΩ TX)',
    category: 'Schutz-Elektronik',
    dimensions: 'Axial 1/4 W (Farbringe: Braun-Schwarz-Rot-Gold)',
    summary:
      'Sitzt in Reihe in der blauen Datenleitung von Casio TIP (TX) zu ESP32 GPIO20 (RX).',
    purpose:
      'Begrenzt den Strom im Fehlerfall auf harmlose ~3 mA und verhindert sogenanntes „Back-Powering“ (Rückstrom über Datenleitungen in den ausgeschalteten ESP32).',
    multimeterValue: '950 Ω – 1050 Ω (Braun=1, Schwarz=0, Rot=×100, Gold=±5 %)',
    solderTip: 'Keine Polung! Vor dem Einschrumpfen prüfen, ob beide Lötstellen mechanisch fest sitzen.',
    focusCamera: { position: [38, 32, -48], target: MOD_PARTS.R2_1K_TX.CENTER, fov: 26 },
    badgeColor: '#3b82f6',
  },
  r3_1k: {
    id: 'r3_1k',
    name: 'R3: 1 kΩ UART-Schutzwiderstand (RX-Leitung)',
    shortName: 'R3 (1 kΩ RX)',
    category: 'Schutz-Elektronik',
    dimensions: 'Axial 1/4 W (Farbringe: Braun-Schwarz-Rot-Gold)',
    summary:
      'Sitzt in Reihe in der grünen Antwortleitung von ESP32 GPIO21 (TX) zu Casio RING (RX).',
    purpose:
      'Schützt den seriellen RX-Eingang der Casio-CPU vor Kurzschlüssen und Stromspitzen beim Einschalten des ESP32.',
    multimeterValue: '950 Ω – 1050 Ω (Braun=1, Schwarz=0, Rot=×100, Gold=±5 %)',
    solderTip: 'Keine Polung! Nach dem Anlöten mit Kapton-Band oder dünnem Schrumpfschlauch isolieren.',
    focusCamera: { position: [42, 32, -48], target: MOD_PARTS.R3_1K_RX.CENTER, fov: 26 },
    badgeColor: '#22c55e',
  },
  d1_1n4007: {
    id: 'd1_1n4007',
    name: 'D1: 1N4007 Schutzdiode (DO-41)',
    shortName: 'D1 (1N4007)',
    category: 'Schutz-Elektronik',
    dimensions: 'Ø 2,4 × 4,8 mm (Silberner Kathoden-Ring zum ESP32!)',
    summary:
      'Robuste 1-A-Siliziumdiode mit charakteristischem Spannungsabfall von ~0,7 V.',
    purpose:
      'Senkt die Batteriespannung (4,8–6,0 V) sicher um ca. 0,7 V ab, sodass am 5V-Eingang des ESP32-C3 stets sichere ~4,1–5,3 V anliegen – weit unter dem 6,0-V-Limit des ME6211-Reglers! Schützt zudem vor Verpolung.',
    pinout: [
      { pin: 'Anode (schwarze Seite)', signal: 'Eingang von AO3401 Drain (Pin 3)', color: '#ea580c', note: 'Ohne Ring' },
      { pin: 'Kathode (SILBERNER RING)', signal: 'Ausgang → ESP32 5V-Pin', color: '#e2e8f0', note: 'Silberner Ring zeigt ZUM ESP32!' },
    ],
    multimeterValue: 'Diodentest: 0,55–0,70 V in Durchlassrichtung, OL in Sperrrichtung',
    solderTip:
      'Achte dreifach auf den silbernen Ring: Er MUSS Richtung ESP32-5V zeigen! Beinchen sauber biegen, ohne den Glaskörper/Verguss zu knicken.',
    focusCamera: { position: [30, 26, 56], target: MOD_PARTS.D1_1N4007.CENTER, fov: 24 },
    badgeColor: '#e2e8f0',
  },
  c1_100uf: {
    id: 'c1_100uf',
    name: 'C1: 100 µF / 10 V Elektrolytkondensator',
    shortName: 'C1 (100 µF)',
    category: 'Schutz-Elektronik',
    dimensions: 'Radial Ø 5,0 × 7,0 mm (liegend eingebaut)',
    summary:
      'Lokaler Energiespeicher direkt zwischen 5V (+) und GND (-) am ESP32-C3.',
    purpose:
      'Beim WLAN-Senden zieht der ESP32-C3 kurze Stromspitzen bis 300 mA. Ohne C1 würde die Batteriespannung kurz einbrechen (Brownout) und der Casio oder ESP32 neu starten!',
    pinout: [
      { pin: 'Plus (+) — langes Beinchen', signal: 'ESP32 5V-Pin', color: '#ef4444', note: 'Schwarze Seite ohne weißen Streifen' },
      { pin: 'Minus (-) — WEISSER STREIFEN', signal: 'ESP32 GND-Pin', color: '#334155', note: 'Heller Streifen mit „-“-Symbolen!' },
    ],
    multimeterValue: 'Kapazitätsmessung: ~90–115 µF • kein dauerhafter Durchgang (< 10 Ω = Kurzschluss!)',
    solderTip:
      'Unbedingt liegend montieren (damit die Rückschale passt) und so nah wie möglich (< 1 cm) an den 5V- und GND-Pads des ESP32 anlöten!',
    focusCamera: { position: [36, 28, 58], target: MOD_PARTS.C1_100UF.CENTER, fov: 24 },
    badgeColor: '#0ea5e9',
  },
  sw1_reed: {
    id: 'sw1_reed',
    name: 'SW1: Versteckter Magnet-Reedschalter (Glasröhrchen)',
    shortName: 'SW1 Reedschalter',
    category: 'Schutz-Elektronik',
    dimensions: 'Ø 2,2 × 14,0 mm Glasröhrchen (Schließer / NO)',
    summary:
      'Zwei winzige magnetische Kontaktzungen in einem luftdichten Glasröhrchen – komplett unsichtbar im Inneren an der rechten Gehäuseflanke.',
    purpose:
      'Verbindet das MOSFET-Gate (Pin 1) mit GND, sobald du von außen einen kleinen Neodym-Magneten an die Gehäuseseite hältst. Kein Loch bohren, kein sichtbarer Schalter!',
    multimeterValue: 'Ohne Magnet: OL (offen) • Mit Magnet (< 10 mm): < 0,5 Ω (geschlossen)',
    solderTip:
      'VORSICHT GLAS! Biege die Beinchen niemals direkt am Glasende, sondern halte das Beinchen 2 mm außerhalb mit einer Spitzzange fest, damit das Glasröhrchen nicht platzt.',
    focusCamera: { position: [62, 30, 52], target: MOD_PARTS.SW1_REED.CENTER, fov: 26 },
    badgeColor: '#38bdf8',
  },
  kapton_tape: {
    id: 'kapton_tape',
    name: 'Kapton-Isolierband (Polyimid-Folie)',
    shortName: 'Kapton-Band',
    category: 'Schutz-Elektronik',
    dimensions: 'Hitzebeständig bis 260 °C • nur 0,05 mm dünn',
    summary:
      'Bernsteinfarbene, halbtransparente Hochtemperatur-Isolierfolie aus der Luft- und Raumfahrt-Elektronik.',
    purpose:
      'Umhüllt den ESP32-C3 sowie AO3401, R1 und D1 superdünn ohne Platz zu verschwenden und verhindert jeden versehentlichen Kontakt zur Casio-Platine.',
    multimeterValue: 'Durchschlagfestigkeit > 4000 V – perfekte elektrische Isolation',
    solderTip: 'Lass die rote Keramik-WLAN-Antenne frei und klebe auch ein Stückchen Kapton auf die Casio-Platine unter den 1-kΩ-Widerständen.',
    focusCamera: { position: [56, 48, 82], target: [26, 10, 52], fov: 30 },
    badgeColor: '#d97706',
  },

  // All 8 Wires clickable!
  wire_tx: {
    id: 'wire_tx',
    name: 'Leitung 1: TX-Datenleitung (Blau)',
    shortName: 'TX-Leitung (Blau)',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (30 AWG Litze/Kynar) + R2 (1 kΩ)',
    summary: 'Casio 2,5 mm TIP (TX) → R2 (1 kΩ) → ESP32 GPIO20 (RX).',
    purpose: 'Überträgt deine Fragen vom Taschenrechner als 3,3-V-UART-Datenstrom zum ESP32-C3.',
    multimeterValue: '~1,00 kΩ von Casio TIP bis ESP32 GPIO20',
    solderTip: 'Sauber außen am rechten Platinenrand entlangführen – weg vom Display-Flachbandkabel!',
    focusCamera: { position: [54, 62, -16], target: [30, 9, -20], fov: 35 },
    badgeColor: '#2563eb',
  },
  wire_rx: {
    id: 'wire_rx',
    name: 'Leitung 2: RX-Datenleitung (Grün)',
    shortName: 'RX-Leitung (Grün)',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (30 AWG Litze/Kynar) + R3 (1 kΩ)',
    summary: 'Casio 2,5 mm RING (RX) → R3 (1 kΩ) → ESP32 GPIO21 (TX).',
    purpose: 'Bringt die fertige Gemini-Antwort vom ESP32-C3 sicher zurück auf das Casio-Display.',
    multimeterValue: '~1,00 kΩ von Casio RING bis ESP32 GPIO21',
    solderTip: 'Parallel zur blauen TX-Leitung mit kleinen Streifen Kapton-Band flach fixieren.',
    focusCamera: { position: [58, 62, -16], target: [32, 9, -20], fov: 35 },
    badgeColor: '#16a34a',
  },
  wire_gnd_data: {
    id: 'wire_gnd_data',
    name: 'Leitung 3: Daten-Masse (Schwarz)',
    shortName: 'Daten-GND',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (30 AWG)',
    summary: 'Casio 2,5 mm SLEEVE (GND) → ESP32 GND.',
    purpose: 'Stellt das saubere gemeinsame Massepotential für die 3,3-V-UART-Kommunikation her.',
    multimeterValue: '< 0,5 Ω zwischen Casio SLEEVE und ESP32 GND',
    solderTip: 'Kann gemeinsam mit Batterie -V_BAT am ESP32 GND-Pad sternförmig verlötet werden.',
    focusCamera: { position: [48, 72, -12], target: [26, 9, -15], fov: 36 },
    badgeColor: '#334155',
  },
  wire_vbat_neg: {
    id: 'wire_vbat_neg',
    name: 'Leitung 4: Batterie-Masse (Schwarz)',
    shortName: 'Batterie -V_BAT',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (besser 26–28 AWG für geringe Verluste)',
    summary: 'Batteriefach -V_BAT → ESP32 GND.',
    purpose: 'Rückleitung für den Betriebsstrom (bis 300 mA bei WLAN-Peaks) zurück zum Akkupack.',
    multimeterValue: '< 0,3 Ω von Minus-Feder des Batteriefachs bis ESP32 GND',
    solderTip: 'Verwende für die Stromleitungen (+V_BAT und -V_BAT) gerne etwas dickeren Draht (0,25 mm²), damit die Spannung beim WLAN-Senden stabil bleibt.',
    focusCamera: { position: [-4, 68, 74], target: [-6, 10, 42], fov: 34 },
    badgeColor: '#334155',
  },
  wire_vbat_pos: {
    id: 'wire_vbat_pos',
    name: 'Leitung 5: Batterie-Plus Eingang (Rot)',
    shortName: 'Batterie +V_BAT',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (26–28 AWG)',
    summary: 'Batteriefach +V_BAT (4,8–6,0 V) → AO3401 Pin 2 (Source).',
    purpose: 'Führt die ungeschaltete Batteriespannung auf kurzem Weg zum High-Side-MOSFET.',
    multimeterValue: '+4,8 bis +5,4 V DC gegen GND (bei eingelegten NiMH-Akkus)',
    solderTip: 'Kurz halten und erst ganz zum Schluss Akkus einlegen, nachdem du alles mit dem Multimeter geprüft hast!',
    focusCamera: { position: [14, 42, 62], target: [10, 10, 36], fov: 30 },
    badgeColor: '#dc2626',
  },
  wire_gate: {
    id: 'wire_gate',
    name: 'Leitung 6: Gate-Steuerung (Gelb/Orange)',
    shortName: 'Gate-Steuerung',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (30 AWG)',
    summary: 'AO3401 Source → R1 (10 kΩ) → AO3401 Gate → SW1 (Reedschalter) → GND.',
    purpose: 'Steuerpfad mit winzigem Strom (~0,5 mA nur wenn aktiv). Schaltet den MOSFET blitzschnell und prellfrei über den versteckten Magneten.',
    multimeterValue: 'Ohne Magnet: Gate ≈ +5,2 V • Mit Magnet: Gate ≈ 0,00 V',
    solderTip: 'Hier fließen nur winzige Ströme – ganz feiner Lackdraht oder 30-AWG-Litze reicht völlig.',
    focusCamera: { position: [36, 40, 56], target: [26, 10, 36], fov: 30 },
    badgeColor: '#f59e0b',
  },
  wire_5v_switched: {
    id: 'wire_5v_switched',
    name: 'Leitung 7: Geschaltetes 5V-Plus (Rot-Orange)',
    shortName: 'Geschaltetes 5V',
    category: 'Verkabelung',
    dimensions: 'Ø 0,35 mm (26–28 AWG) über D1 (1N4007)',
    summary: 'AO3401 Pin 3 (Drain) → D1 (1N4007, silberner Ring zum ESP) → ESP32 5V.',
    purpose: 'Versorgt den ESP32-C3 mit geschalteten, diodengeschützten ~4,5 V.',
    multimeterValue: 'SW1 aus: 0,00 V • SW1 ein: ~4,50 V DC am ESP32 5V-Pin',
    solderTip: 'Denke an den silbernen Kathoden-Ring der 1N4007 – er zeigt direkt in Richtung ESP32 5V!',
    focusCamera: { position: [28, 32, 60], target: [20, 10, 44], fov: 26 },
    badgeColor: '#ea580c',
  },
  wire_cap: {
    id: 'wire_cap',
    name: 'Leitung 8: WLAN-Pufferelko (Rot/Schwarz kurz)',
    shortName: 'Pufferelko C1',
    category: 'Verkabelung',
    dimensions: 'Ultrakurze Anschlüsse (< 8 mm) parallel an 5V & GND',
    summary: 'C1 (100 µF / 10 V) parallel zwischen ESP32 5V (+) und ESP32 GND (-).',
    purpose: 'Liefert millisekundenschnelle Stromspitzen beim WLAN-Verbindungsaufbau, damit der Rechner niemals abstürzt.',
    multimeterValue: 'Im Betrieb ~4,50 V an den Elko-Beinchen (weißer Streifen = 0 V GND)',
    solderTip: 'Je kürzer die Beinchen zwischen C1 und den ESP32-Pads, desto besser filtert der Kondensator!',
    focusCamera: { position: [34, 30, 62], target: [24, 10, 48], fov: 26 },
    badgeColor: '#0ea5e9',
  },
}

// Automatically register all 16 ESP32-C3 SuperMini Castellated Pads into the inspector!
const ESP_PIN_COMPONENTS: Record<string, ComponentSpec> = {}
for (const pin of ESP32_PINS) {
  ESP_PIN_COMPONENTS[pin.id] = {
    id: pin.id,
    name: `ESP32-C3 Pin: ${pin.label}`,
    shortName: pin.label,
    category: 'Pin / Lötpad',
    dimensions: 'Vergoldetes Rand-Pad (Castellated Hole, 2,54 mm Raster)',
    summary: `${pin.side === 'left' ? 'Linke' : 'Rechte'} Pin-Reihe (#${pin.index + 1} ab USB-C): ${pin.signalRole}.`,
    purpose: pin.used
      ? `Aktiv genutzter Pin in diesem Umbau: ${pin.signalRole}.`
      : `In diesem Umbau ungenutzt (${pin.signalRole}). Bleibt frei und wird durch Kapton-Band isoliert.`,
    multimeterValue:
      pin.label === '5V'
        ? 'Aus: 0,00 V • Ein: ~4,50 V DC'
        : pin.label === 'GND'
          ? '0,00 V Bezugspotential (< 0,5 Ω zu -V_BAT)'
          : pin.label === '3V3'
            ? 'Ein: exakt 3,30 V DC (LDO Ausgang)'
            : pin.label.startsWith('GPIO20') || pin.label.startsWith('GPIO21')
              ? '3,3 V TTL UART Pegel (~1,00 kΩ zum Casio 2,5-mm-Pad)'
              : 'Max. 3,3 V Logikpegel (nicht 5-V-tolerant!)',
    solderTip: pin.used
      ? 'Pad kurz vorverzinnen, abisoliertes Drahtende (max. 2 mm) flach auflegen und 1–2 Sekunden sauber anlöten.'
      : 'Bleibt unbestückt – achte beim Löten der Nachbar-Pads darauf, keine Zinnbrücke hierher zu ziehen.',
    focusCamera: {
      position: [pin.worldPos[0] + 14, pin.worldPos[1] + 20, pin.worldPos[2] + 18],
      target: pin.worldPos,
      fov: 24,
    },
    badgeColor: pin.color,
  }
}

export const COMPONENTS_DB: Record<string, ComponentSpec> = {
  ...BASE_COMPONENTS,
  ...ESP_PIN_COMPONENTS,
}
