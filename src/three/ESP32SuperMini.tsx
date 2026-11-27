import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ESP32, ESP32_PINS } from '../data/geometryLayout'
import type { LayerOffsets } from '../types'
import { createEsp32ChipTexture, createEsp32PcbTexture } from './textures'

interface ESP32SuperMiniProps {
  layersRef: MutableRefObject<LayerOffsets>
  selectedId: string | null
  hoveredId: string | null
  showLabels: boolean
  currentStep: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function ESP32SuperMini({
  layersRef,
  selectedId,
  hoveredId,
  showLabels,
  currentStep,
  onSelect,
  onHover,
}: ESP32SuperMiniProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const ledLightRef = useRef<THREE.PointLight>(null)

  const pcbTex = useMemo(() => createEsp32PcbTexture(), [])
  const chipTex = useMemo(() => createEsp32ChipTexture(), [])

  useFrame((state) => {
    const L = layersRef.current
    if (groupRef.current) {
      groupRef.current.position.set(
        ESP32.CENTER[0],
        ESP32.CENTER[1] + L.modY,
        ESP32.CENTER[2],
      )
    }

    // Genuine glowing blue GPIO8 Status LED when SW1 is closed (powered ON)
    const t = state.clock.elapsedTime
    const active = L.powerOn && currentStep >= 7
    const manualActive = L.powerOn
    let glow = 0
    if (manualActive) {
      // Rhythmic Wi-Fi heartbeat pulse on GPIO8
      const heartbeat =
        currentStep === 8
          ? 0.55 + 0.45 * Math.sin(t * 14)
          : 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * 4.5), 2)
      glow = active || manualActive ? heartbeat : 0
    }

    if (ledMatRef.current) {
      ledMatRef.current.emissiveIntensity = glow * 5.0
      ledMatRef.current.color.set(glow > 0.05 ? '#60a5fa' : '#1e3a5f')
    }
    if (ledLightRef.current) {
      ledLightRef.current.intensity = glow * 16
    }
  })

  const showKeepOut =
    currentStep === 6 ||
    currentStep === 7 ||
    currentStep === 8 ||
    selectedId === 'esp32_antenna' ||
    hoveredId === 'esp32_antenna'

  const showPinLabels =
    showLabels &&
    (currentStep === 3 ||
      currentStep === 5 ||
      currentStep === 6 ||
      selectedId === 'esp32_board' ||
      (selectedId?.startsWith('esp_pin_') ?? false))

  return (
    <group
      ref={groupRef}
      visible={currentStep >= 3 || selectedId === 'esp32_board'}
      position={ESP32.CENTER}
      rotation={[0, ESP32.ROTATION_Y, 0]}
    >
      {/* ================================================================ */}
      {/* MATTE BLACK FR4 PCB BODY (EXACT 18.0 × 1.0 × 22.5 mm)            */}
      {/* ================================================================ */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect('esp32_board')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('esp32_board')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[ESP32.WIDTH, ESP32.THICKNESS, ESP32.LENGTH]} />
          <meshStandardMaterial color="#15171d" roughness={0.58} metalness={0.14} />
        </mesh>

        {/* Crisp Matte Black Top Silkscreen Layer */}
        <mesh position={[0, ESP32.THICKNESS / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ESP32.WIDTH - 0.1, ESP32.LENGTH - 0.1]} />
          <meshStandardMaterial map={pcbTex} roughness={0.52} metalness={0.16} />
        </mesh>

        {/* ============================================================== */}
        {/* SILVER USB-C CONNECTOR AT TOP EDGE (local -Z)                  */}
        {/* ============================================================== */}
        <group position={[0, 1.95, -9.6]}>
          <mesh castShadow>
            <boxGeometry args={[8.9, 3.1, 6.8]} />
            <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.94} />
          </mesh>
          {/* Rounded USB-C Port Mouth */}
          <mesh position={[0, 0, -3.42]}>
            <boxGeometry args={[7.4, 1.9, 0.2]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, -3.0]}>
            <boxGeometry args={[5.8, 0.45, 0.8]} />
            <meshStandardMaterial color="#1f242d" roughness={0.5} />
          </mesh>
        </group>

        {/* ============================================================== */}
        {/* TWO TINY SIDE TACTILE BUTTONS: BOOT (Left) & RST (Right)       */}
        {/* ============================================================== */}
        {[
          { x: -5.2, z: -4.4 }, // BOOT
          { x: 5.2, z: -4.4 }, // RST
        ].map((btn, idx) => (
          <group key={idx} position={[btn.x, 0.9, btn.z]}>
            <mesh castShadow>
              <boxGeometry args={[2.2, 0.8, 3.0]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.28} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.5, 14]} />
              <meshStandardMaterial color="#181b22" roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* ============================================================== */}
        {/* ICONIC 45°-ROTATED ESP32-C3 QFN32 CHIP (5.0 × 5.0 × 0.85 mm)   */}
        {/* ============================================================== */}
        <group position={[0, 0.92, 1.8]} rotation={[0, Math.PI / 4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[5.0, 0.85, 5.0]} />
            <meshStandardMaterial color="#1d2027" roughness={0.38} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.7, 4.7]} />
            <meshStandardMaterial map={chipTex} roughness={0.35} metalness={0.2} />
          </mesh>
        </group>

        {/* ============================================================== */}
        {/* 40 MHz METALLIC CRYSTAL OSCILLATOR & ME6211 LDO REGULATOR      */}
        {/* ============================================================== */}
        {/* Metallic 40 MHz Crystal */}
        <mesh position={[4.2, 0.88, 5.8]} castShadow>
          <boxGeometry args={[2.5, 0.75, 2.0]} />
          <meshStandardMaterial color="#d4dce6" roughness={0.18} metalness={0.94} />
        </mesh>

        {/* ME6211 3.3V LDO Voltage Regulator (SOT-23-5 near 5V/3V3 pads) */}
        <group position={[4.5, 0.88, -6.2]}>
          <mesh castShadow>
            <boxGeometry args={[2.9, 0.85, 1.6]} />
            <meshStandardMaterial color="#1a1d24" roughness={0.4} />
          </mesh>
          {[-0.95, 0, 0.95].map((lx, i) => (
            <mesh key={i} position={[lx, -0.22, 0.95]}>
              <boxGeometry args={[0.35, 0.25, 0.5]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Tiny 0402 Decoupling Passives */}
        {[
          [-3.8, 0.72, 5.8],
          [-2.0, 0.72, 6.2],
          [1.8, 0.72, 6.6],
          [4.2, 0.72, 0.8],
        ].map(([cx, cy, cz], idx) => (
          <mesh key={idx} position={[cx, cy, cz]}>
            <boxGeometry args={[1.1, 0.45, 0.65]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#a18156' : '#242830'} roughness={0.45} />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* GENUINE GLOWING BLUE STATUS LED (GPIO8)                          */}
      {/* ================================================================ */}
      <group
        position={[-3.6, 0.78, -1.8]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('esp32_led')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('esp32_led')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh>
          <boxGeometry args={[1.6, 0.58, 0.85]} />
          <meshStandardMaterial
            ref={ledMatRef}
            color="#38bdf8"
            emissive="#2599ff"
            emissiveIntensity={0}
            roughness={0.2}
          />
        </mesh>
        <pointLight
          ref={ledLightRef}
          position={[0, 1.8, 0]}
          color="#38bdf8"
          intensity={0}
          distance={26}
          decay={2}
        />
      </group>

      {/* ================================================================ */}
      {/* RED CERAMIC WI-FI ANTENNA (Bottom Edge +Z) + KEEP-OUT ZONE       */}
      {/* ================================================================ */}
      <group
        position={[0, 1.05, 10.3]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('esp32_antenna')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('esp32_antenna')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Authentic Brick-Red Ceramic 2.4GHz SMD Antenna */}
        <mesh castShadow>
          <boxGeometry args={[5.2, 1.25, 1.85]} />
          <meshPhysicalMaterial
            color="#c82828"
            roughness={0.26}
            metalness={0.08}
            clearcoat={0.6}
          />
        </mesh>
        {/* Silver end terminations */}
        {[-2.5, 2.5].map((ax, i) => (
          <mesh key={i} position={[ax, 0, 0]}>
            <boxGeometry args={[0.55, 1.28, 1.88]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.92} />
          </mesh>
        ))}

        {/* Semi-transparent "Antenna Keep-Out-Zone" facing outer calculator wall! */}
        {showKeepOut && (
          <group position={[0, 0.4, 2.4]}>
            <mesh>
              <boxGeometry args={[10.5, 4.2, 4.6]} />
              <meshStandardMaterial
                color="#ef4444"
                transparent
                opacity={0.18}
                depthWrite={false}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[10.5, 4.2, 4.6]} />
              <meshBasicMaterial color="#f87171" wireframe transparent opacity={0.55} />
            </mesh>
            {showLabels && (
              <Html zIndexRange={[10, 0]} position={[0, 3.6, 2.2]} center>
                <button
                  type="button"
                  onClick={() => onSelect('esp32_antenna')}
                  className="pin-3d-tag bg-red-600/92 text-white border border-red-200/70"
                >
                  Antenne → Außenwand (Keep-Out-Zone)
                </button>
              </Html>
            )}
          </group>
        )}
      </group>

      {/* ================================================================ */}
      {/* ALL 16 GOLD CASTELLATED EDGE PADS WITH INTERACTIVE 3D LABELS     */}
      {/* ================================================================ */}
      {ESP32_PINS.map((pin) => {
        const isSelected = selectedId === pin.id
        const isHovered = hoveredId === pin.id
        const highlight = isSelected || isHovered
        return (
          <group
            key={pin.id}
            position={[pin.localPos[0], 0, pin.localPos[2]]}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(pin.id)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              onHover(pin.id)
            }}
            onPointerOut={() => onHover(null)}
          >
            {/* Gold Plated Castellated Pad Collar (Top + Bottom + Side Half-Hole) */}
            <mesh position={[0, 0.53, 0]}>
              <cylinderGeometry args={[0.88, 0.88, 0.14, 16]} />
              <meshStandardMaterial
                color={highlight ? '#fde047' : '#e5b84b'}
                emissive={highlight ? pin.color : '#000000'}
                emissiveIntensity={highlight ? 0.85 : 0}
                roughness={0.2}
                metalness={0.92}
              />
            </mesh>
            {/* Edge Castellated Plated Half-Barrel */}
            <mesh position={[pin.side === 'left' ? -0.45 : 0.45, 0, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 1.06, 12]} />
              <meshStandardMaterial color="#e5b84b" roughness={0.22} metalness={0.92} />
            </mesh>
            {/* Through-Hole Center */}
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.16, 12]} />
              <meshStandardMaterial color="#0b0d11" roughness={0.9} />
            </mesh>

            {/* 3D Interactive Pin Label (all 16 pads visible when zoomed/labeled, or highlighted pins) */}
            {(showPinLabels && (pin.used || selectedId === 'esp32_board' || highlight)) && (
              <Html
                zIndexRange={[10, 0]}
                position={[
                  pin.side === 'left' ? -2.9 : 2.9,
                  1.55,
                  0,
                ]}
                center
              >
                <button
                  type="button"
                  onClick={() => onSelect(pin.id)}
                  style={{
                    borderColor: pin.color,
                  }}
                  className={`pin-3d-tag border ${
                    pin.used || highlight
                      ? 'bg-slate-950/92 text-white'
                      : 'bg-slate-900/75 text-slate-300'
                  }`}
                >
                  {pin.label}
                </button>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
