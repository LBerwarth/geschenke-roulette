import type { Duel, Player } from './types'

export type Row = { player: Player; points: number; rank: number }

export function ranking(players: Player[], duels: Duel[]): Row[] {
  const points = new Map(players.map((p) => [p.id, 0]))
  for (const d of duels) for (const id of d.winners ?? []) points.set(id, (points.get(id) ?? 0) + 1)
  const sorted = players
    .map((player) => ({ player, points: points.get(player.id) ?? 0 }))
    .sort((x, y) => y.points - x.points)
  return sorted.map((row) => ({ ...row, rank: sorted.findIndex((r) => r.points === row.points) + 1 }))
}

// Platz n = alle, die sich den Platz teilen, auf dem Position n liegt
export function playersAtPlace(rows: Row[], place: number): Player[] {
  const at = rows[Math.min(place, rows.length) - 1]
  return at ? rows.filter((r) => r.rank === at.rank).map((r) => r.player) : []
}
