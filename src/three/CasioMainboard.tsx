import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CASIO, CASIO_PORTS, CR2032_POS } from '../data/geometryLayout'
import type { LayerOffsets } from '../types'
import { createCasioPcbTexture, createCr2032Texture } from './textures'

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
  const pcbCoreMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const pcbTopMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const tipMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const ringMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const sleeveMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const pcbTexture = useMemo(() => createCasioPcbTexture(), [])
  const cr2032Texture = useMemo(() => createCr2032Texture(), [])

  // Smooth curved white 24-pin FFC Display Ribbon geometry
  const ffcGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5.4, -55.0),
      new THREE.Vector3(0, 8.2, -51.0),
      new THREE.Vector3(0, 8.9, -45.5),
      new THREE.Vector3(0, 8.1, -40.5),
    ])
    const pts = curve.getPoints(24)
    const width = 22.0
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
    return g
  }, [])

  // Procedural crisp 24-conductor white FFC texture
  const ffcTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, 256, 128)
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#cbd5e1' : '#94a3b8'
      ctx.fillRect(10 + i * 10, 0, 4, 128)
    }
    // Blue PET stiffener strip at connector end
    ctx.fillStyle = '#1d4ed8'
    ctx.fillRect(0, 102, 256, 26)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
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
    for (const mat of [pcbCoreMatRef.current, pcbTopMatRef.current]) {
      if (mat) {
        mat.opacity = pcbOpacity
        mat.transparent = pcbTrans
        mat.depthWrite = !pcbTrans
      }
    }

    // Warm molten solder glow highlight on the 3 serial pads in Step 2/3 or hover
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

  // SMD resistor array coordinates
  const smdPositions: [number, number, number][] = [
    [-28, CASIO.PCB_TOP_Y + 0.35, -42],
    [-28, CASIO.PCB_TOP_Y + 0.35, -37],
    [-28, CASIO.PCB_TOP_Y + 0.35, -32],
    [-28, CASIO.PCB_TOP_Y + 0.35, -14],
    [-28, CASIO.PCB_TOP_Y + 0.35, -9],
    [30, CASIO.PCB_TOP_Y + 0.35, -34],
    [30, CASIO.PCB_TOP_Y + 0.35, -28],
    [30, CASIO.PCB_TOP_Y + 0.35, -22],
    [-5, CASIO.PCB_TOP_Y + 0.35, 6],
    [4, CASIO.PCB_TOP_Y + 0.35, 6],
    [13, CASIO.PCB_TOP_Y + 0.35, 6],
    [22, CASIO.PCB_TOP_Y + 0.35, 6],
  ]

  return (
    <group ref={groupRef}>
      {/* ================================================================ */}
      {/* EMERALD GREEN FR4 MAINBOARD PCB (82 × 114 × 1.6 mm)              */}
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
        {/* Solid FR4 Substrate Core */}
        <mesh position={[0, CASIO.PCB_BOTTOM_Y + CASIO.PCB_THICKNESS / 2, -29.0]} castShadow receiveShadow>
          <boxGeometry args={[82.0, CASIO.PCB_THICKNESS, 114.0]} />
          <meshStandardMaterial ref={pcbCoreMatRef} color="#0b5c34" roughness={0.34} metalness={0.14} />
        </mesh>

        {/* High-res Emerald Soldermask + Copper Traces + Silkscreen Top Layer */}
        <mesh position={[0, CASIO.PCB_TOP_Y + 0.02, -29.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[81.6, 113.6]} />
          <meshStandardMaterial
            ref={pcbTopMatRef}
            map={pcbTexture}
            roughness={0.32}
            metalness={0.2}
          />
        </mesh>

        {/* Gold mounting rim rings around PCB edges */}
        {[
          [-37, -81],
          [37, -81],
          [-37, 23],
          [37, 23],
        ].map(([gx, gz], idx) => (
          <mesh key={idx} position={[gx, CASIO.PCB_TOP_Y + 0.06, gz]}>
            <cylinderGeometry args={[2.1, 2.1, 0.08, 16]} />
            <meshStandardMaterial color="#e0b84c" roughness={0.24} metalness={0.88} />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* MINI-USB PORT (Typ Mini-B, Top Left Edge)                        */}
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
        {/* Brushed Stainless Steel Mini-B Shell */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.7, 3.9, 9.2]} />
          <meshStandardMaterial color="#d2d8e2" roughness={0.22} metalness={0.92} />
        </mesh>
        {/* Dark Recessed Port Opening facing -Z */}
        <mesh position={[0, 0, -4.62]}>
          <boxGeometry args={[6.4, 2.6, 0.25]} />
          <meshStandardMaterial color="#111318" roughness={0.8} />
        </mesh>
        {/* Internal USB Contact Tongue */}
        <mesh position={[0, 0, -4.1]}>
          <boxGeometry args={[4.4, 0.7, 1.2]} />
          <meshStandardMaterial color="#272b33" roughness={0.5} />
        </mesh>
        {/* Side Solder Anchors */}
        {[-4.0, 4.0].map((ax, i) => (
          <mesh key={i} position={[ax, -1.6, 0]}>
            <boxGeometry args={[0.9, 0.9, 6.2]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* 2.5mm 3-PIN TRS SERIAL JACK + 3 LARGE LABELED GOLD SOLDER PADS   */}
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
        {/* Matte Black Rectangular Jack Housing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6.6, 5.2, 11.4]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.44} metalness={0.12} />
        </mesh>
        {/* Protruding Cylindrical Metal Bushing Collar facing -Z */}
        <mesh position={[0, 0, -6.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[2.35, 2.35, 2.2, 24]} />
          <meshStandardMaterial color="#d8dee8" roughness={0.2} metalness={0.94} />
        </mesh>
        {/* 2.5mm Bore Hole */}
        <mesh position={[0, 0, -7.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.3, 18]} />
          <meshStandardMaterial color="#090a0d" roughness={0.9} />
        </mesh>
      </group>

      {/* 3 Large Gold Solder Pads on Back of PCB (TIP / RING / SLEEVE) */}
      {(
        [
          {
            id: 'pad_sleeve',
            pos: CASIO_PORTS.PAD_SLEEVE_GND,
            ref: sleeveMatRef,
            label: 'SLEEVE = GND',
            ringColor: '#334155',
            tagClass: 'bg-slate-900/92 text-slate-100 border-slate-400/60',
            offset: [-14.0, 4.5, -4.5] as [number, number, number],
          },
          {
            id: 'pad_ring',
            pos: CASIO_PORTS.PAD_RING_RX,
            ref: ringMatRef,
            label: 'RING = RX (3,3V)',
            ringColor: '#16a34a',
            tagClass: 'bg-emerald-700/92 text-white border-emerald-300/60',
            offset: [1.5, 9.2, -1.5] as [number, number, number],
          },
          {
            id: 'pad_tip',
            pos: CASIO_PORTS.PAD_TIP_TX,
            ref: tipMatRef,
            label: 'TIP = TX (3,3V)',
            ringColor: '#2563eb',
            tagClass: 'bg-blue-600/92 text-white border-blue-300/60',
            offset: [13.0, 4.5, 4.0] as [number, number, number],
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
          {/* Large Gold Oval Solder Pad */}
          <mesh scale={[1.3, 1, 1.0]}>
            <cylinderGeometry args={[1.35, 1.45, 0.24, 20]} />
            <meshStandardMaterial
              ref={pad.ref}
              color="#eab849"
              roughness={0.22}
              metalness={0.9}
            />
          </mesh>
          {/* Color-coded silkscreen halo */}
          <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.65, 2.15, 24]} />
            <meshStandardMaterial color={pad.ringColor} roughness={0.5} />
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

      {/* ================================================================ */}
      {/* TWO BLACK CHIP-ON-BOARD (COB) EPOXY BLOBS (CPU & RAM/FLASH)      */}
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
        {/* Main SH4A CPU COB Dome */}
        <mesh position={[-12.0, CASIO.PCB_TOP_Y + 0.1, -24.0]} scale={[1, 0.28, 1]} castShadow>
          <sphereGeometry args={[9.2, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#0e1014"
            roughness={0.14}
            metalness={0.08}
            clearcoat={0.92}
            clearcoatRoughness={0.12}
          />
        </mesh>
        {/* Secondary RAM/Flash COB Dome */}
        <mesh position={[17.5, CASIO.PCB_TOP_Y + 0.1, -20.5]} scale={[1, 0.3, 1]} castShadow>
          <sphereGeometry args={[6.8, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#0e1014"
            roughness={0.14}
            metalness={0.08}
            clearcoat={0.92}
            clearcoatRoughness={0.12}
          />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* WHITE 24-PIN DISPLAY FLAT FLEX CABLE (FFC) + WARNING BADGE       */}
      {/* ================================================================ */}
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
        {/* PCB Slot Cutout visual */}
        <mesh position={[0, CASIO.PCB_TOP_Y + 0.08, -55.2]}>
          <boxGeometry args={[24.5, 0.2, 2.4]} />
          <meshStandardMaterial color="#0b0d11" roughness={0.9} />
        </mesh>
        {/* Curved 24-pin white ribbon */}
        <mesh geometry={ffcGeo} castShadow>
          <meshStandardMaterial
            map={ffcTexture}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.15}
          />
        </mesh>
        {/* ZIF Connector Header */}
        <mesh position={[0, CASIO.PCB_TOP_Y + 0.9, -40.2]} castShadow>
          <boxGeometry args={[25.0, 1.8, 3.8]} />
          <meshStandardMaterial color="#e8edf3" roughness={0.38} />
        </mesh>
        <mesh position={[0, CASIO.PCB_TOP_Y + 1.45, -39.2]}>
          <boxGeometry args={[24.0, 0.7, 1.4]} />
          <meshStandardMaterial color="#1e222a" roughness={0.45} />
        </mesh>
        {showLabels && (currentStep === 2 || selectedId === 'ffc_cable' || hoveredId === 'ffc_cable') && (
          <Html zIndexRange={[10, 0]} position={[0, CASIO.PCB_TOP_Y + 6.2, -47.5]} center>
            <button
              type="button"
              onClick={() => onSelect('ffc_cable')}
              className="pin-3d-tag bg-red-600/95 text-white border border-red-200/70 shadow-lg"
            >
              ⚠ Display-FFC: Nicht knicken oder abziehen!
            </button>
          </Html>
        )}
      </group>

      {/* ================================================================ */}
      {/* BLUE STANDING ELECTROLYTIC CAPACITOR & SMD PASSIVES              */}
      {/* ================================================================ */}
      <group position={[-28.5, CASIO.PCB_TOP_Y, -62.0]}>
        <mesh position={[0, 3.6, 0]} castShadow>
          <cylinderGeometry args={[2.5, 2.5, 7.2, 20]} />
          <meshStandardMaterial color="#1d5fb8" roughness={0.28} metalness={0.28} />
        </mesh>
        {/* Metallic scored vent top */}
        <mesh position={[0, 7.22, 0]}>
          <cylinderGeometry args={[2.3, 2.3, 0.14, 20]} />
          <meshStandardMaterial color="#dce3ec" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Silver minus stripe */}
        <mesh position={[2.46, 3.6, 0]}>
          <boxGeometry args={[0.2, 6.8, 1.1]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>
      </group>

      {/* 32.768 kHz Cylindrical Watch Crystal */}
      <mesh position={[-3.0, CASIO.PCB_TOP_Y + 1.0, -7.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 6.0, 14]} />
        <meshStandardMaterial color="#d9e0ea" roughness={0.18} metalness={0.95} />
      </mesh>

      {/* SMD Resistor Networks & MLCC Decoupling Caps */}
      {smdPositions.map(([sx, sy, sz], idx) => (
        <group key={idx} position={[sx, sy, sz]}>
          <mesh>
            <boxGeometry args={[3.2, 0.7, 1.6]} />
            <meshStandardMaterial
              color={idx % 3 === 0 ? '#a88a5e' : '#181a20'}
              roughness={0.42}
            />
          </mesh>
          <mesh position={[-1.65, 0, 0]}>
            <boxGeometry args={[0.45, 0.72, 1.62]} />
            <meshStandardMaterial color="#d4dce6" roughness={0.22} metalness={0.9} />
          </mesh>
          <mesh position={[1.65, 0, 0]}>
            <boxGeometry args={[0.45, 0.72, 1.62]} />
            <meshStandardMaterial color="#d4dce6" roughness={0.22} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ================================================================ */}
      {/* CR2032 BACKUP COIN CELL HOLDER (RAM Retention Warning!)          */}
      {/* ================================================================ */}
      <group
        position={CR2032_POS}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('cr2032')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('cr2032')
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Black Circular Nylon Holder Cradle */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[11.4, 11.6, 3.6, 32]} />
          <meshStandardMaterial color="#191c22" roughness={0.48} />
        </mesh>
        {/* Chrome CR2032 3V Lithium Coin Cell seated inside */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[10.0, 10.0, 3.2, 32]} />
          <meshStandardMaterial color="#d5dce5" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Top embossed metallic stamp */}
        <mesh position={[0, 3.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[9.8, 32]} />
          <meshStandardMaterial map={cr2032Texture} roughness={0.22} metalness={0.86} />
        </mesh>
        {/* Spring Positive Retention Clip spanning top */}
        <mesh position={[0, 4.1, -6.2]} castShadow>
          <boxGeometry args={[6.4, 0.45, 9.5]} />
          <meshStandardMaterial color="#dde3ec" roughness={0.2} metalness={0.94} />
        </mesh>
        {showLabels && (currentStep === 1 || selectedId === 'cr2032') && (
          <Html zIndexRange={[10, 0]} position={[14, 14.5, -10.0]} center>
            <button
              type="button"
              onClick={() => onSelect('cr2032')}
              className="pin-3d-tag bg-amber-500/95 text-slate-950 border border-amber-200/80 shadow"
            >
              CR2032 RAM-Backup (Drin lassen!)
            </button>
          </Html>
        )}
      </group>
    </group>
  )
}
