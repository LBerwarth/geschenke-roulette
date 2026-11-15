import { BONUS } from '../content/bonus'
import { decided } from '../game/reducer'
import { mulberry32, pick, shuffle, subSeed } from '../game/rng'
import { playersAtPlace, ranking } from '../game/score'
import { Button } from '../ui/Button'
import type { DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'

export function Bestenliste({ game, dispatch }: DuellProps) {
  const rows = ranking(game.players, game.duels)
  const rng = mulberry32(subSeed(game.seed, 5000 + game.bonusSeen))
  const bonus = shuffle(mulberry32(game.seed), BONUS)[game.bonusSeen % BONUS.length]
  const dice = 1 + Math.floor(rng() * Math.min(6, rows.length))
  const place =
    bonus.place === 'last' ? rows.length : bonus.place === 'middle' ? Math.ceil(rows.length / 2) : bonus.place === 'dice' ? dice : bonus.place
  const chosen = pick(rng, playersAtPlace(rows, place))
  const others = rows.filter((r) => r.player.id !== chosen.id)
  const last = pick(rng, others.filter((r) => r.rank === others.at(-1)!.rank)).player
  const text = bonus.text.replaceAll('{name}', chosen.name).replaceAll('{place}', String(place)).replaceAll('{last}', last.name)

  const done = () => dispatch({ type: 'bonusDone' })
  const undo = () => dispatch({ type: 'undo' })
  useHotkeys({ ' ': done, enter: done, z: undo })

  return (
    <main className="flex min-h-dvh flex-col gap-6 px-5 py-6 md:px-14 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
            Nach Duell {decided(game)} · 1 Punkt pro Sieg
          </span>
          <h1 className="font-display text-[44px] leading-none font-extrabold">Bestenliste</h1>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <span className="text-base text-muted">Gleichstand: gleicher Platz, die App lost unter ihnen aus</span>
          <Button onClick={undo} className="min-h-11 rounded-full px-4.5 text-[15px]">
            Letzten Eintrag rückgängig
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 grow flex-wrap gap-8">
        <ol
          className="grid min-w-80 flex-1 grid-flow-col grid-cols-2 gap-x-4 gap-y-2"
          style={{ gridTemplateRows: `repeat(${Math.ceil(rows.length / 2)}, minmax(3rem, 1fr))` }}
        >
          {rows.map((row) => {
            const on = row.player.id === chosen.id
            return (
              <li
                key={row.player.id}
                className={`flex items-center gap-3.5 rounded-xl px-4 ${on ? 'bg-gold text-ink' : 'bg-surface'}`}
              >
                <span className="w-8 font-display text-[22px] font-extrabold">{row.rank}.</span>
                <span className="grow text-lg font-medium">{row.player.name}</span>
                <span className="font-display text-[22px] font-extrabold">{row.points}</span>
              </li>
            )
          })}
        </ol>
        <section className="flex w-full flex-col gap-4 rounded-[28px] bg-red p-6 md:w-100 md:shrink-0 md:p-8 text-white">
          <span className="text-base font-semibold tracking-[0.12em] uppercase">Bonus-Ereignis</span>
          <h2 className="font-display text-4xl leading-[1.05] md:text-[48px] font-extrabold">{bonus.title}</h2>
          <p className="text-xl leading-snug">{text}</p>
          <div className="grow" />
          <Button variant="white" onClick={done} className="font-display text-[22px] font-extrabold">
            Erledigt – weiter
          </Button>
        </section>
      </div>
    </main>
  )
}
