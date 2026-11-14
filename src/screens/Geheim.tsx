import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { isSecretDeck, secretSequence, type SecretDeck } from '../content/geheim'
import { TASKS } from '../content/tasks'
import { beep, formatClock, useStopwatch } from '../ui/useStopwatch'

export function Geheim() {
  const [params] = useSearchParams()
  const deck = params.get('deck')
  const seed = Number(params.get('seed'))
  if (!isSecretDeck(deck) || !Number.isInteger(seed)) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center text-xl">
        Dieser Link ist unvollständig. Scanne den QR-Code am Fernseher noch einmal.
      </main>
    )
  }
  return <Runde key={`${deck}-${seed}`} deck={deck} seed={seed} />
}

function Runde({ deck, seed }: { deck: SecretDeck; seed: number }) {
  const terms = useMemo(() => secretSequence(deck, seed), [deck, seed])
  const seconds = TASKS[deck].baustein.seconds
  const watch = useStopwatch()
  const [index, setIndex] = useState(0)
  const [hits, setHits] = useState(0)
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
  const eyebrow = 'text-sm font-semibold tracking-widest text-eyebrow uppercase'

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4.5 px-6 py-7">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-widest text-muted uppercase">Nur für dich</span>
        <span className="flex items-baseline gap-3">
          {started && !done && <span className="text-[15px] font-semibold">{hits} Treffer</span>}
          <span className="font-display text-2xl font-extrabold text-gold tabular-nums">
            {formatClock(Math.ceil(Math.max(0, remaining) / 1000) * 1000)}
          </span>
        </span>
      </div>

      {!started && (
        <>
          <div className="flex grow flex-col justify-center gap-4 rounded-3xl bg-cream px-5.5 py-7 text-ink">
            <span className={eyebrow}>{TASKS[deck].title}</span>
            <span className="font-display text-4xl leading-none font-extrabold">Bereit?</span>
            <p className="text-[17px] leading-snug text-ink-soft">{TASKS[deck].rules}</p>
            <p className="text-[17px] leading-snug text-ink-soft">
              Halte das Handy so, dass niemand mitliest. Tippe „Los“, sobald die Zeit am Fernseher startet.
            </p>
          </div>
          <button type="button" onClick={watch.start} className="h-18 cursor-pointer rounded-[18px] bg-gold font-display text-[26px] font-extrabold text-ink">
            Los
          </button>
        </>
      )}

      {started && !done && (
        <>
          <div className="flex grow flex-col justify-center gap-4.5 rounded-3xl bg-cream px-5.5 py-7 text-ink">
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
          <button
            type="button"
            onClick={() => {
              setHits(hits + 1)
              setIndex(index + 1)
            }}
            className="h-18 cursor-pointer rounded-[18px] bg-green font-display text-[26px] font-extrabold text-white"
          >
            Erraten – nächster
          </button>
          <button
            type="button"
            onClick={() => setIndex(index + 1)}
            className="h-13 cursor-pointer rounded-[14px] border-2 border-line text-[17px] font-semibold"
          >
            Überspringen
          </button>
        </>
      )}

      {done && (
        <div className="flex grow flex-col items-center justify-center gap-2.5 rounded-3xl bg-cream px-5.5 py-7 text-center text-ink">
          <span className={eyebrow}>Zeit um!</span>
          <span className="font-display text-[160px] leading-none font-extrabold">{hits}</span>
          <span className="font-display text-3xl font-extrabold">Treffer</span>
          <span className="mt-3 text-[17px] leading-snug text-ink-soft">Halte das Handy hoch, damit alle es sehen.</span>
        </div>
      )}

      <span className="text-center text-[13px] leading-snug text-muted">
        Über den QR-Code geöffnet · läuft danach offline
      </span>
    </main>
  )
}
