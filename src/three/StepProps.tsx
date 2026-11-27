import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useRef, useState } from 'react'
import * as THREE from 'three'
import { CASIO_PORTS, ESP_PAD, MOD_PARTS } from '../data/geometryLayout'
import type { LayerOffsets, LivePhase } from '../types'

interface StepPropsComponentProps {
  layersRef: MutableRefObject<LayerOffsets>
  livePhaseRef: MutableRefObject<{ phase: LivePhase; progress: number }>
  currentStep: number
  powerOn: boolean
  showLabels: boolean
}

const TEST_TARGETS = [
  {
    name: 'TIP (Spitze) → Goldpad TX',
    plugZ: -90.4,
    padPos: CASIO_PORTS.PAD_TIP_TX,
    color: '#3b82f6',
  },
  {
    name: 'RING (Mitte) → Goldpad Y (RX)',
    plugZ: -92.8,
    padPos: CASIO_PORTS.PAD_RING_RX,
    color: '#22c55e',
  },
  {
    name: 'SLEEVE (Schaft) → Massepad GND',
    plugZ: -95.4,
    padPos: CASIO_PORTS.PAD_SLEEVE_GND,
    color: '#94a3b8',
  },
] as const

export function StepProps({
  layersRef,
  livePhaseRef,
  currentStep,
  powerOn,
  showLabels,
}: StepPropsComponentProps) {
  const plugGroupRef = useRef<THREE.Group>(null)
  const redProbeRef = useRef<THREE.Group>(null)
  const blackProbeRef = useRef<THREE.Group>(null)
  const [probeIndex, setProbeIndex] = useState(0)
  const probeIdxRef = useRef(0)

  // Step 7 / Power Toggle: External Neodymium Magnet (approaches LEFT flank beside SW1!)
  const magnetGroupRef = useRef<THREE.Group>(null)
  const magRing1Ref = useRef<THREE.Mesh>(null)
  const magRing2Ref = useRef<THREE.Mesh>(null)

  // Step 8: Concentric Wi-Fi Radio Waves expanding from Red Ceramic Antenna (-X outward!)
  const wifiRingsRef = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state, delta) => {
    const L = layersRef.current
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    // ---- STEP 2: Animated 2.5mm Plug & Multimeter Continuity Probes at CN401 (Top-Left!) ----
    if (currentStep === 2) {
      const idx = Math.floor(t / 2.6) % 3
      if (idx !== probeIdxRef.current) {
        probeIdxRef.current = idx
        setProbeIndex(idx)
      }
      const target = TEST_TARGETS[idx]
      const pcbY = L.pcbY

      if (plugGroupRef.current) {
        plugGroupRef.current.position.y = pcbY
      }
      if (redProbeRef.current) {
        redProbeRef.current.position.x = THREE.MathUtils.damp(
          redProbeRef.current.position.x,
          target.padPos[0],
          7,
          dt,
        )
        redProbeRef.current.position.y = THREE.MathUtils.damp(
          redProbeRef.current.position.y,
          target.padPos[1] + pcbY + 0.35,
          7,
          dt,
        )
        redProbeRef.current.position.z = THREE.MathUtils.damp(
          redProbeRef.current.position.z,
          target.padPos[2],
          7,
          dt,
        )
      }
      if (blackProbeRef.current) {
        blackProbeRef.current.position.x = THREE.MathUtils.damp(
          blackProbeRef.current.position.x,
          CASIO_PORTS.JACK_25MM[0],
          7,
          dt,
        )
        blackProbeRef.current.position.y = THREE.MathUtils.damp(
          blackProbeRef.current.position.y,
          CASIO_PORTS.JACK_25MM[1] + pcbY + 1.3,
          7,
          dt,
        )
        blackProbeRef.current.position.z = THREE.MathUtils.damp(
          blackProbeRef.current.position.z,
          target.plugZ,
          7,
          dt,
        )
      }
    }

    // ---- STEP 7 / POWER SWITCH: Neodymium N52 Magnet approaching LEFT flank (-X) ----
    if (magnetGroupRef.current) {
      const near = L.magnetNear
      const showMagnet = near > 0.02 || currentStep === 7
      magnetGroupRef.current.visible = showMagnet
      const targetX = THREE.MathUtils.lerp(-74, -48.5, near)
      magnetGroupRef.current.position.set(
        targetX,
        MOD_PARTS.SW1_REED.CENTER[1] + L.sw1Y + 2.0,
        MOD_PARTS.SW1_REED.CENTER[2],
      )

      if (magRing1Ref.current && magRing2Ref.current) {
        const s1 = 1 + ((t * 1.4) % 1) * 1.6
        const s2 = 1 + ((t * 1.4 + 0.5) % 1) * 1.6
        magRing1Ref.current.scale.setScalar(s1)
        magRing2Ref.current.scale.setScalar(s2)
        ;(magRing1Ref.current.material as THREE.MeshBasicMaterial).opacity =
          near * (1 - ((t * 1.4) % 1)) * 0.65
        ;(magRing2Ref.current.material as THREE.MeshBasicMaterial).opacity =
          near * (1 - ((t * 1.4 + 0.5) % 1)) * 0.65
      }
    }

    // ---- STEP 8: Concentric 2.4 GHz Wi-Fi Waves radiating outward (-X) from Ceramic Antenna ----
    const lp = livePhaseRef.current
    const wifiActive = currentStep === 8 && (lp.phase === 'wifi' || lp.phase === 'tx' || lp.phase === 'rx')
    const intensity = lp.phase === 'wifi' ? 1.0 : 0.35
    wifiRingsRef.current.forEach((ring, i) => {
      if (!ring) return
      ring.visible = wifiActive
      if (!wifiActive) return
      const phase = (t * 0.9 + i / 4) % 1
      const scale = 0.7 + phase * 6.8
      ring.scale.set(scale, scale, 1)
      ring.position.set(
        ESP_PAD.ANTENNA_WORLD[0] - 4 - phase * 24,
        ESP_PAD.ANTENNA_WORLD[1] + L.modY,
        ESP_PAD.ANTENNA_WORLD[2],
      )
      ;(ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.85 * intensity
    })
  })

  const activeTest = TEST_TARGETS[probeIndex]

  return (
    <group>
      {/* STEP 2: 2.5mm TRS Plug + Multimeter Continuity Probes at CN401 */}
      {currentStep === 2 && (
        <group>
          <group ref={plugGroupRef} position={[CASIO_PORTS.JACK_25MM[0], 0, 0]}>
            <mesh position={[0, CASIO_PORTS.JACK_25MM[1], -103.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[3.4, 3.0, 14.0, 20]} />
              <meshStandardMaterial color="#181b22" roughness={0.5} />
            </mesh>
            <mesh position={[0, CASIO_PORTS.JACK_25MM[1], -95.0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.25, 1.25, 3.6, 18]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.92} />
            </mesh>
            <mesh position={[0, CASIO_PORTS.JACK_25MM[1], -93.6]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.26, 1.26, 0.5, 16]} />
              <meshStandardMaterial color="#090a0d" roughness={0.8} />
            </mesh>
            <mesh position={[0, CASIO_PORTS.JACK_25MM[1], -92.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.25, 1.25, 2.2, 18]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.94} />
            </mesh>
            <mesh position={[0, CASIO_PORTS.JACK_25MM[1], -90.9]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.26, 1.26, 0.5, 16]} />
              <meshStandardMaterial color="#090a0d" roughness={0.8} />
            </mesh>
            <mesh position={[0, CASIO_PORTS.JACK_25MM[1], -89.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.9, 1.25, 2.5, 18]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.95} />
            </mesh>
          </group>

          {/* RED Multimeter Probe touching CN401 Square Gold Test Pad */}
          <group ref={redProbeRef} position={CASIO_PORTS.PAD_TIP_TX} rotation={[0.32, 0, 0.32]}>
            <mesh position={[0, 4.5, 0]}>
              <cylinderGeometry args={[0.45, 0.12, 9.0, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.18} metalness={0.95} />
            </mesh>
            <mesh position={[0, 20.0, 0]} castShadow>
              <cylinderGeometry args={[2.1, 1.4, 22.0, 16]} />
              <meshStandardMaterial color="#dc2626" roughness={0.36} />
            </mesh>
            <mesh position={[0, 10.2, 0]}>
              <cylinderGeometry args={[2.6, 2.6, 1.4, 16]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.4} />
            </mesh>
          </group>

          {/* BLACK Multimeter Probe touching 2.5mm Plug Section */}
          <group ref={blackProbeRef} position={[CASIO_PORTS.JACK_25MM[0], 15, -90.4]} rotation={[-0.35, 0, -0.3]}>
            <mesh position={[0, 4.5, 0]}>
              <cylinderGeometry args={[0.45, 0.12, 9.0, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.18} metalness={0.95} />
            </mesh>
            <mesh position={[0, 20.0, 0]} castShadow>
              <cylinderGeometry args={[2.1, 1.4, 22.0, 16]} />
              <meshStandardMaterial color="#1f242d" roughness={0.42} />
            </mesh>
            <mesh position={[0, 10.2, 0]}>
              <cylinderGeometry args={[2.6, 2.6, 1.4, 16]} />
              <meshStandardMaterial color="#111318" roughness={0.45} />
            </mesh>
          </group>

          {showLabels && (
            <Html zIndexRange={[10, 0]} position={[-12, 26, -86]} center>
              <div className="pointer-events-none whitespace-nowrap rounded-xl border border-emerald-400/50 bg-slate-950/90 px-2.5 py-1.5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span>Multimeter an CN401</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono-tech">0,2 Ω · PIEP!</span>
                </div>
                <div
                  className="mt-0.5 font-mono-tech text-[11px] font-bold"
                  style={{ color: activeTest.color }}
                >
                  {activeTest.name}
                </div>
              </div>
            </Html>
          )}
        </group>
      )}

      {/* STEP 7 & POWER SWITCH: Neodymium Magnet on Left Flank (-X) */}
      <group ref={magnetGroupRef} visible={false}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[5.2, 5.2, 3.6, 28]} />
          <meshStandardMaterial color="#dce3ec" roughness={0.16} metalness={0.96} />
        </mesh>
        <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[5.28, 5.28, 1.5, 28]} />
          <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[5.28, 5.28, 1.5, 28]} />
          <meshStandardMaterial color="#2563eb" roughness={0.35} metalness={0.4} />
        </mesh>

        {/* Field rings radiating +X toward SW1 */}
        <mesh ref={magRing1Ref} position={[2.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[4.0, 4.7, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={magRing2Ref} position={[2.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[4.0, 4.7, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>

        {showLabels && (currentStep === 7 || (powerOn && currentStep !== 8)) && (
          <Html zIndexRange={[10, 0]} position={[0, 9.5, 0]} center>
            <div className="pin-3d-tag bg-slate-950/92 text-sky-200 border border-sky-400/60 pointer-events-none">
              Neodym-Magnet (linke Gehäuseflanke) → schließt SW1
            </div>
          </Html>
        )}
      </group>

      {/* STEP 8: Concentric 2.4 GHz Wi-Fi Waves radiating outward (-X) */}
      <group>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              wifiRingsRef.current[i] = el
            }}
            rotation={[0, Math.PI / 2, 0]}
            visible={false}
          >
            <ringGeometry args={[3.4, 4.15, 36]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {currentStep === 8 && showLabels && (
          <Html
            zIndexRange={[10, 0]}
            position={[ESP_PAD.ANTENNA_WORLD[0] - 24, ESP_PAD.ANTENNA_WORLD[1] + 4, ESP_PAD.ANTENNA_WORLD[2]]}
            center
          >
            <div className="pin-3d-tag bg-sky-600/92 text-white border border-sky-200/70 pointer-events-none shadow-lg">
              WLAN 2,4 GHz • HTTPS → Gemini API
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}
