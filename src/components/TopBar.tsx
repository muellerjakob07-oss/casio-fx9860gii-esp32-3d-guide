import {
  CheckSquare,
  Cpu,
  Magnet,
  Moon,
  Sun,
  Tag,
} from 'lucide-react'
import type { ThemeMode } from '../types'

interface TopBarProps {
  theme: ThemeMode
  onToggleTheme: () => void
  showLabels: boolean
  onToggleLabels: () => void
  powerOn: boolean
  onTogglePower: () => void
  checklistDone: number
  checklistTotal: number
  onOpenChecklist: () => void
}

export function TopBar({
  theme,
  onToggleTheme,
  showLabels,
  onToggleLabels,
  powerOn,
  onTogglePower,
  checklistDone,
  checklistTotal,
  onOpenChecklist,
}: TopBarProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
      {/* Product Identity */}
      <div className="glass-panel pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Cpu className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-[15px]">
            CASIO fx-9860GII × ESP32-C3 SuperMini
          </h1>
          <p className="truncate text-[11px] text-[var(--text-muted)]">
            Interaktive 3D-Bauanleitung · Gemini API über WLAN
          </p>
        </div>
      </div>

      {/* Center Live Electrical Telemetry Capsule (Clickable to toggle Magnet/SW1) */}
      <button
        type="button"
        id="topbar-power-telemetry"
        onClick={onTogglePower}
        title="Klicken, um den Magnet-Reedschalter SW1 umzuschalten"
        className="glass-panel pointer-events-auto hidden items-center gap-3 rounded-full px-4 py-2 text-xs transition hover:bg-[var(--surface-glass-strong)] md:flex"
      >
        <Magnet
          className={`h-3.5 w-3.5 transition-colors ${
            powerOn ? 'text-sky-400' : 'text-[var(--text-muted)]'
          }`}
        />
        <span className="font-medium text-[var(--text-secondary)]">
          SW1 {powerOn ? 'Geschlossen' : 'Offen'}
        </span>
        <span className="h-3.5 w-px bg-[var(--border-strong)]" />
        <span
          className={`font-mono-tech font-semibold ${
            powerOn ? 'text-sky-400' : 'text-emerald-500'
          }`}
        >
          {powerOn ? '4,50 V · ~85 mA' : '0,00 V · 0,00 mA'}
        </span>
      </button>

      {/* Right Utility Actions */}
      <div className="glass-panel pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5">
        <button
          type="button"
          id="btn-toggle-labels"
          onClick={onToggleLabels}
          title="3D-Pin-Labels ein- oder ausblenden"
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            showLabels
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">3D-Labels</span>
        </button>

        <button
          type="button"
          id="btn-open-checklist"
          onClick={onOpenChecklist}
          title="Anfänger-Checkliste öffnen"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Checkliste</span>
          <span className="font-mono-tech rounded-md bg-[var(--surface-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-primary)]">
            {checklistDone}/{checklistTotal}
          </span>
        </button>

        <button
          type="button"
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Zum hellen Studio-Modus wechseln' : 'Zum dunklen Studio-Modus wechseln'}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
