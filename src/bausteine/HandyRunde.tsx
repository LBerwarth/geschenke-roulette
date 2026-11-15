import { useState } from 'react'
import { readLocalHits } from '../content/geheim'
import { subSeed } from '../game/rng'
import { Button } from '../ui/Button'
import { DuellShell, duelNames, type DuellProps } from '../ui/DuellShell'
import { QrCode } from '../ui/QrCode'

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)

export function HandyRunde({ seconds, ...props }: DuellProps & { seconds: number }) {
  const { game, dispatch } = props
  const { duel, names } = duelNames(game)
  const seed = subSeed(game.seed, game.duels.length * 1000 + duel.contentIndex)
  const [hits, setHits] = useState(() => {
    const saved = readLocalHits(seed)
    return names.map((_, i) => saved[i] ?? 0)
  })

  const url = `${location.origin}/geheim?deck=${duel.taskId}&seed=${seed}&n=${names.length}`
  const best = Math.max(...hits)
  const winners = duel.players.filter((_, i) => hits[i] === best)
  const change = (i: number, by: number) => setHits(hits.map((h, j) => (j === i ? Math.max(0, h + by) : h)))
  const stepper = 'flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-line text-2xl font-semibold'

  return (
    <DuellShell
      {...props}
      tag="Begriff nur am Handy"
      resultBar={
        <Button variant="gold" className="flex-1" disabled={best === 0} onClick={() => dispatch({ type: 'result', winners })}>
          {best === 0
            ? 'Erst die Treffer vom Handy eintragen'
            : `Eintragen: ${winners.map((id) => names[duel.players.indexOf(id)]).join(' und ')} ${winners.length > 1 ? 'gewinnen' : 'gewinnt'}`}
        </Button>
      }
    >
      <div className="flex min-w-80 flex-1 flex-col justify-center gap-3 rounded-[28px] bg-surface px-4 py-5 md:px-8 md:py-6">
        <span className="text-base font-semibold tracking-[0.12em] text-gold uppercase">
          Ratet mit! · {seconds / 60} Minuten pro Person
        </span>
        <p className="text-lg leading-snug text-muted">
          Das Handy zählt Zeit und Treffer selbst und wird reihum weitergegeben. Am Ende zeigt es alle Treffer – hier
          eintragen.
        </p>
        <ol className="flex flex-col gap-2">
          {names.map((name, i) => (
            <li key={i} className="flex items-center gap-2 rounded-2xl bg-bg px-3 py-1.5 md:gap-4 md:px-5">
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
      <div className="flex w-full flex-col md:w-72 md:shrink-0 items-center justify-center gap-2.5 rounded-[28px] bg-cream p-5 text-center text-ink">
        <span className="text-base font-semibold tracking-[0.12em] text-eyebrow uppercase">Ein Handy für alle</span>
        <QrCode value={url} className="w-full max-w-52 rounded-xl" />
        <span className="text-[15px] leading-snug text-ink-soft">
          Einmal scannen, {names[0]} beginnt. Danach geht das Handy an {names.slice(1).join(' und dann an ')}.
        </span>
        <a
          href={`${url}&local=1`}
          className="flex min-h-12 items-center rounded-full bg-ink px-5 text-base font-semibold text-text no-underline"
        >
          Kein zweites Handy? Hier öffnen
        </a>
        {isLocal && (
          <span className="text-[13px] leading-snug text-eyebrow">
            Lokale Adresse: Der Code funktioniert am Handy erst auf der veröffentlichten Seite.
          </span>
        )}
      </div>
    </DuellShell>
  )
}
