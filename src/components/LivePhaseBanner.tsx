import { ArrowRight, Monitor, Radio, RotateCw, Send, Wifi } from 'lucide-react'
import type { LivePhase } from '../types'

interface LivePhaseBannerProps {
  visible: boolean
  phase: LivePhase
  powerOn: boolean
  onReplay: () => void
  onTurnPowerOn: () => void
}

const PHASES: { id: LivePhase; label: string; color: string; icon: typeof Send }[] = [
  { id: 'tx', label: '1. TX → GPIO20', color: '#3b82f6', icon: Send },
  { id: 'wifi', label: '2. WLAN HTTPS', color: '#38bdf8', icon: Wifi },
  { id: 'rx', label: '3. GPIO21 → RX', color: '#22c55e', icon: Radio },
  { id: 'lcd', label: '4. 128×64 LCD', color: '#10b981', icon: Monitor },
]

export function LivePhaseBanner({
  visible,
  phase,
  powerOn,
  onReplay,
  onTurnPowerOn,
}: LivePhaseBannerProps) {
  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-30 flex justify-center px-4">
      <div className="glass-panel-strong pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs">
        {!powerOn ? (
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-secondary)]">
              SW1 ist ausgeschaltet (0,00 mA Standby).
            </span>
            <button
              type="button"
              onClick={onTurnPowerOn}
              className="rounded-xl bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Magnet anlegen (SW1 EIN)
            </button>
          </div>
        ) : (
          <>
            {PHASES.map((item, idx) => {
              const Icon = item.icon
              const isActive = phase === item.id
              return (
                <div key={item.id} className="flex items-center gap-2">
                  <span
                    style={isActive ? { backgroundColor: `${item.color}24`, color: item.color } : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-mono-tech text-[11px] font-semibold transition ${
                      isActive ? '' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                  {idx < PHASES.length - 1 && (
                    <ArrowRight className="hidden h-3 w-3 text-[var(--text-muted)] sm:inline" />
                  )}
                </div>
              )
            })}

            <button
              type="button"
              id="btn-replay-live"
              onClick={onReplay}
              title="Live-Ablauf von vorn starten"
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
