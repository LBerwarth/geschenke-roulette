import { TASKS, type TaskId } from '../content/tasks'
import { mulberry32, pick, subSeed, type Rng } from './rng'
import type { Duel, Game } from './types'

export const duelCount = (durationMin: number) => Math.max(6, Math.round((durationMin - 15) / 2.5))

function minBy<T>(items: T[], score: (item: T) => number): T[] {
  const min = Math.min(...items.map(score))
  return items.filter((item) => score(item) === min)
}

function drawPair(rng: Rng, game: Game): [string, string] {
  const ids = game.players.map((p) => p.id)
  const last = game.duels.at(-1)
  const rested = last ? ids.filter((id) => id !== last.a && id !== last.b) : ids
  const pool = rested.length >= 2 ? rested : ids
  const plays = (id: string) => game.duels.filter((d) => d.a === id || d.b === id).length
  const met = ([a, b]: [string, string]) =>
    game.duels.filter((d) => (d.a === a && d.b === b) || (d.b === a && d.a === b)).length
  const pairs = pool.flatMap((a, i) => pool.slice(i + 1).map((b): [string, string] => [a, b]))
  const [a, b] = pick(rng, minBy(minBy(pairs, ([a, b]) => plays(a) + plays(b)), met))
  return rng() < 0.5 ? [a, b] : [b, a]
}

export function drawTask(rng: Rng, game: Game, exclude?: TaskId): TaskId {
  const all = game.settings.enabledTasks
  const enabled = all.length > 1 ? all.filter((t) => t !== exclude) : all
  const used = (t: TaskId) => game.duels.filter((d) => d.taskId === t).length
  const fresh = minBy(enabled, used)
  const last = game.duels.at(-1)
  const mixed = fresh.filter((t) => !last || TASKS[t].category !== TASKS[last.taskId].category)
  return pick(rng, mixed.length ? mixed : fresh)
}

export function drawDuel(game: Game): Duel {
  const n = game.duels.length
  const rng = mulberry32(subSeed(game.seed, n))
  const [a, b] = drawPair(rng, game)
  return { id: `d${n}`, taskId: drawTask(rng, game), a, b, result: null, contentIndex: Math.floor(rng() * 1e6) }
}
