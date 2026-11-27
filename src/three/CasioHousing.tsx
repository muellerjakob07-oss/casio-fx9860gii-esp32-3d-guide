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
import { createRoundedRectShape } from './tubeUtils'

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
  const backRibsMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const doorMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const frontPlateMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const frontTexture = useMemo(() => createCasioFrontTexture(), [])
  const backTexture = useMemo(() => createCasioBackTexture(), [])
  const batteryTexture = useMemo(() => createBatteryTexture(), [])
  const lcdController = useMemo(() => createLiveLcdController(), [])

  // Hollow shell geometries (Pearl-silver front shell + Matte-black rear shell with horizontal AAA bay)
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
      bevelSegments: 2,
      curveSegments: 16,
    })
    frontRim.rotateX(-Math.PI / 2)

    const frontPlate = new THREE.ExtrudeGeometry(outer, {
      depth: 1.8,
      bevelEnabled: true,
      bevelThickness: 0.55,
      bevelSize: 0.45,
      bevelSegments: 2,
      curveSegments: 16,
    })
    frontPlate.rotateX(-Math.PI / 2)

    const backRim = new THREE.ExtrudeGeometry(rimShape, {
      depth: CASIO.HEIGHT - CASIO.SPLIT_Y - 1.8,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.35,
      bevelSegments: 2,
      curveSegments: 16,
    })
    backRim.rotateX(-Math.PI / 2)

    // Back plate with authentic horizontal 4xAAA battery bay opening
    // Note: rotateX(-PI/2) maps shape (x, y) -> 3D (x, -y), so 3D Z:+25.5..+72.5 => shape Y:-72.5..-25.5
    const backPlateShape = outer.clone()
    const batHole = new THREE.Path()
    batHole.moveTo(-20.5, -72.5)
    batHole.lineTo(32.5, -72.5)
    batHole.lineTo(32.5, -25.5)
    batHole.lineTo(-20.5, -25.5)
    batHole.closePath()
    backPlateShape.holes.push(batHole)

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

  // Raised 3D sculpted keycaps on front face (matches two-tone image_6.png!)
  const keycaps = useMemo(() => {
    const caps: { x: number; z: number; w: number; l: number; color: string }[] = []
    // F1-F6 silver pill keys
    for (let c = 0; c < 6; c++) {
      caps.push({ x: 31.8 - c * 12.7, z: -18.5, w: 7.6, l: 4.2, color: '#d8dde6' })
    }
    // Lower numeric block (4 rows x 5 cols: white digits + slate-blue DEL/AC/EXE)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const isAction = (r === 0 && c >= 3) || (r === 3 && c === 4)
        caps.push({
          x: 30.8 - c * 15.4,
          z: 33.0 + r * 13.2,
          w: 11.2,
          l: 7.2,
          color: isAction ? '#9eb2c7' : '#f4f6f9',
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

    // 4x Horizontal AAA batteries: combine explode offset + Step 1..6 lift-out
    if (batteriesGroupRef.current) {
      batteriesGroupRef.current.position.y = L.batteriesY + L.batteriesEject * 30
      batteriesGroupRef.current.position.z = L.batteriesEject * 10
    }

    // Matte-black Back Shell: opens up, shifts aside, and fades cleanly during Steps 2-6
    if (backGroupRef.current) {
      const openLift = L.backShellOpen * 64
      const openSlideX = L.backShellOpen * 135
      backGroupRef.current.position.set(openSlideX, L.backShellY + openLift, 0)
      backGroupRef.current.rotation.z = -L.backShellOpen * 0.26
      backGroupRef.current.visible = L.backShellOpen < 0.96
    }

    // Sliding black battery cover slides downward (+Z) in Step 1
    if (batteryDoorRef.current) {
      batteryDoorRef.current.position.z = 49.0 + L.batteryDoorOffset * 48
      batteryDoorRef.current.position.y = 21.1 + L.batteryDoorOffset * 12
    }

    // 6 Black Phillips screws spin out cleanly
    screwsRefs.current.forEach((grp, idx) => {
      if (!grp) return
      const base = SCREW_POSITIONS[idx]
      const openSlideX = L.backShellOpen * 135
      grp.visible = L.backShellOpen < 0.94
      grp.position.set(
        base[0] + openSlideX * Math.max(0, L.backShellOpen - 0.3) * 1.45,
        base[1] + L.screwsY + L.screwsOut * 30 + L.backShellOpen * 48,
        base[2],
      )
      grp.rotation.y = L.screwsOut * Math.PI * 10
    })

    // Smooth X-Ray transparency on Matte-Black Back Shell & Pearl-Silver Front Shell
    const xray = L.xray
    const openFade = Math.max(0, 1 - L.backShellOpen * 1.15)
    const backOpacity = THREE.MathUtils.lerp(1.0, 0.16, xray) * openFade
    const isBackTransparent = backOpacity < 0.98

    for (const mat of [
      backMatRef.current,
      backPlateMatRef.current,
      doorMatRef.current,
      backRibsMatRef.current,
    ]) {
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

    const frontXrayAmount = L.rootFlip > 0.25 ? xray * 0.78 : xray * 0.32
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

    // Live 128x64 monochrome Casio LCD pixel matrix update
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
      {/* 1. PEARL-SILVER FRONT SHELL (Vorderschale, matches image_6.png!) */}
      {/* ================================================================ */}
      <group ref={frontGroupRef}>
        {/* Pearl-Silver Outer Floor Plate */}
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
            color="#dcdfe6"
            roughness={0.38}
            metalness={0.08}
            clearcoat={0.22}
          />
        </mesh>

        {/* Pearl-Silver Hollow Side Walls */}
        <mesh geometry={frontRimGeo} position={[0, 1.9, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            ref={frontRimMatRef}
            color="#cfd4dd"
            roughness={0.42}
            metalness={0.08}
          />
        </mesh>

        {/* Authentic Two-Tone Casio fx-9860GII Front Faceplate Graphic (facing -Y) */}
        <mesh
          position={[0, -0.03, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_housing')
          }}
        >
          <planeGeometry args={[CASIO.WIDTH - 3.5, CASIO.LENGTH - 3.5]} />
          <meshStandardMaterial
            ref={frontPlateMatRef}
            map={frontTexture}
            roughness={0.36}
            metalness={0.08}
          />
        </mesh>

        {/* Tactile 3D Raised Keycaps on Front Face */}
        <group ref={keycapsGroupRef} position={[0, -0.45, 0]}>
          {keycaps.map((k, idx) => (
            <mesh key={idx} position={[k.x, 0, k.z]}>
              <boxGeometry args={[k.w, 0.9, k.l]} />
              <meshStandardMaterial color={k.color} roughness={0.34} metalness={0.05} />
            </mesh>
          ))}
          {/* Pearl-Silver REPLAY D-Pad */}
          <mesh position={[-25.4, -0.15, -4.8]}>
            <cylinderGeometry args={[8.8, 9.4, 1.0, 32]} />
            <meshStandardMaterial color="#d4dae4" roughness={0.28} metalness={0.25} />
          </mesh>
        </group>

        {/* 128 x 64 MONOCHROME STN LCD MODULE + STAMPED STEEL CARRIER SHIELD */}
        <group
          position={[0, 0, -54.0]}
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
          {/* Active 128x64 Pixel Matrix on Front Face */}
          <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
            <planeGeometry args={[60, 30]} />
            <meshStandardMaterial
              map={lcdController.texture}
              roughness={0.22}
              metalness={0.05}
              emissive="#7f9678"
              emissiveIntensity={currentStep === 8 ? 0.24 : 0.08}
            />
          </mesh>
          {/* Protective Glossy LCD Lens */}
          <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
            <planeGeometry args={[65, 35]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.12}
              roughness={0.08}
              clearcoat={1}
            />
          </mesh>

          {/* REAL STAMPED STEEL LCD CARRIER SHIELD (supports elevated CY802-1 CPU PCB!) */}
          <mesh position={[-1.5, 7.6, 1.5]} castShadow receiveShadow>
            <boxGeometry args={[71.0, 5.6, 53.0]} />
            <meshStandardMaterial color="#c4ccd8" roughness={0.28} metalness={0.86} />
          </mesh>
          {/* Characteristic Left & Right Stamped Metal Mounting Tabs (seen in image_5.png!) */}
          <group position={[-37.5, 8.8, 20.5]}>
            <mesh castShadow>
              <boxGeometry args={[5.5, 1.2, 12.0]} />
              <meshStandardMaterial color="#cfd6e2" roughness={0.25} metalness={0.88} />
            </mesh>
            <mesh position={[0.2, 0.2, 2.5]}>
              <cylinderGeometry args={[1.4, 1.4, 1.5, 14]} />
              <meshStandardMaterial color="#181b22" roughness={0.8} />
            </mesh>
          </group>
          <group position={[34.5, 8.8, 17.5]}>
            <mesh castShadow>
              <boxGeometry args={[5.0, 1.2, 12.0]} />
              <meshStandardMaterial color="#cfd6e2" roughness={0.25} metalness={0.88} />
            </mesh>
            <mesh position={[-0.2, 0.2, 2.2]}>
              <cylinderGeometry args={[1.4, 1.4, 1.5, 14]} />
              <meshStandardMaterial color="#181b22" roughness={0.8} />
            </mesh>
          </group>
          {/* Black Foam Cushion Strips along left & right edges of LCD Shield (image_5.png!) */}
          <mesh position={[-37.8, 9.2, -5.0]}>
            <boxGeometry args={[3.4, 2.0, 36.0]} />
            <meshStandardMaterial color="#17191e" roughness={0.92} />
          </mesh>
          <mesh position={[34.8, 9.2, -4.0]}>
            <boxGeometry args={[3.4, 2.0, 38.0]} />
            <meshStandardMaterial color="#17191e" roughness={0.92} />
          </mesh>
        </group>

        {/* Silicone Keypad Membrane underneath Lower Keypad PCB GY493-E4W */}
        <group ref={membraneGroupRef} position={[0, 3.2, 30.0]}>
          <mesh receiveShadow>
            <boxGeometry args={[72.0, 1.2, 108.0]} />
            <meshStandardMaterial color="#363b45" roughness={0.82} />
          </mesh>
        </group>

        {/* 6 Internal Screw Bosses */}
        {SCREW_POSITIONS.map(([sx, , sz], idx) => (
          <group key={idx} position={[sx, 5.8, sz]}>
            <mesh castShadow>
              <cylinderGeometry args={[2.5, 2.9, 7.8, 16]} />
              <meshStandardMaterial color="#b9c0cc" roughness={0.48} />
            </mesh>
            <mesh position={[0, 3.95, 0]}>
              <cylinderGeometry args={[1.1, 1.1, 0.2, 12]} />
              <meshStandardMaterial color="#111318" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* ============================================================== */}
        {/* STEP-TRENCH INSTALLATION ZONE (Stufen-Nische Z = +4 .. +24 mm) */}
        {/* ============================================================== */}
        <group
          position={[NICHE_BOUNDS.CENTER[0], 6.4, NICHE_BOUNDS.CENTER[2]]}
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
          {nicheHighlight && (
            <mesh position={[0, 3.4, 0]}>
              <boxGeometry args={[NICHE_BOUNDS.SIZE[0], NICHE_BOUNDS.SIZE[1], NICHE_BOUNDS.SIZE[2]]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.16} wireframe />
            </mesh>
          )}
          {showLabels && (currentStep === 6 || selectedId === 'niche') && (
            <Html zIndexRange={[10, 0]} position={[-12, 8.2, 0]} center>
              <button
                type="button"
                onClick={() => onSelect('niche')}
                className="pin-3d-tag bg-sky-600/92 text-white border border-sky-300/60"
              >
                Stufen-Nische (Freiraum zwischen CPU-Board & Batteriefach)
              </button>
            </Html>
          )}
        </group>
      </group>

      {/* ================================================================ */}
      {/* 2. 4× HORIZONTAL AAA NiMH BATTERIES (lying along X-axis!)        */}
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
          // Cylinder default axis is +Y; rotZ = -PI/2 points +Y (+ button) to +X (Right)
          const rotZ = bay.polarityRight === '+' ? -Math.PI / 2 : Math.PI / 2
          return (
            <group
              key={idx}
              position={[bay.x, BATTERY_BAY.Y_CENTER, bay.z]}
              rotation={[0, 0, rotZ]}
            >
              <mesh castShadow receiveShadow>
                <cylinderGeometry
                  args={[BATTERY_BAY.CELL_RADIUS, BATTERY_BAY.CELL_RADIUS, 42.6, 26]}
                />
                <meshStandardMaterial
                  map={batteryTexture}
                  roughness={0.32}
                  metalness={0.28}
                  emissive={batteryHighlight ? '#10b981' : '#000000'}
                  emissiveIntensity={batteryHighlight ? 0.16 : 0}
                />
              </mesh>
              {/* Positive Button Nub (+ end) */}
              <mesh position={[0, 22.0, 0]} castShadow>
                <cylinderGeometry args={[2.0, 2.0, 1.5, 18]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.18} metalness={0.94} />
              </mesh>
              {/* Negative Flat Cap (- end) */}
              <mesh position={[0, -21.45, 0]}>
                <cylinderGeometry args={[4.4, 4.4, 0.35, 20]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.24} metalness={0.9} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* ================================================================ */}
      {/* 3. MATTE-BLACK REAR SHELL + BATTERY TROUGH & RIBS (image_3.png!) */}
      {/* ================================================================ */}
      <group ref={backGroupRef}>
        {/* Matte-Black Outer Rim */}
        <mesh
          geometry={backRimGeo}
          position={[0, CASIO.SPLIT_Y + 0.1, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            onSelect('casio_back_shell')
          }}
        >
          <meshPhysicalMaterial
            ref={backMatRef}
            color="#181b21"
            roughness={0.46}
            metalness={0.1}
            clearcoat={0.12}
          />
        </mesh>

        {/* Matte-Black Top Plate */}
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
            color="#191c22"
            roughness={0.45}
            metalness={0.1}
          />
        </mesh>

        {/* Molded Rear Shell Engraving Decal */}
        <mesh position={[0, 21.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CASIO.WIDTH - 6, CASIO.LENGTH - 6]} />
          <meshStandardMaterial
            ref={backDecalMatRef}
            map={backTexture}
            roughness={0.52}
            metalness={0.06}
            transparent
          />
        </mesh>

        {/* Molded Internal Battery Bay Walls & Criss-Cross Stiffening Ribs (seen in image_3.png!) */}
        <group>
          {/* Battery Trough Perimeter Walls hanging down from rear shell */}
          <mesh position={[6.0, 14.2, 25.2]}>
            <boxGeometry args={[53.5, 9.6, 1.5]} />
            <meshStandardMaterial ref={backRibsMatRef} color="#16191f" roughness={0.55} />
          </mesh>
          <mesh position={[6.0, 14.2, 72.8]}>
            <boxGeometry args={[53.5, 9.6, 1.5]} />
            <meshStandardMaterial color="#16191f" roughness={0.55} transparent opacity={0.85} />
          </mesh>
          <mesh position={[-20.5, 14.2, 49.0]}>
            <boxGeometry args={[1.5, 9.6, 48.5]} />
            <meshStandardMaterial color="#16191f" roughness={0.55} transparent opacity={0.85} />
          </mesh>
          {/* Series Bridge Metal Contacts on left wall of battery bay */}
          {[37.6, 60.0].map((bz, i) => (
            <mesh key={i} position={[-19.2, 11.8, bz]}>
              <boxGeometry args={[0.8, 6.2, 9.5]} />
              <meshStandardMaterial color="#d4dce6" roughness={0.22} metalness={0.92} />
            </mesh>
          ))}
          {/* Series Bridge Metal Contact on right wall between Row 2 (+) & Row 3 (-) */}
          <mesh position={[28.4, 11.8, 48.8]}>
            <boxGeometry args={[0.8, 6.2, 9.5]} />
            <meshStandardMaterial color="#d4dce6" roughness={0.22} metalness={0.92} />
          </mesh>
        </group>

        {/* Sliding Matte-Black Battery Compartment Door */}
        <group ref={batteryDoorRef} position={[6.0, 21.1, 49.0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[54.2, 1.2, 48.4]} />
            <meshPhysicalMaterial
              ref={doorMatRef}
              color="#1c2028"
              roughness={0.44}
              metalness={0.1}
            />
          </mesh>
          {[-3.5, 0, 3.5].map((rz, idx) => (
            <mesh key={idx} position={[0, 0.7, 14 + rz]}>
              <boxGeometry args={[18, 0.35, 1.0]} />
              <meshStandardMaterial color="#111318" roughness={0.65} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ================================================================ */}
      {/* 4. 6× BLACK ANODIZED PHILLIPS HOUSING SCREWS (PH0)               */}
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
          <mesh castShadow>
            <cylinderGeometry args={[2.0, 1.7, 1.0, 18]} />
            <meshStandardMaterial color="#252932" roughness={0.32} metalness={0.78} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[2.2, 0.14, 0.42]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[0.42, 0.14, 2.2]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.8} />
          </mesh>
          <mesh position={[0, -3.2, 0]}>
            <cylinderGeometry args={[0.9, 0.82, 5.8, 12]} />
            <meshStandardMaterial color="#2d323d" roughness={0.35} metalness={0.82} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
