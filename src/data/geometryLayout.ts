import type { Vec3 } from '../types'

// ============================================================================
// Single Source of Truth: Photogrammetrically Calibrated Geometry (1 Unit = 1 mm)
// Based on real CASIO fx-9860GII (USB Power Graphic 2) Teardown:
//   - Upper CPU Daughterboard: CY802-1 / RJA532593-001V01 (elevated ~6 mm)
//   - Lower Keypad Mainboard:  GY493-E4W / RJA520455-001V02
// ============================================================================

export const CASIO = {
  WIDTH: 87.5, // Outer shell X: -43.75 .. +43.75 mm
  LENGTH: 184.0, // Outer shell Z: -92.0 .. +92.0 mm
  HEIGHT: 21.2, // Total thickness Y: 0.0 (Front face) .. 21.2 (Back face)
  SPLIT_Y: 11.2,
  WALL: 2.2,
  CORNER_RADIUS: 8.5,

  // Two-Board Stepped PCB Stack (exact match to side-profile teardown photo)
  LOWER_PCB_WIDTH: 74.0, // X: -37.0 .. +37.0 mm
  LOWER_PCB_Z_MIN: -26.0,
  LOWER_PCB_Z_MAX: 85.0, // length 111.0 mm
  LOWER_PCB_BOTTOM_Y: 4.6,
  LOWER_PCB_TOP_Y: 6.2,

  UPPER_PCB_WIDTH: 69.0, // X: -36.5 .. +32.5 mm
  UPPER_PCB_Z_MIN: -81.0,
  UPPER_PCB_Z_MAX: 1.5, // length 82.5 mm
  UPPER_PCB_BOTTOM_Y: 10.6,
  UPPER_PCB_TOP_Y: 12.2,

  PCB_THICKNESS: 1.6,
} as const

// 6 Black Phillips Housing Screws (PH0) on the rear shell
export const SCREW_POSITIONS: Vec3[] = [
  [-38.2, 20.4, -82.0],
  [38.2, 20.4, -82.0],
  [-39.0, 20.4, -6.0],
  [39.0, 20.4, -6.0],
  [-37.5, 20.4, 79.5],
  [37.5, 20.4, 79.5],
]

// 4x Horizontal AAA NiMH Cells (Ø 10.5 x 44.5 mm, lying along X axis!)
// Matches real P702 (top-right conical spring '-') and P701 (bottom-right spiral '+')
export const AAA_BAYS: { x: number; z: number; polarityRight: '+' | '-' }[] = [
  { x: 4.8, z: 32.0, polarityRight: '-' }, // Row 1: '-' right against conical spring P702
  { x: 4.8, z: 43.2, polarityRight: '+' }, // Row 2: '+' right
  { x: 4.8, z: 54.4, polarityRight: '-' }, // Row 3: '-' right
  { x: 4.8, z: 65.6, polarityRight: '+' }, // Row 4: '+' right against flat spiral P701
]

export const BATTERY_BAY = {
  Y_CENTER: 11.8,
  CELL_RADIUS: 5.15,
  CELL_LENGTH: 44.5,
  // Real solder joints / golden test pads on lower PCB GY493-E4W right edge!
  P702_SPRING_BASE: [31.8, 7.2, 37.2] as Vec3, // -V_BAT / GND spring foot
  P701_SPRING_BASE: [31.8, 7.2, 60.5] as Vec3, // +V_BAT spring foot
  NEG_TAB: [27.6, CASIO.LOWER_PCB_TOP_Y + 0.15, 37.8] as Vec3, // Golden Testpad T702 (-V_BAT / GND)
  POS_TAB: [24.8, CASIO.LOWER_PCB_TOP_Y + 0.15, 59.8] as Vec3, // Golden Testpad T701 (+V_BAT)
} as const

