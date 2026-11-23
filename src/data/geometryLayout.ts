import type { Vec3 } from '../types'

// ============================================================================
// Single Source of Truth: Millimeter-Accurate Geometry (1 Three.js Unit = 1 mm)
// ============================================================================

export const CASIO = {
  WIDTH: 91.5, // X: -45.75 .. +45.75
  LENGTH: 184.0, // Z: -92.0 .. +92.0
  HEIGHT: 21.2, // Y: 0.0 (Front face) .. 21.2 (Back face)
  SPLIT_Y: 10.6,
  WALL: 2.0,
  CORNER_RADIUS: 8.5,
  PCB_THICKNESS: 1.6,
  PCB_BOTTOM_Y: 5.8,
  PCB_TOP_Y: 7.4,
} as const

// 6 Phillips housing screws (X, Z)
export const SCREW_POSITIONS: Vec3[] = [
  [-39.5, 20.4, -82.5],
  [39.5, 20.4, -82.5],
  [-40.5, 20.4, -5.0],
  [40.5, 20.4, -5.0],
  [-39.5, 20.4, 82.5],
  [39.5, 20.4, 82.5],
]

// 4x AAA NiMH battery centers (Ø 10.5 x 44.5 mm)
export const AAA_BAYS: { x: number; z: number; polarityTop: '+' | '-' }[] = [
  { x: -32.25, z: 58.25, polarityTop: '-' },
  { x: -20.25, z: 58.25, polarityTop: '+' },
  { x: -8.25, z: 58.25, polarityTop: '-' },
  { x: 3.75, z: 58.25, polarityTop: '+' },
]

export const BATTERY_BAY = {
  Y_CENTER: 9.6,
  CELL_RADIUS: 5.25,
  CELL_LENGTH: 44.5,
  // Top solder tabs directly accessible at Z = 34.4
  NEG_TAB: [-32.25, 9.4, 34.4] as Vec3, // -V_BAT (GND)
  POS_TAB: [3.75, 9.4, 34.4] as Vec3, // +V_BAT (4.8 - 6.0 V)
} as const

// CR2032 Backup Cell Holder on Casio mainboard
export const CR2032_POS: Vec3 = [-24.0, CASIO.PCB_TOP_Y, 13.5]

// Top edge ports on Casio mainboard
export const CASIO_PORTS = {
  MINI_USB: [-16.0, 9.5, -86.2] as Vec3,
  JACK_25MM: [16.0, 9.5, -83.8] as Vec3,
  // 3 large gold solder pads on the back of Casio PCB (Y = 7.48)
  PAD_SLEEVE_GND: [11.8, CASIO.PCB_TOP_Y + 0.12, -81.0] as Vec3,
  PAD_RING_RX: [16.0, CASIO.PCB_TOP_Y + 0.12, -77.2] as Vec3,
  PAD_TIP_TX: [20.2, CASIO.PCB_TOP_Y + 0.12, -73.4] as Vec3,
} as const

// ============================================================================
// ESP32-C3 SuperMini (exact 22.5 x 18.0 x 1.0 mm)
// Local frame:
//   X: -9.0 (Left pads) .. +9.0 (Right pads)
//   Y: -0.5 .. +0.5 (1.0 mm FR4 matte black)
//   Z: -11.25 (USB-C top) .. +11.25 (Red ceramic Wi-Fi antenna bottom)
// Placed in calculator right niche at center [28.2, 7.6, 58.5] with rotY = +PI/2:
//   local (lx, ly, lz) -> world (cx + lz, cy + ly, cz - lx)
//   so red ceramic antenna (+Z) points straight outward (+X) to calculator wall!
// ============================================================================
export const ESP32 = {
  WIDTH: 18.0,
  LENGTH: 22.5,
  THICKNESS: 1.0,
  CENTER: [28.2, 7.6, 58.5] as Vec3,
  ROTATION_Y: Math.PI / 2,
  PIN_PITCH: 2.54,
  PIN_START_Z: -8.2,
  PAD_X: 8.35,
} as const

