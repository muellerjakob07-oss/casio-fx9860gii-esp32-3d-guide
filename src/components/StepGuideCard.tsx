import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  Lightbulb,
  Wrench,
} from 'lucide-react'
import { COMPONENTS_DB } from '../data/componentsData'
import type { StepDefinition } from '../types'

interface StepGuideCardProps {
  step: StepDefinition
  totalSteps: number
  collapsed: boolean
  onToggleCollapse: () => void
  onSelectComponent: (id: string) => void
}

export function StepGuideCard({
  step,
  totalSteps,
  collapsed,
  onToggleCollapse,
  onSelectComponent,
}: StepGuideCardProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        id="btn-expand-guide"
        onClick={onToggleCollapse}
        className="glass-panel pointer-events-auto fixed left-4 top-20 z-20 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-glass-strong)] sm:left-6"
      >
        <Wrench className="h-3.5 w-3.5 text-[var(--accent)]" />
        <span>
          Schritt {step.id}: {step.shortTitle}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
      </button>
    )
  }

  return (
    <aside className="glass-panel studio-scroll pointer-events-auto fixed left-4 top-20 z-20 flex max-h-[calc(100vh-11.5rem)] w-[calc(100vw-2rem)] max-w-[368px] flex-col overflow-y-auto rounded-3xl p-5 sm:left-6">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[var(--text-muted)]">
          <span className="font-mono-tech rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 font-semibold text-[var(--accent)]">
            Schritt {step.id} / {totalSteps}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {step.durationMin}
          </span>
          <span>·</span>
          <span>{step.difficulty}</span>
        </div>

        <button
          type="button"
          id="btn-collapse-guide"
          onClick={onToggleCollapse}
          title="Anleitung einklappen für freie 3D-Sicht"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Title & Summary */}
      <h2 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em] text-[var(--text-primary)]">
        {step.title}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
        {step.summary}
      </p>

      {/* Numbered Beginner Instructions */}
      <ol className="mt-4 space-y-2.5">
        {step.instructions.map((text, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[var(--text-primary)]">
            <span className="font-mono-tech mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[10px] font-semibold text-[var(--text-secondary)]">
              {idx + 1}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>

      {/* Safety Warning Callout */}
      {step.warning && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-500/10 px-3.5 py-3 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <div className="font-semibold text-amber-600 dark:text-amber-400">
              {step.warning.title}
            </div>
            <p className="mt-0.5 leading-relaxed text-[var(--text-secondary)]">
              {step.warning.text}
            </p>
          </div>
        </div>
      )}

      {/* Multimeter Check */}
      <div className="mt-4 rounded-2xl bg-[var(--surface-subtle)] px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Gauge className="h-3.5 w-3.5 text-emerald-500" />
          <span>Multimeter-Check</span>
        </div>
        <div className="mt-1.5 space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-muted)]">Modus:</span>
            <span className="font-medium text-[var(--text-primary)]">{step.multimeterCheck.mode}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-muted)]">Messpunkte:</span>
            <span className="text-right text-[var(--text-secondary)]">{step.multimeterCheck.points}</span>
          </div>
          <div className="mt-1 rounded-xl bg-emerald-500/10 px-2.5 py-1.5 font-mono-tech text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Sollwert: {step.multimeterCheck.expected}
          </div>
        </div>
      </div>

      {/* Beginner Tip */}
      <div className="mt-3.5 flex items-start gap-2 text-xs leading-relaxed text-[var(--text-secondary)]">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
        <p>
          <strong className="font-semibold text-[var(--text-primary)]">Anfänger-Tipp: </strong>
          {step.beginnerTip}
        </p>
      </div>

      {/* Clickable Parts in this Step */}
      {step.highlightIds.length > 0 && (
        <div className="mt-4 border-t border-[var(--border-hairline)] pt-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Bauteile in diesem Schritt inspizieren
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {step.highlightIds.map((id) => {
              const spec = COMPONENTS_DB[id]
              if (!spec) return null
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectComponent(id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: spec.badgeColor }}
                  />
                  {spec.shortName}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
