import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ChecklistPanel } from './components/ChecklistPanel'
import { ControlsHud } from './components/ControlsHud'
import { InspectorModal } from './components/InspectorModal'
import { LivePhaseBanner } from './components/LivePhaseBanner'
import { StepGuideCard } from './components/StepGuideCard'
import { StepStepper } from './components/StepStepper'
import { TopBar } from './components/TopBar'
import { CHECKLIST_ITEMS } from './data/checklistData'
import { COMPONENTS_DB } from './data/componentsData'
import { CAMERA_PRESETS, STEPS } from './data/stepsData'
import { Scene3D } from './three/Scene3D'
import type { CameraPresetId, CameraTarget, ComponentSpec, LivePhase, ThemeMode } from './types'

const CHECKLIST_STORAGE_KEY = 'casio_esp32_checklist_v1'

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D Studio Render Error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full items-center justify-center p-8 text-center">
          <div className="glass-panel max-w-md rounded-3xl p-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              3D-Ansicht konnte nicht gestartet werden
            </h2>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Bitte prüfe, ob WebGL in deinem Browser aktiviert ist. Fehler:{' '}
              <span className="font-mono-tech">{this.state.error.message}</span>
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function getInitialParams() {
  if (typeof window === 'undefined') {
    return { step: 1, explode: 0, theme: 'dark' as ThemeMode, inspect: null as string | null }
  }
  const params = new URLSearchParams(window.location.search)
  const rawStep = Number(params.get('step'))
  const step = Number.isInteger(rawStep) && rawStep >= 1 && rawStep <= STEPS.length ? rawStep : 1
  const rawExplode = Number(params.get('explode'))
  const explode = Number.isFinite(rawExplode) ? Math.max(0, Math.min(100, rawExplode)) : 0
  const theme: ThemeMode = params.get('theme') === 'light' ? 'light' : 'dark'
  const inspect = params.get('inspect')
  return { step, explode, theme, inspect }
}