export interface EspPinDef {
  id: string
  label: string
  side: 'left' | 'right'
  index: number
  localPos: Vec3
  worldPos: Vec3 // installed pos at modY = 0
  color: string
  used?: boolean
  signalRole: string
}

export function espLocalToCalc(local: Vec3): Vec3 {
  // rotation.y = +Math.PI / 2 => (lx, ly, lz) -> (cx + lz, cy + ly, cz - lx)
  return [
    ESP32.CENTER[0] + local[2],
    ESP32.CENTER[1] + local[1],
    ESP32.CENTER[2] - local[0],
  ]
}

const LEFT_PIN_NAMES: { label: string; role: string; color: string; used?: boolean }[] = [
  { label: 'GPIO5', role: 'Frei (ADC2 / SPI)', color: '#94a3b8' },
  { label: 'GPIO6', role: 'Frei (SPI CLK)', color: '#94a3b8' },
  { label: 'GPIO7', role: 'Frei (SPI SS)', color: '#94a3b8' },
  { label: 'GPIO8', role: 'Interne blaue Status-LED (Active-Low)', color: '#38bdf8', used: true },
  { label: 'GPIO9', role: 'BOOT-Taster (Strapping Pin)', color: '#94a3b8' },
  { label: 'GPIO10', role: 'Frei (PWM / GPIO)', color: '#94a3b8' },
  { label: 'GPIO20 (RX)', role: 'UART0 RX ← empfängt TX vom Casio (über R2 1 kΩ)', color: '#3b82f6', used: true },
  { label: 'GPIO21 (TX)', role: 'UART0 TX → sendet an RX vom Casio (über R3 1 kΩ)', color: '#22c55e', used: true },
]

const RIGHT_PIN_NAMES: { label: string; role: string; color: string; used?: boolean }[] = [
  { label: '5V', role: 'Versorgungseingang (~4,5 V hinter D1 1N4007 + C1 100 µF)', color: '#ef4444', used: true },
  { label: 'GND', role: 'Gemeinsame Masse (Batterie -V_BAT, Casio SLEEVE, SW1, C1 -)', color: '#64748b', used: true },
  { label: '3V3', role: 'Interner 3,3 V LDO-Ausgang (ME6211, max. 500 mA)', color: '#f59e0b' },
  { label: 'GPIO4', role: 'Frei (ADC1_CH4)', color: '#94a3b8' },
  { label: 'GPIO3', role: 'Frei (ADC1_CH3)', color: '#94a3b8' },
  { label: 'GPIO2', role: 'Frei (Strapping / ADC1_CH2)', color: '#94a3b8' },
  { label: 'GPIO1', role: 'Frei (ADC1_CH1)', color: '#94a3b8' },
  { label: 'GPIO0', role: 'Frei (ADC1_CH0)', color: '#94a3b8' },
]

export const ESP32_PINS: EspPinDef[] = [
  ...LEFT_PIN_NAMES.map((p, i) => {
    const lz = ESP32.PIN_START_Z + i * ESP32.PIN_PITCH
    const localPos: Vec3 = [-ESP32.PAD_X, 0.56, lz]
    return {
      id: `esp_pin_${p.label.split(' ')[0].toLowerCase()}`,
      label: p.label,
      side: 'left' as const,
      index: i,
      localPos,
      worldPos: espLocalToCalc(localPos),
      color: p.color,
      used: p.used,
      signalRole: p.role,
    }
  }),
  ...RIGHT_PIN_NAMES.map((p, i) => {
    const lz = ESP32.PIN_START_Z + i * ESP32.PIN_PITCH
    const localPos: Vec3 = [ESP32.PAD_X, 0.56, lz]
    return {
      id: `esp_pin_${p.label.split(' ')[0].toLowerCase()}`,
      label: p.label,
      side: 'right' as const,
      index: i,
      localPos,
      worldPos: espLocalToCalc(localPos),
      color: p.color,
      used: p.used,
      signalRole: p.role,
    }
  }),
]

export function getEspPin(namePrefix: string): EspPinDef {
  const found = ESP32_PINS.find((p) => p.label.startsWith(namePrefix))
  if (!found) {
    throw new Error(`Unknown ESP32 pin: ${namePrefix}`)
  }
  return found
}

