import { useMemo, useState } from 'react'
import { HT_DECKS, HT_SOURCE } from '../content/hoeherTiefer'
import { mulberry32, shuffle, subSeed } from '../game/rng'
import { Button } from '../ui/Button'
import { DuellShell, duelNames, type DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'

type Guess = 'higher' | 'lower'

export function HoeherTiefer(props: DuellProps) {
  const { game, dispatch } = props
  const { duel, a, b } = duelNames(game)
  const deckIndex = duel.contentIndex % HT_DECKS.length
  const deck = HT_DECKS[deckIndex]
  const order = useMemo(
    () => shuffle(mulberry32(subSeed(game.seed, duel.contentIndex)), deck.items),
    [game.seed, duel.contentIndex, deck],
  )
  const [pos, setPos] = useState(0)
  const [guess, setGuess] = useState<Guess | null>(null)

  const known = order[pos % order.length]
  const next = order[(pos + 1) % order.length]
  const names = [a, b]
  const turn = names[pos % 2]
  const other = names[(pos + 1) % 2]
  const right = guess !== null && (next.value === known.value || next.value > known.value === (guess === 'higher'))

  const advance = () => {
    setPos(pos + 1)
    setGuess(null)
  }
  useHotkeys({
    h: guess ? undefined : () => setGuess('higher'),
    t: guess ? undefined : () => setGuess('lower'),
    ' ': guess ? advance : undefined,
  })

  const card = 'flex min-w-0 flex-1 flex-col justify-center gap-3 rounded-[28px] bg-cream px-10 py-8 text-ink'
  const eyebrow = 'text-base font-semibold tracking-[0.12em] text-eyebrow uppercase'
  const label = 'font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.05] font-extrabold'
  const value = 'font-display text-[clamp(2.25rem,4.4vw,3.5rem)] leading-none font-extrabold tabular-nums'

  return (
    <DuellShell
      {...props}
      tag="Höher oder tiefer"
      action={<Button onClick={() => dispatch({ type: 'newContent' })}>Anderes Fragenset</Button>}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex min-h-0 grow flex-wrap gap-5">
          <div className={card}>
            <span className={eyebrow}>Bekannt</span>
            <span className={label}>{known.label}</span>
            <span className={`${value} text-eyebrow`}>{known.display}</span>
          </div>
          <div className={card}>
            <span className={eyebrow}>Höher oder tiefer? · {turn} ist dran</span>
            <span className={label}>{next.label}</span>
            {guess ? (
              <>
                <span className={`${value} text-eyebrow`}>{next.display}</span>
                <span role="status" className="text-xl font-semibold">
                  {right ? 'Richtig!' : `Falsch – ${other} gewinnt.`}
                </span>
                {right && (
                  <button type="button" onClick={advance} className="h-14 cursor-pointer rounded-2xl bg-ink px-6 text-[19px] font-semibold text-text">
                    Weiter – {other} ist dran
                  </button>
                )}
              </>
            ) : (
              <>
                <span className={`${value} text-ink-soft`}>?</span>
                <div className="flex gap-3">
                  {(['higher', 'lower'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGuess(g)}
                      className="h-14 flex-1 cursor-pointer rounded-2xl bg-ink px-6 text-[19px] font-semibold text-text"
                    >
                      {g === 'higher' ? 'Höher (H)' : 'Tiefer (T)'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[15px] font-semibold text-muted">Fragensets:</span>
          {HT_DECKS.map((d, i) => (
            <span
              key={d.name}
              className={`flex h-9 items-center rounded-full px-3.5 text-[15px] font-semibold ${i === deckIndex ? 'bg-gold text-ink' : 'bg-surface text-muted'}`}
            >
              {d.name} · {d.items.length}
            </span>
          ))}
          <span className="ml-auto text-[13px] text-muted">{HT_SOURCE}</span>
        </div>
      </div>
    </DuellShell>
  )
}
