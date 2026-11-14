import { TASK_IDS } from '../content/tasks'
import { drawDuel, duelCount, groupSize } from './draw'
import type { Duel, Game, Player, Settings } from './types'

export const BONUS_EVERY = 4

export const initialGame: Game = {
  players: [],
  phase: 'setup',
  settings: { durationMin: 60, stealLimit: 3, finaleMin: 2, enabledTasks: TASK_IDS },
  duels: [],
  cardIndex: 0,
  bonusSeen: 0,
  chaosDone: false,
  seed: 0,
}

export type Action =
  | { type: 'start'; players: Player[]; settings: Settings; seed: number }
  | { type: 'nextCard' }
  | { type: 'toDuels' }
  | { type: 'result'; winners: string[] }
  | { type: 'undo' }
  | { type: 'reroll' }
  | { type: 'newContent' }
  | { type: 'bonusDone' }
  | { type: 'chaosDone' }
  | { type: 'toEnd' }
  | { type: 'reset' }

export const decided = (game: Game) => game.duels.filter((d) => d.winners).length
export const bonusDue = (game: Game) => Math.floor(decided(game) / BONUS_EVERY) > game.bonusSeen

function withPending(game: Game, change: (duel: Duel) => Duel): Game {
  const last = game.duels.at(-1)
  if (!last || last.winners) return game
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
      if (!action.winners.length) return game
      const done = withPending(game, (d) => ({ ...d, winners: action.winners }))
      if (done === game) return game
      const total = duelCount(game.settings.durationMin)
      if (done.duels.length >= total) return { ...done, phase: 'wish' }
      const halftime = !game.chaosDone && done.duels.length === Math.floor(total / 2)
      return { ...done, phase: halftime ? 'finale' : 'duels', duels: [...done.duels, drawDuel(done)] }
    }
    case 'undo': {
      const duels = game.duels.at(-1)?.winners ? game.duels : game.duels.slice(0, -1)
      const last = duels.at(-1)
      if (!last?.winners) return game
      return {
        ...game,
        phase: 'duels',
        duels: [...duels.slice(0, -1), { ...last, winners: null }],
        bonusSeen: Math.min(game.bonusSeen, Math.floor((duels.length - 1) / BONUS_EVERY)),
      }
    }
    case 'reroll':
      return withPending(game, (d) => {
        const before = { ...game, duels: game.duels.slice(0, -1) }
        const fresh = drawDuel(before, d.taskId, (d.contentIndex % 997) + 1)
        return groupSize(fresh.taskId) === d.players.length ? { ...fresh, players: d.players } : fresh
      })
    case 'newContent':
      return withPending(game, (d) => ({ ...d, contentIndex: d.contentIndex + 1 }))
    case 'bonusDone':
      return { ...game, bonusSeen: game.bonusSeen + 1 }
    case 'chaosDone':
      return { ...game, phase: 'duels', chaosDone: true }
    case 'toEnd':
      return { ...game, phase: 'end' }
    case 'reset':
      return { ...initialGame, players: game.players, settings: game.settings }
  }
}
