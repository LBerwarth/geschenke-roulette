import { useEffect, useMemo } from 'react'
import { CHAOS, CHAOS_HINWEIS } from '../content/chaos'
import { mulberry32, shuffle, subSeed } from '../game/rng'
import { Button } from '../ui/Button'
import type { DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'
import { beep, formatClock, useStopwatch } from '../ui/useStopwatch'

const EVERY_MS = 20_000

export function Chaos({ game, dispatch }: DuellProps) {
  const events = useMemo(() => shuffle(mulberry32(subSeed(game.seed, 9000)), CHAOS), [game.seed])
  const watch = useStopwatch()
  const totalMs = game.settings.finaleMin * 60_000
  const remaining = totalMs - watch.elapsedMs
  const done = remaining <= 0
  const started = watch.running || watch.elapsedMs > 0
  const index = Math.floor(Math.min(watch.elapsedMs, totalMs - 1) / EVERY_MS)
  const { running, stop } = watch

  useEffect(() => {
    if (done && running) stop()
  }, [done, running, stop])
  useEffect(() => {
    if (started) beep()
  }, [index, started, done])

  const toEnd = () => dispatch({ type: 'chaosDone' })
  const act = done ? toEnd : running ? watch.stop : watch.start
  useHotkeys({ ' ': act, z: started ? undefined : () => dispatch({ type: 'undo' }) })
  const past = [1, 2, 3].map((back) => index - back).filter((i) => i >= 0)

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-deep px-14 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
          Halbzeit · Chaos-Runde · alle gleichzeitig
        </span>
        <div className="flex gap-3">
          {!started && (
            <Button onClick={() => dispatch({ type: 'undo' })} className="min-h-12 rounded-full px-5 text-base">
              Letztes Duell rückgängig
            </Button>
          )}
          <Button variant={done || !started ? 'gold' : 'outline'} onClick={act} className="min-h-12 rounded-full px-5 text-base">
            {done ? 'Weiter mit den Duellen' : running ? 'Pause' : started ? 'Weiter' : 'Chaos-Runde starten'}
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-[120px] leading-none font-extrabold text-gold tabular-nums">
          {formatClock(Math.ceil(Math.max(0, remaining) / 1000) * 1000)}
        </span>
        <div className="h-2.5 w-full max-w-160 overflow-hidden rounded-full bg-surface">
          <div className="h-full bg-gold" style={{ width: `${Math.min(100, (watch.elapsedMs / totalMs) * 100)}%` }} />
        </div>
        <span className="mt-1.5 text-base text-muted">
          {done
            ? 'Zeit um! Alle behalten, was sie gerade halten. Weiter geht es mit den Duellen.'
            : `Nächstes Ereignis in ${formatClock(Math.ceil((EVERY_MS - (watch.elapsedMs % EVERY_MS)) / 1000) * 1000)}`}
        </span>
      </div>
      <div className="flex grow items-center gap-10 rounded-[28px] bg-cream px-12 py-10 text-ink">
        <div className="flex size-35 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h14" />
            <path d="M13 7l5 5-5 5" />
            <path d="M4 6h6M4 18h6" />
          </svg>
        </div>
        <div className="flex flex-col gap-3" aria-live="polite">
          <span className="text-lg font-semibold tracking-[0.12em] text-eyebrow uppercase">
            {started ? `Ereignis ${index + 1}` : 'Gleich geht es los'}
          </span>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-extrabold">
            {started ? events[index % events.length] : 'Alle halten ihr Geschenk fest!'}
          </h2>
          <p className="text-2xl text-ink-soft">
            {started ? CHAOS_HINWEIS : 'Alle 20 Sekunden kommt ein neues Ereignis für die ganze Runde.'}
          </p>
        </div>
      </div>
      <div className="flex min-h-9 flex-wrap items-center gap-2.5">
        {past.length > 0 && <span className="text-[15px] font-semibold text-muted">Vorher:</span>}
        {past.map((i) => (
          <span key={i} className="flex min-h-9 items-center rounded-full bg-surface px-3.5 text-[15px]">
            {events[i % events.length]}
          </span>
        ))}
      </div>
    </main>
  )
}
