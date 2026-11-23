import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ESP32, MOD_PARTS } from '../data/geometryLayout'
import type { LayerOffsets } from '../types'
import {
  createAo3401Texture,
  createCap100uFTexture,
  createDiodeTexture,
  createResistorTexture,
} from './textures'

interface ModElectronicsProps {
  layersRef: MutableRefObject<LayerOffsets>
  selectedId: string | null
  hoveredId: string | null
  showLabels: boolean
  currentStep: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

/**
 * Reusable axial 1/4W resistor with realistic contoured ceramic body,
 * accurate color bands, and tinned copper axial leads.
 */
function AxialResistor({
  position,
  texture,
  id,
  label,
  selected,
  hovered,
  showTag,
  onSelect,
  onHover,
}: {
  position: [number, number, number]
  texture: THREE.CanvasTexture
  id: string
  label: string
  selected: boolean
  hovered: boolean
  showTag: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const focus = selected || hovered
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(id)
      }}
      onPointerOut={() => onHover(null)}
    >
      {/* Center resistor cylinder aligned along Z axis */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 3.8, 18]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.38}
          metalness={0.08}
          emissive={focus ? '#f59e0b' : '#000000'}
          emissiveIntensity={focus ? 0.35 : 0}
        />
      </mesh>
      {/* Contoured end caps */}
      {[-1.75, 1.75].map((ez, i) => (
        <mesh key={i} position={[0, 0, ez]} castShadow>
          <sphereGeometry args={[0.88, 14, 14]} />
          <meshStandardMaterial color="#dcc396" roughness={0.4} />
        </mesh>
      ))}
      {/* Tinned Copper Axial Wire Leads extending to -3.0 and +3.0 along Z */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 6.2, 10]} />
        <meshStandardMaterial color="#d4dce6" roughness={0.22} metalness={0.92} />
      </mesh>
      {/* Bent downward lead tips */}
      {[-3.0, 3.0].map((lz, i) => (
        <mesh key={i} position={[0, -0.25, lz]}>
          <cylinderGeometry args={[0.18, 0.18, 0.65, 8]} />
          <meshStandardMaterial color="#d4dce6" roughness={0.22} metalness={0.92} />
        </mesh>
      ))}
      {showTag && (
        <Html zIndexRange={[10, 0]} position={[0, 2.5, 0]} center>
          <button
            type="button"
            onClick={() => onSelect(id)}
            className="pin-3d-tag bg-amber-950/90 text-amber-100 border border-amber-400/60"
          >
            {label}
          </button>
        </Html>
      )}
    </group>
  )
}

