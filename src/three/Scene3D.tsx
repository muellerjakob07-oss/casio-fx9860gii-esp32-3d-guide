import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { CameraTarget, LayerOffsets, LivePhase, ThemeMode } from '../types'
import { CameraRig } from './CameraRig'
import { CasioHousing } from './CasioHousing'
import { CasioMainboard } from './CasioMainboard'
import { ESP32SuperMini } from './ESP32SuperMini'
import { ModElectronics } from './ModElectronics'
import { StepProps } from './StepProps'
import { StudioLighting } from './StudioLighting'
import { WiringHarness } from './WiringHarness'

interface Scene3DProps {
  theme: ThemeMode
  currentStep: number
  explode: number // 0..100
  xray: number // 0..100
  powerOn: boolean
  showLabels: boolean
  selectedId: string | null
  hoveredId: string | null
  cameraGoal: CameraTarget
  flightNonce: number
  liveCycleNonce: number
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
  onLivePhaseChange: (phase: LivePhase) => void
}

function CalculatorAssembly({
  currentStep,
  explode,
  xray,
  powerOn,
  showLabels,
  selectedId,
  hoveredId,
  liveCycleNonce,
  onSelect,
  onHover,
  onLivePhaseChange,
}: Omit<Scene3DProps, 'theme' | 'cameraGoal' | 'flightNonce'>) {
  const rootRef = useRef<THREE.Group>(null)
  const stepEnterTimeRef = useRef(0)
  const liveCycleStartRef = useRef(0)
  const lastPhaseRef = useRef<LivePhase>('idle')

  const exp0 = explode / 100
  const open0 = currentStep >= 2 && currentStep <= 6 ? 1 : 0
  const lift0 = currentStep >= 3 && currentStep <= 5 ? 7.5 : 0
  const layersRef = useRef<LayerOffsets>({
    frontShellY: -exp0 * 24,
    pcbY: 0,
    batteriesY: exp0 * 20,
    r2r3Y: exp0 * 16,
    modY: lift0 + exp0 * 28,
    sw1Y: exp0 * 24,
    backShellY: exp0 * 52,
    screwsY: exp0 * 72,
    batteryDoorOffset: currentStep === 1 ? 1 : 0,
    batteriesEject: currentStep >= 1 && currentStep <= 6 ? 1 : 0,
    backShellOpen: open0,
    screwsOut: open0,
    kaptonWrap: currentStep >= 6 ? 1 : 0,
    magnetNear: powerOn ? 1 : 0,
    rootFlip: currentStep === 8 ? 1 : 0,
    xray: xray / 100,
    solderGlow: 1,
    powerOn,
  })

  const livePhaseRef = useRef<{ phase: LivePhase; progress: number }>({
    phase: currentStep === 8 ? 'lcd' : 'idle',
    progress: currentStep === 8 ? 0.55 : 0,
  })

  // Trigger a fresh solder-glow impulse on step change
  useEffect(() => {
    stepEnterTimeRef.current = -1
    if (currentStep === 8) {
      liveCycleStartRef.current = -1
    } else if (lastPhaseRef.current !== 'idle') {
      lastPhaseRef.current = 'idle'
      livePhaseRef.current = { phase: 'idle', progress: 0 }
      onLivePhaseChange('idle')
    }
  }, [currentStep, onLivePhaseChange])

  useEffect(() => {
    liveCycleStartRef.current = -1
  }, [liveCycleNonce])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    if (stepEnterTimeRef.current < 0) stepEnterTimeRef.current = t
    if (liveCycleStartRef.current < 0) liveCycleStartRef.current = t

    const L = layersRef.current
    const exp = explode / 100
    const xrayTarget = xray / 100

    // Determine step-driven mechanical animation targets
    const targetBatteryDoor = currentStep === 1 ? 1 : 0
    const targetBatteriesEject = currentStep >= 1 && currentStep <= 6 ? 1 : 0
    const targetBackOpen = currentStep >= 2 && currentStep <= 6 ? 1 : 0
    const targetScrewsOut = currentStep >= 2 && currentStep <= 6 ? 1 : 0
    // In soldering steps 3..5, lift mod assembly gently above cavity for crystal-clear macro soldering,
    // then in Step 6+ smoothly glide down into the Einbaunische!
    const targetInstallLift = currentStep >= 3 && currentStep <= 5 ? 7.5 : 0
    const targetKapton = currentStep >= 6 ? 1 : 0
    const targetMagnet = powerOn ? 1 : 0
    // In Step 8 (Live-Betrieb), smoothly turn face-up onto a sleek studio showcase angle!
    const targetFlip = currentStep === 8 ? 1 : 0

    // Silky exponential damping across all mechanical layers
    const smooth = 5.2
    L.frontShellY = THREE.MathUtils.damp(L.frontShellY, -exp * 24, smooth, dt)
    L.pcbY = THREE.MathUtils.damp(L.pcbY, 0, smooth, dt)
    L.batteriesY = THREE.MathUtils.damp(L.batteriesY, exp * 20, smooth, dt)
    L.r2r3Y = THREE.MathUtils.damp(L.r2r3Y, exp * 16, smooth, dt)
    L.modY = THREE.MathUtils.damp(L.modY, targetInstallLift + exp * 28, smooth, dt)
    L.sw1Y = THREE.MathUtils.damp(L.sw1Y, exp * 24, smooth, dt)
    L.backShellY = THREE.MathUtils.damp(L.backShellY, exp * 52, smooth, dt)
    L.screwsY = THREE.MathUtils.damp(L.screwsY, exp * 72, smooth, dt)

    L.batteryDoorOffset = THREE.MathUtils.damp(L.batteryDoorOffset, targetBatteryDoor, 4.6, dt)
    L.batteriesEject = THREE.MathUtils.damp(L.batteriesEject, targetBatteriesEject, 4.2, dt)
    L.backShellOpen = THREE.MathUtils.damp(L.backShellOpen, targetBackOpen, 3.8, dt)
    L.screwsOut = THREE.MathUtils.damp(L.screwsOut, targetScrewsOut, 4.8, dt)
    L.kaptonWrap = THREE.MathUtils.damp(L.kaptonWrap, targetKapton, 4.0, dt)
    L.magnetNear = THREE.MathUtils.damp(L.magnetNear, targetMagnet, 5.6, dt)
    L.rootFlip = THREE.MathUtils.damp(L.rootFlip, targetFlip, 3.6, dt)
    L.xray = THREE.MathUtils.damp(L.xray, xrayTarget, 7.0, dt)
    L.powerOn = powerOn

    const sinceEnter = t - stepEnterTimeRef.current
    L.solderGlow = sinceEnter < 3.5 ? Math.max(0, 1 - sinceEnter / 3.5) : 0.35

    // Apply smooth Apple-keynote hero flip in Step 8 (reveals 128x64 LCD face-up with X-ray!)
    if (rootRef.current) {
      rootRef.current.rotation.z = L.rootFlip * Math.PI
      // Slight elegant elevation while rotating so corners never dip below tabletop shadow
      const arcLift = Math.sin(L.rootFlip * Math.PI) * 32 + L.rootFlip * 24
      rootRef.current.position.y = arcLift
    }

    // Step 8 Live-Betrieb 14-second Cycle: TX (3s) -> Wi-Fi HTTPS (3s) -> RX (2.5s) -> LCD Scroll (5.5s)
    if (currentStep === 8 && powerOn) {
      const cycleDuration = 14.0
      const elapsed = (t - liveCycleStartRef.current) % cycleDuration
      let phase: LivePhase = 'tx'
      let progress = 0

      if (elapsed < 3.0) {
        phase = 'tx'
        progress = elapsed / 3.0
      } else if (elapsed < 6.0) {
        phase = 'wifi'
        progress = (elapsed - 3.0) / 3.0
      } else if (elapsed < 8.5) {
        phase = 'rx'
        progress = (elapsed - 6.0) / 2.5
      } else {
        phase = 'lcd'
        progress = (elapsed - 8.5) / 5.5
      }

      livePhaseRef.current.phase = phase
      livePhaseRef.current.progress = progress

      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase
        onLivePhaseChange(phase)
      }
    } else if (currentStep === 8 && !powerOn) {
      livePhaseRef.current.phase = 'idle'
      livePhaseRef.current.progress = 0
      if (lastPhaseRef.current !== 'idle') {
        lastPhaseRef.current = 'idle'
        onLivePhaseChange('idle')
      }
    }
  })

  return (
    <group ref={rootRef}>
      <CasioHousing
        layersRef={layersRef}
        livePhaseRef={livePhaseRef}
        selectedId={selectedId}
        hoveredId={hoveredId}
        showLabels={showLabels}
        currentStep={currentStep}
        onSelect={onSelect}
        onHover={onHover}
      />

      <CasioMainboard
        layersRef={layersRef}
        selectedId={selectedId}
        hoveredId={hoveredId}
        showLabels={showLabels}
        currentStep={currentStep}
        onSelect={onSelect}
        onHover={onHover}
      />

      <ESP32SuperMini
        layersRef={layersRef}
        selectedId={selectedId}
        hoveredId={hoveredId}
        showLabels={showLabels}
        currentStep={currentStep}
        onSelect={onSelect}
        onHover={onHover}
      />

      <ModElectronics
        layersRef={layersRef}
        selectedId={selectedId}
        hoveredId={hoveredId}
        showLabels={showLabels}
        currentStep={currentStep}
        onSelect={onSelect}
        onHover={onHover}
      />

      <WiringHarness
        layersRef={layersRef}
        livePhaseRef={livePhaseRef}
        selectedId={selectedId}
        hoveredId={hoveredId}
        currentStep={currentStep}
        onSelect={onSelect}
        onHover={onHover}
      />

      <StepProps
        layersRef={layersRef}
        livePhaseRef={livePhaseRef}
        currentStep={currentStep}
        powerOn={powerOn}
        showLabels={showLabels}
      />
    </group>
  )
}

export function Scene3D(props: Scene3DProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: props.cameraGoal.position,
        fov: props.cameraGoal.fov ?? 35,
        near: 1,
        far: 1600,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      onPointerMissed={() => props.onSelect(null)}
      className="h-full w-full"
    >
      <StudioLighting theme={props.theme} />
      <CameraRig cameraGoal={props.cameraGoal} flightNonce={props.flightNonce} />
      <CalculatorAssembly
        currentStep={props.currentStep}
        explode={props.explode}
        xray={props.xray}
        powerOn={props.powerOn}
        showLabels={props.showLabels}
        selectedId={props.selectedId}
        hoveredId={props.hoveredId}
        liveCycleNonce={props.liveCycleNonce}
        onSelect={props.onSelect}
        onHover={props.onHover}
        onLivePhaseChange={props.onLivePhaseChange}
      />
    </Canvas>
  )
}
