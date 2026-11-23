import type { CameraPresetId, CameraTarget, StepDefinition } from '../types'

export const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; description: string; camera: CameraTarget }
> = {
  overview: {
    label: 'Gesamtansicht',
    description: 'Studio-Perspektive auf den kompletten Rechner',
    camera: { position: [86, 138, 128], target: [0, 8, 2], fov: 35 },
  },
  macro_solder: {
    label: 'Makro: Lötstelle',
    description: 'Nahaufnahme auf AO3401, D1, C1 und ESP32-Pads',
    camera: { position: [38, 42, 68], target: [22, 10, 46], fov: 32 },
  },
  pcb_top: {
    label: 'Platine von oben',
    description: 'Senkrechte Draufsicht auf Verkabelung & Pads',
    camera: { position: [2, 225, 14], target: [2, 8, 2], fov: 36 },
  },
  xray_side: {
    label: 'Röntgen-Seite',
    description: 'Seitenblick auf Antenne, Reedschalter & Bauhöhe',
    camera: { position: [122, 46, 56], target: [18, 10, 44], fov: 33 },
  },
}

export const STEPS: StepDefinition[] = [
  {
    id: 1,
    shortTitle: 'Vorbereitung',
    title: 'Vorbereitung & Sicherheits-Check',
    subtitle: 'AAA-Akkus herausnehmen, CR2032 schützen und Spannung verstehen',
    durationMin: '5 Min.',
    difficulty: 'Sehr leicht',
    summary:
      'Bevor du den Schraubendreher ansetzt, machst du den Rechner spannungsfrei. Gleichzeitig schützt du deinen Speicher und wählst die richtige Akku-Spannung für den ESP32-C3.',
    instructions: [
      'Schiebe den Batteriefachdeckel auf und nimm alle 4 AAA-Akkus heraus, damit beim Löten kein Kurzschluss entstehen kann.',
      'Lass die kleine runde CR2032-Knopfzelle unbedingt im Halter! Sie versorgt den Arbeitsspeicher (RAM) – entfernst du sie, werden alle Programme und Add-ins gelöscht.',
      'Nutze unbedingt 4× NiMH-Akkus (4 × 1,2 V ≈ 4,8–5,2 V) statt frischer Einweg-Alkaline-Zellen (bis 6,4 V). Zusammen mit der 1N4007-Diode bleibt der ESP32-C3 immer sicher unter seinem 6,0-V-Limit.',
    ],
    warning: {
      title: 'CR2032 nicht entfernen!',
      text: 'Ziehst du die Backup-Knopfzelle heraus, während die AAA-Zellen draußen sind, führt der Casio sofort einen Werksreset durch.',
    },
    beginnerTip:
      'Lege dir ein kleines Magnet-Schälchen für die 6 Gehäuseschrauben bereit und reinige deine Lötspitze vorab mit feuchtem Schwamm oder Messingwolle.',
    multimeterCheck: {
      mode: 'Gleichspannung (V DC)',
      points: 'Alle 4 AAA-Akkus in Reihe gemessen',
      expected: '4,8 V – 5,4 V (NiMH voll geladen)',
    },
    camera: { position: [-82, 206, 204], target: [-6, 8, 8], fov: 35 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['battery_pack', 'cr2032', 'casio_housing'],
  },
  {
    id: 2,
    shortTitle: 'Öffnen & Messen',
    title: 'Gehäuse öffnen & Klinkenbuchse ausmessen',
    subtitle: '6 Schrauben lösen, Rückschale abheben und Tip/Ring/Sleeve prüfen',
    durationMin: '10 Min.',
    difficulty: 'Leicht',
    summary:
      'Jetzt öffnest du die Rückschale und misst mit dem Multimeter exakt aus, welches große Lötpad an der 2,5-mm-Buchse zu Spitze (TX), Ring (RX) und Schaft (GND) gehört.',
    instructions: [
      'Drehe alle 6 Kreuzschlitzschrauben (PH0) vorsichtig heraus und hebe die Rückschale sanft nach oben ab – ohne an Kabeln zu zerren.',
      'Achtung in der Platinenmitte: Das weiße 24-polige Display-Flachbandkabel (FFC) niemals knicken oder abziehen!',
      'Stecke einen 2,5-mm-Klinkenstecker (oder ein offenes Kabel) in die obere serielle Buchse und prüfe im Durchgangsmodus (Piepser) die 3 großen Lötpads: TIP = TX, RING = RX, SLEEVE = GND.',
    ],
    warning: {
      title: 'Flachbandkabel nicht berühren!',
      text: 'Das breite weiße Display-Flachbandkabel in der Mitte ist geklebt bzw. empfindlich geklemmt. Schon ein scharfer Knick kann Streifen im LCD verursachen.',
    },
    beginnerTip:
      'Wenn dein Multimeter bei ~0,2 Ω piept, hast du das richtige Pad gefunden. Markiere dir TIP (Blau), RING (Grün) und SLEEVE (Schwarz) kurz mit einem feinen Stift auf deiner Skizze.',
    multimeterCheck: {
      mode: 'Durchgangsprüfer (Beep / Ω)',
      points: '2,5-mm-Stecker (Tip / Ring / Sleeve) → Lötpads',
      expected: '< 0,5 Ω (klarer Piepton auf exakt einem Pad)',
    },
    camera: { position: [56, 94, -12], target: [12, 8, -72], fov: 35 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['jack_25mm', 'pad_tip', 'pad_ring', 'pad_sleeve', 'ffc_cable'],
  },
  {
    id: 3,
    shortTitle: 'UART löten',
    title: 'UART-Datenleitungen löten (TX / RX + 1 kΩ)',
    subtitle: 'Überkreuz-Verbindung mit Schutz-Widerständen für die Casio-CPU',
    durationMin: '15 Min.',
    difficulty: 'Präzision',
    summary:
      'Über diese drei feinen Drähte spricht dein Casio später mit dem ESP32-C3. Die zwei 1-kΩ-Widerstände schützen die empfindliche Casio-CPU zuverlässig vor Rückströmen.',
    instructions: [
      'Verzinne zuerst die 3 Casio-Pads (TIP, RING, SLEEVE) sowie GPIO20 (RX), GPIO21 (TX) und GND am ESP32-C3 ganz dünn bei ~320 °C.',
      'Löte die blaue TX-Leitung von Casio TIP (TX) über den 1-kΩ-Widerstand R2 (Braun-Schwarz-Rot-Gold) an ESP32 GPIO20 (RX) – immer über Kreuz!',
      'Löte die grüne RX-Leitung von Casio RING (RX) über R3 (1 kΩ) an ESP32 GPIO21 (TX), und verbinde Casio SLEEVE (GND) mit schwarzem Draht direkt an ESP32 GND.',
    ],
    warning: {
      title: 'Immer über Kreuz verbinden!',
      text: 'Sender spricht zu Empfänger: Casio TX (TIP) geht an ESP32 RX (GPIO20), und Casio RX (RING) geht an ESP32 TX (GPIO21).',
    },
    beginnerTip:
      'Kürze die Beinchen der 1-kΩ-Widerstände sauber auf ~3 mm und schrumpfe sie später ein oder isoliere sie mit Kapton-Band, damit nichts die grüne Platine berührt.',
    multimeterCheck: {
      mode: 'Widerstand (Ω)',
      points: 'Casio TIP → ESP32 GPIO20 | Casio RING → ESP32 GPIO21',
      expected: 'jeweils ~1,00 kΩ (±5 %) • kein Kurzschluss zu GND',
    },
    camera: { position: [64, 76, -12], target: [24, 9, -62], fov: 34 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['wire_tx', 'wire_rx', 'wire_gnd_data', 'r2_1k', 'r3_1k', 'esp_pin_gpio20', 'esp_pin_gpio21'],
  },
  {
    id: 4,
    shortTitle: 'MOSFET & R1',
    title: 'AO3401 High-Side-Schalter & 10 kΩ Pull-up',
    subtitle: 'Echter 0,00-mA-Standby dank P-Kanal-MOSFET und Reedschalter',
    durationMin: '15 Min.',
    difficulty: 'Präzision',
    summary:
      'Damit der ESP32 deine Batterien im normalen Schulalltag nicht leerzieht, schaltet der winzige AO3401-MOSFET den Strom komplett ab – auf echte 0,00 mA Ruhestrom.',
    instructions: [
      'Lege den AO3401 (Aufdruck „A19T“) so vor dich, dass die 2 Beinchen links sind: Pin 1 (links oben) = Gate, Pin 2 (links unten) = Source, Pin 3 (rechts einzeln) = Drain.',
      'Löte R1 (10 kΩ, Braun-Schwarz-Orange-Gold) direkt zwischen Source (Pin 2) und Gate (Pin 1). Dieser Pull-up zieht das Gate sicher auf Plus – der MOSFET sperrt komplett!',
      'Verbinde Batteriefach +V_BAT (rot) mit Source (Pin 2), Batteriefach -V_BAT (schwarz) mit ESP32 GND, und verbinde den Reedschalter SW1 zwischen Gate (Pin 1) und GND.',
    ],
    warning: {
      title: 'Pin-Belegung des SOT-23 genau prüfen!',
      text: 'Vertauschst du Source und Drain, leitet die interne Body-Diode dauerhaft und der ESP32 lässt sich nicht mehr ausschalten.',
    },
    beginnerTip:
      'Fixiere den winzigen AO3401 zum Löten mit einem kleinen Streifen Krepp- oder Kapton-Band auf dem Tisch – so verrutscht er nicht beim Anlöten der feinen Drähte.',
    multimeterCheck: {
      mode: 'Widerstand (kΩ)',
      points: 'AO3401 Pin 1 (Gate) ↔ Pin 2 (Source)',
      expected: '10,0 kΩ • bei Magnet an SW1: Gate ↔ GND < 1 Ω',
    },
    camera: { position: [34, 48, 72], target: [22, 13, 38], fov: 32 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['ao3401', 'r1_10k', 'sw1_reed', 'wire_vbat_pos', 'wire_vbat_neg', 'wire_gate'],
  },
  {
    id: 5,
    shortTitle: 'Diode & Elko',
    title: 'Schutzdiode 1N4007 & 100 µF Puffer-Elko',
    subtitle: 'Spannung sicher senken und 300-mA-WLAN-Stromspitzen abfedern',
    durationMin: '10 Min.',
    difficulty: 'Leicht',
    summary:
      'Zwei kleine Bauteile machen den Unterschied zwischen abstürzendem Gebastel und absolut stabiler Hardware: die 1N4007 senkt die Spannung, der 100-µF-Elko fängt WLAN-Peaks ab.',
    instructions: [
      'Achte bei der Diode D1 (1N4007) zwingend auf den silbernen Ring (Kathode): Dieser Ring MUSS in Richtung ESP32-5V-Pin zeigen! Die schwarze Seite (Anode) kommt an AO3401 Drain (Pin 3).',
      'Durch die 1N4007 sinkt die Batteriespannung sauber um ca. 0,7 V (von ~5,2 V auf ~4,5 V) – der ME6211-Spannungsregler auf dem ESP32 läuft damit kühl und absolut sicher.',
      'Löte den Elektrolytkondensator C1 (100 µF / 10 V) liegend parallel an ESP32 5V (+) und GND (-). Der helle Minus-Streifen am Gehäuse gehört zwingend an GND!',
    ],
    warning: {
      title: 'Polung von Diode & Elko doppelt prüfen!',
      text: 'Ein verpolter Elektrolytkondensator wird heiß und geht kaputt. Eine verpolte 1N4007 sperrt den Strom komplett (ESP32 bleibt tot).',
    },
    beginnerTip:
      'Merksatz für den silbernen Ring der Diode: Der Ring ist wie ein Pfeil-Balken – der Strom fließt von der schwarzen Seite hin zum silbernen Ring in den ESP32 hinein.',
    multimeterCheck: {
      mode: 'Diodentest (▶|)',
      points: 'Rot an D1 Anode (Drain) • Schwarz an D1 Kathode (Silberring)',
      expected: '0,55 V – 0,70 V Durchlassspannung (umgekehrt: OL)',
    },
    camera: { position: [44, 48, 78], target: [24, 13, 46], fov: 32 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['d1_1n4007', 'c1_100uf', 'wire_5v_switched', 'wire_cap', 'esp_pin_5v', 'esp_pin_gnd'],
  },
  {
    id: 6,
    shortTitle: 'Kapton & Einbau',
    title: 'Kapton-Isolierung & Einbau in die Gehäusenische',
    subtitle: 'Elektronik sicher isolieren und WLAN-Antenne optimal ausrichten',
    durationMin: '10 Min.',
    difficulty: 'Leicht',
    summary:
      'Vor dem Einsetzen hüllst du den ESP32-C3 und die MOSFET-Schaltung sauber in bernsteinfarbenes Kapton-Band ein und platzierst das Modul exakt in der freien Nische.',
    instructions: [
      'Umwickle die gesamte Löt-Elektronik (ESP32-C3, AO3401, R1, D1) sauber mit hitzebeständigem Kapton-Isolierband, sodass kein blankes Metall die Casio-Platine berühren kann.',
      'Lass die kleine rote Keramik-WLAN-Antenne am Ende des ESP32 frei und richte sie direkt zur rechten Gehäuse-Außenwand aus – weg von Batterien und Kupferflächen!',
      'Schiebe den Reedschalter SW1 ebenfalls ganz nah an die rechte Außenwand, damit dein kleiner Magnet ihn später mühelos durch das Plastik hindurch auslösen kann.',
    ],
    warning: {
      title: 'Keine Metallteile vor der roten Keramik-Antenne!',
      text: 'Die rot markierte Antenna-Keep-Out-Zone muss frei von Batterien und Kabeln bleiben, sonst sinkt deine WLAN-Reichweite dramatisch.',
    },
    beginnerTip:
      'Ein winziger Tropfen Heißkleber oder doppelseitiges Schaumstoffband am Boden der Nische verhindert, dass im geschlossenen Taschenrechner später etwas klappert.',
    multimeterCheck: {
      mode: 'Widerstand (Ω)',
      points: 'Batterie +V_BAT ↔ Batterie -V_BAT (ohne Batterien)',
      expected: '> 100 kΩ / OL (garantiert kein Kurzschluss!)',
    },
    camera: { position: [74, 68, 92], target: [28, 9, 54], fov: 33 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['kapton_tape', 'esp32_board', 'esp32_antenna', 'niche', 'sw1_reed'],
  },
  {
    id: 7,
    shortTitle: 'Magnet-Test',
    title: 'Gehäuse schließen & Magnet-Test (SW1)',
    subtitle: 'Unsichtbarer Einbau prüfen: 0,00 mA im Standby, blaues Aufblinken mit Magnet',
    durationMin: '5 Min.',
    difficulty: 'Fertigstellung',
    summary:
      'Du schließt den Casio wieder komplett – von außen ist absolut nichts vom Umbau zu sehen! Jetzt testest du den unsichtbaren Magnet-Schalter im Röntgenblick.',
    instructions: [
      'Setze die Rückschale passgenau auf (ohne Kabel einzuklemmen!), drehe alle 6 Gehäuseschrauben wieder handfest ein und lege die 4 AAA-NiMH-Akkus wieder ein.',
      'Prüfe ohne Magnet: Der AO3401 sperrt komplett, der Ruhestrom beträgt exakt 0,00 mA – dein Casio funktioniert völlig normal wie ab Werk.',
      'Führe nun den kleinen Neodym-Magneten von außen an die rechte Gehäuseflanke auf Höhe von SW1: Die Kontakte im Glasröhrchen schließen hörbar leise und die blaue GPIO8-LED erwacht zum Leben!',
    ],
    beginnerTip:
      'Probiere rechts im Steuerungs-HUD den Schalter „Magnet / SW1 (Ein/Aus)“ aus und schiebe den Röntgenblick-Slider, um live zu beobachten, wie die Kontaktzungen im Glasröhrchen schalten.',
    multimeterCheck: {
      mode: 'Strom (mA) / Spannung (V)',
      points: 'Ohne Magnet vs. Magnet an rechter Flanke',
      expected: 'Aus: 0,00 mA • Ein: 4,50 V am ESP32 / ~85 mA aktiv',
    },
    camera: { position: [108, 66, 78], target: [24, 12, 46], fov: 34 },
    defaultXray: 62,
    defaultPowerOn: true,
    highlightIds: ['sw1_reed', 'esp32_led', 'casio_back_shell'],
  },
  {
    id: 8,
    shortTitle: 'Live-Betrieb',
    title: 'Live-Betrieb: Gemini Sachaufgabe lösen',
    subtitle: 'UART-Anfrage → WLAN HTTPS zur Gemini API → Rechenweg auf dem 128×64 LCD',
    durationMin: 'Live-Demo',
    difficulty: 'Fertigstellung',
    summary:
      'Erlebe deinen fertigen Umbau in Aktion! Im Röntgenblick siehst du gleichzeitig den echten 128×64-Pixel-Bildschirm und den gesamten Datenfluss über UART und WLAN.',
    instructions: [
      '1. Anfrage (Blau / TX): Du tippst auf dem Casio eine Sachaufgabe ein und drückst [EXE]. Blaue 3,3-V-UART-Impulse flitzen über TIP und R2 (1 kΩ) zu GPIO20 (RX).',
      '2. Cloud-Abfrage (WLAN): Der ESP32-C3 sendet den Prompt per verschlüsseltem HTTPS-POST über die rote Keramik-Antenne direkt an die Google Gemini API.',
      '3. Antwort (Grün / RX): Die fertige Lösung fließt als grüner Datenstrom über GPIO21 (TX) und R3 zurück an den Casio und scrollt sauber lesbar über das 128×64-Monochrom-Display.',
    ],
    beginnerTip:
      'Du kannst das Modell auch jetzt frei drehen, heranzoomen oder den Röntgenblick auf 0 % stellen, um den unauffälligen Original-Look von außen zu bewundern.',
    multimeterCheck: {
      mode: 'UART Baudrate & Pegel',
      points: 'Casio Serial (3-Pin 2,5 mm) ↔ ESP32 UART0',
      expected: '9600 / 115200 Baud • 3,3 V TTL Logikpegel • TLS 1.3',
    },
    camera: { position: [-88, 204, 158], target: [-6, 14, -10], fov: 36 },
    defaultXray: 62,
    defaultPowerOn: true,
    highlightIds: ['casio_lcd', 'wire_tx', 'wire_rx', 'esp32_antenna', 'esp32_led'],
  },
]
