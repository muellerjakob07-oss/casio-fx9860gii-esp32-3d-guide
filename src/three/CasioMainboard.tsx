import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BATTERY_BAY, CASIO, CASIO_PORTS } from '../data/geometryLayout'
import type { LayerOffsets } from '../types'
import {
  createLcdKaptonFlexTexture,
  createLowerKeypadPcbTexture,
  createMxicFlashTexture,
  createUpperCpuPcbTexture,
} from './textures'
import { createBatterySpringGeometry, createRoundedRectShape } from './tubeUtils'

interface CasioMainboardProps {
  layersRef: MutableRefObject<LayerOffsets>
  selectedId: string | null
  hoveredId: string | null
  showLabels: boolean
  currentStep: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function CasioMainboard({
  layersRef,
  selectedId,
  hoveredId,
  showLabels,
  currentStep,
  onSelect,
  onHover,
}: CasioMainboardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const lowerPcbMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const lowerTopMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const upperPcbMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const upperTopMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const tipMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const ringMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const sleeveMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const upperPcbTex = useMemo(() => createUpperCpuPcbTexture(), [])
  const lowerPcbTex = useMemo(() => createLowerKeypadPcbTexture(), [])
  const mxicTex = useMemo(() => createMxicFlashTexture(), [])
  const lcdFlexTex = useMemo(() => createLcdKaptonFlexTexture(), [])

  // Conical spring for P702 (-V_BAT) pointing horizontally LEFT (-X)
  const p702SpringGeo = useMemo(() => createBatterySpringGeometry(4.2, 1.5, 9.2, 5.0), [])

  // Flat spiral disc spring for P701 (+V_BAT) standing in YZ plane facing LEFT (-X)
  const p701SpiralGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const samples = 56
    for (let i = 0; i <= samples; i++) {
      const t = i / samples
      const ang = t * 3.2 * Math.PI * 2
      const r = 0.8 + t * 3.8
      pts.push(new THREE.Vector3(0, Math.cos(ang) * r, Math.sin(ang) * r))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 56, 0.3, 8, false)
  }, [])

  // Rounded-square pillow geometries for U101 & U301 COBs (matches image_5.png!)
  const { cobU101Geo, cobU301Geo } = useMemo(() => {
    const s1 = createRoundedRectShape(17.5, 15.8, 5.2)
    const g1 = new THREE.ExtrudeGeometry(s1, {
      depth: 0.9,
      bevelEnabled: true,
      bevelThickness: 0.75,
      bevelSize: 0.9,
      bevelSegments: 5,
      curveSegments: 16,
    })
    g1.rotateX(-Math.PI / 2)

    const s2 = createRoundedRectShape(10.6, 11.4, 3.6)
    const g2 = new THREE.ExtrudeGeometry(s2, {
      depth: 0.85,
      bevelEnabled: true,
      bevelThickness: 0.65,
      bevelSize: 0.8,
      bevelSegments: 5,
      curveSegments: 16,
    })
    g2.rotateX(-Math.PI / 2)

    return { cobU101Geo: g1, cobU301Geo: g2 }
  }, [])

  // White 21-pin soldered Board-to-Board Ribbon Cable (JN701) curving down the 6mm step!
  const { jn701Geo, jn701Tex } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(20.0, CASIO.UPPER_PCB_TOP_Y + 0.15, -1.2),
      new THREE.Vector3(20.0, CASIO.UPPER_PCB_TOP_Y + 0.9, 3.2),
      new THREE.Vector3(20.0, 9.6, 7.2),
      new THREE.Vector3(20.0, CASIO.LOWER_PCB_TOP_Y + 0.2, 10.8),
    ])
    const pts = curve.getPoints(24)
    const width = 21.5
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    pts.forEach((p, i) => {
      positions.push(p.x - width / 2, p.y, p.z)
      positions.push(p.x + width / 2, p.y, p.z)
      uvs.push(0, i / 24)
      uvs.push(1, i / 24)
      if (i < 24) {
        const a = i * 2
        const b = a + 1
        const c = a + 2
        const d = a + 3
        indices.push(a, b, c, b, d, c)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setIndex(indices)
    g.computeVertexNormals()

    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, 256, 128)
    // Exposed tinned solder fingers at top & bottom ends (exact match to image_5.png!)
    ctx.fillStyle = '#334155'
    ctx.fillRect(0, 0, 256, 22)
    ctx.fillRect(0, 106, 256, 22)
    for (let i = 0; i < 21; i++) {
      const lx = 8 + i * 11.6
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(lx, 0, 6.5, 24)
      ctx.fillRect(lx, 104, 6.5, 24)
      ctx.fillStyle = 'rgba(148,163,184,0.28)'
      ctx.fillRect(lx, 24, 5, 80)
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return { jn701Geo: g, jn701Tex: t }
  }, [])

  useFrame((state) => {
    const L = layersRef.current
    if (groupRef.current) {
      groupRef.current.position.y = L.pcbY
    }

    // In Step 8 flipped X-Ray mode, soften PCB opacity so backside UART pulses & ESP32 glow right through
    const pcbXray = L.rootFlip * L.xray
    const pcbOpacity = THREE.MathUtils.lerp(1.0, 0.36, pcbXray)
    const pcbTrans = pcbOpacity < 0.98
    for (const mat of [
      lowerPcbMatRef.current,
      lowerTopMatRef.current,
      upperPcbMatRef.current,
      upperTopMatRef.current,
    ]) {
      if (mat) {
        mat.opacity = pcbOpacity
        mat.transparent = pcbTrans
        mat.depthWrite = !pcbTrans
      }
    }

    // Warm solder / continuity highlight on the 3 CN401 pads in Step 2/3 or hover
    const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 5.2)
    const stepGlow = currentStep === 3 ? 0.55 + pulse * 0.45 : currentStep === 2 ? 0.25 + pulse * 0.3 : 0

    const updatePad = (
      mat: THREE.MeshStandardMaterial | null,
      id: string,
      activeColor: string,
    ) => {
      if (!mat) return
      const focus = selectedId === id || hoveredId === id
      mat.emissive.set(focus ? activeColor : currentStep === 3 ? '#f59e0b' : activeColor)
      mat.emissiveIntensity = focus ? 0.75 : stepGlow * 0.55
    }

    updatePad(tipMatRef.current, 'pad_tip', '#3b82f6')
    updatePad(ringMatRef.current, 'pad_ring', '#22c55e')
    updatePad(sleeveMatRef.current, 'pad_sleeve', '#94a3b8')
  })

  // Dense realistic SMD passives & SOT-23 transistors on CY802-1
  const smdParts: [number, number, number, number, string][] = [
    [-25.5, -67.2, 2.6, 1.3, '#181a20'], // SOT-23 below CN401
    [-19.5, -67.2, 2.6, 1.3, '#181a20'], // SOT-23 below Y pad
    [-14.5, -63.5, 2.6, 1.3, '#181a20'],
    [15.8, -68.0, 4.8, 2.4, '#14161b'], // 4R0 resistor below CN102
    [4.5, -61.5, 2.0, 1.2, '#b08d57'],
    [8.2, -61.5, 2.0, 1.2, '#b08d57'],
    [4.5, -58.5, 2.0, 1.2, '#b08d57'],
    [8.2, -58.5, 2.0, 1.2, '#b08d57'],
    [-5.0, -61.0, 2.2, 1.4, '#181a20'],
    [-1.0, -61.0, 2.2, 1.4, '#181a20'],
    [-8.5, -34.0, 2.4, 1.4, '#b08d57'],
    [-8.5, -30.0, 2.4, 1.4, '#b08d57'],
    [2.0, -24.0, 3.2, 1.6, '#181a20'],
    [8.0, -24.0, 3.2, 1.6, '#181a20'],
  ]

  return (
    <group ref={groupRef}>
      {/* ================================================================ */}
      {/* A. LOWER KEYPAD MAINBOARD: GY493-E4W / RJA520455-001V02          */}
      {/*    Sitting deep at Y = 4.6 .. 6.2 mm (74 × 111 mm)               */}
      {/* ================================================================ */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect('casio_pcb')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('casio_pcb')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh
          position={[0, CASIO.LOWER_PCB_BOTTOM_Y + CASIO.PCB_THICKNESS / 2, 29.5]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[CASIO.LOWER_PCB_WIDTH, CASIO.PCB_THICKNESS, 111.0]} />
          <meshStandardMaterial ref={lowerPcbMatRef} color="#0c6236" roughness={0.38} metalness={0.12} />
        </mesh>

        <mesh
          position={[0, CASIO.LOWER_PCB_TOP_Y + 0.02, 29.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[CASIO.LOWER_PCB_WIDTH - 0.3, 110.7]} />
          <meshStandardMaterial
            ref={lowerTopMatRef}
            map={lowerPcbTex}
            roughness={0.36}
            metalness={0.16}
          />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* REAL BATTERY CONTACTS P702 (-V_BAT) & P701 (+V_BAT) ON GY493-E4W */}
      {/* ================================================================ */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect('battery_pack')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('battery_pack')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* P702 (-V_BAT / GND): Solder block on right edge + horizontal cone spring pointing LEFT (-X) */}
        <mesh position={BATTERY_BAY.P702_SPRING_BASE} castShadow>
          <boxGeometry args={[2.6, 1.8, 5.8]} />
          <meshStandardMaterial color="#d8dee8" roughness={0.18} metalness={0.94} />
        </mesh>
        {/* Vertical riser arm up to battery center Y=11.8 */}
        <mesh position={[30.5, 9.6, 33.2]}>
          <boxGeometry args={[0.8, 5.2, 2.2]} />
          <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.94} />
        </mesh>
        {/* Conical coil spring pointing toward -X (rotation.y = -PI/2 maps +Z tube to -X!) */}
        <mesh
          geometry={p702SpringGeo}
          position={[30.2, BATTERY_BAY.Y_CENTER, 32.0]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color="#dce3ec" roughness={0.18} metalness={0.95} />
        </mesh>
        {/* Highlighted Golden Testpad T702 (-V_BAT / GND) */}
        <mesh position={BATTERY_BAY.NEG_TAB}>
          <cylinderGeometry args={[1.35, 1.35, 0.22, 18]} />
          <meshStandardMaterial color="#eab849" roughness={0.22} metalness={0.92} />
        </mesh>

        {/* P701 (+V_BAT): Solder block on right edge + flat spiral disc standing in YZ plane facing LEFT (-X) */}
        <mesh position={BATTERY_BAY.P701_SPRING_BASE} castShadow>
          <boxGeometry args={[2.6, 1.8, 5.8]} />
          <meshStandardMaterial color="#d8dee8" roughness={0.18} metalness={0.94} />
        </mesh>
        <mesh position={[29.2, 9.5, 65.6]}>
          <boxGeometry args={[0.8, 5.0, 2.0]} />
          <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.94} />
        </mesh>
        <mesh geometry={p701SpiralGeo} position={[28.0, BATTERY_BAY.Y_CENTER, 65.6]} castShadow>
          <meshStandardMaterial color="#dce3ec" roughness={0.18} metalness={0.95} />
        </mesh>
        {/* Highlighted Golden Testpad T701 (+V_BAT) */}
        <mesh position={BATTERY_BAY.POS_TAB}>
          <cylinderGeometry args={[1.35, 1.35, 0.22, 18]} />
          <meshStandardMaterial color="#eab849" roughness={0.22} metalness={0.92} />
        </mesh>

        {showLabels && (currentStep === 1 || currentStep === 4 || selectedId === 'battery_pack') && (
          <>
            <Html zIndexRange={[10, 0]} position={[28.5, 15.5, 36.0]} center>
              <button
                type="button"
                onClick={() => onSelect('battery_pack')}
                className="pin-3d-tag bg-slate-900/92 text-slate-100 border border-slate-400/60"
              >
                P702 / Pad T702 = −V_BAT (GND)
              </button>
            </Html>
            <Html zIndexRange={[10, 0]} position={[28.5, 15.5, 62.5]} center>
              <button
                type="button"
                onClick={() => onSelect('battery_pack')}
                className="pin-3d-tag bg-red-600/92 text-white border border-red-300/60"
              >
                P701 / Pad T701 = +V_BAT (4,8–5,4 V)
              </button>
            </Html>
          </>
        )}
      </group>

      {/* ================================================================ */}
      {/* B. ELEVATED UPPER CPU DAUGHTERBOARD: CY802-1 / RJA532593-001V01  */}
      {/*    Mounted 6.0 mm higher on LCD metal shield (Y = 10.6 .. 12.2)  */}
      {/* ================================================================ */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect('casio_pcb')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('casio_pcb')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh
          position={[-2.0, CASIO.UPPER_PCB_BOTTOM_Y + CASIO.PCB_THICKNESS / 2, -39.75]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[CASIO.UPPER_PCB_WIDTH, CASIO.PCB_THICKNESS, 82.5]} />
          <meshStandardMaterial ref={upperPcbMatRef} color="#0e6839" roughness={0.34} metalness={0.14} />
        </mesh>

        <mesh
          position={[-2.0, CASIO.UPPER_PCB_TOP_Y + 0.02, -39.75]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[CASIO.UPPER_PCB_WIDTH - 0.2, 82.3]} />
          <meshStandardMaterial
            ref={upperTopMatRef}
            map={upperPcbTex}
            roughness={0.32}
            metalness={0.18}
          />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* TOP-LEFT: CN401 2.5mm TRS SERIAL JACK + SQUARE GOLD TEST PADS    */}
      {/* ================================================================ */}
      <group
        position={CASIO_PORTS.JACK_25MM}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('jack_25mm')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('jack_25mm')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Matte-Black Open-Top SMD 2.5mm Jack Body (matches zoom_cn401.png!) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.8, 4.2, 9.6]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.46} metalness={0.1} />
        </mesh>
        {/* Visible Golden Internal TRS Contact Leaf Springs inside CN401 */}
        <mesh position={[0, 2.12, -2.4]}>
          <boxGeometry args={[3.4, 0.2, 1.4]} />
          <meshStandardMaterial color="#eab849" roughness={0.22} metalness={0.92} />
        </mesh>
        <mesh position={[0, 2.12, 0.4]}>
          <boxGeometry args={[3.2, 0.2, 1.4]} />
          <meshStandardMaterial color="#eab849" roughness={0.22} metalness={0.92} />
        </mesh>
        {/* Front Black + Brass Bushing Collar facing -Z */}
        <mesh position={[0, -0.1, -5.7]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[2.15, 2.15, 2.0, 22]} />
          <meshStandardMaterial color="#232730" roughness={0.35} metalness={0.35} />
        </mesh>
        <mesh position={[0, -0.1, -6.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.25, 18]} />
          <meshStandardMaterial color="#090a0d" roughness={0.9} />
        </mesh>
      </group>

      {/* 3 Real Accessible Square Gold Solder/Test Pads around CN401 */}
      {(
        [
          {
            id: 'pad_sleeve',
            pos: CASIO_PORTS.PAD_SLEEVE_GND,
            ref: sleeveMatRef,
            label: 'SLEEVE = GND (CN401)',
            tagClass: 'bg-slate-900/92 text-slate-100 border-slate-400/60',
            offset: [-11.5, 4.2, -5.5] as [number, number, number],
          },
          {
            id: 'pad_ring',
            pos: CASIO_PORTS.PAD_RING_RX,
            ref: ringMatRef,
            label: 'RING = RX (Pad Y, 3,3V)',
            tagClass: 'bg-emerald-700/92 text-white border-emerald-300/60',
            offset: [13.5, 5.2, -1.5] as [number, number, number],
          },
          {
            id: 'pad_tip',
            pos: CASIO_PORTS.PAD_TIP_TX,
            ref: tipMatRef,
            label: 'TIP = TX (Goldpad, 3,3V)',
            tagClass: 'bg-blue-600/92 text-white border-blue-300/60',
            offset: [-1.0, 4.2, 5.8] as [number, number, number],
          },
        ] as const
      ).map((pad) => (
        <group
          key={pad.id}
          position={pad.pos}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(pad.id)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover(pad.id)
          }}
          onPointerOut={() => onHover(null)}
        >
          {/* Square Gold Test Pad matching CY802-1 silkscreen boxes */}
          <mesh>
            <boxGeometry args={[2.4, 0.24, 2.4]} />
            <meshStandardMaterial
              ref={pad.ref}
              color="#eab849"
              roughness={0.2}
              metalness={0.92}
            />
          </mesh>
          {showLabels && ((currentStep >= 2 && currentStep <= 4) || selectedId === pad.id) && (
            <Html zIndexRange={[10, 0]} position={pad.offset} center>
              <button
                type="button"
                onClick={() => onSelect(pad.id)}
                className={`pin-3d-tag border ${pad.tagClass}`}
              >
                {pad.label}
              </button>
            </Html>
          )}
        </group>
      ))}

      {/* P902 Red & White LCD Backlight Wires + Black Tape at Top-Far-Left (image_5.png!) */}
      <group
        position={CASIO_PORTS.BACKLIGHT_PADS}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('backlight_p902')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('backlight_p902')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Soldered Red & White micro wires */}
        <mesh position={[-1.4, 0.3, -1.0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 4.2, 10]} />
          <meshStandardMaterial color="#ef4444" roughness={0.45} />
        </mesh>
        <mesh position={[-1.4, 0.3, 0.9]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 4.2, 10]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
        {/* Black acetate cloth tape securing backlight wires at left edge */}
        <mesh position={[-3.8, -0.4, 2.2]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[3.4, 2.2, 9.5]} />
          <meshStandardMaterial color="#14161b" roughness={0.68} />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* TOP-CENTER: S30FE02 DARK-BROWN POLYIMIDE LCD FLEX CABLE          */}
      {/* ================================================================ */}
      <group
        position={CASIO_PORTS.LCD_FLEX_TOP}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('lcd_flex_s30fe02')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('lcd_flex_s30fe02')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Flat polyimide section bonded to top of CY802-1 */}
        <mesh castShadow>
          <boxGeometry args={[25.5, 0.25, 11.4]} />
          <meshStandardMaterial map={lcdFlexTex} roughness={0.32} metalness={0.2} />
        </mesh>
        {/* Folded 180° loop wrapping around top edge (-Z) down to LCD glass */}
        <mesh position={[0, -2.0, -5.8]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[25.5, 0.25, 4.2]} />
          <meshStandardMaterial color="#3c2718" roughness={0.35} />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* TOP-RIGHT: CN102 SILVER MINI-USB PORT                            */}
      {/* ================================================================ */}
      <group
        position={CASIO_PORTS.MINI_USB}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('mini_usb')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('mini_usb')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.7, 3.9, 9.2]} />
          <meshStandardMaterial color="#d2d8e2" roughness={0.22} metalness={0.92} />
        </mesh>
        <mesh position={[0, 0, -4.62]}>
          <boxGeometry args={[6.4, 2.6, 0.25]} />
          <meshStandardMaterial color="#111318" roughness={0.8} />
        </mesh>
        {[-4.1, 4.1].map((ax, i) => (
          <mesh key={i} position={[ax, -1.5, 0]}>
            <boxGeometry args={[1.0, 0.8, 5.8]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* ROUNDED-SQUARE EPOXY COBs (U101 CPU & U301) + MXIC "9A" FLASH    */}
      {/* ================================================================ */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect('cob_cpu')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('cob_cpu')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh geometry={cobU101Geo} position={[3.0, CASIO.UPPER_PCB_TOP_Y, -41.5]} castShadow>
          <meshPhysicalMaterial
            color="#0e1014"
            roughness={0.14}
            metalness={0.08}
            clearcoat={0.92}
            clearcoatRoughness={0.12}
          />
        </mesh>
        <mesh geometry={cobU301Geo} position={[-21.0, CASIO.UPPER_PCB_TOP_Y, -48.0]} castShadow>
          <meshPhysicalMaterial
            color="#0e1014"
            roughness={0.14}
            metalness={0.08}
            clearcoat={0.92}
            clearcoatRoughness={0.12}
          />
        </mesh>
      </group>

      {/* MXIC Macronix NOR Flash TSOP-48 with authentic white "9A" mark (replaces fake CR2032!) */}
      <group
        position={CASIO_PORTS.MXIC_FLASH}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('mxic_flash')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('mxic_flash')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh castShadow>
          <boxGeometry args={[12.0, 1.1, 17.6]} />
          <meshStandardMaterial color="#1f2229" roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.57, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[11.8, 17.4]} />
          <meshStandardMaterial map={mxicTex} roughness={0.36} />
        </mesh>
        {/* TSOP-48 fine silver leads along top & bottom edges */}
        {Array.from({ length: 14 }).map((_, i) => {
          const lx = -5.2 + i * 0.8
          return (
            <group key={i}>
              <mesh position={[lx, -0.25, -9.2]}>
                <boxGeometry args={[0.35, 0.35, 1.0]} />
                <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.92} />
              </mesh>
              <mesh position={[lx, -0.25, 9.2]}>
                <boxGeometry args={[0.35, 0.35, 1.0]} />
                <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.92} />
              </mesh>
            </group>
          )
        })}
        {showLabels && (currentStep === 1 || selectedId === 'mxic_flash') && (
          <Html zIndexRange={[10, 0]} position={[0, 5.2, 0]} center>
            <button
              type="button"
              onClick={() => onSelect('mxic_flash')}
              className="pin-3d-tag bg-emerald-600/95 text-white border border-emerald-200/80 shadow"
            >
              MXIC NOR-Flash („9A“) • Kein CR2032 nötig!
            </button>
          </Html>
        )}
      </group>

      {/* Characteristic Orange SMD Tantalum Capacitors, Blue Trimmer & Crystal on CY802-1 */}
      <mesh position={[9.2, CASIO.UPPER_PCB_TOP_Y + 0.9, -14.2]} castShadow>
        <boxGeometry args={[3.4, 1.8, 2.8]} />
        <meshStandardMaterial color="#ea781e" roughness={0.38} />
      </mesh>
      <mesh position={[18.2, CASIO.UPPER_PCB_TOP_Y + 1.1, -13.8]} castShadow>
        <boxGeometry args={[3.8, 2.2, 4.8]} />
        <meshStandardMaterial color="#ea781e" roughness={0.38} />
      </mesh>
      <mesh position={[22.0, CASIO.UPPER_PCB_TOP_Y + 0.65, -39.5]} castShadow>
        <boxGeometry args={[3.6, 1.3, 3.6]} />
        <meshStandardMaterial color="#2563eb" roughness={0.35} />
      </mesh>
      <mesh position={[18.8, CASIO.UPPER_PCB_TOP_Y + 0.55, -60.5]} castShadow>
        <boxGeometry args={[5.0, 1.1, 2.2]} />
        <meshStandardMaterial color="#181a20" roughness={0.4} />
      </mesh>

      {smdParts.map(([sx, sz, sw, sl, col], idx) => (
        <mesh key={idx} position={[sx, CASIO.UPPER_PCB_TOP_Y + 0.35, sz]}>
          <boxGeometry args={[sw, 0.7, sl]} />
          <meshStandardMaterial color={col} roughness={0.42} />
        </mesh>
      ))}

      {/* ================================================================ */}
      {/* STEP-EDGE BRIDGE: JN701 WHITE 21-PIN RIBBON + C302 BLUE ELKO     */}
      {/* ================================================================ */}
      {/* JN701 White Soldered Board-to-Board Ribbon Cable (Right Side of Step!) */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect('ffc_cable')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('ffc_cable')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh geometry={jn701Geo} castShadow>
          <meshStandardMaterial
            map={jn701Tex}
            side={THREE.DoubleSide}
            roughness={0.38}
            metalness={0.18}
          />
        </mesh>
        {showLabels && (currentStep === 2 || selectedId === 'ffc_cable' || hoveredId === 'ffc_cable') && (
          <Html zIndexRange={[10, 0]} position={[20.0, 15.2, 4.8]} center>
            <button
              type="button"
              onClick={() => onSelect('ffc_cable')}
              className="pin-3d-tag bg-red-600/95 text-white border border-red-200/70 shadow-lg"
            >
              ⚠ JN701 Verbindungs-FFC (direkt verlötet – nicht knicken!)
            </button>
          </Html>
        )}
      </group>

      {/* C302 Horizontal Light-Blue Electrolytic Capacitor hanging into Step-Trench! */}
      <group
        position={CASIO_PORTS.BLUE_CAP_C302}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('c302_cap')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('c302_cap')
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[2.6, 2.6, 10.2, 22]} />
          <meshStandardMaterial color="#1d6fe8" roughness={0.26} metalness={0.28} />
        </mesh>
        {/* White polarity stripe on C302 */}
        <mesh position={[2.52, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.25, 10.0, 1.3]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>
        {/* Scored aluminum end cap */}
        <mesh position={[0, 0, 5.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.4, 2.4, 0.16, 20]} />
          <meshStandardMaterial color="#dce3ec" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Two bent solder leads up to CY802-1 bottom edge */}
        {[-0.9, 0.9].map((lx, i) => (
          <mesh key={i} position={[lx, 1.8, -5.8]} rotation={[0.55, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 4.2, 10]} />
            <meshStandardMaterial color="#dce3ec" roughness={0.2} metalness={0.94} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
