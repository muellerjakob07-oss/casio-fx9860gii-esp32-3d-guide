import { Check, RotateCcw, ShieldAlert, X } from 'lucide-react'
import { CHECKLIST_ITEMS } from '../data/checklistData'

interface ChecklistPanelProps {
  open: boolean
  checkedIds: string[]
  onToggleItem: (id: string) => void
  onReset: () => void
  onJumpToStep: (stepId: number) => void
  onClose: () => void
}

export function ChecklistPanel({
  open,
  checkedIds,
  onToggleItem,
  onReset,
  onJumpToStep,
  onClose,
}: ChecklistPanelProps) {
  if (!open) return null

  const progress = Math.round((checkedIds.length / CHECKLIST_ITEMS.length) * 100)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel-strong flex h-full max-h-[760px] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-hairline)] p-5">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              Anfänger-Checkliste & Sicherheitsprüfung
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Hake jeden Punkt ab, bevor du die Akkus wieder einlegst.
            </p>
          </div>
          <button
            type="button"
            id="btn-close-checklist"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="border-b border-[var(--border-hairline)] px-5 py-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--text-secondary)]">Fortschritt</span>
            <span className="font-mono-tech font-semibold text-[var(--text-primary)]">
              {checkedIds.length} / {CHECKLIST_ITEMS.length} ({progress} %)
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="studio-scroll flex-1 space-y-2 overflow-y-auto p-4">
          {CHECKLIST_ITEMS.map((item) => {
            const checked = checkedIds.includes(item.id)
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-2xl p-3 transition ${
                  checked
                    ? 'bg-emerald-500/10'
                    : 'bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleItem(item.id)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    checked
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-[var(--border-strong)] bg-transparent'
                  }`}
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.id)}
                      className={`text-left text-xs font-semibold leading-snug ${
                        checked
                          ? 'text-[var(--text-muted)] line-through'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {item.title}
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    {item.detail}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToStep(item.step)
                        onClose()
                      }}
                      className="font-mono-tech rounded-md bg-[var(--surface-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)] hover:underline"
                    >
                      Zu Schritt {item.step} →
                    </button>
                    {item.critical && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                        <ShieldAlert className="h-3 w-3" />
                        Wichtige Sicherheit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-hairline)] px-5 py-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Zurücksetzen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  )
}
