import {
  Crosshair,
  Flame,
  Gauge,
  Ruler,
  X,
} from 'lucide-react'
import type { ComponentSpec } from '../types'

interface InspectorModalProps {
  spec: ComponentSpec | null
  onClose: () => void
  onFocusCamera: (spec: ComponentSpec) => void
}

export function InspectorModal({
  spec,
  onClose,
  onFocusCamera,
}: InspectorModalProps) {
  if (!spec) return null

  return (
    <section
      aria-label="Bauteil-Inspektor"
      className="glass-panel-strong studio-scroll pointer-events-auto min-h-0 w-[calc(100vw-2rem)] max-w-[360px] flex-1 overflow-y-auto rounded-3xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--text-muted)]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: spec.badgeColor }}
            />
            <span>{spec.category}</span>
          </div>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[var(--text-primary)]">
            {spec.name}
          </h3>
        </div>

        <button
          type="button"
          id="btn-close-inspector"
          onClick={onClose}
          aria-label="Inspektor schließen"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Dimensions & Zoom Action */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-mono-tech inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
          <Ruler className="h-3 w-3 text-[var(--text-muted)]" />
          {spec.dimensions}
        </span>

        <button
          type="button"
          id="btn-zoom-component"
          onClick={() => onFocusCamera(spec)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Heranzoomen
        </button>
      </div>

      {/* Summary & Purpose */}
      <p className="mt-3.5 text-xs leading-relaxed text-[var(--text-primary)]">
        {spec.summary}
      </p>
      <div className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
        <strong className="font-semibold text-[var(--text-primary)]">Zweck im Umbau: </strong>
        {spec.purpose}
      </div>

      {/* Optional Pinout Table */}
      {spec.pinout && spec.pinout.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Exakte Pin-Belegung
          </div>
          <div className="divide-y divide-[var(--border-hairline)] overflow-hidden rounded-2xl bg-[var(--surface-subtle)]">
            {spec.pinout.map((p, idx) => (
              <div key={idx} className="px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-mono-tech font-semibold text-[var(--text-primary)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.pin}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">{p.signal}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{p.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multimeter Value */}
      <div className="mt-4 rounded-2xl bg-[var(--surface-subtle)] px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
          <Gauge className="h-3.5 w-3.5" />
          <span>Multimeter-Prüfwert</span>
        </div>
        <div className="font-mono-tech mt-1 text-[11.5px] leading-relaxed text-[var(--text-primary)]">
          {spec.multimeterValue}
        </div>
      </div>

      {/* Beginner Soldering Tip */}
      <div className="mt-3 rounded-2xl bg-amber-500/10 px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Flame className="h-3.5 w-3.5" />
          <span>Anfänger-Löttipp</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          {spec.solderTip}
        </p>
      </div>
    </section>
  )
}
