import { Camera, Crosshair, X } from 'lucide-react'
import { useState } from 'react'

interface PhotoReferenceModalProps {
  open: boolean
  onClose: () => void
  onJumpToStep: (stepId: number) => void
}

const REFERENCE_PHOTOS = [
  {
    id: 'topdown',
    title: '1. Gesamt-Draufsicht (CY802-1 + GY493-E4W)',
    src: './ref/pcb_topdown.jpg',
    caption:
      'Deine echte Doppel-Platine: Oben links CN401 (2,5 mm) mit quadratischen Goldpads, mittig S30FE02 (LCD-Flex), rechts CN102 (Mini-USB). Darunter MXIC „9A“ Flash, die 6-mm-Stufe mit C302 & JN701 sowie rechts unten die Batteriefedern P702 (−) / T702 und P701 (+) / T701.',
    step: 2,
    stepLabel: 'Zu Schritt 2: CN401 & Platinen-Check',
  },
  {
    id: 'side_step',
    title: '2. Seitenprofil der 6-mm-Platinenstufe',
    src: './ref/pcb_side_step.jpg',
    caption:
      'Hier sieht man perfekt, warum der ESP32-C3 in die Stufe gehört: Unterhalb des blauen Elkos C302 springt die Platine um ~6 mm zurück auf die flache Tastenplatine – genau dort liegt dein ESP32 kollisionsfrei!',
    step: 6,
    stepLabel: 'Zu Schritt 6: Einbau in die Stufen-Nische',
  },
  {
    id: 'shells',
    title: '3. Schwarze Rückschale, Innenrippen & Batteriefedern',
    src: './ref/pcb_and_shells.jpg',
    caption:
      'Im Hintergrund deine schwarze Rückschale mit Innenrippen und links die Batteriewanne. Rechts auf der grünen Platine die Kegelfeder P702 (−V_BAT) und die flache Spiralfeder P701 (+V_BAT).',
    step: 4,
    stepLabel: 'Zu Schritt 4: Stromabgriff an P701 / P702',
  },
  {
    id: 'front',
    title: '4. Perlsilberne Vorderschale & lose Zifferntasten',
    src: './ref/front_shell.jpg',
    caption:
      'Zweifarbige Frontschale (Perlsilber / Anthrazit). Gut zu erkennen: Nimmt man die Platine heraus, rutschen unten leicht die losen Zifferntasten (0, ·, EXP, EXE) weg – lass die Platine beim Löten daher einfach in der Vorderschale liegen!',
    step: 1,
    stepLabel: 'Zu Schritt 1: Vorbereitung',
  },
] as const

export function PhotoReferenceModal({
  open,
  onClose,
  onJumpToStep,
}: PhotoReferenceModalProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (!open) return null
  const active = REFERENCE_PHOTOS[activeIdx]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel-strong flex max-h-[88vh] w-full max-w-[780px] flex-col overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-hairline)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                Echte Hardware-Referenz (Deine Teardown-Fotos ↔ 3D-Modell)
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Alle Platinenmaße, Lötpads und die Stufen-Nische sind 1:1 auf diese Revision abgestimmt
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-photos"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo Selector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-[var(--border-hairline)] px-5 py-2.5">
          {REFERENCE_PHOTOS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                idx === activeIdx
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Main Image & Explanation */}
        <div className="studio-scroll flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <div className="flex max-h-[440px] w-full items-center justify-center overflow-hidden rounded-2xl bg-black/40 p-2 md:w-1/2">
              <img
                src={active.src}
                alt={active.title}
                className="max-h-[420px] w-auto rounded-xl object-contain"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {active.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {active.caption}
                </p>

                <div className="mt-4 space-y-2 rounded-2xl bg-[var(--surface-subtle)] p-3.5 text-xs">
                  <div className="font-semibold text-[var(--text-primary)]">
                    Wichtigste Anpassungen im neuen Bauplan:
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-[11.5px] text-[var(--text-secondary)]">
                    <li>
                      <strong>CN401 sitzt oben links:</strong> Kurze UART-Führung entlang der linken Kante (weg vom gelöteten weißen FFC <code className="font-mono-tech">JN701</code>!).
                    </li>
                    <li>
                      <strong>ESP32 in der 6-mm-Stufe:</strong> Liegt flach über Kapton auf <code className="font-mono-tech">T703–T719</code>, Antenne frei zur linken Außenwand.
                    </li>
                    <li>
                      <strong>Strom über T701 / T702:</strong> Sauberes Löten auf der FR4-Tastenplatine neben <code className="font-mono-tech">P701</code> (+) und <code className="font-mono-tech">P702</code> (−).
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onJumpToStep(active.step)
                  onClose()
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {active.stepLabel} im 3D-Modell öffnen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
