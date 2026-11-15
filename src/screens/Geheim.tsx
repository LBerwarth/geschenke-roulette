import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { isSecretDeck, saveLocalHits, secretSequence, type SecretDeck } from '../content/geheim'
import { TASKS } from '../content/tasks'
import { beep, formatClock, useStopwatch } from '../ui/useStopwatch'

export function Geheim() {
  const [params] = useSearchParams()
  const deck = params.get('deck')
  const seed = Number(params.get('seed'))
  const rounds = Math.min(6, Math.max(1, Number(params.get('n')) || 1))
  if (!isSecretDeck(deck) || !Number.isInteger(seed)) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center text-xl">
        Dieser Link ist unvollständig. Scanne den QR-Code am Fernseher noch einmal.
      </main>
    )
  }
  return <Runden key={`${deck}-${seed}`} deck={deck} seed={seed} rounds={rounds} local={params.has('local')} />
}

const eyebrow = 'text-sm font-semibold tracking-widest text-eyebrow uppercase'
const card = 'flex grow flex-col justify-center gap-4 rounded-3xl bg-cream px-5.5 py-7 text-ink'
const bigButton = 'min-h-18 cursor-pointer rounded-[18px] px-4 font-display text-[24px] font-extrabold'

type Props = { deck: SecretDeck; seed: number; rounds: number; local: boolean }

function Runden({ deck, seed, rounds, local }: Props) {
  const terms = useMemo(() => secretSequence(deck, seed), [deck, seed])
  const seconds = TASKS[deck].baustein.seconds
  const watch = useStopwatch()
  const [index, setIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [results, setResults] = useState<number[]>([])
  const round = results.length
  const finished = round >= rounds
  const remaining = seconds * 1000 - watch.elapsedMs
  const done = remaining <= 0
  const started = watch.running || watch.elapsedMs > 0
  const { running, stop } = watch

  useEffect(() => {
    if (!done || !running) return
    stop()
    beep()
    navigator.vibrate?.(400)
  }, [done, running, stop])

  const term = terms[index % terms.length]
  const nextTerm = (hit: boolean) => {
    if (hit) setHits(hits + 1)
    setIndex(index + 1)
  }
  const closeRound = () => {
    if (local) saveLocalHits(seed, [...results, hits])
    setResults([...results, hits])
    setHits(0)
    setIndex(index + 1)
    watch.reset()
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4.5 px-6 py-7">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-widest text-muted uppercase">
          {finished ? 'Ergebnis' : `Nur für Erklärer ${round + 1} von ${rounds}`}
        </span>
        {!finished && (
          <span className="flex items-baseline gap-3">
            {started && !done && <span className="text-[15px] font-semibold">{hits} Treffer</span>}
            <span className="font-display text-2xl font-extrabold text-gold tabular-nums">
              {formatClock(Math.ceil(Math.max(0, remaining) / 1000) * 1000)}
            </span>
          </span>
        )}
      </div>

      {finished && (
        <div className={`${card} text-center`}>
          <span className={eyebrow}>Alle Treffer</span>
          <ol className="flex flex-col gap-3">
            {results.map((result, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-left">
                <span className="text-2xl font-semibold">Erklärer {i + 1}</span>
                <span className="font-display text-6xl leading-none font-extrabold">{result}</span>
              </li>
            ))}
          </ol>
          {local ? (
            <Link to="/" className={`${bigButton} flex items-center justify-center bg-ink text-text no-underline`}>
              Zurück zum Spiel
            </Link>
          ) : (
            <span className="text-[17px] leading-snug text-ink-soft">Tragt die Treffer am Fernseher ein.</span>
          )}
        </div>
      )}

      {!finished && !started && (
        <>
          <div className={card}>
            <span className={eyebrow}>{TASKS[deck].title}</span>
            <span className="font-display text-4xl leading-none font-extrabold">Erklärer {round + 1}, bereit?</span>
            <p className="text-[17px] leading-snug text-ink-soft">
              Halte das Handy so, dass niemand mitliest. Du hast {seconds / 60} Minuten, die Uhr startet mit „Los“.
            </p>
          </div>
          <button type="button" onClick={watch.start} className={`${bigButton} bg-gold text-ink`}>
            Los
          </button>
        </>
      )}

      {!finished && started && !done && (
        <>
          <div className={card}>
            <span className={eyebrow}>Erkläre</span>
            <span className="font-display text-5xl leading-none font-extrabold break-words hyphens-auto" lang="de">
              {term.term}
            </span>
            {term.forbidden && (
              <>
                <span className={`${eyebrow} mt-2`}>Nicht sagen</span>
                <div className="flex flex-col gap-2">
                  {term.forbidden.map((word) => (
                    <span key={word} className="flex h-11 items-center rounded-xl bg-red px-4 text-lg font-semibold text-white">
                      {word}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <button type="button" onClick={() => nextTerm(true)} className={`${bigButton} bg-green text-white`}>
            Erraten – nächster
          </button>
          <button
            type="button"
            onClick={() => nextTerm(false)}
            className="h-13 cursor-pointer rounded-[14px] border-2 border-line text-[17px] font-semibold"
          >
            Überspringen
          </button>
        </>
      )}

      {!finished && done && (
        <>
          <div className={`${card} items-center text-center`}>
            <span className={eyebrow}>Zeit um!</span>
            <span className="font-display text-[160px] leading-none font-extrabold">{hits}</span>
            <span className="font-display text-3xl font-extrabold">Treffer</span>
            <span className="mt-3 text-[17px] leading-snug text-ink-soft">Halte das Handy hoch, damit alle es sehen.</span>
          </div>
          <button type="button" onClick={closeRound} className={`${bigButton} bg-gold text-ink`}>
            {round + 1 < rounds ? `Weiter – Handy an Erklärer ${round + 2}` : 'Alle Treffer zeigen'}
          </button>
        </>
      )}

      <span className="text-center text-[13px] leading-snug text-muted">
        {local ? 'Niemand außer dem Erklärer schaut aufs Handy' : 'Über den QR-Code geöffnet · läuft danach offline'}
      </span>
    </main>
  )
}
