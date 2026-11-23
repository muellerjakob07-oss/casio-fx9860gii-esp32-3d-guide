export type ThemeMode = 'dark' | 'light'

export type CameraPresetId =
  | 'overview'
  | 'macro_solder'
  | 'pcb_top'
  | 'xray_side'

export type LivePhase = 'idle' | 'tx' | 'wifi' | 'rx' | 'lcd'

export type Vec3 = [number, number, number]

export interface CameraTarget {
  position: Vec3
  target: Vec3
  fov?: number
}

export interface StepDefinition {
  id: number // 1..8
  shortTitle: string
  title: string
  subtitle: string
  durationMin: string
  difficulty: 'Sehr leicht' | 'Leicht' | 'Präzision' | 'Fertigstellung'
  summary: string
  instructions: string[]
  warning?: {
    title: string
    text: string
  }
  beginnerTip: string
  multimeterCheck: {
    mode: string
    points: string
    expected: string
  }
  camera: CameraTarget
  defaultXray: number // 0..100
  defaultPowerOn: boolean
  highlightIds: string[]
}

export interface PinInfo {
  pin: string
  signal: string
  color: string
  note: string
}

export interface ComponentSpec {
  id: string
  name: string
  shortName: string
  category:
    | 'Taschenrechner'
    | 'Hauptplatine'
    | 'ESP32-C3'
    | 'Schutz-Elektronik'
    | 'Verkabelung'
    | 'Pin / Lötpad'
  dimensions: string
  summary: string
  purpose: string
  pinout?: PinInfo[]
  multimeterValue: string
  solderTip: string
  focusCamera: CameraTarget
  badgeColor: string
}

export interface ChecklistItem {
  id: string
  step: number
  title: string
  detail: string
  critical?: boolean
}

export interface LayerOffsets {
  frontShellY: number
  pcbY: number
  batteriesY: number
  r2r3Y: number
  modY: number
  sw1Y: number
  backShellY: number
  screwsY: number
  batteryDoorOffset: number
  batteriesEject: number // 0 = seated, 1 = lifted out
  backShellOpen: number // 0 = closed, 1 = opened aside
  screwsOut: number // 0 = seated, 1 = backed out
  kaptonWrap: number // 0 = hidden, 1 = wrapped
  magnetNear: number // 0 = away, 1 = close to SW1
  rootFlip: number // 0 = back up, 1 = front up (Step 8)
  xray: number // 0..1
  solderGlow: number // 0..1
  powerOn: boolean
}
