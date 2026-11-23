import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StepDefinition } from '../types'

interface StepStepperProps {
  steps: StepDefinition[]
  currentStep: number
  onSelectStep: (stepId: number) => void
}

export function StepStepper({
  steps,
  currentStep,
  onSelectStep,
}: StepStepperProps) {
  const canPrev = currentStep > 1
  const canNext = currentStep < steps.length

  return (
    <nav
      aria-label="8 Bauschritte"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-4 sm:px-6"
    >
      <div className="glass-panel-strong pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-2">
        {/* Previous Step */}
        <button
          type="button"
          id="btn-step-prev"
          disabled={!canPrev}
          onClick={() => canPrev && onSelectStep(currentStep - 1)}
          aria-label="Vorheriger Schritt"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Step Pills */}
        <div className="studio-scroll flex items-center gap-1 overflow-x-auto px-1">
          {steps.map((s) => {
            const active = s.id === currentStep
            const done = s.id < currentStep
            return (
              <button
                key={s.id}
                type="button"
                id={`step-btn-${s.id}`}
                onClick={() => onSelectStep(s.id)}
                className={`group flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : done
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span
                  className={`font-mono-tech flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    active
                      ? 'bg-white/20 text-white'
                      : done
                        ? 'bg-emerald-500/18 text-emerald-500'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {s.id}
                </span>
                <span className={active ? 'inline' : 'hidden lg:inline'}>
                  {s.shortTitle}
                </span>
              </button>
            )
          })}
        </div>

        {/* Next Step */}
        <button
          type="button"
          id="btn-step-next"
          disabled={!canNext}
          onClick={() => canNext && onSelectStep(currentStep + 1)}
          aria-label="Nächster Schritt"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
