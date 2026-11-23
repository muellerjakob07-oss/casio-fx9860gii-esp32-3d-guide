import {
  Camera,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Magnet,
  SlidersHorizontal,
} from 'lucide-react'
import { CAMERA_PRESETS } from '../data/stepsData'
import type { CameraPresetId } from '../types'

interface ControlsHudProps {
  explode: number
  onChangeExplode: (v: number) => void
  xray: number
  onChangeXray: (v: number) => void
  powerOn: boolean
  onTogglePower: () => void
  activePreset: CameraPresetId | null
  onSelectPreset: (preset: CameraPresetId) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const PRESET_ORDER: CameraPresetId[] = [
  'overview',
  'macro_solder',
  'pcb_top',
  'xray_side',
]

export function ControlsHud({
  explode,
  onChangeExplode,
  xray,
  onChangeXray,
  powerOn,
  onTogglePower,
  activePreset,
  onSelectPreset,
  collapsed,
  onToggleCollapse,
}: ControlsHudProps) {
  return (
    <aside className="glass-panel pointer-events-auto w-[286px] shrink-0 rounded-3xl p-4">
      {/* Header */}
      <button
        type="button"
        id="btn-toggle-hud"
        onClick={onToggleCollapse}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
          3D-Steuerung & Simulation
        </span>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
        )}
      </button>

      {!collapsed && (
        <div className="mt-4 space-y-4">
          {/* 1. Exploded View Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label
                htmlFor="slider-explode"
                className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]"
              >
                <Layers className="h-3.5 w-3.5" />
                Explosionsansicht
              </label>
              <span className="font-mono-tech text-[11px] font-semibold text-[var(--text-primary)]">
                {explode} %
              </span>
            </div>
            <input
              id="slider-explode"
              type="range"
              min={0}
              max={100}
              value={explode}
              onChange={(e) => onChangeExplode(Number(e.target.value))}
              className="studio-slider"
            />
          </div>

          {/* 2. Housing X-Ray Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label
                htmlFor="slider-xray"
                className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]"
              >
                <Eye className="h-3.5 w-3.5" />
                Gehäuse-Röntgenblick
              </label>
              <span className="font-mono-tech text-[11px] font-semibold text-[var(--text-primary)]">
                {xray} %
              </span>
            </div>
            <input
              id="slider-xray"
              type="range"
              min={0}
              max={100}
              value={xray}
              onChange={(e) => onChangeXray(Number(e.target.value))}
              className="studio-slider"
            />
          </div>

          {/* 3. Live Magnet / SW1 Power Switch */}
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Magnet
                  className={`h-4 w-4 transition-colors ${
                    powerOn ? 'text-sky-400' : 'text-[var(--text-muted)]'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    Magnet / SW1
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {powerOn ? 'Reedschalter geschlossen' : 'Standby (MOSFET sperrt)'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="toggle-magnet-sw1"
                role="switch"
                aria-checked={powerOn}
                onClick={onTogglePower}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                  powerOn ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    powerOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Real-Time Electrical Measurement Readout */}
            <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[var(--border-hairline)] pt-2.5 text-[11px]">
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">ESP32 5V-Pin</div>
                <div className="font-mono-tech font-semibold text-[var(--text-primary)]">
                  {powerOn ? '4,50 V' : '0,00 V'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">Stromaufnahme</div>
                <div
                  className={`font-mono-tech font-semibold ${
                    powerOn ? 'text-sky-400' : 'text-emerald-500'
                  }`}
                >
                  {powerOn ? '~85 mA' : '0,00 mA'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Camera Presets */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
              <Camera className="h-3.5 w-3.5" />
              <span>Kamera-Perspektiven</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_ORDER.map((presetId) => {
                const preset = CAMERA_PRESETS[presetId]
                const isActive = activePreset === presetId
                return (
                  <button
                    key={presetId}
                    type="button"
                    id={`preset-${presetId}`}
                    onClick={() => onSelectPreset(presetId)}
                    className={`rounded-xl px-2.5 py-2 text-left text-[11px] font-medium transition ${
                      isActive
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
