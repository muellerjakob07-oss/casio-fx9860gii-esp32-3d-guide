import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  AAA_BAYS,
  BATTERY_BAY,
  CASIO,
  NICHE_BOUNDS,
  SCREW_POSITIONS,
} from '../data/geometryLayout'
import type { LayerOffsets, LivePhase } from '../types'
import {
  createBatteryTexture,
  createCasioBackTexture,
  createCasioFrontTexture,
  createLiveLcdController,
} from './textures'
import { createBatterySpringGeometry, createRoundedRectShape } from './tubeUtils'

interface CasioHousingProps {
  layersRef: MutableRefObject<LayerOffsets>
  livePhaseRef: MutableRefObject<{ phase: LivePhase; progress: number }>
  selectedId: string | null
  hoveredId: string | null
  showLabels: boolean
  currentStep: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function CasioHousing({
  layersRef,
  livePhaseRef,
  selectedId,
  hoveredId,
  showLabels,
  currentStep,
  onSelect,
  onHover,
}: CasioHousingProps) {
  const frontGroupRef = useRef<THREE.Group>(null)
  const keycapsGroupRef = useRef<THREE.Group>(null)
  const membraneGroupRef = useRef<THREE.Group>(null)
  const batteriesGroupRef = useRef<THREE.Group>(null)
  const backGroupRef = useRef<THREE.Group>(null)
  const batteryDoorRef = useRef<THREE.Group>(null)
  const screwsRefs = useRef<(THREE.Group | null)[]>([])

  // Materials driven smoothly by X-Ray slider
  const frontMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const frontRimMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const backMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const backPlateMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const backDecalMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const doorMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const frontPlateMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // Procedural textures & live 128x64 LCD controller
  const frontTexture = useMemo(() => createCasioFrontTexture(), [])
  const backTexture = useMemo(() => createCasioBackTexture(), [])
  const batteryTexture = useMemo(() => createBatteryTexture(), [])
  const lcdController = useMemo(() => createLiveLcdController(), [])
  const springGeo = useMemo(() => createBatterySpringGeometry(3.6, 1.3, 4.4, 4.5), [])

  // Hollow shell geometries (true 2.0 mm wall thickness, rounded 8.5 mm corners)
  const { frontRimGeo, frontPlateGeo, backRimGeo, backPlateGeo } = useMemo(() => {
    const outer = createRoundedRectShape(CASIO.WIDTH, CASIO.LENGTH, CASIO.CORNER_RADIUS)
    const inner = createRoundedRectShape(
      CASIO.WIDTH - CASIO.WALL * 2,
      CASIO.LENGTH - CASIO.WALL * 2,
      CASIO.CORNER_RADIUS - 1.6,
    )
    const rimShape = outer.clone()
    rimShape.holes.push(inner)

    const frontRim = new THREE.ExtrudeGeometry(rimShape, {
      depth: CASIO.SPLIT_Y - 1.8,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.35,
      bevelSegments: 3,
      curveSegments: 16,
    })
    frontRim.rotateX(-Math.PI / 2)

    const frontPlate = new THREE.ExtrudeGeometry(outer, {
      depth: 1.8,
      bevelEnabled: true,
      bevelThickness: 0.55,
      bevelSize: 0.45,
      bevelSegments: 3,
      curveSegments: 16,
    })
    frontPlate.rotateX(-Math.PI / 2)

    const backRim = new THREE.ExtrudeGeometry(rimShape, {
      depth: CASIO.SPLIT_Y - 2.0,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.35,
      bevelSegments: 3,
      curveSegments: 16,
    })
    backRim.rotateX(-Math.PI / 2)

    const backPlateShape = outer.clone()
    // 4xAAA battery bay cutout (3D X: -39..+11, Z: +32.5..+84 -> shape Y: -84..-32.5)
    const batHole = new THREE.Path()
    batHole.moveTo(-39.0, -84.0)
    batHole.lineTo(11.0, -84.0)
    batHole.lineTo(11.0, -32.5)
    batHole.lineTo(-39.0, -32.5)
    batHole.closePath()
    backPlateShape.holes.push(batHole)

    // Circular CR2032 backup cell service opening (3D center X=-24, Z=+13.5 -> shape Y=-13.5)
    const crHole = new THREE.Path()
    crHole.absarc(-24.0, -13.5, 12.2, 0, Math.PI * 2, true)
    backPlateShape.holes.push(crHole)

    const backPlate = new THREE.ExtrudeGeometry(backPlateShape, {
      depth: 1.8,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.35,
      bevelSegments: 2,
      curveSegments: 16,
    })
    backPlate.rotateX(-Math.PI / 2)

    return {
      frontRimGeo: frontRim,
      frontPlateGeo: frontPlate,
      backRimGeo: backRim,
      backPlateGeo: backPlate,
    }
  }, [])

  // Raised 3D sculpted keycap layout on front face (subtle 1.2mm height)
  const keycaps = useMemo(() => {
    const caps: { x: number; z: number; w: number; l: number; color: string }[] = []
    // F1-F6 top row
    for (let c = 0; c < 6; c++) {
      caps.push({ x: 33.4 - c * 13.35, z: -18.2, w: 8.2, l: 3.8, color: '#8a92a3' })
    }
    // Numeric block 4 rows x 5 cols
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const isBlue = (r === 0 && c >= 3) || (r === 3 && c === 4)
        const isWhite = c < 3
        caps.push({
          x: 32.0 - c * 16.0,
          z: 32.2 + r * 13.1,
          w: 11.4,
          l: 7.4,
          color: isBlue ? '#1c64b0' : isWhite ? '#e2e7ef' : '#4a505e',
        })
      }
    }
    return caps
  }, [])

  useFrame((state) => {
    const L = layersRef.current

    if (frontGroupRef.current) {
      frontGroupRef.current.position.y = L.frontShellY
    }

    // 4x AAA batteries: combine explode offset + Step 1 eject slide-out
    if (batteriesGroupRef.current) {
      batteriesGroupRef.current.position.y = L.batteriesY + L.batteriesEject * 26
      batteriesGroupRef.current.position.z = L.batteriesEject * 12
    }

    // Back shell: opens up, shifts gracefully aside, and fades cleanly away during Steps 2-6
    if (backGroupRef.current) {
      const openLift = L.backShellOpen * 64
      const openSlideX = -L.backShellOpen * 135
      backGroupRef.current.position.set(openSlideX, L.backShellY + openLift, 0)
      backGroupRef.current.rotation.z = L.backShellOpen * 0.28
      backGroupRef.current.visible = L.backShellOpen < 0.96
    }

    // Battery cover slides open cleanly in Step 1
    if (batteryDoorRef.current) {
      batteryDoorRef.current.position.z = L.batteryDoorOffset * 48
      batteryDoorRef.current.position.y = L.batteryDoorOffset * 14
    }

    // 6 Phillips screws spin counterclockwise & lift cleanly out
    screwsRefs.current.forEach((grp, idx) => {
      if (!grp) return
      const base = SCREW_POSITIONS[idx]
      const openSlideX = -L.backShellOpen * 135
      grp.visible = L.backShellOpen < 0.94
      grp.position.set(
        base[0] + openSlideX * Math.max(0, L.backShellOpen - 0.3) * 1.45,
        base[1] + L.screwsY + L.screwsOut * 30 + L.backShellOpen * 48,
        base[2],
      )
      grp.rotation.y = L.screwsOut * Math.PI * 10
    })

    // Smooth X-Ray transparency on Back Shell & Front Shell (Step 8 reveals PCB behind front!)
    const xray = L.xray
    const openFade = Math.max(0, 1 - L.backShellOpen * 1.15)
    const backOpacity = THREE.MathUtils.lerp(1.0, 0.16, xray) * openFade
    const isBackTransparent = backOpacity < 0.98

    for (const mat of [backMatRef.current, backPlateMatRef.current, doorMatRef.current]) {
      if (mat) {
        mat.opacity = Math.max(0.02, backOpacity)
        mat.transparent = isBackTransparent
        mat.depthWrite = !isBackTransparent
      }
    }
    if (backDecalMatRef.current) {
      backDecalMatRef.current.opacity = Math.max(0.0, backOpacity * 0.95)
      backDecalMatRef.current.transparent = true
      backDecalMatRef.current.depthWrite = false
    }

    // When flipped face-up in Step 8 (or high X-ray), subtly let front shell go X-ray too
    const frontXrayAmount = L.rootFlip > 0.25 ? xray * 0.78 : xray * 0.35
    const frontOpacity = THREE.MathUtils.lerp(1.0, 0.22, frontXrayAmount)
    const isFrontTrans = frontOpacity < 0.98
    for (const mat of [frontMatRef.current, frontRimMatRef.current]) {
      if (mat) {
        mat.opacity = frontOpacity
        mat.transparent = isFrontTrans
        mat.depthWrite = !isFrontTrans
      }
    }
    if (frontPlateMatRef.current) {
      frontPlateMatRef.current.opacity = frontOpacity
      frontPlateMatRef.current.transparent = isFrontTrans
      frontPlateMatRef.current.depthWrite = !isFrontTrans
    }

    const hideFrontBlockers = L.rootFlip > 0.35 && xray > 0.28
    if (keycapsGroupRef.current) keycapsGroupRef.current.visible = !hideFrontBlockers
    if (membraneGroupRef.current) membraneGroupRef.current.visible = !hideFrontBlockers

    // Update live 128x64 monochrome Casio LCD texture
    const lp = livePhaseRef.current
    lcdController.update(lp.phase, lp.progress, L.powerOn, state.clock.elapsedTime)
  })

  const nicheHighlight =
    selectedId === 'niche' || hoveredId === 'niche' || currentStep === 6
  const batteryHighlight =
    selectedId === 'battery_pack' || hoveredId === 'battery_pack' || currentStep === 1

  return (
    <group>
      {/* ================================================================ */}
      {/* 1. FRONT SHELL (Vorderschale, face-down on Y=0, looking inside)  */}
      {/* ================================================================ */}
      <group ref={frontGroupRef}>
        {/* Outer Floor Plate (y = 0 .. 1.8) */}
        <mesh
          geometry={frontPlateGeo}
          position={[0, 0.55, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_housing')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover('casio_housing')
          }}
          onPointerOut={() => onHover(null)}
        >
          <meshPhysicalMaterial
            ref={frontMatRef}
            color="#2b2f38"
            roughness={0.42}
            metalness={0.14}
            clearcoat={0.2}
          />
        </mesh>

        {/* Hollow Side Walls (y = 1.8 .. 10.6) */}
        <mesh geometry={frontRimGeo} position={[0, 1.9, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            ref={frontRimMatRef}
            color="#262a32"
            roughness={0.46}
            metalness={0.12}
          />
        </mesh>

        {/* Authentic Casio fx-9860GII Front Faceplate Graphic (normal facing -Y) */}
        <mesh
          position={[0, -0.02, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_housing')
          }}
        >
          <planeGeometry args={[CASIO.WIDTH - 4, CASIO.LENGTH - 4]} />
          <meshStandardMaterial
            ref={frontPlateMatRef}
            map={frontTexture}
            roughness={0.38}
            metalness={0.12}
          />
        </mesh>

        {/* Tactile 3D Raised Keycaps on Front Face (visible when flipped or orbiting underneath) */}
        <group ref={keycapsGroupRef} position={[0, -0.45, 0]}>
          {keycaps.map((k, idx) => (
            <mesh key={idx} position={[k.x, 0, k.z]}>
              <boxGeometry args={[k.w, 0.9, k.l]} />
              <meshStandardMaterial color={k.color} roughness={0.36} metalness={0.08} />
            </mesh>
          ))}
          {/* Sculpted Metallic REPLAY D-Pad */}
          <mesh position={[-26.6, -0.15, -4.6]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[9.2, 9.8, 1.0, 32]} />
            <meshStandardMaterial color="#9ea6b5" roughness={0.28} metalness={0.62} />
          </mesh>
        </group>

        {/* 128 x 64 MONOCHROME STN LCD MODULE (active pixel screen facing -Y!) */}
        <group
          position={[0, 0, -54.5]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_lcd')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover('casio_lcd')
          }}
          onPointerOut={() => onHover(null)}
        >
          {/* Front Glass Window & Active 128x64 Pixel Matrix */}
          <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
            <planeGeometry args={[62, 31]} />
            <meshStandardMaterial
              map={lcdController.texture}
              roughness={0.22}
              metalness={0.05}
              emissive="#7f9678"
              emissiveIntensity={currentStep === 8 ? 0.24 : 0.08}
            />
          </mesh>
          {/* Protective Glossy LCD Cover Lens */}
          <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
            <planeGeometry args={[67, 36]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.12}
              roughness={0.08}
              metalness={0.05}
              clearcoat={1}
            />
          </mesh>
          {/* Interior LCD Metal EMI Shield Frame visible from opened rear */}
          <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[68, 2.8, 42]} />
            <meshStandardMaterial color="#adb5c2" roughness={0.34} metalness={0.78} />
          </mesh>
          {/* Rear LCD Polarizer Backing Plate */}
          <mesh position={[0, 5.05, 0]}>
            <boxGeometry args={[62, 0.3, 36]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.1} />
          </mesh>
        </group>

        {/* Interior Silicone Keypad Rubber Membrane Backside + Carbon Contact Pills */}
        <group ref={membraneGroupRef} position={[0, 2.5, 28]}>
          <mesh receiveShadow>
            <boxGeometry args={[76, 1.1, 106]} />
            <meshStandardMaterial color="#3c424d" roughness={0.78} metalness={0.02} />
          </mesh>
          {/* Carbon rubber pill grid */}
          {Array.from({ length: 25 }).map((_, i) => {
            const col = i % 5
            const row = Math.floor(i / 5)
            return (
              <mesh key={i} position={[-28 + col * 14, 0.65, -36 + row * 18]}>
                <cylinderGeometry args={[2.1, 2.1, 0.35, 12]} />
                <meshStandardMaterial color="#181a1f" roughness={0.5} />
              </mesh>
            )
          })}
        </group>

        {/* 6 Molded Internal Screw Bosses (Schraubdome) */}
        {SCREW_POSITIONS.map(([sx, , sz], idx) => (
          <group key={idx} position={[sx, 5.8, sz]}>
            <mesh castShadow>
              <cylinderGeometry args={[2.6, 3.1, 7.6, 16]} />
              <meshStandardMaterial color="#2d313b" roughness={0.5} />
            </mesh>
            <mesh position={[0, 3.85, 0]}>
              <cylinderGeometry args={[1.15, 1.15, 0.2, 12]} />
              <meshStandardMaterial color="#0f1115" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* ============================================================== */}
        {/* BATTERY COMPARTMENT FRAME (Lower Left/Center, 4x AAA in series) */}
        {/* ============================================================== */}
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
          {/* Battery Bay Floor Cradle */}
          <mesh position={[-14.25, 3.4, 58.25]} receiveShadow>
            <boxGeometry args={[51, 1.2, 51]} />
            <meshStandardMaterial color="#1e222a" roughness={0.62} />
          </mesh>
          {/* Top & Bottom Battery Walls */}
          <mesh position={[-14.25, 8.8, 33.0]} castShadow receiveShadow>
            <boxGeometry args={[51, 10.2, 1.6]} />
            <meshStandardMaterial color="#272b34" roughness={0.52} />
          </mesh>
          <mesh position={[-14.25, 8.8, 83.4]} castShadow receiveShadow>
            <boxGeometry args={[51, 10.2, 1.6]} />
            <meshStandardMaterial color="#272b34" roughness={0.52} />
          </mesh>
          {/* Right Wall separating Battery Bay from ESP32 Einbaunische */}
          <mesh position={[11.4, 8.6, 58.25]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 10.0, 51.4]} />
            <meshStandardMaterial color="#272b34" roughness={0.52} />
          </mesh>
          {/* 3 Internal Cell Divider Ribs */}
          {[-26.25, -14.25, -2.25].map((rx, idx) => (
            <mesh key={idx} position={[rx, 6.8, 58.25]}>
              <boxGeometry args={[0.9, 6.2, 48.5]} />
              <meshStandardMaterial color="#2a2f3a" roughness={0.58} />
            </mesh>
          ))}

          {/* Nickel-Plated Conical Springs & Contact Plates for all 4 AAA slots */}
          {AAA_BAYS.map((bay, idx) => {
            const topIsMinus = bay.polarityTop === '-'
            return (
              <group key={idx}>
                {/* Top Contact (Z = 34.0) */}
                {topIsMinus ? (
                  <mesh
                    geometry={springGeo}
                    position={[bay.x, BATTERY_BAY.Y_CENTER, 34.0]}
                    castShadow
                  >
                    <meshStandardMaterial color="#d4dae3" roughness={0.22} metalness={0.92} />
                  </mesh>
                ) : (
                  <mesh position={[bay.x, BATTERY_BAY.Y_CENTER, 34.2]}>
                    <boxGeometry args={[7.2, 7.2, 0.6]} />
                    <meshStandardMaterial color="#d4dae3" roughness={0.25} metalness={0.9} />
                  </mesh>
                )}

                {/* Bottom Contact (Z = 82.4) */}
                {!topIsMinus ? (
                  <mesh
                    geometry={springGeo}
                    position={[bay.x, BATTERY_BAY.Y_CENTER, 82.4]}
                    rotation={[0, Math.PI, 0]}
                    castShadow
                  >
                    <meshStandardMaterial color="#d4dae3" roughness={0.22} metalness={0.92} />
                  </mesh>
                ) : (
                  <mesh position={[bay.x, BATTERY_BAY.Y_CENTER, 82.2]}>
                    <boxGeometry args={[7.2, 7.2, 0.6]} />
                    <meshStandardMaterial color="#d4dae3" roughness={0.25} metalness={0.9} />
                  </mesh>
                )}
              </group>
            )
          })}

          {/* Accessible Main Solder Tabs: -V_BAT (GND) & +V_BAT (4.8-6.0V) */}
          <mesh position={BATTERY_BAY.NEG_TAB}>
            <boxGeometry args={[4.4, 2.2, 2.2]} />
            <meshStandardMaterial color="#d4dae3" roughness={0.2} metalness={0.92} />
          </mesh>
          <mesh position={BATTERY_BAY.POS_TAB}>
            <boxGeometry args={[4.4, 2.2, 2.2]} />
            <meshStandardMaterial color="#d4dae3" roughness={0.2} metalness={0.92} />
          </mesh>

          {showLabels && currentStep <= 6 && (
            <>
              <Html zIndexRange={[10, 0]} position={[BATTERY_BAY.NEG_TAB[0], 13.5, BATTERY_BAY.NEG_TAB[2] - 2]} center>
                <button
                  type="button"
                  onClick={() => onSelect('battery_pack')}
                  className="pin-3d-tag bg-slate-900/90 text-slate-100 border border-slate-400/50"
                >
                  −V_BAT (GND)
                </button>
              </Html>
              <Html zIndexRange={[10, 0]} position={[BATTERY_BAY.POS_TAB[0], 13.5, BATTERY_BAY.POS_TAB[2] - 2]} center>
                <button
                  type="button"
                  onClick={() => onSelect('battery_pack')}
                  className="pin-3d-tag bg-red-600/90 text-white border border-red-300/60"
                >
                  +V_BAT (4,8–6,0 V)
                </button>
              </Html>
            </>
          )}
        </group>

        {/* ============================================================== */}
        {/* INSTALLATION NICHE (Einbaunische right next to battery bay)    */}
        {/* ============================================================== */}
        <group
          position={[NICHE_BOUNDS.CENTER[0], 4.2, NICHE_BOUNDS.CENTER[2]]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('niche')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover('niche')
          }}
          onPointerOut={() => onHover(null)}
        >
          {/* Niche Floor Pad */}
          <mesh receiveShadow>
            <boxGeometry args={[28, 0.8, 36]} />
            <meshStandardMaterial
              color={nicheHighlight ? '#1e3a5f' : '#21252e'}
              roughness={0.6}
            />
          </mesh>
          {/* Subtle glowing niche outline in Step 6 or when inspected */}
          {nicheHighlight && (
            <mesh position={[0, 3.6, 0]}>
              <boxGeometry args={[28, 7.2, 22]} />
              <meshStandardMaterial
                color="#38bdf8"
                transparent
                opacity={0.14}
                wireframe
              />
            </mesh>
          )}
          {showLabels && (currentStep === 6 || selectedId === 'niche') && (
            <Html zIndexRange={[10, 0]} position={[0, 8.5, 13.5]} center>
              <button
                type="button"
                onClick={() => onSelect('niche')}
                className="pin-3d-tag bg-sky-600/90 text-white border border-sky-300/60"
              >
                Einbaunische (28 × 22 × 7 mm)
              </button>
            </Html>
          )}
        </group>
      </group>

      {/* ================================================================ */}
      {/* 2. 4× ANIMATED AAA NiMH BATTERIES (Ø 10.5 × 44.5 mm)             */}
      {/* ================================================================ */}
      <group
        ref={batteriesGroupRef}
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
        {AAA_BAYS.map((bay, idx) => {
          // Rotate cell so '+' button points toward '+' terminal end
          const rotX = bay.polarityTop === '+' ? -Math.PI / 2 : Math.PI / 2
          return (
            <group
              key={idx}
              position={[bay.x, BATTERY_BAY.Y_CENTER, bay.z]}
              rotation={[rotX, 0, 0]}
            >
              {/* Main cylindrical NiMH body */}
              <mesh castShadow receiveShadow>
                <cylinderGeometry
                  args={[BATTERY_BAY.CELL_RADIUS, BATTERY_BAY.CELL_RADIUS, 42.6, 28]}
                />
                <meshStandardMaterial
                  map={batteryTexture}
                  roughness={0.32}
                  metalness={0.28}
                  emissive={batteryHighlight ? '#10b981' : '#000000'}
                  emissiveIntensity={batteryHighlight ? 0.14 : 0}
                />
              </mesh>
              {/* Positive Metallic Nub (+ top) */}
              <mesh position={[0, 22.0, 0]} castShadow>
                <cylinderGeometry args={[2.1, 2.1, 1.5, 18]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.18} metalness={0.94} />
              </mesh>
              {/* Negative Flat Metal End (- bottom) */}
              <mesh position={[0, -21.45, 0]}>
                <cylinderGeometry args={[4.6, 4.6, 0.35, 22]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.24} metalness={0.9} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* ================================================================ */}
      {/* 3. BACK SHELL (Rückschale) + BATTERY DOOR (X-Ray Capable!)       */}
      {/* ================================================================ */}
      <group ref={backGroupRef}>
        {/* Back Outer Rim (y = 10.8 .. 19.4) */}
        <mesh
          geometry={backRimGeo}
          position={[0, CASIO.SPLIT_Y + 0.15, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_back_shell')
          }}
        >
          <meshPhysicalMaterial
            ref={backMatRef}
            color="#262a33"
            roughness={0.38}
            metalness={0.14}
            clearcoat={0.22}
          />
        </mesh>

        {/* Back Top Plate (y = 19.2 .. 21.0) */}
        <mesh
          geometry={backPlateGeo}
          position={[0, 19.1, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_back_shell')
          }}
        >
          <meshPhysicalMaterial
            ref={backPlateMatRef}
            color="#272b34"
            roughness={0.42}
            metalness={0.14}
            clearcoat={0.18}
          />
        </mesh>

        {/* Molded Rear Shell Engraving Decal (normalized 0..1 UVs) */}
        <mesh position={[0, 21.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CASIO.WIDTH - 6, CASIO.LENGTH - 6]} />
          <meshStandardMaterial
            ref={backDecalMatRef}
            map={backTexture}
            roughness={0.5}
            metalness={0.08}
            transparent
          />
        </mesh>

        {/* Removable Battery Compartment Door */}
        <group ref={batteryDoorRef} position={[-14.2, 21.1, 58.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[52, 1.1, 52]} />
            <meshPhysicalMaterial
              ref={doorMatRef}
              color="#2d323d"
              roughness={0.42}
              metalness={0.14}
            />
          </mesh>
          {/* Thumb grip ridges */}
          {[-4, 0, 4].map((rz, idx) => (
            <mesh key={idx} position={[0, 0.65, -18 + rz]}>
              <boxGeometry args={[18, 0.35, 1.1]} />
              <meshStandardMaterial color="#1f232b" roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ================================================================ */}
      {/* 4. 6× ANIMATED PHILLIPS HOUSING SCREWS (PH0)                     */}
      {/* ================================================================ */}
      {SCREW_POSITIONS.map((pos, idx) => (
        <group
          key={idx}
          ref={(el) => {
            screwsRefs.current[idx] = el
          }}
          position={pos}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_back_shell')
          }}
        >
          {/* Countersunk Screw Head */}
          <mesh castShadow>
            <cylinderGeometry args={[2.1, 1.8, 1.0, 18]} />
            <meshStandardMaterial color="#c9d1dc" roughness={0.24} metalness={0.92} />
          </mesh>
          {/* Phillips Cross Recess */}
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[2.3, 0.14, 0.45]} />
            <meshStandardMaterial color="#1e222a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[0.45, 0.14, 2.3]} />
            <meshStandardMaterial color="#1e222a" roughness={0.7} />
          </mesh>
          {/* Threaded Shank */}
          <mesh position={[0, -3.4, 0]}>
            <cylinderGeometry args={[0.92, 0.85, 6.2, 12]} />
            <meshStandardMaterial color="#aeb7c4" roughness={0.32} metalness={0.86} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