// Real Upper CPU Daughterboard (CY802-1) Ports & Landmarks
// Looking at opened back (ports at Z = -81 mm):
//   - LEFT:   CN401 (2.5mm TRS Serial Jack) + P902 (R/W Backlight wires)
//   - CENTER: S30FE02 (Dark-brown polyimide LCD flex cable)
//   - RIGHT:  CN102 (Silver Mini-USB receptacle)
export const CASIO_PORTS = {
  JACK_25MM: [-25.0, 14.2, -78.2] as Vec3, // CN401 (Top-Left!)
  MINI_USB: [19.0, 14.1, -79.2] as Vec3, // CN102 (Top-Right!)
  LCD_FLEX_TOP: [-2.5, 12.4, -75.2] as Vec3, // S30FE02 brown Kapton LCD FPC
  BACKLIGHT_PADS: [-33.5, 12.4, -75.5] as Vec3, // P902 Red/White backlight wires
  BOARD_FFC_BRIDGE: [20.0, 9.5, 5.0] as Vec3, // JN701 white 21-pin soldered board-to-board FFC
  BLUE_CAP_C302: [-1.2, 9.6, 5.8] as Vec3, // C302 horizontal light-blue elko at step edge
  MXIC_FLASH: [-22.0, 12.8, -23.0] as Vec3, // Macronix NOR Flash TSOP-48 ("9A")

  // 3 Real Accessible Solder/Test Pads around CN401 on CY802-1 (Y = 12.28):
  PAD_SLEEVE_GND: [-28.2, CASIO.UPPER_PCB_TOP_Y + 0.12, -79.2] as Vec3, // CN401 GND foot
  PAD_RING_RX: [-19.5, CASIO.UPPER_PCB_TOP_Y + 0.12, -73.0] as Vec3, // Square gold pad "Y" (RX)
  PAD_TIP_TX: [-24.8, CASIO.UPPER_PCB_TOP_Y + 0.12, -70.8] as Vec3, // Square gold pad below Tip (TX)
} as const

// ============================================================================
// ESP32-C3 SuperMini (exact 22.5 x 18.0 x 1.0 mm)
// Installed flat in the REAL Left Step-Trench (below CY802-1, above AAA bay)
// Center: [-23.2, 7.2, 14.2] with ROTATION_Y = -Math.PI / 2:
//   local (lx, ly, lz) -> world (cx - lz, cy + ly, cz + lx)
//   - Red Ceramic Wi-Fi Antenna (+lz) points LEFT (-X = -33.8) to outer ABS wall!
//   - USB-C (-lz) points RIGHT (+X = -13.2) into open step trench
//   - GPIO20/GPIO21 (lx = -8.35) sit at Z = +5.85 facing straight up to CN401!
//   - 5V/GND (lx = +8.35) sit at Z = +22.55 right next to power cluster!
// ============================================================================
export const ESP32 = {
  WIDTH: 18.0,
  LENGTH: 22.5,
  THICKNESS: 1.0,
  CENTER: [-23.2, 7.2, 14.2] as Vec3,
  ROTATION_Y: -Math.PI / 2,
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
  worldPos: Vec3
  color: string
  used?: boolean
  signalRole: string
}

export function espLocalToCalc(local: Vec3): Vec3 {
  // rotation.y = -Math.PI / 2 => (lx, ly, lz) -> (cx - lz, cy + ly, cz + lx)
  return [
    ESP32.CENTER[0] - local[2],
    ESP32.CENTER[1] + local[1],
    ESP32.CENTER[2] + local[0],
  ]
}

const LEFT_PIN_NAMES: { label: string; role: string; color: string; used?: boolean }[] = [
  { label: 'GPIO5', role: 'Frei (ADC2 / SPI)', color: '#94a3b8' },
  { label: 'GPIO6', role: 'Frei (SPI CLK)', color: '#94a3b8' },
  { label: 'GPIO7', role: 'Frei (SPI SS)', color: '#94a3b8' },
  { label: 'GPIO8', role: 'Interne blaue Status-LED (Active-Low)', color: '#38bdf8', used: true },
  { label: 'GPIO9', role: 'BOOT-Taster (Strapping Pin)', color: '#94a3b8' },
  { label: 'GPIO10', role: 'Frei (PWM / GPIO)', color: '#94a3b8' },
  { label: 'GPIO20 (RX)', role: 'UART0 RX ← empfängt TX von CN401 TIP (über R2 1 kΩ)', color: '#3b82f6', used: true },
  { label: 'GPIO21 (TX)', role: 'UART0 TX → sendet an RX von CN401 RING (über R3 1 kΩ)', color: '#22c55e', used: true },
]