// Key ESP32 pad installed coordinates
export const ESP_PAD = {
  V5: getEspPin('5V').worldPos, // [20.0, 8.16, 50.15]
  GND: getEspPin('GND').worldPos, // [22.54, 8.16, 50.15]
  V33: getEspPin('3V3').worldPos, // [25.08, 8.16, 50.15]
  GPIO20_RX: getEspPin('GPIO20').worldPos, // [35.24, 8.16, 66.85]
  GPIO21_TX: getEspPin('GPIO21').worldPos, // [37.78, 8.16, 66.85]
  ANTENNA_WORLD: espLocalToCalc([0, 0.9, 10.6]), // [38.8, 8.5, 58.5]
  LED_GPIO8_WORLD: espLocalToCalc([-3.6, 0.75, -1.8]), // [26.4, 8.35, 62.1]
} as const

// ============================================================================
// Safety & Switching Mod Electronics (in right niche / upper power cluster)
// ============================================================================
export const MOD_PARTS = {
  // AO3401 P-Channel MOSFET (SOT-23, 2.9 x 1.3 mm)
  AO3401: {
    CENTER: [17.4, 8.6, 36.6] as Vec3,
    PIN1_GATE: [16.1, 8.15, 35.65] as Vec3, // Pin 1 (links oben) = Gate (G)
    PIN2_SOURCE: [16.1, 8.15, 37.55] as Vec3, // Pin 2 (links unten) = Source (S)
    PIN3_DRAIN: [18.7, 8.15, 36.6] as Vec3, // Pin 3 (rechts einzeln) = Drain (D)
  },
  // R1: 10 kΩ Pull-up Resistor (Braun-Schwarz-Orange-Gold) between Source & Gate
  R1_10K: {
    CENTER: [13.2, 8.6, 36.6] as Vec3,
    LEAD_GATE: [13.2, 8.2, 33.9] as Vec3,
    LEAD_SOURCE: [13.2, 8.2, 39.3] as Vec3,
  },
  // D1: 1N4007 Diode (DO-41, silver cathode ring towards ESP32 5V)
  D1_1N4007: {
    CENTER: [19.9, 8.7, 43.2] as Vec3,
    LEAD_ANODE: [19.9, 8.35, 39.6] as Vec3,
    LEAD_CATHODE: [19.9, 8.35, 46.8] as Vec3, // Silver ring end!
  },
  // C1: 100 µF / 10 V Electrolytic Cap (laying horizontally, white '-' stripe on GND side)
  C1_100UF: {
    CENTER: [26.4, 9.9, 43.2] as Vec3,
    LEAD_POS: [25.2, 8.85, 47.6] as Vec3,
    LEAD_NEG: [27.6, 8.85, 47.6] as Vec3,
  },
  // SW1: Hidden Magnetic Reed Switch in glass tube along right outer wall
  SW1_REED: {
    CENTER: [40.4, 10.2, 37.5] as Vec3,
    LEAD_TOP_GATE: [40.4, 10.2, 29.4] as Vec3,
    LEAD_BOT_GND: [40.4, 10.2, 45.6] as Vec3,
  },
  // R2 & R3: 2x 1 kΩ UART Protection Resistors (Braun-Schwarz-Rot-Gold) inline near 2.5mm jack
  R2_1K_TX: {
    CENTER: [27.2, 8.6, -61.5] as Vec3,
    LEAD_TOP: [27.2, 8.2, -64.5] as Vec3,
    LEAD_BOT: [27.2, 8.2, -58.5] as Vec3,
  },
  R3_1K_RX: {
    CENTER: [31.6, 8.6, -61.5] as Vec3,
    LEAD_TOP: [31.6, 8.2, -64.5] as Vec3,
    LEAD_BOT: [31.6, 8.2, -58.5] as Vec3,
  },
} as const

// Installation Niche (Einbaunische) bounds right next to battery bay
export const NICHE_BOUNDS = {
  CENTER: [28.0, 7.6, 57.5] as Vec3,
  SIZE: [28.0, 7.2, 22.0] as Vec3,
} as const
