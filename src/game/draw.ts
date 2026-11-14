import { TASKS, type Baustein, type TaskId } from '../content/tasks'
import { mulberry32, pick, shuffle, subSeed, type Rng } from './rng'
import type { Duel, Game } from './types'

export const duelCount = (durationMin: number) => Math.max(6, Math.round((durationMin - 15) / 2.5))

export function groupSize(taskId: TaskId) {
  const baustein: Baustein = TASKS[taskId].baustein
  return baustein.kind === 'handy' ? baustein.players : 2
}

function minBy<T>(items: T[], score: (item: T) => number): T[] {
  const min = Math.min(...items.map(score))
  return items.filter((item) => score(item) === min)
}

function combos<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]]
  return items.flatMap((item, i) => combos(items.slice(i + 1), size - 1).map((rest) => [item, ...rest]))
}

function drawGroup(rng: Rng, game: Game, size: number): string[] {
  const ids = game.players.map((p) => p.id)
  const last = game.duels.at(-1)
  const rested = last ? ids.filter((id) => !last.players.includes(id)) : ids
  const pool = rested.length >= size ? rested : ids
  const plays = new Map(ids.map((id) => [id, game.duels.filter((d) => d.players.includes(id)).length]))
  const load = (group: string[]) => group.reduce((sum, id) => sum + plays.get(id)!, 0)
  const met = (group: string[]) =>
    game.duels.filter((d) => group.filter((id) => d.players.includes(id)).length >= 2).length
  return shuffle(rng, pick(rng, minBy(minBy(combos(pool, size), load), met)))
}

function drawTask(rng: Rng, game: Game, exclude?: TaskId): TaskId {
  const all = game.settings.enabledTasks
  const enabled = all.length > 1 ? all.filter((t) => t !== exclude) : all
  const used = (t: TaskId) => game.duels.filter((d) => d.taskId === t).length
  const fresh = minBy(enabled, used)
  const last = game.duels.at(-1)
  const mixed = fresh.filter((t) => !last || TASKS[t].category !== TASKS[last.taskId].category)
  return pick(rng, mixed.length ? mixed : fresh)
}

export function drawDuel(game: Game, exclude?: TaskId, salt = 0): Duel {
  const n = game.duels.length
  const rng = mulberry32(subSeed(game.seed, n + salt * 7919))
  const taskId = drawTask(rng, game, exclude)
  const players = drawGroup(rng, game, groupSize(taskId))
  return { id: `d${n}`, taskId, players, winners: null, contentIndex: Math.floor(rng() * 1e6) }
}
