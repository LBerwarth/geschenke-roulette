import { useMemo, type Dispatch } from 'react'
import { KARTEN } from '../content/karten'
import type { Action } from '../game/reducer'
import { mulberry32, shuffle } from '../game/rng'
import type { Game } from '../game/types'
import { Button } from '../ui/Button'
import { useHotkeys } from '../ui/useHotkeys'

export function Karten({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  const deck = useMemo(() => shuffle(mulberry32(game.seed), KARTEN), [game.seed])
  const card = deck[game.cardIndex % deck.length]
  const player = game.players[game.cardIndex % game.players.length]
  const next = () => dispatch({ type: 'nextCard' })
  const toDuels = () => dispatch({ type: 'toDuels' })
  useHotkeys({ ' ': next, enter: next, d: toDuels })

  return (
    <main className="flex min-h-screen flex-col gap-7 px-14 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
          Phase 1 · Ereigniskarten · Zug {game.cardIndex + 1} · bis alle ein Päckchen haben
        </span>
        <Button onClick={toDuels} className="min-h-12 rounded-full text-base">
          Alle haben ein Päckchen – weiter zu den Duellen
        </Button>
      </div>
      <div className="flex grow flex-wrap items-center gap-12">
        <div className="flex min-w-80 flex-1 flex-col gap-5">
          <span className="text-[22px] text-muted">Am Zug</span>
          <div className="flex items-center gap-5">
            <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-gold font-display text-[44px] font-extrabold text-ink">
              {player.name[0].toUpperCase()}
            </span>
            <span className="font-display text-7xl leading-none font-extrabold">{player.name}</span>
          </div>
          <p className="max-w-130 text-xl leading-snug text-muted">
            Lies die Karte vor und mach es im Raum. Die App merkt sich nicht, wer welches Päckchen hat.
          </p>
          <p className="max-w-130 text-xl leading-snug text-muted">
            Geht die Karte nicht, weil du noch kein Päckchen hast? Dann nimm eins vom Tisch. Gesperrte Päckchen bleiben,
            wo sie sind.
          </p>
        </div>
        <div className="flex min-h-150 w-130 shrink-0 flex-col gap-5 rounded-[28px] bg-red p-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold tracking-[0.12em] uppercase">Ereignis</span>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="1.5" />
              <path d="M3 7h18v3H3zM12 7v13M12 7c-1.500-3-5-2.500-3.500 0M12 7c1.500-3 5-2.500 3.500 0" />
            </svg>
          </div>
          <div className="flex grow flex-col justify-center gap-4">
            <h2 className="font-display text-[64px] leading-none font-extrabold">{card.title}</h2>
            <p className="text-[26px] leading-snug">{card.text.replace('{limit}', String(game.settings.stealLimit))}</p>
          </div>
          <Button variant="white" onClick={next} className="font-display text-[22px] font-extrabold">
            Erledigt – nächste Karte
          </Button>
        </div>
      </div>
    </main>
  )
}
