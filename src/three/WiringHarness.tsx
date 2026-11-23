import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BATTERY_BAY, CASIO_PORTS, ESP_PAD, MOD_PARTS } from '../data/geometryLayout'
import type { LayerOffsets, LivePhase, Vec3 } from '../types'
import { createDynamicTubeGeometry, updateDynamicTubeGeometry } from './tubeUtils'

interface WiringHarnessProps {
  layersRef: MutableRefObject<LayerOffsets>
  livePhaseRef: MutableRefObject<{ phase: LivePhase; progress: number }>
  selectedId: string | null
  hoveredId: string | null
  currentStep: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

type LayerKey = 'pcb' | 'r2r3' | 'bat' | 'mod' | 'sw1'

interface WaypointSpec {
  pos: Vec3
  layer: LayerKey
}

interface WireSegmentDef {
  key: string
  wireId: string // links to COMPONENTS_DB
  color: string
  radius: number
  minStep: number // step when this wire appears
  solderStep: number // step when solder joints glow warm
  points: WaypointSpec[]
  flowType?: 'tx' | 'rx' | 'power' | 'gate'
  flowReverse?: boolean
}

const WIRE_SEGMENTS: WireSegmentDef[] = [
  // 1a. TX-Leitung (Blau): Casio 2.5mm TIP (TX) -> R2 Top
  {
    key: 'tx_a',
    wireId: 'wire_tx',
    color: '#2563eb',
    radius: 0.24,
    minStep: 3,
    solderStep: 3,
    flowType: 'tx',
    points: [
      { pos: CASIO_PORTS.PAD_TIP_TX, layer: 'pcb' },
      { pos: [23.8, 9.2, -70.8], layer: 'r2r3' },
      { pos: [26.8, 9.0, -67.5], layer: 'r2r3' },
      { pos: MOD_PARTS.R2_1K_TX.LEAD_TOP, layer: 'r2r3' },
    ],
  },
  // 1b. TX-Leitung (Blau): R2 Bottom -> right PCB channel -> inner niche perimeter -> ESP32 GPIO20 (RX)
  {
    key: 'tx_b',
    wireId: 'wire_tx',
    color: '#2563eb',
    radius: 0.24,
    minStep: 3,
    solderStep: 3,
    flowType: 'tx',
    points: [
      { pos: MOD_PARTS.R2_1K_TX.LEAD_BOT, layer: 'r2r3' },
      { pos: [30.2, 8.9, -44.0], layer: 'pcb' },
      { pos: [35.2, 8.8, -12.0], layer: 'pcb' },
      { pos: [34.4, 8.9, 25.0], layer: 'pcb' },
      { pos: [32.6, 9.2, 48.2], layer: 'mod' },
      { pos: [14.8, 8.8, 49.5], layer: 'mod' },
      { pos: [14.8, 8.6, 69.8], layer: 'mod' },
      { pos: [34.8, 8.6, 70.0], layer: 'mod' },
      { pos: ESP_PAD.GPIO20_RX, layer: 'mod' },
    ],
  },

  // 2a. RX-Leitung (Grün): Casio 2.5mm RING (RX) -> R3 Top
  {
    key: 'rx_a',
    wireId: 'wire_rx',
    color: '#16a34a',
    radius: 0.24,
    minStep: 3,
    solderStep: 3,
    flowType: 'rx',
    flowReverse: true,
    points: [
      { pos: CASIO_PORTS.PAD_RING_RX, layer: 'pcb' },
      { pos: [23.0, 9.6, -75.0], layer: 'r2r3' },
      { pos: [30.2, 9.2, -70.2], layer: 'r2r3' },
      { pos: MOD_PARTS.R3_1K_RX.LEAD_TOP, layer: 'r2r3' },
    ],
  },
  // 2b. RX-Leitung (Grün): R3 Bottom -> right PCB channel -> inner niche perimeter -> ESP32 GPIO21 (TX)
  {
    key: 'rx_b',
    wireId: 'wire_rx',
    color: '#16a34a',
    radius: 0.24,
    minStep: 3,
    solderStep: 3,
    flowType: 'rx',
    flowReverse: true,
    points: [
      { pos: MOD_PARTS.R3_1K_RX.LEAD_BOT, layer: 'r2r3' },
      { pos: [34.6, 8.9, -44.0], layer: 'pcb' },
      { pos: [37.4, 8.8, -12.0], layer: 'pcb' },
      { pos: [36.4, 8.9, 25.0], layer: 'pcb' },
      { pos: [34.2, 9.2, 48.8], layer: 'mod' },
      { pos: [13.6, 8.8, 50.6], layer: 'mod' },
      { pos: [13.6, 8.6, 71.2], layer: 'mod' },
      { pos: [37.8, 8.6, 71.2], layer: 'mod' },
      { pos: ESP_PAD.GPIO21_TX, layer: 'mod' },
    ],
  },

  // 3. Daten-Masse (Schwarz): Casio 2.5mm SLEEVE (GND) -> ESP32 GND
  {
    key: 'gnd_data',
    wireId: 'wire_gnd_data',
    color: '#22262e',
    radius: 0.24,
    minStep: 3,
    solderStep: 3,
    points: [
      { pos: CASIO_PORTS.PAD_SLEEVE_GND, layer: 'pcb' },
      { pos: [19.0, 9.0, -79.2], layer: 'pcb' },
      { pos: [34.0, 8.8, -68.0], layer: 'pcb' },
      { pos: [34.4, 8.6, -12.0], layer: 'pcb' },
      { pos: [33.2, 8.8, 25.0], layer: 'pcb' },
      { pos: [29.8, 9.4, 48.2], layer: 'mod' },
      { pos: ESP_PAD.GND, layer: 'mod' },
    ],
  },

  // 4. Batterie-Masse (Schwarz): Batteriefach -V_BAT -> ESP32 GND
  {
    key: 'vbat_neg',
    wireId: 'wire_vbat_neg',
    color: '#1e222a',
    radius: 0.28,
    minStep: 4,
    solderStep: 4,
    points: [
      { pos: BATTERY_BAY.NEG_TAB, layer: 'bat' },
      { pos: [-26.0, 10.6, 31.2], layer: 'pcb' },
      { pos: [-6.0, 10.2, 31.0], layer: 'pcb' },
      { pos: [10.8, 10.0, 31.5], layer: 'mod' },
      { pos: [12.4, 9.6, 48.0], layer: 'mod' },
      { pos: ESP_PAD.GND, layer: 'mod' },
    ],
  },

  // 5. Batterie-Plus Eingang (Rot): Batteriefach +V_BAT -> AO3401 Pin 2 (Source)
  {
    key: 'vbat_pos',
    wireId: 'wire_vbat_pos',
    color: '#dc2626',
    radius: 0.28,
    minStep: 4,
    solderStep: 4,
    flowType: 'power',
    points: [
      { pos: BATTERY_BAY.POS_TAB, layer: 'bat' },
      { pos: [8.5, 11.2, 36.2], layer: 'mod' },
      { pos: [12.8, 9.4, 38.2], layer: 'mod' },
      { pos: MOD_PARTS.AO3401.PIN2_SOURCE, layer: 'mod' },
    ],
  },

  // 6a. Gate-Steuerung (Gelb/Orange): AO3401 Pin 2 (Source) -> R1 Lead Source
  {
    key: 'gate_a',
    wireId: 'wire_gate',
    color: '#f59e0b',
    radius: 0.21,
    minStep: 4,
    solderStep: 4,
    points: [
      { pos: MOD_PARTS.AO3401.PIN2_SOURCE, layer: 'mod' },
      { pos: [14.7, 8.7, 39.2], layer: 'mod' },
      { pos: MOD_PARTS.R1_10K.LEAD_SOURCE, layer: 'mod' },
    ],
  },
  // 6b. Gate-Steuerung (Gelb/Orange): R1 Lead Gate -> AO3401 Pin 1 (Gate)
  {
    key: 'gate_b',
    wireId: 'wire_gate',
    color: '#f59e0b',
    radius: 0.21,
    minStep: 4,
    solderStep: 4,
    points: [
      { pos: MOD_PARTS.R1_10K.LEAD_GATE, layer: 'mod' },
      { pos: [14.7, 8.7, 34.8], layer: 'mod' },
      { pos: MOD_PARTS.AO3401.PIN1_GATE, layer: 'mod' },
    ],
  },
  // 6c. Gate-Steuerung (Gelb/Orange): AO3401 Pin 1 (Gate) -> SW1 Top Lead
  {
    key: 'gate_c',
    wireId: 'wire_gate',
    color: '#f59e0b',
    radius: 0.22,
    minStep: 4,
    solderStep: 4,
    flowType: 'gate',
    points: [
      { pos: MOD_PARTS.AO3401.PIN1_GATE, layer: 'mod' },
      { pos: [18.5, 9.4, 31.8], layer: 'mod' },
      { pos: [31.0, 10.2, 29.8], layer: 'sw1' },
      { pos: MOD_PARTS.SW1_REED.LEAD_TOP_GATE, layer: 'sw1' },
    ],
  },
  // 6d. Gate-Steuerung (Gelb/Orange): SW1 Bottom Lead -> ESP32 GND
  {
    key: 'gate_d',
    wireId: 'wire_gate',
    color: '#d97706',
    radius: 0.22,
    minStep: 4,
    solderStep: 4,
    flowType: 'gate',
    points: [
      { pos: MOD_PARTS.SW1_REED.LEAD_BOT_GND, layer: 'sw1' },
      { pos: [36.5, 10.0, 48.2], layer: 'mod' },
      { pos: [27.5, 9.2, 49.4], layer: 'mod' },
      { pos: ESP_PAD.GND, layer: 'mod' },
    ],
  },

  // 7a. Geschaltetes 5V-Plus (Rot-Orange): AO3401 Pin 3 (Drain) -> D1 Anode
  {
    key: 'v5_a',
    wireId: 'wire_5v_switched',
    color: '#ea580c',
    radius: 0.27,
    minStep: 5,
    solderStep: 5,
    flowType: 'power',
    points: [
      { pos: MOD_PARTS.AO3401.PIN3_DRAIN, layer: 'mod' },
      { pos: [19.6, 8.8, 38.0], layer: 'mod' },
      { pos: MOD_PARTS.D1_1N4007.LEAD_ANODE, layer: 'mod' },
    ],
  },
  // 7b. Geschaltetes 5V-Plus (Rot-Orange): D1 Cathode (silver ring) -> ESP32 5V
  {
    key: 'v5_b',
    wireId: 'wire_5v_switched',
    color: '#ea580c',
    radius: 0.27,
    minStep: 5,
    solderStep: 5,
    flowType: 'power',
    points: [
      { pos: MOD_PARTS.D1_1N4007.LEAD_CATHODE, layer: 'mod' },
      { pos: [19.95, 8.85, 48.6], layer: 'mod' },
      { pos: ESP_PAD.V5, layer: 'mod' },
    ],
  },

  // 8a. WLAN-Pufferelko (Rot kurz): C1 (+) -> ESP32 5V
  {
    key: 'cap_pos',
    wireId: 'wire_cap',
    color: '#ef4444',
    radius: 0.23,
    minStep: 5,
    solderStep: 5,
    points: [
      { pos: MOD_PARTS.C1_100UF.LEAD_POS, layer: 'mod' },
      { pos: [22.4, 9.2, 49.0], layer: 'mod' },
      { pos: ESP_PAD.V5, layer: 'mod' },
    ],
  },
  // 8b. WLAN-Pufferelko (Schwarz kurz): C1 (-) -> ESP32 GND
  {
    key: 'cap_neg',
    wireId: 'wire_cap',
    color: '#1e222a',
    radius: 0.23,
    minStep: 5,
    solderStep: 5,
    points: [
      { pos: MOD_PARTS.C1_100UF.LEAD_NEG, layer: 'mod' },
      { pos: [25.2, 9.1, 49.1], layer: 'mod' },
      { pos: ESP_PAD.GND, layer: 'mod' },
    ],
  },
]

function getLayerY(layer: LayerKey, L: LayerOffsets): number {
  switch (layer) {
    case 'pcb':
      return L.pcbY
    case 'r2r3':
      return L.r2r3Y
    case 'bat':
      return L.frontShellY // Battery tabs sit mounted inside front shell battery cradle
    case 'mod':
      return L.modY
    case 'sw1':
      return L.sw1Y
  }
}

const TUBULAR_SEGMENTS = 36
const RADIAL_SEGMENTS = 8
const PULSES_PER_FLOW_WIRE = 3

function DynamicWireSegment({
  seg,
  layersRef,
  livePhaseRef,
  selectedId,
  hoveredId,
  currentStep,
  onSelect,
  onHover,
}: {
  seg: WireSegmentDef
  layersRef: MutableRefObject<LayerOffsets>
  livePhaseRef: MutableRefObject<{ phase: LivePhase; progress: number }>
  selectedId: string | null
  hoveredId: string | null
  currentStep: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const tubeGeo = useMemo(() => createDynamicTubeGeometry(TUBULAR_SEGMENTS, RADIAL_SEGMENTS), [])
  const pointsPool = useMemo(() => seg.points.map(() => new THREE.Vector3()), [seg.points])
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(pointsPool, false, 'catmullrom', 0.45),
    [pointsPool],
  )
  const coneStartRef = useRef<THREE.Mesh>(null)
  const coneEndRef = useRef<THREE.Mesh>(null)
  const solderStartMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const solderEndMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([])
  const lastGeoSigRef = useRef<string>('')

  const visible = currentStep >= seg.minStep
  const isHighlighted = selectedId === seg.wireId || hoveredId === seg.wireId

  useFrame((state) => {
    if (!visible) return
    const L = layersRef.current

    const sig = `${L.pcbY.toFixed(3)}_${L.r2r3Y.toFixed(3)}_${L.frontShellY.toFixed(3)}_${L.modY.toFixed(3)}_${L.sw1Y.toFixed(3)}`
    if (sig !== lastGeoSigRef.current) {
      lastGeoSigRef.current = sig
      for (let i = 0; i < seg.points.length; i++) {
        const wp = seg.points[i]
        const dy = getLayerY(wp.layer, L)
        pointsPool[i].set(wp.pos[0], wp.pos[1] + dy, wp.pos[2])
      }
      updateDynamicTubeGeometry(tubeGeo, curve, TUBULAR_SEGMENTS, seg.radius, RADIAL_SEGMENTS)
    }

    // Keep metallic solder cones locked 100% onto start & end wire tips
    const pStart = pointsPool[0]
    const pEnd = pointsPool[pointsPool.length - 1]
    if (coneStartRef.current) {
      coneStartRef.current.position.set(pStart.x, pStart.y + 0.15, pStart.z)
    }
    if (coneEndRef.current) {
      coneEndRef.current.position.set(pEnd.x, pEnd.y + 0.15, pEnd.z)
    }

    // Warm molten solder glow highlight when actively soldering this step
    const t = state.clock.elapsedTime
    const glowing = currentStep === seg.solderStep
    const glowIntensity = glowing ? (0.45 + 0.55 * Math.sin(t * 6.5)) * (0.4 + L.solderGlow * 0.8) : 0
    if (solderStartMatRef.current) {
      solderStartMatRef.current.emissiveIntensity = glowIntensity
    }
    if (solderEndMatRef.current) {
      solderEndMatRef.current.emissiveIntensity = glowIntensity
    }

    // Animated signal & electrical current pulses along the wire!
    if (seg.flowType) {
      const lp = livePhaseRef.current
      let flowActive = false
      let speed = 0.65

      if (seg.flowType === 'tx' && currentStep === 8 && lp.phase === 'tx') {
        flowActive = true
        speed = 0.85
      } else if (seg.flowType === 'rx' && currentStep === 8 && lp.phase === 'rx') {
        flowActive = true
        speed = 0.85
      } else if (seg.flowType === 'power' && L.powerOn) {
        flowActive = true
        speed = 0.55
      } else if (seg.flowType === 'gate' && L.powerOn && currentStep >= 7) {
        flowActive = true
        speed = 0.45
      }

      for (let i = 0; i < PULSES_PER_FLOW_WIRE; i++) {
        const mesh = pulseRefs.current[i]
        if (!mesh) continue
        mesh.visible = flowActive
        if (flowActive) {
          let u = (t * speed + i / PULSES_PER_FLOW_WIRE) % 1
          if (seg.flowReverse) u = 1 - u
          curve.getPointAt(u, mesh.position)
        }
      }
    }
  })

  const pulseColor =
    seg.flowType === 'tx'
      ? '#60a5fa'
      : seg.flowType === 'rx'
        ? '#4ade80'
        : seg.flowType === 'power'
          ? '#fb923c'
          : '#facc15'

  return (
    <group visible={visible}>
      {/* Insulated Silicone Wire Tube */}
      <mesh
        geometry={tubeGeo}
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          onSelect(seg.wireId)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(seg.wireId)
        }}
        onPointerOut={() => onHover(null)}
      >
        <meshStandardMaterial
          color={seg.color}
          roughness={0.38}
          metalness={0.08}
          emissive={isHighlighted ? seg.color : '#000000'}
          emissiveIntensity={isHighlighted ? 0.65 : 0}
        />
      </mesh>

