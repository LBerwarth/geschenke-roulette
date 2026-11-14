import { useEffect, useState } from 'react'
import { subSeed } from '../game/rng'
import { Button } from '../ui/Button'
import { DuellShell, duelNames, type DuellProps } from '../ui/DuellShell'
import { QrCode } from '../ui/QrCode'
import { useHotkeys } from '../ui/useHotkeys'
import { beep, formatClock, useStopwatch } from '../ui/useStopwatch'

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)

export function HandyRunde({ seconds, ...props }: DuellProps & { seconds: number }) {
  const { game, dispatch } = props
  const { duel, names } = duelNames(game)
  const [hits, setHits] = useState(() => names.map(() => 0))
  const watch = useStopwatch()
  const remaining = seconds * 1000 - watch.elapsedMs
  const done = remaining <= 0
  const { running, stop } = watch

  useEffect(() => {
    if (!done || !running) return
    stop()
    beep()
  }, [done, running, stop])

  const seed = subSeed(game.seed, game.duels.length * 1000 + duel.contentIndex)
  const url = `${location.origin}/geheim?deck=${duel.taskId}&seed=${seed}&n=${names.length}`
  const act = running ? watch.stop : done ? watch.reset : watch.start
  useHotkeys({ ' ': act })

  const best = Math.max(...hits)
  const winners = duel.players.filter((_, i) => hits[i] === best)
  const change = (i: number, by: number) => setHits(hits.map((h, j) => (j === i ? Math.max(0, h + by) : h)))
  const stepper = 'flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-line text-2xl font-semibold'

  return (
    <DuellShell
      {...props}
      tag="Begriff nur am Handy"
      action={
        <Button onClick={act}>
          {running ? 'Pause' : done ? 'Uhr zurücksetzen' : watch.elapsedMs ? 'Weiter' : 'Uhr starten'}
        </Button>
      }
      resultBar={
        <Button variant="gold" className="flex-1" disabled={best === 0} onClick={() => dispatch({ type: 'result', winners })}>
          {best === 0
            ? 'Erst die Treffer vom Handy eintragen'
            : `Eintragen: ${winners.map((id) => names[duel.players.indexOf(id)]).join(' und ')} ${winners.length > 1 ? 'gewinnen' : 'gewinnt'}`}
        </Button>
      }
    >
      <div className="flex min-w-80 flex-1 flex-col justify-center gap-4 rounded-[28px] bg-surface px-10 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <span className="text-base font-semibold tracking-[0.12em] text-gold uppercase">
            {done ? 'Zeit um!' : 'Ratet mit! · Zeit pro Person'}
          </span>
          <span className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-none font-extrabold text-gold tabular-nums">
            {formatClock(Math.ceil(Math.max(0, remaining) / 1000) * 1000)}
          </span>
        </div>
        <p className="text-lg leading-snug text-muted">
          Das Handy zählt Zeit und Treffer selbst und wird reihum weitergegeben. Am Ende zeigt es alle Treffer – hier
          eintragen.
        </p>
        <ol className="flex flex-col gap-2.5">
          {names.map((name, i) => (
            <li key={i} className="flex items-center gap-4 rounded-2xl bg-bg px-5 py-2.5">
              <span className="w-8 font-display text-2xl font-extrabold text-gold">{i + 1}.</span>
              <span className="grow text-2xl font-semibold">{name}</span>
              <button type="button" aria-label={`Treffer ${name} verringern`} onClick={() => change(i, -1)} className={stepper}>
                −
              </button>
              <span aria-label={`Treffer ${name}`} className="w-12 text-center font-display text-4xl font-extrabold tabular-nums">
                {hits[i]}
              </span>
              <button type="button" aria-label={`Treffer ${name} erhöhen`} onClick={() => change(i, 1)} className={stepper}>
                +
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex w-80 shrink-0 flex-col items-center justify-center gap-3 rounded-[28px] bg-cream p-6 text-center text-ink">
        <span className="text-base font-semibold tracking-[0.12em] text-eyebrow uppercase">Ein Handy für alle drei</span>
        <QrCode value={url} className="w-full max-w-60 rounded-xl" />
        <span className="text-[15px] leading-snug text-ink-soft">
          Einmal scannen, {names[0]} beginnt. Danach geht das Handy an {names.slice(1).join(' und dann an ')}.
        </span>
        {isLocal && (
          <span className="text-[13px] leading-snug text-eyebrow">
            Lokale Adresse: Der Code funktioniert am Handy erst auf der veröffentlichten Seite.
          </span>
        )}
      </div>
    </DuellShell>
  )
}
