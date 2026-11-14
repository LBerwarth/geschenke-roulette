import { TASK_IDS } from '../content/tasks'
import { drawDuel, drawTask, duelCount } from './draw'
import { mulberry32, subSeed } from './rng'
import type { Duel, Game, Player, Result, Settings } from './types'

export const BONUS_EVERY = 4

export const initialGame: Game = {
  players: [],
  phase: 'setup',
  settings: { durationMin: 60, stealLimit: 3, finaleMin: 5, enabledTasks: TASK_IDS },
  duels: [],
  cardIndex: 0,
  bonusSeen: 0,
  seed: 0,
}

export type Action =
  | { type: 'start'; players: Player[]; settings: Settings; seed: number }
  | { type: 'nextCard' }
  | { type: 'toDuels' }
  | { type: 'result'; result: Result }
  | { type: 'undo' }
  | { type: 'reroll' }
  | { type: 'newContent' }
  | { type: 'bonusDone' }
  | { type: 'toEnd' }
  | { type: 'reset' }

export const decided = (game: Game) => game.duels.filter((d) => d.result).length
export const bonusDue = (game: Game) => Math.floor(decided(game) / BONUS_EVERY) > game.bonusSeen

function withPending(game: Game, change: (duel: Duel) => Duel): Game {
  const last = game.duels.at(-1)
  if (!last || last.result) return game
  return { ...game, duels: [...game.duels.slice(0, -1), change(last)] }
}

export function reducer(game: Game, action: Action): Game {
  switch (action.type) {
    case 'start':
      return { ...initialGame, players: action.players, settings: action.settings, seed: action.seed, phase: 'cards' }
    case 'nextCard':
      return { ...game, cardIndex: game.cardIndex + 1 }
    case 'toDuels': {
      const next = { ...game, phase: 'duels' as const }
      return { ...next, duels: [drawDuel(next)] }
    }
    case 'result': {
      const done = withPending(game, (d) => ({ ...d, result: action.result }))
      if (done === game) return game
      if (done.duels.length >= duelCount(game.settings.durationMin)) return { ...done, phase: 'finale' }
      return { ...done, duels: [...done.duels, drawDuel(done)] }
    }
    case 'undo': {
      const duels = game.duels.at(-1)?.result ? game.duels : game.duels.slice(0, -1)
      const last = duels.at(-1)
      if (!last?.result) return game
      return {
        ...game,
        phase: 'duels',
        duels: [...duels.slice(0, -1), { ...last, result: null }],
        bonusSeen: Math.min(game.bonusSeen, Math.floor((duels.length - 1) / BONUS_EVERY)),
      }
    }
    case 'reroll':
      return withPending(game, (d) => {
        const rng = mulberry32(subSeed(game.seed, d.contentIndex))
        const before = { ...game, duels: game.duels.slice(0, -1) }
        return { ...d, taskId: drawTask(rng, before, d.taskId), contentIndex: d.contentIndex + 1 }
      })
    case 'newContent':
      return withPending(game, (d) => ({ ...d, contentIndex: d.contentIndex + 1 }))
    case 'bonusDone':
      return { ...game, bonusSeen: game.bonusSeen + 1 }
    case 'toEnd':
      return { ...game, phase: 'end' }
    case 'reset':
      return { ...initialGame, players: game.players, settings: game.settings }
  }
}