      {/* Shiny Metallic Solder Cones (Lötzinn-Kegel) at Both Wire Ends */}
      <mesh ref={coneStartRef}>
        <coneGeometry args={[0.62, 0.72, 12]} />
        <meshStandardMaterial
          ref={solderStartMatRef}
          color="#dce3ec"
          roughness={0.16}
          metalness={0.94}
          emissive="#f97316"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh ref={coneEndRef}>
        <coneGeometry args={[0.62, 0.72, 12]} />
        <meshStandardMaterial
          ref={solderEndMatRef}
          color="#dce3ec"
          roughness={0.16}
          metalness={0.94}
          emissive="#f97316"
          emissiveIntensity={0}
        />
      </mesh>

      {/* Animated Glowing Light Pulses for UART TX/RX & Power Flow */}
      {seg.flowType &&
        Array.from({ length: PULSES_PER_FLOW_WIRE }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              pulseRefs.current[i] = el
            }}
            visible={false}
          >
            <sphereGeometry args={[seg.flowType === 'tx' || seg.flowType === 'rx' ? 0.85 : 0.62, 12, 12]} />
            <meshBasicMaterial color={pulseColor} />
          </mesh>
        ))}
    </group>
  )
}

export function WiringHarness({
  layersRef,
  livePhaseRef,
  selectedId,
  hoveredId,
  currentStep,
  onSelect,
  onHover,
}: WiringHarnessProps) {
  return (
    <group>
      {WIRE_SEGMENTS.map((seg) => (
        <DynamicWireSegment
          key={seg.key}
          seg={seg}
          layersRef={layersRef}
          livePhaseRef={livePhaseRef}
          selectedId={selectedId}
          hoveredId={hoveredId}
          currentStep={currentStep}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  )
}