export default function App() {
  const initial = useMemo(() => getInitialParams(), [])
  const initialStepDef = STEPS[initial.step - 1] ?? STEPS[0]

  const [theme, setTheme] = useState<ThemeMode>(initial.theme)
  const [currentStep, setCurrentStep] = useState<number>(initial.step)
  const [explode, setExplode] = useState<number>(initial.explode)
  const [xray, setXray] = useState<number>(initialStepDef.defaultXray)
  const [powerOn, setPowerOn] = useState<boolean>(initialStepDef.defaultPowerOn)
  const [showLabels, setShowLabels] = useState<boolean>(true)

  const [selectedId, setSelectedId] = useState<string | null>(initial.inspect)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<CameraPresetId | null>(
    initial.step === 1 ? 'overview' : null,
  )
  const [cameraGoal, setCameraGoal] = useState<CameraTarget>(initialStepDef.camera)
  const [flightNonce, setFlightNonce] = useState<number>(0)

  const [guideCollapsed, setGuideCollapsed] = useState<boolean>(false)
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(Boolean(initial.inspect))
  const [checklistOpen, setChecklistOpen] = useState<boolean>(false)
  const [livePhase, setLivePhase] = useState<LivePhase>(initial.step === 8 ? 'lcd' : 'idle')
  const [liveCycleNonce, setLiveCycleNonce] = useState<number>(0)

  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as string[]) : []
    } catch {
      return []
    }
  })

  // Apply studio dark/light class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Persist beginner checklist
  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIds))
    } catch {
      // ignore storage errors
    }
  }, [checkedIds])

  const stepDef = useMemo(
    () => STEPS.find((s) => s.id === currentStep) ?? STEPS[0],
    [currentStep],
  )

  const selectedSpec = selectedId ? COMPONENTS_DB[selectedId] ?? null : null
  const hoveredSpec = hoveredId ? COMPONENTS_DB[hoveredId] ?? null : null

  const handleSelectStep = useCallback((stepId: number) => {
    const target = STEPS.find((s) => s.id === stepId)
    if (!target) return
    setCurrentStep(stepId)
    setActivePreset(null)
    setXray(target.defaultXray)
    setPowerOn(target.defaultPowerOn)
    setCameraGoal(target.camera)
    setFlightNonce((n) => n + 1)
  }, [])

  const handleSelectPreset = useCallback((presetId: CameraPresetId) => {
    setActivePreset(presetId)
    setCameraGoal(CAMERA_PRESETS[presetId].camera)
    setFlightNonce((n) => n + 1)
    if (presetId === 'xray_side' && xray < 45) {
      setXray(60)
    }
  }, [xray])

  const handleFocusComponent = useCallback((spec: ComponentSpec) => {
    setActivePreset(null)
    setCameraGoal(spec.focusCamera)
    setFlightNonce((n) => n + 1)
  }, [])

  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedId(id)
    if (id) {
      setHudCollapsed(true)
    }
  }, [])

  const handleToggleChecklistItem = useCallback((id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  // Keyboard navigation (Left/Right for steps, Esc to close modals)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' && currentStep < STEPS.length) {
        handleSelectStep(currentStep + 1)
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        handleSelectStep(currentStep - 1)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
        setChecklistOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentStep, handleSelectStep])

  // Cursor pointer feedback when hovering interactive 3D parts
  useEffect(() => {
    document.body.style.cursor = hoveredId ? 'pointer' : 'default'
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [hoveredId])

  return (
    <div className="studio-backdrop relative h-full w-full overflow-hidden select-none">
      {/* Full-Bleed Interactive 3D Viewport */}
      <main className="h-full w-full">
        <WebGLErrorBoundary>
          <Scene3D
            theme={theme}
            currentStep={currentStep}
            explode={explode}
            xray={xray}
            powerOn={powerOn}
            showLabels={showLabels}
            selectedId={selectedId}
            hoveredId={hoveredId}
            cameraGoal={cameraGoal}
            flightNonce={flightNonce}
            liveCycleNonce={liveCycleNonce}
            onSelect={handleSelectComponent}
            onHover={setHoveredId}
            onLivePhaseChange={setLivePhase}
          />
        </WebGLErrorBoundary>
      </main>

      {/* Top Studio Header Bar */}
      <TopBar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        powerOn={powerOn}
        onTogglePower={() => setPowerOn((v) => !v)}
        checklistDone={checkedIds.length}
        checklistTotal={CHECKLIST_ITEMS.length}
        onOpenChecklist={() => setChecklistOpen(true)}
      />

      {/* Step 8 Live Gemini Pipeline Indicator */}
      <LivePhaseBanner
        visible={currentStep === 8}
        phase={livePhase}
        powerOn={powerOn}
        onReplay={() => setLiveCycleNonce((n) => n + 1)}
        onTurnPowerOn={() => setPowerOn(true)}
      />

      {/* Left Guided Beginner Story Card */}
      <StepGuideCard
        step={stepDef}
        totalSteps={STEPS.length}
        collapsed={guideCollapsed}
        onToggleCollapse={() => setGuideCollapsed((v) => !v)}
        onSelectComponent={(id) => {
          handleSelectComponent(id)
          const spec = COMPONENTS_DB[id]
          if (spec) handleFocusComponent(spec)
        }}
      />

      {/* Right Rail: Unified non-overlapping Controls HUD + Component Inspector */}
      <div className="pointer-events-none fixed right-4 top-20 bottom-20 z-20 flex flex-col items-end gap-3 sm:right-6">
        <ControlsHud
          explode={explode}
          onChangeExplode={setExplode}
          xray={xray}
          onChangeXray={setXray}
          powerOn={powerOn}
          onTogglePower={() => setPowerOn((v) => !v)}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
          collapsed={hudCollapsed}
          onToggleCollapse={() => setHudCollapsed((v) => !v)}
        />

        <InspectorModal
          spec={selectedSpec}
          onClose={() => {
            setSelectedId(null)
            setHudCollapsed(false)
          }}
          onFocusCamera={handleFocusComponent}
        />
      </div>

      {/* Subtle Floating Hover Pill (ESP-Labs Pin & Part Preview) */}
      {hoveredSpec && hoveredSpec.id !== selectedId && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-30 -translate-x-1/2">
          <div className="glass-panel-strong flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: hoveredSpec.badgeColor }}
            />
            <span className="font-semibold text-[var(--text-primary)]">{hoveredSpec.name}</span>
            <span className="text-[var(--text-muted)]">· Klicken für Details</span>
          </div>
        </div>
      )}

      {/* Bottom Apple Product Stepper (8 Steps) */}
      <StepStepper
        steps={STEPS}
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
      />

      {/* Beginner Safety & Soldering Checklist Slide-Over */}
      <ChecklistPanel
        open={checklistOpen}
        checkedIds={checkedIds}
        onToggleItem={handleToggleChecklistItem}
        onReset={() => setCheckedIds([])}
        onJumpToStep={handleSelectStep}
        onClose={() => setChecklistOpen(false)}
      />
    </div>
  )
}
