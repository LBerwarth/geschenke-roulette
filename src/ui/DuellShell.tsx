import type { Dispatch, ReactNode } from 'react'
import { CATEGORY_LABEL, TASKS } from '../content/tasks'
import { duelCount } from '../game/draw'
import type { Action } from '../game/reducer'
import { mulberry32, subSeed } from '../game/rng'
import { ranking } from '../game/score'
import type { Game } from '../game/types'
import { Button } from './Button'
import { useHotkeys } from './useHotkeys'

export type DuellProps = { game: Game; dispatch: Dispatch<Action> }

export function duelNames(game: Game) {
  const duel = game.duels.at(-1)!
  const name = (id: string) => game.players.find((p) => p.id === id)?.name ?? '?'
  return { duel, a: name(duel.a), b: name(duel.b) }
}

export function lastEntry(game: Game): string | null {
  const prev = game.duels.findLast((d) => d.result)
  if (!prev) return null
  const name = (id: string) => game.players.find((p) => p.id === id)?.name ?? '?'
  if (prev.result !== 'both') return `Eingetragen: ${name(prev.result === 'a' ? prev.a : prev.b)} gewinnt und klaut`
  const rows = ranking(game.players, game.duels)
  const points = (id: string) => rows.find((r) => r.player.id === id)?.points ?? 0
  const coin = mulberry32(subSeed(game.seed, 1000 + game.duels.indexOf(prev)))() < 0.5
  const first = points(prev.a) === points(prev.b) ? (coin ? prev.a : prev.b) : points(prev.a) < points(prev.b) ? prev.a : prev.b
  return `Eingetragen: Unentschieden – beide klauen, zuerst ${name(first)}`
}

export function EntryToast({ game, dispatch }: DuellProps) {
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

type Props = DuellProps & { tag: string; action?: ReactNode; children: ReactNode }

export function DuellShell({ game, dispatch, tag, action, children }: Props) {
  const { duel, a, b } = duelNames(game)
  const task = TASKS[duel.taskId]
  const reroll = () => dispatch({ type: 'reroll' })
  useHotkeys({
    '1': () => dispatch({ type: 'result', result: 'a' }),
    '2': () => dispatch({ type: 'result', result: 'b' }),
    u: () => dispatch({ type: 'result', result: 'both' }),
    z: () => dispatch({ type: 'undo' }),
    n: reroll,
  })

  return (
    <main className="flex min-h-screen flex-col gap-5 px-14 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">
          {CATEGORY_LABEL[task.category]} · {tag} · Duell {game.duels.length} von {duelCount(game.settings.durationMin)}
        </span>
        <div className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="flex h-9 items-center rounded-full bg-gold px-3.5 text-ink">{a}</span>
          <span className="text-muted">vs</span>
          <span className="flex h-9 items-center rounded-full bg-blue px-3.5 text-white">{b}</span>
          <Button onClick={reroll} className="ml-4 min-h-11 rounded-full px-4.5 text-[15px]">
            Andere Aufgabe
          </Button>
        </div>
      </div>
      <EntryToast game={game} dispatch={dispatch} />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[44px] leading-none font-extrabold">{task.title}</h1>
        <p className="max-w-250 text-[19px] leading-snug text-muted">{task.rules}</p>
      </div>
      <div className="flex min-h-0 grow gap-5">{children}</div>
      <div className="flex flex-wrap gap-3">
        {action}
        <Button variant="gold" className="flex-1" onClick={() => dispatch({ type: 'result', result: 'a' })}>
          {a} gewinnt
        </Button>
        <Button variant="blue" className="flex-1" onClick={() => dispatch({ type: 'result', result: 'b' })}>
          {b} gewinnt
        </Button>
        <Button className="text-lg" onClick={() => dispatch({ type: 'result', result: 'both' })}>
          Unentschieden – beide gewinnen
        </Button>
      </div>
      <span className="text-sm text-muted">
        Tasten: 1 {a} · 2 {b} · U Unentschieden · Z Rückgängig · N andere Aufgabe · Leertaste Aktion
      </span>
    </main>
  )
}
