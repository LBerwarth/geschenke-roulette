import type { TaskId } from '../content/tasks'

export type Player = { id: string; name: string }
export type Result = 'a' | 'b' | 'both'
export type Duel = { id: string; taskId: TaskId; a: string; b: string; result: Result | null; contentIndex: number }
export type Phase = 'setup' | 'cards' | 'duels' | 'finale' | 'end'
export type Settings = { durationMin: number; stealLimit: number; finaleMin: number; enabledTasks: TaskId[] }
export type Game = {
  players: Player[]
  phase: Phase
  settings: Settings
  duels: Duel[]
  cardIndex: number
  bonusSeen: number
  seed: number
}
