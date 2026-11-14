import type { TaskId } from '../content/tasks'

export type Player = { id: string; name: string }
// winners: null = offen, mehrere Einträge = Unentschieden, alle bekommen einen Punkt
export type Duel = { id: string; taskId: TaskId; players: string[]; winners: string[] | null; contentIndex: number }
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
