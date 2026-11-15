import { ranking } from '../game/score'
import { Button } from '../ui/Button'
import type { DuellProps } from '../ui/DuellShell'

export function Ende({ game, dispatch }: DuellProps) {
  const top = ranking(game.players, game.duels).slice(0, 3)
  return (
    <main className="flex min-h-dvh flex-col gap-5 px-5 py-6 md:px-14 md:py-10">
      <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
        Spiel beendet · {game.settings.durationMin} Minuten
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[44px] leading-none font-extrabold">Jetzt wird ausgepackt!</h1>
        <p className="max-w-250 text-[19px] leading-snug text-muted">
          Reihum auspacken – die Reihenfolge macht ihr im Raum aus. Die App zeigt nur noch die Duell-Sieger.
        </p>
      </div>
      <ol className="flex grow flex-col justify-center gap-3">
        {top.map((row) => (
          <li key={row.player.id} className="flex flex-wrap items-center gap-x-4 rounded-2xl bg-surface px-5 py-3 md:px-6 md:py-4.5">
            <span className="w-12 font-display text-4xl font-extrabold text-gold">{row.rank}.</span>
            <span className="grow text-[26px] font-semibold">{row.player.name}</span>
            <span className="font-display text-3xl font-extrabold">
              {row.points} {row.points === 1 ? 'Sieg' : 'Siege'}
            </span>
          </li>
        ))}
      </ol>
      <Button variant="gold" onClick={() => dispatch({ type: 'reset' })} className="self-start text-lg">
        Neues Spiel
      </Button>
    </main>
  )
}
