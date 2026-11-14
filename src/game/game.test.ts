import { expect, test } from 'vitest'
import { TASKS } from '../content/tasks'
import { duelCount } from './draw'
import { bonusDue, initialGame, reducer } from './reducer'
import { mulberry32, shuffle } from './rng'
import { playersAtPlace, ranking } from './score'
import type { Duel, Game, Player } from './types'

const makePlayers = (n: number): Player[] => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `S${i}` }))

function start(n: number, seed: number, durationMin = 60): Game {
  const game = reducer(initialGame, {
    type: 'start',
    players: makePlayers(n),
    settings: { ...initialGame.settings, durationMin },
    seed,
  })
  return reducer(game, { type: 'toDuels' })
}

function play(n: number, seed: number, durationMin = 90): Game {
  let game = start(n, seed, durationMin)
  while (game.phase === 'duels') game = reducer(game, { type: 'result', result: 'a' })
  return game
}

test('mulberry32 liefert für denselben Startwert dieselbe Folge', () => {
  const a = mulberry32(42)
  const b = mulberry32(42)
  expect(Array.from({ length: 50 }, a)).toEqual(Array.from({ length: 50 }, b))
  expect(mulberry32(42)()).not.toBe(mulberry32(43)())
  const items = Array.from({ length: 100 }, (_, i) => i)
  expect(shuffle(mulberry32(7), items)).toEqual(shuffle(mulberry32(7), items))
  expect(shuffle(mulberry32(7), items).sort((x, y) => x - y)).toEqual(items)
})

test('mulberry32 Referenzwerte bleiben stabil', () => {
  const rng = mulberry32(1)
  expect([rng(), rng(), rng()].map((x) => Math.floor(x * 1e6))).toMatchInlineSnapshot(`
    [
      627073,
      2735,
      527447,
    ]
  `)
})

test.each([3, 4, 5, 8, 15])('Auslosung mit %i Spielern ist fair', (n) => {
  for (const seed of [1, 2, 3, 99]) {
    const { duels, players } = play(n, seed)
    expect(duels).toHaveLength(duelCount(90))
    duels.forEach((d, i) => {
      expect(d.a).not.toBe(d.b)
      const plays = players.map((p) => duels.slice(0, i + 1).filter((x) => x.a === p.id || x.b === p.id).length)
      expect(Math.max(...plays) - Math.min(...plays)).toBeLessThanOrEqual(n >= 4 ? 1 : 2)
      if (i > 0 && n >= 4) {
        const prev = duels[i - 1]
        expect([prev.a, prev.b]).not.toContain(d.a)
        expect([prev.a, prev.b]).not.toContain(d.b)
      }
    })
  }
})

test('Aufgaben wiederholen sich erst, wenn alle dran waren, und Kategorien wechseln', () => {
  const { duels } = play(8, 5)
  const total = Object.keys(TASKS).length
  expect(new Set(duels.slice(0, total).map((d) => d.taskId)).size).toBe(total)
  const repeats = duels.slice(1, total).filter((d, i) => TASKS[d.taskId].category === TASKS[duels[i].taskId].category)
  expect(repeats.length).toBeLessThanOrEqual(3)
})

test('neue Paarungen werden bevorzugt, solange alle gleich oft spielen', () => {
  for (const seed of [1, 2, 3, 11, 99]) {
    const { duels } = play(8, seed, 45)
    const pairs = duels.map((d) => [d.a, d.b].sort().join('-'))
    expect(pairs.length - new Set(pairs).size).toBeLessThanOrEqual(1)
  }
})

test('Punkte inkl. Unentschieden und Rückgängig', () => {
  let game = start(6, 3)
  const first = game.duels[0]
  game = reducer(game, { type: 'result', result: 'both' })
  const second = game.duels[1]
  game = reducer(game, { type: 'result', result: 'b' })
  const points = (g: Game, id: string) => ranking(g.players, g.duels).find((r) => r.player.id === id)!.points
  expect(points(game, first.a)).toBe(1)
  expect(points(game, first.b)).toBe(1)
  expect(points(game, second.b)).toBe(1)
  expect(points(game, second.a)).toBe(0)

  const pending = game.duels[2]
  game = reducer(game, { type: 'undo' })
  expect(game.duels).toHaveLength(2)
  expect(game.duels[1]).toEqual({ ...second, result: null })
  expect(points(game, second.b)).toBe(0)
  game = reducer(game, { type: 'result', result: 'a' })
  expect(game.duels[2]).toEqual(pending)
  expect(points(game, second.a)).toBe(1)
})

test('Rückgängig holt das Spiel aus dem Finale zurück', () => {
  const finale = play(6, 1, 30)
  expect(finale.phase).toBe('finale')
  const back = reducer(finale, { type: 'undo' })
  expect(back.phase).toBe('duels')
  expect(back.duels.at(-1)!.result).toBeNull()
  expect(back.duels).toHaveLength(finale.duels.length)
})

test('Gleichstand teilt den Platz', () => {
  const duel = (a: string, b: string, result: Duel['result']): Duel => ({
    id: a + b,
    taskId: 'pingpong',
    a,
    b,
    result,
    contentIndex: 0,
  })
  const rows = ranking(makePlayers(5), [duel('p0', 'p1', 'a'), duel('p0', 'p2', 'a'), duel('p3', 'p4', 'both')])
  expect(rows.map((r) => r.rank)).toEqual([1, 2, 2, 4, 4])
  expect(playersAtPlace(rows, 3).map((p) => p.id)).toEqual(['p3', 'p4'])
  expect(playersAtPlace(rows, 99).map((p) => p.id)).toEqual(['p1', 'p2'])
})

test('Bonus-Ereignis nach jedem 4. Duell, andere Aufgabe wechselt die Aufgabe', () => {
  let game = start(6, 8)
  const before = game.duels[0].taskId
  game = reducer(game, { type: 'reroll' })
  expect(game.duels[0].taskId).not.toBe(before)
  for (let i = 0; i < 3; i++) game = reducer(game, { type: 'result', result: 'a' })
  expect(bonusDue(game)).toBe(false)
  game = reducer(game, { type: 'result', result: 'a' })
  expect(bonusDue(game)).toBe(true)
  game = reducer(game, { type: 'bonusDone' })
  expect(bonusDue(game)).toBe(false)
})