export function ModElectronics({
  layersRef,
  selectedId,
  hoveredId,
  showLabels,
  currentStep,
  onSelect,
  onHover,
}: ModElectronicsProps) {
  const powerClusterRef = useRef<THREE.Group>(null)
  const r2r3GroupRef = useRef<THREE.Group>(null)
  const sw1GroupRef = useRef<THREE.Group>(null)
  const reedBladeTopRef = useRef<THREE.Mesh>(null)
  const reedBladeBotRef = useRef<THREE.Mesh>(null)
  const reedGlowRef = useRef<THREE.MeshStandardMaterial>(null)
  const kaptonGroupRef = useRef<THREE.Group>(null)
  const kaptonMat1Ref = useRef<THREE.MeshPhysicalMaterial>(null)
  const kaptonMat2Ref = useRef<THREE.MeshPhysicalMaterial>(null)

  // Procedural component textures
  const ao3401Tex = useMemo(() => createAo3401Texture(), [])
  const r10kTex = useMemo(
    () => createResistorTexture(['#7c441c', '#18181b', '#f97316', '#d4af37']), // Braun-Schwarz-Orange-Gold
    [],
  )
  const r1kTex = useMemo(
    () => createResistorTexture(['#7c441c', '#18181b', '#dc2626', '#d4af37']), // Braun-Schwarz-Rot-Gold
    [],
  )
  const diodeTex = useMemo(() => createDiodeTexture(), [])
  const capTex = useMemo(() => createCap100uFTexture(), [])

  useFrame((_, delta) => {
    const L = layersRef.current
    const dt = Math.min(delta, 0.05)

    if (powerClusterRef.current) {
      powerClusterRef.current.position.y = L.modY
    }
    if (r2r3GroupRef.current) {
      r2r3GroupRef.current.position.y = L.r2r3Y
    }
    if (sw1GroupRef.current) {
      sw1GroupRef.current.position.y = L.sw1Y
    }

    // Physical magnetic reed switch blades snapping closed when magnet approaches / SW1 active!
    const closedTarget = L.powerOn ? 1 : 0
    if (reedBladeTopRef.current && reedBladeBotRef.current) {
      const targetAngle = closedTarget ? 0.0 : 0.09
      reedBladeTopRef.current.rotation.y = THREE.MathUtils.damp(
        reedBladeTopRef.current.rotation.y,
        targetAngle,
        14,
        dt,
      )
      reedBladeBotRef.current.rotation.y = THREE.MathUtils.damp(
        reedBladeBotRef.current.rotation.y,
        -targetAngle,
        14,
        dt,
      )
      reedBladeTopRef.current.position.x = THREE.MathUtils.damp(
        reedBladeTopRef.current.position.x,
        closedTarget ? 0.03 : 0.24,
        14,
        dt,
      )
      reedBladeBotRef.current.position.x = THREE.MathUtils.damp(
        reedBladeBotRef.current.position.x,
        closedTarget ? -0.03 : -0.24,
        14,
        dt,
      )
    }
    if (reedGlowRef.current) {
      reedGlowRef.current.emissiveIntensity = THREE.MathUtils.damp(
        reedGlowRef.current.emissiveIntensity,
        L.powerOn ? 2.6 : 0,
        10,
        dt,
      )
    }

    // Kapton polyimide tape smooth descending & wrapping animation in Step 6+
    if (kaptonGroupRef.current) {
      const kw = L.kaptonWrap
      kaptonGroupRef.current.visible = kw > 0.02
      kaptonGroupRef.current.position.y = L.modY + (1 - kw) * 22
      kaptonGroupRef.current.scale.set(1, Math.max(0.25, kw), 1)
    }
    const kOpacity = L.kaptonWrap * 0.42
    if (kaptonMat1Ref.current) kaptonMat1Ref.current.opacity = kOpacity
    if (kaptonMat2Ref.current) kaptonMat2Ref.current.opacity = kOpacity
  })

  const showUart = currentStep >= 3
  const showMosfet = currentStep >= 4
  const showDiodeCap = currentStep >= 5

  return (
    <group>
      {/* ================================================================ */}
      {/* R2 & R3: 2× 1 kΩ UART PROTECTION RESISTORS (Step 3+)             */}
      {/* ================================================================ */}
      <group ref={r2r3GroupRef} visible={showUart}>
        <AxialResistor
          position={MOD_PARTS.R2_1K_TX.CENTER}
          texture={r1kTex}
          id="r2_1k"
          label="R2: 1 kΩ (TX)"
          selected={selectedId === 'r2_1k'}
          hovered={hoveredId === 'r2_1k'}
          showTag={showLabels && (currentStep === 3 || selectedId === 'r2_1k' || hoveredId === 'r2_1k')}
          onSelect={onSelect}
          onHover={onHover}
        />
        <AxialResistor
          position={MOD_PARTS.R3_1K_RX.CENTER}
          texture={r1kTex}
          id="r3_1k"
          label="R3: 1 kΩ (RX)"
          selected={selectedId === 'r3_1k'}
          hovered={hoveredId === 'r3_1k'}
          showTag={showLabels && (currentStep === 3 || selectedId === 'r3_1k' || hoveredId === 'r3_1k')}
          onSelect={onSelect}
          onHover={onHover}
        />
      </group>

      {/* ================================================================ */}
      {/* POWER & PROTECTION CLUSTER (Moves cleanly with ESP32 into niche) */}
      {/* ================================================================ */}
      <group ref={powerClusterRef}>
        {/* -------------------------------------------------------------- */}
        {/* 1. AO3401 P-CHANNEL MOSFET (SOT-23, 2.9 × 1.3 mm, "A19T")      */}
        {/* -------------------------------------------------------------- */}
        {showMosfet && (
          <group
            position={MOD_PARTS.AO3401.CENTER}
            onClick={(e) => {
              e.stopPropagation()
              onSelect('ao3401')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              onHover('ao3401')
            }}
            onPointerOut={() => onHover(null)}
          >
            {/* Molded Black Epoxy SOT-23 Body (2.9 mm along Z, 1.3 mm along X) */}
            <mesh castShadow>
              <boxGeometry args={[1.55, 1.05, 3.05]} />
              <meshStandardMaterial
                color="#191b22"
                roughness={0.34}
                metalness={0.14}
                emissive={selectedId === 'ao3401' || hoveredId === 'ao3401' ? '#f59e0b' : '#000000'}
                emissiveIntensity={selectedId === 'ao3401' || hoveredId === 'ao3401' ? 0.35 : 0}
              />
            </mesh>
            {/* White Laser Marking "A19T" on Top Face */}
            <mesh position={[0, 0.54, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[2.9, 1.45]} />
              <meshStandardMaterial map={ao3401Tex} roughness={0.35} />
            </mesh>

            {/* Pin 1 (links oben) = Gate (G) — Amber Marker */}
            <group position={[-1.05, -0.3, -0.95]}>
              <mesh castShadow>
                <boxGeometry args={[0.85, 0.28, 0.48]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.92} />
              </mesh>
              <mesh position={[-0.25, 0.16, 0]}>
                <boxGeometry args={[0.38, 0.16, 0.54]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.45} />
              </mesh>
            </group>

            {/* Pin 2 (links unten) = Source (S) — Red Marker */}
            <group position={[-1.05, -0.3, 0.95]}>
              <mesh castShadow>
                <boxGeometry args={[0.85, 0.28, 0.48]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.92} />
              </mesh>
              <mesh position={[-0.25, 0.16, 0]}>
                <boxGeometry args={[0.38, 0.16, 0.54]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.45} />
              </mesh>
            </group>

            {/* Pin 3 (rechts einzeln) = Drain (D) — Orange-Red Marker */}
            <group position={[1.05, -0.3, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.85, 0.28, 0.48]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.92} />
              </mesh>
              <mesh position={[0.25, 0.16, 0]}>
                <boxGeometry args={[0.38, 0.16, 0.54]} />
                <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={0.45} />
              </mesh>
            </group>

            {showLabels && (currentStep === 4 || selectedId === 'ao3401' || hoveredId === 'ao3401') && (
              <>
                <Html zIndexRange={[10, 0]} position={[0, 3.0, -2.5]} center>
                  <button
                    type="button"
                    onClick={() => onSelect('ao3401')}
                    className="pin-3d-tag bg-amber-500/95 text-slate-950 border border-amber-200"
                  >
                    AO3401 (A19T) • P1:Gate | P2:Source | P3:Drain
                  </button>
                </Html>
              </>
            )}
          </group>
        )}

        {/* -------------------------------------------------------------- */}
        {/* 2. R1: 10 kΩ PULL-UP RESISTOR (Braun-Schwarz-Orange-Gold)      */}
        {/* -------------------------------------------------------------- */}
        {showMosfet && (
          <AxialResistor
            position={MOD_PARTS.R1_10K.CENTER}
            texture={r10kTex}
            id="r1_10k"
            label="R1: 10 kΩ Pull-up (0,00 mA)"
            selected={selectedId === 'r1_10k'}
            hovered={hoveredId === 'r1_10k'}
            showTag={showLabels && (currentStep === 4 || selectedId === 'r1_10k' || hoveredId === 'r1_10k')}
            onSelect={onSelect}
            onHover={onHover}
          />
        )}

        {/* -------------------------------------------------------------- */}
        {/* 3. D1: 1N4007 PROTECTION DIODE (Silver Cathode Ring -> ESP 5V) */}
        {/* -------------------------------------------------------------- */}
        {showDiodeCap && (
          <group
            position={MOD_PARTS.D1_1N4007.CENTER}
            onClick={(e) => {
              e.stopPropagation()
              onSelect('d1_1n4007')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              onHover('d1_1n4007')
            }}
            onPointerOut={() => onHover(null)}
          >
            {/* DO-41 Black Cylinder rotated so +Y texture top (SILVER RING!) points to +Z (ESP32 5V!) */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[1.22, 1.22, 4.9, 24]} />
              <meshStandardMaterial
                map={diodeTex}
                roughness={0.28}
                metalness={0.25}
                emissive={selectedId === 'd1_1n4007' || hoveredId === 'd1_1n4007' ? '#e2e8f0' : '#000000'}
                emissiveIntensity={selectedId === 'd1_1n4007' || hoveredId === 'd1_1n4007' ? 0.3 : 0}
              />
            </mesh>
            {/* Extra crisp physical metallic silver cathode collar at +Z end */}
            <mesh position={[0, 0, 1.55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.25, 1.25, 0.9, 24]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.18} metalness={0.92} />
            </mesh>
            {/* Axial Metal Leads */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 7.6, 10]} />
              <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.92} />
            </mesh>

            {showLabels && (currentStep === 5 || selectedId === 'd1_1n4007' || hoveredId === 'd1_1n4007') && (
              <Html zIndexRange={[10, 0]} position={[-3.2, 3.2, 1.6]} center>
                <button
                  type="button"
                  onClick={() => onSelect('d1_1n4007')}
                  className="pin-3d-tag bg-slate-100/95 text-slate-950 border border-slate-400"
                >
                  D1 1N4007 • Silberring → ESP 5V (−0,7 V)
                </button>
              </Html>
            )}
          </group>
        )}

        {/* -------------------------------------------------------------- */}
        {/* 4. C1: 100 µF / 10 V ELECTROLYTIC CAPACITOR (White '-' Stripe) */}
        {/* -------------------------------------------------------------- */}
        {showDiodeCap && (
          <group
            position={MOD_PARTS.C1_100UF.CENTER}
            onClick={(e) => {
              e.stopPropagation()
              onSelect('c1_100uf')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              onHover('c1_100uf')
            }}
            onPointerOut={() => onHover(null)}
          >
            {/* Horizontal Radial Can Body (Ø 5.0 × 7.0 mm) — white '-' stripe faces +X (GND side!) */}
            <mesh rotation={[Math.PI / 2, 0, -Math.PI / 2]} castShadow>
              <cylinderGeometry args={[2.5, 2.5, 7.0, 26]} />
              <meshStandardMaterial
                map={capTex}
                roughness={0.26}
                metalness={0.34}
                emissive={selectedId === 'c1_100uf' || hoveredId === 'c1_100uf' ? '#38bdf8' : '#000000'}
                emissiveIntensity={selectedId === 'c1_100uf' || hoveredId === 'c1_100uf' ? 0.3 : 0}
              />
            </mesh>
            {/* Scored Aluminum Top End Cap (at -Z) */}
            <mesh position={[0, 0, -3.52]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2.35, 2.35, 0.16, 24]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.18} metalness={0.94} />
            </mesh>
            {/* Rubber Seal Base (at +Z where leads exit) */}
            <mesh position={[0, 0, 3.52]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2.3, 2.3, 0.25, 24]} />
              <meshStandardMaterial color="#181a20" roughness={0.75} />
            </mesh>
            {/* '+' Lead (left / -X) & '-' Lead (right / +X, white stripe side) */}
            <mesh position={[-1.2, -0.45, 4.1]} rotation={[Math.PI / 3.4, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 1.8, 10]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.92} />
            </mesh>
            <mesh position={[1.2, -0.45, 4.1]} rotation={[Math.PI / 3.4, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 1.8, 10]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.92} />
            </mesh>

            {showLabels && (currentStep === 5 || selectedId === 'c1_100uf' || hoveredId === 'c1_100uf') && (
              <Html zIndexRange={[10, 0]} position={[3.5, 4.0, 0]} center>
                <button
                  type="button"
                  onClick={() => onSelect('c1_100uf')}
                  className="pin-3d-tag bg-sky-700/95 text-white border border-sky-300"
                >
                  C1 100 µF / 10 V (Weißer Streifen = − GND)
                </button>
              </Html>
            )}
          </group>
        )}
      </group>

      {/* ================================================================ */}
      {/* 5. SW1: HIDDEN MAGNETIC REED SWITCH IN GLASS TUBE (Step 4+)      */}
      {/* ================================================================ */}
      <group
        ref={sw1GroupRef}
        visible={showMosfet}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('sw1_reed')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('sw1_reed')
        }}
        onPointerOut={() => onHover(null)}
      >
        <group position={MOD_PARTS.SW1_REED.CENTER}>
          {/* Transparent Hermetic Glass Cylinder (14.0 × Ø 2.2 mm) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.15, 1.15, 13.8, 24]} />
            <meshPhysicalMaterial
              color="#dff3ff"
              transparent
              opacity={0.34}
              roughness={0.06}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.05}
              depthWrite={false}
            />
          </mesh>
          {/* Fused Glass End Beads */}
          {[-6.8, 6.8].map((gz, i) => (
            <mesh key={i} position={[0, 0, gz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.95, 1.1, 0.7, 16]} />
              <meshStandardMaterial color="#a8d5ba" roughness={0.25} transparent opacity={0.75} />
            </mesh>
          ))}
          {/* External Axial Leads */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 16.8, 10]} />
            <meshStandardMaterial color="#d4dce6" roughness={0.2} metalness={0.94} />
          </mesh>
          {/* TWO ANIMATED INTERNAL FERROMAGNETIC REED BLADES! */}
          <mesh ref={reedBladeTopRef} position={[0.22, 0, -2.7]}>
            <boxGeometry args={[0.14, 0.62, 7.6]} />
            <meshStandardMaterial color="#e5b84b" roughness={0.22} metalness={0.94} />
          </mesh>
          <mesh ref={reedBladeBotRef} position={[-0.22, 0, 2.7]}>
            <boxGeometry args={[0.14, 0.62, 7.6]} />
            <meshStandardMaterial color="#e5b84b" roughness={0.22} metalness={0.94} />
          </mesh>
          {/* Subtle Contact Glow when Magnet Closes Switch */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.62, 14, 14]} />
            <meshStandardMaterial
              ref={reedGlowRef}
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={0}
              transparent
              opacity={0.7}
            />
          </mesh>

          {showLabels &&
            (currentStep === 4 || currentStep === 7 || selectedId === 'sw1_reed' || hoveredId === 'sw1_reed') && (
              <Html zIndexRange={[10, 0]} position={[2.8, 3.6, 0]} center>
                <button
                  type="button"
                  onClick={() => onSelect('sw1_reed')}
                  className="pin-3d-tag bg-sky-950/92 text-sky-100 border border-sky-400/70"
                >
                  SW1 Reedschalter (Magnet)
                </button>
              </Html>
            )}
        </group>
      </group>

      {/* ================================================================ */}
      {/* 6. KAPTON AMBER POLYIMIDE INSULATING WRAP (Step 6+)              */}
      {/* ================================================================ */}
      <group
        ref={kaptonGroupRef}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('kapton_tape')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('kapton_tape')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Amber Kapton Wrap around ESP32-C3 (leaves red ceramic antenna at +X UNCOVERED!) */}
        <mesh position={[ESP32.CENTER[0] - 2.6, ESP32.CENTER[1] + 1.4, ESP32.CENTER[2]]}>
          <boxGeometry args={[19.2, 4.4, 20.6]} />
          <meshPhysicalMaterial
            ref={kaptonMat1Ref}
            color="#d97706"
            transparent
            opacity={0.42}
            roughness={0.14}
            metalness={0.05}
            clearcoat={0.85}
            depthWrite={false}
          />
        </mesh>

        {/* Amber Kapton Wrap around AO3401 + R1 + D1 power cluster */}
        <mesh position={[19.6, 9.2, 40.2]}>
          <boxGeometry args={[17.8, 4.6, 15.6]} />
          <meshPhysicalMaterial
            ref={kaptonMat2Ref}
            color="#d97706"
            transparent
            opacity={0.42}
            roughness={0.14}
            metalness={0.05}
            clearcoat={0.85}
            depthWrite={false}
          />
        </mesh>

        {showLabels && (currentStep === 6 || selectedId === 'kapton_tape') && (
          <Html zIndexRange={[10, 0]} position={[22, 13.5, 48]} center>
            <button
              type="button"
              onClick={() => onSelect('kapton_tape')}
              className="pin-3d-tag bg-amber-600/92 text-white border border-amber-200/70"
            >
              Kapton-Isolierband (Polyimid)
            </button>
          </Html>
        )}
      </group>
    </group>
  )
}