const RIGHT_PIN_NAMES: { label: string; role: string; color: string; used?: boolean }[] = [
  { label: '5V', role: 'Versorgungseingang (~4,5 V hinter D1 1N4007 + C1 100 µF)', color: '#ef4444', used: true },
  { label: 'GND', role: 'Gemeinsame Masse (T702/P702 -V_BAT, CN401 SLEEVE, SW1, C1 -)', color: '#64748b', used: true },
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

export const ESP_PAD = {
  V5: getEspPin('5V').worldPos, // [-15.0, 7.76, 22.55]
  GND: getEspPin('GND').worldPos, // [-17.54, 7.76, 22.55]
  V33: getEspPin('3V3').worldPos, // [-20.08, 7.76, 22.55]
  GPIO20_RX: getEspPin('GPIO20').worldPos, // [-30.24, 7.76, 5.85]
  GPIO21_TX: getEspPin('GPIO21').worldPos, // [-32.78, 7.76, 5.85]
  ANTENNA_WORLD: espLocalToCalc([0, 0.9, 10.6]), // [-33.8, 8.1, 14.2] (Left outer wall!)
  LED_GPIO8_WORLD: espLocalToCalc([-3.6, 0.75, -1.8]), // [-21.4, 7.95, 10.6]
} as const

// ============================================================================
// Safety & Switching Mod Electronics (placed in real Step-Trench & Left Margin)
// ============================================================================
export const MOD_PARTS = {
  // AO3401 P-Channel MOSFET (SOT-23, 2.9 x 1.3 mm) in right-center step pocket
  AO3401: {
    CENTER: [5.5, 7.5, 19.5] as Vec3,
    PIN1_GATE: [4.2, 7.1, 18.55] as Vec3, // Pin 1 (links oben) = Gate (G)
    PIN2_SOURCE: [4.2, 7.1, 20.45] as Vec3, // Pin 2 (links unten) = Source (S)
    PIN3_DRAIN: [6.8, 7.1, 19.5] as Vec3, // Pin 3 (rechts einzeln) = Drain (D)
  },
  // R1: 10 kΩ Pull-up Resistor (Braun-Schwarz-Orange-Gold) between Source & Gate
  R1_10K: {
    CENTER: [9.8, 7.5, 19.5] as Vec3,
    LEAD_GATE: [9.8, 7.1, 16.5] as Vec3,
    LEAD_SOURCE: [9.8, 7.1, 22.5] as Vec3,
  },
  // D1: 1N4007 Diode (DO-41, silver cathode ring towards ESP32 5V at -X!)
  D1_1N4007: {
    CENTER: [-3.2, 7.7, 22.2] as Vec3,
    LEAD_ANODE: [0.4, 7.35, 22.2] as Vec3, // Connected to AO3401 Drain
    LEAD_CATHODE: [-6.8, 7.35, 22.2] as Vec3, // Silver ring side -> ESP32 5V!
  },
  // C1: 100 µF / 10 V Electrolytic Cap (laying flat in step trench, '-' stripe to GND)
  C1_100UF: {
    CENTER: [-7.5, 8.9, 15.8] as Vec3,
    LEAD_POS: [-9.2, 7.85, 19.8] as Vec3,
    LEAD_NEG: [-11.6, 7.85, 19.8] as Vec3,
  },
  // SW1: Hidden Magnetic Reed Switch in free left channel beside AAA battery bay!
  SW1_REED: {
    CENTER: [-33.5, 8.2, 42.0] as Vec3,
    LEAD_TOP_GATE: [-33.5, 8.2, 33.8] as Vec3,
    LEAD_BOT_GND: [-33.5, 8.2, 50.2] as Vec3,
  },
  // R2 & R3: 2x 1 kΩ UART Protection Resistors along left edge below CN401
  R2_1K_TX: {
    CENTER: [-30.4, 13.0, -34.0] as Vec3,
    LEAD_TOP: [-30.4, 12.6, -37.0] as Vec3,
    LEAD_BOT: [-30.4, 12.6, -31.0] as Vec3,
  },
  R3_1K_RX: {
    CENTER: [-34.0, 13.0, -34.0] as Vec3,
    LEAD_TOP: [-34.0, 12.6, -37.0] as Vec3,
    LEAD_BOT: [-34.0, 12.6, -31.0] as Vec3,
  },
} as const

// Real Step-Trench Installation Niche (Stufen-Nische zwischen CPU-Board & Batteriefach)
export const NICHE_BOUNDS = {
  CENTER: [-10.5, 6.4, 14.5] as Vec3,
  SIZE: [50.0, 7.5, 21.0] as Vec3,
} as const
