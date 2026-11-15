import type { Dispatch, ReactNode } from 'react'
import { CATEGORY_LABEL, TASKS } from '../content/tasks'
import { duelCount } from '../game/draw'
import type { Action } from '../game/reducer'
import { mulberry32, shuffle, subSeed } from '../game/rng'
import { ranking } from '../game/score'
import type { Game } from '../game/types'
import { Button } from './Button'
import { useHotkeys } from './useHotkeys'

export type DuellProps = { game: Game; dispatch: Dispatch<Action> }

const PILLS = ['bg-gold text-ink', 'bg-blue text-white', 'bg-red text-white']

const nameOf = (game: Game, id: string) => game.players.find((p) => p.id === id)?.name ?? '?'

export function duelNames(game: Game) {
  const duel = game.duels.at(-1)!
  const names = duel.players.map((id) => nameOf(game, id))
  return { duel, names, a: names[0], b: names[1] }
}

function lastEntry(game: Game): string | null {
  const prev = game.duels.findLast((d) => d.winners)
  if (!prev?.winners) return null
  if (prev.winners.length === 1) return `Eingetragen: ${nameOf(game, prev.winners[0])} gewinnt und klaut`
  // wer in der Bestenliste weiter hinten liegt, klaut zuerst; bei Gleichstand lost die App
  const rows = ranking(game.players, game.duels)
  const points = (id: string) => rows.find((r) => r.player.id === id)?.points ?? 0
  const order = shuffle(mulberry32(subSeed(game.seed, 1000 + game.duels.indexOf(prev))), prev.winners)
    .sort((x, y) => points(x) - points(y))
    .map((id) => nameOf(game, id))
  return `Eingetragen: Unentschieden – alle klauen, Reihenfolge: ${order.join(', ')}`
}

function EntryToast({ game, dispatch }: DuellProps) {
  const entry = lastEntry(game)
  if (!entry) return null
  return (
    <div role="status" className="flex min-h-13 items-center gap-3.5 self-center rounded-full bg-cream py-1.5 pr-2 pl-5 text-ink">
      <span className="text-[17px] font-semibold">{entry}</span>
      <button
        type="button"
        onClick={() => dispatch({ type: 'undo' })}
        className="h-11 cursor-pointer rounded-full bg-ink px-4.5 text-[15px] font-semibold text-text"
      >
        Rückgängig
      </button>
    </div>
  )
}

type Props = DuellProps & { tag: string; action?: ReactNode; resultBar?: ReactNode; children: ReactNode }

export function DuellShell({ game, dispatch, tag, action, resultBar, children }: Props) {
  const { duel, names, a, b } = duelNames(game)
  const task = TASKS[duel.taskId]
  const reroll = () => dispatch({ type: 'reroll' })
  const result = (...winners: string[]) => dispatch({ type: 'result', winners })
  const [idA, idB] = duel.players
  useHotkeys({
    '1': resultBar ? undefined : () => result(idA),
    '2': resultBar ? undefined : () => result(idB),
    u: resultBar ? undefined : () => result(idA, idB),
    z: () => dispatch({ type: 'undo' }),
    n: reroll,
  })

  return (
    <main className="flex min-h-dvh flex-col gap-5 px-5 py-6 md:px-14 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
          {CATEGORY_LABEL[task.category]} · {tag} · Duell {game.duels.length} von {duelCount(game.settings.durationMin)}
        </span>
        <div className="flex flex-wrap items-center gap-2.5 text-lg font-semibold">
          {names.map((name, i) => (
            <span key={i} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-muted">vs</span>}
              <span className={`flex h-9 items-center rounded-full px-3.5 ${PILLS[i % PILLS.length]}`}>{name}</span>
            </span>
          ))}
          <Button onClick={reroll} className="min-h-11 md:ml-4 rounded-full px-4.5 text-[15px]">
            Andere Aufgabe
          </Button>
        </div>
      </div>
      <EntryToast game={game} dispatch={dispatch} />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-4xl leading-none md:text-[44px] font-extrabold">{task.title}</h1>
        <p className="max-w-250 text-[19px] leading-snug text-muted">{task.rules}</p>
      </div>
      <div className="flex min-h-0 grow flex-wrap gap-5">{children}</div>
      <div className="flex flex-wrap gap-3">
        {action}
        {resultBar ?? (
          <>
            <Button variant="gold" className="min-w-40 flex-1" onClick={() => result(idA)}>
              {a} gewinnt
            </Button>
            <Button variant="blue" className="min-w-40 flex-1" onClick={() => result(idB)}>
              {b} gewinnt
            </Button>
            <Button className="text-lg" onClick={() => result(idA, idB)}>
              Unentschieden – beide gewinnen
            </Button>
          </>
        )}
      </div>
      <span className="hidden text-sm text-muted md:block">
        Tasten: {resultBar ? '' : `1 ${a} · 2 ${b} · U Unentschieden · `}Z Rückgängig · N andere Aufgabe · Leertaste
        Aktion
      </span>
    </main>
  )
}
