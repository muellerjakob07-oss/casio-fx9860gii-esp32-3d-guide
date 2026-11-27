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

type LayerKey = 'pcb' | 'r2r3' | 'mod' | 'sw1'

interface WaypointSpec {
  pos: Vec3
  layer: LayerKey
}

interface WireSegmentDef {
  key: string
  wireId: string
  color: string
  radius: number
  minStep: number
  solderStep: number
  points: WaypointSpec[]
  flowType?: 'tx' | 'rx' | 'power' | 'gate'
  flowReverse?: boolean
}

const WIRE_SEGMENTS: WireSegmentDef[] = [
  // 1a. TX-Leitung (Blau): CN401 TIP-Goldpad (oben links) -> R2 Top
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
      { pos: [-27.8, 13.1, -64.0], layer: 'pcb' },
      { pos: [-30.2, 13.1, -48.0], layer: 'r2r3' },
      { pos: MOD_PARTS.R2_1K_TX.LEAD_TOP, layer: 'r2r3' },
    ],
  },
  // 1b. TX-Leitung (Blau): R2 Bottom -> straight down left margin & step -> ESP32 GPIO20 (RX)
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
      { pos: [-30.2, 12.9, -12.0], layer: 'pcb' },
      { pos: [-30.2, 12.6, 1.8], layer: 'pcb' },
      { pos: [-30.2, 8.8, 3.8], layer: 'mod' },
      { pos: ESP_PAD.GPIO20_RX, layer: 'mod' },
    ],
  },

  // 2a. RX-Leitung (Grün): CN401 RING-Goldpad ('Y', oben links) -> R3 Top
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
      { pos: [-22.5, 13.5, -67.5], layer: 'pcb' },
      { pos: [-33.6, 13.3, -54.0], layer: 'r2r3' },
      { pos: MOD_PARTS.R3_1K_RX.LEAD_TOP, layer: 'r2r3' },
    ],
  },
  // 2b. RX-Leitung (Grün): R3 Bottom -> straight down outer-left margin & step -> ESP32 GPIO21 (TX)
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
      { pos: [-33.8, 12.9, -12.0], layer: 'pcb' },
      { pos: [-33.6, 12.6, 1.8], layer: 'pcb' },
      { pos: [-32.8, 8.8, 3.8], layer: 'mod' },
      { pos: ESP_PAD.GPIO21_TX, layer: 'mod' },
    ],
  },

  // 3. Daten-Masse (Schwarz): CN401 SLEEVE (GND) -> inner step route (clear of antenna!) -> ESP32 GND
  {
    key: 'gnd_data',
    wireId: 'wire_gnd_data',
    color: '#22262e',
    radius: 0.24,
    minStep: 3,
    solderStep: 3,
    points: [
      { pos: CASIO_PORTS.PAD_SLEEVE_GND, layer: 'pcb' },
      { pos: [-31.8, 13.0, -68.0], layer: 'pcb' },
      { pos: [-35.2, 12.8, -34.0], layer: 'pcb' },
      { pos: [-34.8, 12.6, 1.6], layer: 'pcb' },
      { pos: [-26.0, 7.6, 3.6], layer: 'mod' },
      { pos: [-11.8, 7.6, 4.8], layer: 'mod' },
      { pos: [-12.2, 8.0, 23.8], layer: 'mod' },
      { pos: ESP_PAD.GND, layer: 'mod' },
    ],
  },

  // 4. Batterie-Masse (Schwarz): P702 / Testpad T702 (-V_BAT) -> along battery top edge -> ESP32 GND
  {
    key: 'vbat_neg',
    wireId: 'wire_vbat_neg',
    color: '#1e222a',
    radius: 0.28,
    minStep: 4,
    solderStep: 4,
    points: [
      { pos: BATTERY_BAY.NEG_TAB, layer: 'pcb' },
      { pos: [31.5, 7.2, 26.5], layer: 'pcb' },
      { pos: [14.5, 7.2, 24.4], layer: 'mod' },
      { pos: [-6.0, 7.4, 24.4], layer: 'mod' },
      { pos: ESP_PAD.GND, layer: 'mod' },
    ],
  },

  // 5. Batterie-Plus Eingang (Rot): P701 / Testpad T701 (+V_BAT) -> right margin -> AO3401 Pin 2 (Source)
  {
    key: 'vbat_pos',
    wireId: 'wire_vbat_pos',
    color: '#dc2626',
    radius: 0.28,
    minStep: 4,
    solderStep: 4,
    flowType: 'power',
    points: [
      { pos: BATTERY_BAY.POS_TAB, layer: 'pcb' },
      { pos: [33.8, 7.2, 54.0], layer: 'pcb' },
      { pos: [33.8, 7.2, 25.0], layer: 'pcb' },
      { pos: [15.0, 7.6, 23.2], layer: 'mod' },
      { pos: [4.2, 7.8, 22.8], layer: 'mod' },
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
      { pos: [7.2, 7.8, 22.4], layer: 'mod' },
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
      { pos: [7.0, 7.8, 16.8], layer: 'mod' },
      { pos: MOD_PARTS.AO3401.PIN1_GATE, layer: 'mod' },
    ],
  },
  // 6c. Gate-Steuerung (Gelb/Orange): AO3401 Pin 1 (Gate) -> SW1 Top Lead (left channel)
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
      { pos: [1.5, 7.8, 14.5], layer: 'mod' },
      { pos: [-5.5, 7.4, 24.8], layer: 'mod' },
      { pos: [-26.5, 7.6, 25.0], layer: 'sw1' },
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
      { pos: [-29.0, 7.8, 49.0], layer: 'sw1' },
      { pos: [-24.0, 7.6, 25.2], layer: 'mod' },
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
      { pos: [4.5, 7.9, 22.0], layer: 'mod' },
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
      { pos: [-11.0, 8.1, 22.4], layer: 'mod' },
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
      { pos: [-12.2, 8.2, 21.4], layer: 'mod' },
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
      { pos: [-15.0, 8.2, 21.4], layer: 'mod' },
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

    const sig = `${L.pcbY.toFixed(3)}_${L.r2r3Y.toFixed(3)}_${L.modY.toFixed(3)}_${L.sw1Y.toFixed(3)}`
    if (sig !== lastGeoSigRef.current) {
      lastGeoSigRef.current = sig
      for (let i = 0; i < seg.points.length; i++) {
        const wp = seg.points[i]
        const dy = getLayerY(wp.layer, L)
        pointsPool[i].set(wp.pos[0], wp.pos[1] + dy, wp.pos[2])
      }
      updateDynamicTubeGeometry(tubeGeo, curve, TUBULAR_SEGMENTS, seg.radius, RADIAL_SEGMENTS)
    }

    const pStart = pointsPool[0]
    const pEnd = pointsPool[pointsPool.length - 1]
    if (coneStartRef.current) {
      coneStartRef.current.position.set(pStart.x, pStart.y + 0.15, pStart.z)
    }
    if (coneEndRef.current) {
      coneEndRef.current.position.set(pEnd.x, pEnd.y + 0.15, pEnd.z)
    }

    const t = state.clock.elapsedTime
    const glowing = currentStep === seg.solderStep
    const glowIntensity = glowing ? (0.45 + 0.55 * Math.sin(t * 6.5)) * (0.4 + L.solderGlow * 0.8) : 0
    if (solderStartMatRef.current) {
      solderStartMatRef.current.emissiveIntensity = glowIntensity
    }
    if (solderEndMatRef.current) {
      solderEndMatRef.current.emissiveIntensity = glowIntensity
    }

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

      <mesh ref={coneStartRef}>
        <coneGeometry args={[0.58, 0.68, 12]} />
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
        <coneGeometry args={[0.58, 0.68, 12]} />
        <meshStandardMaterial
          ref={solderEndMatRef}
          color="#dce3ec"
          roughness={0.16}
          metalness={0.94}
          emissive="#f97316"
          emissiveIntensity={0}
        />
      </mesh>

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
