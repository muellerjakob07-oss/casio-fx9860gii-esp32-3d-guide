import type { CameraPresetId, CameraTarget, StepDefinition } from '../types'

export const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; description: string; camera: CameraTarget }
> = {
  overview: {
    label: 'Gesamtansicht',
    description: 'Studio-Perspektive auf den echten Zweistufen-Aufbau',
    camera: { position: [-84, 195, 192], target: [0, 8, 5], fov: 35 },
  },
  macro_solder: {
    label: 'Makro: Stufen-Nische',
    description: 'Nahaufnahme auf ESP32-C3, AO3401, D1 & C1 in der Stufe',
    camera: { position: [-14, 48, 56], target: [-10, 10, 17], fov: 32 },
  },
  pcb_top: {
    label: 'Platinen-Draufsicht',
    description: 'Senkrechte Ansicht exakt wie auf deinem Teardown-Foto',
    camera: { position: [0, 290, 8], target: [0, 8, 2], fov: 36 },
  },
  xray_side: {
    label: 'Seitenprofil (Stufe)',
    description: '6-mm-Höhenstufe zwischen CPU-Board CY802-1 & Tastenplatine',
    camera: { position: [-122, 52, 26], target: [-12, 10, 22], fov: 33 },
  },
}

export const STEPS: StepDefinition[] = [
  {
    id: 1,
    shortTitle: 'Vorbereitung',
    title: 'Vorbereitung, Akkus & Flash-Speicher',
    subtitle: '4× querliegende AAA-Zellen entnehmen und Spannung für den ESP32 planen',
    durationMin: '5 Min.',
    difficulty: 'Sehr leicht',
    summary:
      'Auf Basis deiner echten Hardware-Revision (CY802-1 / GY493-E4W) machst du den Rechner zuerst komplett stromlos. Gute Nachricht: Deine Programme liegen sicher im nichtflüchtigen Macronix-Flash-Chip („9A“) – eine CR2032-Stützbatterie gibt es bei diesem Modell nicht!',
    instructions: [
      'Schiebe auf der schwarzen Rückseite den Batteriefachdeckel nach unten ab und nimm alle 4 querliegenden AAA-Zellen heraus.',
      'Keine Sorge um deinen Speicher: Deine neuere „USB Power Graphic 2“-Revision nutzt den großen schwarzen MXIC NOR-Flash-Chip (Aufdruck „9A“) statt einer alten CR2032-Knopfzelle – Add-ins bleiben auch ohne Batterien dauerhaft erhalten.',
      'Lege für den späteren Betrieb 4× wiederaufladbare AAA-NiMH-Akkus (4 × 1,2 V ≈ 4,8–5,4 V) bereit. Zusammen mit der 1N4007-Diode bleibt der ESP32-C3 damit immer kühl und sicher unter seinem 6,0-V-Limit.',
    ],
    warning: {
      title: 'Immer stromlos löten!',
      text: 'Löte niemals bei eingelegten Batterien an den Kontakten P701 / P702 oder den Testpunkten T701 / T702.',
    },
    beginnerTip:
      'Sammle die 6 kleinen schwarzen Gehäuseschrauben wie auf deinem Foto direkt im umgedrehten Schiebedeckel (Hardcase), damit keine verloren geht.',
    multimeterCheck: {
      mode: 'Gleichspannung (V DC)',
      points: '4× NiMH-Akkus außerhalb in Reihe geprüft',
      expected: '4,8 V – 5,4 V DC (optimal für Diode D1 → ~4,5 V am ESP32)',
    },
    camera: { position: [-78, 198, 196], target: [0, 10, 14], fov: 35 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['battery_pack', 'mxic_flash', 'casio_housing'],
  },
  {
    id: 2,
    shortTitle: 'Öffnen & CN401',
    title: 'Gehäuse öffnen & Buchse CN401 (oben links) ausmessen',
    subtitle: 'Zweistufigen Platinen-Aufbau verstehen und die 3 Goldpads an CN401 prüfen',
    durationMin: '10 Min.',
    difficulty: 'Leicht',
    summary:
      'Nach dem Abheben der schwarzen Rückschale siehst du den echten Zweistufen-Aufbau: Oben sitzt erhöht das CPU-Board (CY802-1) mit der 2,5-mm-Buchse CN401 links und Mini-USB CN102 rechts; darunter liegt 6 mm tiefer die Tastenplatine (GY493-E4W).',
    instructions: [
      'Drehe die 6 schwarzen Kreuzschlitzschrauben (PH0) heraus und hebe nur die schwarze Rückschale ab. Lass die Platinen am besten in der hellsilbernen Vorderschale liegen – nimmst du sie heraus, fallen sonst leicht die unteren Zifferntasten (0, ·, EXP, EXE) aus dem Rahmen!',
      'Achte auf die 3 empfindlichen Original-Verbindungen: 1) das braune LCD-Flexkabel (S30FE02) oben mittig, 2) das weiße 21-polige fest verlötete Verbindungs-Flachbandkabel (JN701) rechts an der Stufe und 3) die rot/weißen Backlight-Drähte (P902) ganz oben links.',
      'Stecke einen 2,5-mm-Klinkenstecker oben links in CN401 und klingele mit dem Multimeter (Piepser) die bequemen quadratischen Gold-Prüfpads direkt neben/unter CN401 durch: Spitze (TIP = TX), Ring (RING = RX, Pad „Y“) und Schaft (SLEEVE = GND).',
    ],
    warning: {
      title: 'Weißes Flachbandkabel JN701 & Backlight P902 schützen!',
      text: 'Das weiße Kabel JN701 zwischen oberer und unterer Platine ist direkt verlötet (kein Stecker!). Klappe die beiden Platinen niemals auseinander und verwechsle die rot/weißen Backlight-Drähte an P902 nicht mit der Batterie!',
    },
    beginnerTip:
      'Die quadratischen Goldpads im weißen Siebdruckrahmen direkt neben CN401 lassen sich viel entspannter löten als die winzigen Buchsenbeinchen selbst!',
    multimeterCheck: {
      mode: 'Durchgangsprüfer (Beep / Ω)',
      points: '2,5-mm-Stecker (Tip / Ring / Sleeve) → Goldpads an CN401',
      expected: '< 0,5 Ω (eindeutiger Piepton pro Goldpad)',
    },
    camera: { position: [-56, 86, -18], target: [-22, 13, -72], fov: 35 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['jack_25mm', 'pad_tip', 'pad_ring', 'pad_sleeve', 'ffc_cable', 'lcd_flex_s30fe02', 'backlight_p902'],
  },
  {
    id: 3,
    shortTitle: 'UART links',
    title: 'UART-Leitungen entlang der linken Kante löten',
    subtitle: 'Gerader, kurzer Weg von CN401 (oben links) direkt in die linke Stufen-Nische',
    durationMin: '15 Min.',
    difficulty: 'Präzision',
    summary:
      'Da sowohl CN401 (oben links) als auch unsere Einbau-Stufe auf der linken Seite liegen, laufen die Datenleitungen schnurgerade am linken Rand entlang – weit weg vom empfindlichen weißen Flachbandkabel JN701!',
    instructions: [
      'Klebe am linken Rand der oberen Platine (unterhalb des unbestückten Goldpad-Felds JN101) ein kleines Stück Kapton-Band als isolierende Unterlage für R2 und R3 auf.',
      'Löte die blaue TX-Leitung vom CN401 TIP-Goldpad über R2 (1 kΩ, Braun-Schwarz-Rot-Gold) über Kreuz an ESP32 GPIO20 (RX).',
      'Löte die grüne RX-Leitung vom CN401 RING-Goldpad („Y“) über R3 (1 kΩ) an ESP32 GPIO21 (TX), und führe SLEEVE (GND) mit schwarzem Draht innen um die Stufe an ESP32 GND.',
    ],
    warning: {
      title: 'TX und RX über Kreuz + Antennen-Rand freihalten!',
      text: 'Casio TX geht an ESP32 RX (GPIO20), Casio RX geht an ESP32 TX (GPIO21). Führe das schwarze Massekabel auf der Innenseite des ESP32 entlang, damit die linke WLAN-Antenne frei bleibt.',
    },
    beginnerTip:
      'Verwende dünnen 0,25–0,35 mm Kynar-/Fädeldraht (30 AWG) – er schmiegt sich exakt in die 6-mm-Stufe hinter dem Metall-Displayrahmen ein.',
    multimeterCheck: {
      mode: 'Widerstand (Ω)',
      points: 'CN401 TIP → ESP32 GPIO20 | CN401 RING → ESP32 GPIO21',
      expected: 'jeweils ~1,00 kΩ (±5 %) • kein Kurzschluss zu GND',
    },
    camera: { position: [-68, 86, 18], target: [-28, 11, -28], fov: 35 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['wire_tx', 'wire_rx', 'wire_gnd_data', 'r2_1k', 'r3_1k', 'esp_pin_gpio20', 'esp_pin_gpio21'],
  },
  {
    id: 4,
    shortTitle: 'P701/P702 & MOSFET',
    title: 'Stromabgriff an P701/T701 & AO3401 High-Side-Schalter',
    subtitle: 'Sauber auf der Tastenplatine löten (ohne schmelzendes Plastik!) + 0,00 mA Standby',
    durationMin: '15 Min.',
    difficulty: 'Präzision',
    summary:
      'Auf deiner Tastenplatine GY493-E4W sitzen rechts die beiden Batteriefedern P702 (−V_BAT) und P701 (+V_BAT) samt ihren goldenen Prüfpads T702 und T701 – dort greifst du den Strom sauber ab, ohne ein Kunststofffach zu gefährden!',
    instructions: [
      'Greife Plus (+V_BAT) rechts unten am Lötpad P701 bzw. Goldpad T701 mit rotem Draht ab und führe ihn am oberen Rand des Batteriefachs zu AO3401 Pin 2 (Source). Greife Minus (−V_BAT / GND) oben rechts an P702 bzw. Goldpad T702 mit schwarzem Draht ab und führe ihn an ESP32 GND.',
      'Löte R1 (10 kΩ, Braun-Schwarz-Orange-Gold) direkt zwischen AO3401 Source (Pin 2) und Gate (Pin 1) – das hält den Ruhestrom ohne Magneten garantiert bei 0,00 mA.',
      'Lege den Glas-Reedschalter SW1 in den freien linken Seitenkanal neben den querliegenden AAA-Zellen und verbinde ihn zwischen AO3401 Gate (Pin 1) und ESP32 GND.',
    ],
    warning: {
      title: 'P701 (+) und P702 (−) niemals vertauschen!',
      text: 'Oben rechts an der Kegelfeder (P702 / T702) liegt Minus (GND), unten rechts an der flachen Spiralfeder (P701 / T701) liegt Plus (+4,8 bis +5,4 V). Prüfe das vorab kurz mit eingelegten Akkus per Multimeter!',
    },
    beginnerTip:
      'An den flachen Lötstellen von P701/T701 und P702/T702 direkt auf der FR4-Platine haftet frisches Lötzinn in 1–2 Sekunden perfekt.',
    multimeterCheck: {
      mode: 'Widerstand (kΩ)',
      points: 'AO3401 Pin 1 (Gate) ↔ Pin 2 (Source) | mit Magnet an linker Flanke: Gate ↔ GND',
      expected: '10,0 kΩ offen • < 1,0 Ω wenn Magnet an SW1 liegt',
    },
    camera: { position: [28, 66, 72], target: [6, 10, 34], fov: 34 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['battery_pack', 'ao3401', 'r1_10k', 'sw1_reed', 'wire_vbat_pos', 'wire_vbat_neg', 'wire_gate'],
  },
  {
    id: 5,
    shortTitle: 'Diode & Elko',
    title: 'Schutzdiode 1N4007 & flacher 100 µF Puffer-Elko in der Stufe',
    subtitle: 'Spannung um ~0,7 V senken und WLAN-Peaks direkt neben dem blauen Elko C302 puffern',
    durationMin: '10 Min.',
    difficulty: 'Leicht',
    summary:
      'Direkt unterhalb des originalen blauen Casio-Kondensators C302 ist in der 6-mm-Platinenstufe perfekt Platz für die Schutzdiode D1 (1N4007) und deinen flach liegenden 100-µF-Pufferelko C1.',
    instructions: [
      'Löte die Diode D1 (1N4007) zwischen AO3401 Pin 3 (Drain) und ESP32 5V. Achte auf den silbernen Kathoden-Ring: Er MUSS nach links zum ESP32-5V-Pin zeigen!',
      'Dadurch sinkt die Spannung von ~5,2 V sicher um ca. 0,7 V auf ~4,5 V – ideal für den ME6211-LDO auf dem ESP32-C3.',
      'Löte C1 (100 µF / 10 V) flach liegend in die Stufe direkt vor die 5V- und GND-Pads des ESP32. Der weiße Minus-Streifen zeigt nach links zum GND-Pad!',
    ],
    warning: {
      title: 'C1 unbedingt flach hinlegen & Polung beachten!',
      text: 'Stehend würde der Kondensator gegen die schwarze Rückschale stoßen. Liegend in der 6-mm-Stufe (genau wie der originale blaue C302 daneben!) passt alles problemlos.',
    },
    beginnerTip:
      'Prüfe vor dem Weiterbauen einmal im Diodentest: Von AO3401 Drain zum ESP32 5V-Pin ~0,6 V, in Gegenrichtung „OL“ (gesperrt).',
    multimeterCheck: {
      mode: 'Diodentest (▶|)',
      points: 'Rot an D1 Anode (rechts) • Schwarz an D1 Silberring (links)',
      expected: '0,55 V – 0,70 V Durchlassspannung • rückwärts OL',
    },
    camera: { position: [-6, 46, 54], target: [-8, 11, 18], fov: 31 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['d1_1n4007', 'c1_100uf', 'c302_cap', 'wire_5v_switched', 'wire_cap', 'esp_pin_5v', 'esp_pin_gnd'],
  },
  {
    id: 6,
    shortTitle: 'Kapton & Stufe',
    title: 'Kapton über T703–T719 & Einpassen in die Stufen-Nische',
    subtitle: 'Gold-Testpunkte isolieren, Antenne nach links außen richten & Deckelrippen prüfen',
    durationMin: '10 Min.',
    difficulty: 'Leicht',
    summary:
      'Auf deinem Foto der Tastenplatine GY493-E4W sieht man im Einbaubereich die offenen Gold-Testpunkte T703 bis T719 – diese klebst du zuerst mit Kapton-Band ab, bevor der ESP32 flach in die 6-mm-Stufe einzieht!',
    instructions: [
      'Klebe zuerst eine durchgehende Lage bernsteinfarbenes Kapton-Band flach auf die grüne Tastenplatine über die Testpunkte T703–T719 (unterhalb von C302 / SW301) und umwickle zusätzlich ESP32 + MOSFET-Schaltung.',
      'Positioniere den ESP32-C3 quer im linken Stufen-Graben (22,5 × 18 mm), sodass die rote Keramik-WLAN-Antenne frei nach LINKS zur Kunststoff-Außenwand zeigt – weit weg vom silbernen LCD-Blech und den 4 AAA-Zellen!',
      'Praxis-Check mit deiner schwarzen Rückschale: Im Stufenbereich hat die Rückschale innen dünne Kreuz-Versteifungsrippen. Drückt eine Rippe leicht auf die USB-C-Buchse, knipse diese Innenrippe einfach mit einem kleinen Seitenschneider 2–3 mm flach – von außen bleibt alles 100 % unsichtbar!',
    ],
    warning: {
      title: 'Testpunkte T703–T719 gehören zur Tastenmatrix!',
      text: 'Ohne Kapton-Isolierung auf der unteren Platine würde die Unterseite des ESP32 Tasten-Testpunkte kurzschließen („Geistertasten“). Mit einer Lage Kapton ist das zu 100 % ausgeschlossen!',
    },
    beginnerTip:
      'Prüfe auch, dass das kleine RESET-Loch über dem Gold-Mäander SW301 frei bleibt, falls du den Rechner später einmal zurücksetzen möchtest.',
    multimeterCheck: {
      mode: 'Widerstand (Ω)',
      points: 'Pad T701 (+V_BAT) ↔ Pad T702 (−V_BAT) ohne eingelegte Akkus',
      expected: '> 100 kΩ / OL (bestätigt: null Kurzschlüsse!)',
    },
    camera: { position: [-64, 74, 62], target: [-16, 9, 18], fov: 34 },
    defaultXray: 0,
    defaultPowerOn: false,
    highlightIds: ['kapton_tape', 'esp32_board', 'esp32_antenna', 'niche', 'casio_back_shell'],
  },
  {
    id: 7,
    shortTitle: 'Magnet-Test',
    title: 'Schwarze Rückschale schließen & Magnet-Test an linker Flanke',
    subtitle: 'Unsichtbarer Einbau: 0,00 mA im Schulalltag, Einschalten per Magnet links außen',
    durationMin: '5 Min.',
    difficulty: 'Fertigstellung',
    summary:
      'Du setzt die schwarze Rückschale wieder auf, drehst die 6 Schrauben ein und legst die 4 AAA-NiMH-Akkus quer ein. Von außen sieht dein fx-9860GII zu 100 % original aus!',
    instructions: [
      'Prüfe vor dem Aufsetzen der schwarzen Rückschale kurz, falls du die Platine herausgenommen hattest, dass alle weißen Zifferntasten (0, ·, EXP, EXE) richtig im Frontrahmen sitzen, und schraube die 6 Schrauben handfest ein.',
      'Lege die 4 geladenen AAA-NiMH-Akkus entsprechend der Zickzack-Polung quer ins Fach und schiebe den schwarzen Batteriedeckel zu. Ohne Magnet fließt exakt 0,00 mA Ruhestrom!',
      'Halte nun den kleinen Neodym-Magneten außen an die LINKE untere Gehäuseflanke (auf Höhe des Batteriefachs): Im Röntgenblick siehst du, wie SW1 schließt und die blaue GPIO8-LED auf dem ESP32-C3 aufleuchtet!',
    ],
    beginnerTip:
      'Nutze rechts im Steuerungs-HUD den Schalter „Magnet / SW1“ und den Röntgenblick-Slider, um live durch die schwarze Rückschale auf deine komplette Schaltung zu schauen.',
    multimeterCheck: {
      mode: 'Strom & Spannung im Betrieb',
      points: 'Ohne Magnet vs. Magnet an linker Gehäuseflanke',
      expected: 'Aus: 0,00 mA • Ein: ~4,50 V am ESP32 5V-Pin / ~85 mA aktiv',
    },
    camera: { position: [-106, 68, 76], target: [-20, 11, 32], fov: 34 },
    defaultXray: 65,
    defaultPowerOn: true,
    highlightIds: ['sw1_reed', 'esp32_led', 'casio_back_shell'],
  },
  {
    id: 8,
    shortTitle: 'Live-Betrieb',
    title: 'Live-Betrieb: Gemini Sachaufgabe auf dem 128×64 Display',
    subtitle: 'CN401 TX → ESP32 GPIO20 → WLAN HTTPS Gemini API → GPIO21 → Casio LCD',
    durationMin: 'Live-Demo',
    difficulty: 'Fertigstellung',
    summary:
      'Drehe den fertigen perlweiß-anthraziten CASIO fx-9860GII um und erlebe im Röntgenblick live, wie deine Frage über CN401 zum ESP32-C3 wandert, per WLAN von Gemini gelöst wird und als sauberer Rechenweg über das 128×64-LCD scrollt!',
    instructions: [
      '1. Anfrage (Blau / TX): Du tippst deine Aufgabe ein und drückst [EXE]. Blaue 3,3-V-UART-Impulse laufen von CN401 über R2 (1 kΩ) entlang der Außenkante in GPIO20 (RX).',
      '2. Cloud-Abfrage (WLAN): Der ESP32-C3 baut eine TLS-1.3-HTTPS-Verbindung über die frei zur Gehäuseseite gerichtete rote Keramik-Antenne zur Google Gemini API auf.',
      '3. Antwort (Grün / RX): Der strukturierte Lösungsweg fließt über GPIO21 (TX) und R3 zurück an CN401 (Pad „Y“) und scrollt gestochen scharf über das 128×64-Monochrom-Display.',
    ],
    beginnerTip:
      'Über den Button „Original-Fotos“ oben in der Leiste kannst du jederzeit deine echten Teardown-Aufnahmen direkt mit dem 3D-Modell vergleichen!',
    multimeterCheck: {
      mode: 'Serielles Protokoll',
      points: 'CN401 (3-Pin Serial) ↔ ESP32-C3 UART0',
      expected: '9600 / 115200 Baud • 3,3 V TTL • HTTPS TLS 1.3',
    },
    camera: { position: [84, 198, 156], target: [4, 14, -8], fov: 36 },
    defaultXray: 62,
    defaultPowerOn: true,
    highlightIds: ['casio_lcd', 'wire_tx', 'wire_rx', 'esp32_antenna', 'esp32_led'],
  },
]
