import { useState } from 'react'
import { mulberry32, shuffle, subSeed } from '../game/rng'
import { ranking } from '../game/score'
import { Button } from '../ui/Button'
import type { DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'

export function Wunsch({ game, dispatch }: DuellProps) {
  // Gleichstand: die App lost die Reihenfolge, sort() ist stabil
  const mixed = shuffle(mulberry32(subSeed(game.seed, 7000)), game.players)
  const count = Math.max(1, Math.min(3, Math.floor(game.players.length / 2)))
  const wishers = ranking(mixed, game.duels).slice(0, count).reverse()
  const [step, setStep] = useState(0)
  const current = wishers[step]

  const next = () => (step + 1 < wishers.length ? setStep(step + 1) : dispatch({ type: 'toEnd' }))
  const undo = () => dispatch({ type: 'undo' })
  useHotkeys({ ' ': next, enter: next, z: step === 0 ? undo : undefined })

  return (
    <main className="flex min-h-dvh flex-col gap-6 px-5 py-6 md:px-14 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
          Phase 3 · Wunschrunde · die Besten wählen
        </span>
        {step === 0 && (
          <Button onClick={undo} className="min-h-12 rounded-full px-5 text-base">
            Letztes Duell rückgängig
          </Button>
        )}
      </div>
      <div className="flex min-h-0 grow flex-wrap gap-8">
        <ol className="flex min-w-80 flex-1 flex-col justify-center gap-3">
          {wishers.map((row, i) => (
            <li
              key={row.player.id}
              className={`flex flex-wrap items-center gap-x-4 rounded-2xl px-5 py-3 md:px-6 md:py-4.5 ${i === step ? 'bg-gold text-ink' : 'bg-surface'} ${i < step ? 'opacity-50' : ''}`}
            >
              <span className="w-28 font-display text-3xl font-extrabold">Platz {wishers.length - i}</span>
              <span className="grow text-[26px] font-semibold">{row.player.name}</span>
              <span className="font-display text-2xl font-extrabold">
                {row.points} {row.points === 1 ? 'Sieg' : 'Siege'}
              </span>
            </li>
          ))}
        </ol>
        <section className="flex w-full flex-col gap-4 rounded-[28px] bg-red p-6 md:w-110 md:shrink-0 md:p-8 text-white">
          <span className="text-base font-semibold tracking-[0.12em] uppercase">
            Wunsch {step + 1} von {wishers.length}
          </span>
          <h2 className="font-display text-4xl leading-[1.05] md:text-[48px] font-extrabold">{current.player.name} wählt!</h2>
          <p className="text-xl leading-snug">
            Such dir das Geschenk aus, das du am liebsten willst, und tausche es gegen deins. Auch gesperrte Geschenke
            sind erlaubt.
          </p>
          <p className="text-lg leading-snug">
            {step + 1 < wishers.length
              ? 'Achtung: Wer nach dir wählt, darf es dir wieder wegnehmen.'
              : 'Das ist der letzte Wunsch. Danach bleibt alles, wie es ist.'}
          </p>
          <div className="grow" />
          <Button variant="white" onClick={next} className="font-display text-[22px] font-extrabold">
            {step + 1 < wishers.length ? 'Erledigt – nächster Wunsch' : 'Erledigt – jetzt auspacken'}
          </Button>
        </section>
      </div>
    </main>
  )
}
