import { expect, test } from 'vitest'
import { SECRET_DECKS, secretSequence } from '../content/geheim'
import { TASKS } from '../content/tasks'
import { duelCount, groupSize } from './draw'
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

const win = (game: Game, ...indexes: number[]) =>
  reducer(game, { type: 'result', winners: indexes.map((i) => game.duels.at(-1)!.players[i]) })

function play(n: number, seed: number, durationMin = 90): Game {
  let game = start(n, seed, durationMin)
  while (game.phase === 'duels' || game.phase === 'finale')
    game = game.phase === 'finale' ? reducer(game, { type: 'chaosDone' }) : win(game, 0)
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

test('Handy und Organisator erzeugen aus dem Startwert dieselbe Begriffsfolge', () => {
  expect(SECRET_DECKS.tabu).toHaveLength(100)
  expect(SECRET_DECKS.silbe).toHaveLength(40)
  expect(SECRET_DECKS.tabu.every((t) => t.forbidden?.length === 3)).toBe(true)
  for (const deck of ['tabu', 'silbe'] as const) {
    expect(secretSequence(deck, 2024)).toEqual(secretSequence(deck, 2024))
    expect(secretSequence(deck, 2024)).not.toEqual(secretSequence(deck, 2025))
    expect(new Set(secretSequence(deck, 2024)).size).toBe(SECRET_DECKS[deck].length)
  }
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
  let worst = 0
  for (const seed of [1, 2, 3, 99]) {
    const { duels, players } = play(n, seed)
    expect(duels).toHaveLength(duelCount(90))
    duels.forEach((d, i) => {
      expect(new Set(d.players).size).toBe(groupSize(d.taskId))
      const plays = players.map((p) => duels.slice(0, i + 1).filter((x) => x.players.includes(p.id)).length)
      worst = Math.max(worst, Math.max(...plays) - Math.min(...plays))
      const prev = duels[i - 1]
      if (prev && n - prev.players.length >= d.players.length) {
        expect(d.players.filter((id) => prev.players.includes(id))).toEqual([])
      }
    })
  }
  expect(worst).toBeLessThanOrEqual(n >= 6 ? 1 : 2)
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
    const pairs = duels.filter((d) => d.players.length === 2).map((d) => [...d.players].sort().join('-'))
    expect(pairs.length - new Set(pairs).size).toBeLessThanOrEqual(1)
  }
})

test('Punkte inkl. Unentschieden und Rückgängig', () => {
  let game = start(6, 3)
  const first = game.duels[0]
  game = win(game, 0, 1)
  const second = game.duels[1]
  game = win(game, 1)
  const points = (g: Game, id: string) => ranking(g.players, g.duels).find((r) => r.player.id === id)!.points
  expect(points(game, first.players[0])).toBe(1)
  expect(points(game, first.players[1])).toBe(1)
  expect(points(game, second.players[1])).toBe(1)
  expect(points(game, second.players[0])).toBe(0)

  const pending = game.duels[2]
  game = reducer(game, { type: 'undo' })
  expect(game.duels).toHaveLength(2)
  expect(game.duels[1]).toEqual({ ...second, winners: null })
  expect(points(game, second.players[1])).toBe(0)
  game = win(game, 0)
  expect(game.duels[2]).toEqual(pending)
  expect(points(game, second.players[0])).toBe(1)
})

test('Chaos-Runde zur Halbzeit, Wunschrunde am Ende, Rückgängig holt zurück', () => {
  const finale = play(6, 1, 30)
  expect(finale.phase).toBe('wish')
  expect(finale.chaosDone).toBe(true)
  let half = start(6, 1, 30)
  for (let i = 0; i < 3; i++) half = win(half, 0)
  expect(half.phase).toBe('finale')
  expect(half.duels).toHaveLength(4)
  const back = reducer(finale, { type: 'undo' })
  expect(back.phase).toBe('duels')
  expect(back.duels.at(-1)!.winners).toBeNull()
  expect(back.duels).toHaveLength(finale.duels.length)
})

test('Gleichstand teilt den Platz', () => {
  const duel = (players: string[], winners: string[]): Duel => ({
    id: players.join(),
    taskId: 'pingpong',
    players,
    winners,
    contentIndex: 0,
  })
  const rows = ranking(makePlayers(5), [duel(['p0', 'p1'], ['p0']), duel(['p0', 'p2'], ['p0']), duel(['p3', 'p4'], ['p3', 'p4'])])
  expect(rows.map((r) => r.rank)).toEqual([1, 2, 2, 4, 4])
  expect(playersAtPlace(rows, 3).map((p) => p.id)).toEqual(['p3', 'p4'])
  expect(playersAtPlace(rows, 99).map((p) => p.id)).toEqual(['p1', 'p2'])
})

test('Handy-Aufgaben losen drei Spieler aus', () => {
  const { duels } = play(8, 5)
  const tabu = duels.find((d) => d.taskId === 'tabu')!
  expect(tabu.players).toHaveLength(3)
  expect(duels.find((d) => d.taskId === 'pingpong')!.players).toHaveLength(2)
})

test('Bonus-Ereignis nach jedem 4. Duell, andere Aufgabe wechselt die Aufgabe', () => {
  let game = start(6, 8)
  const before = game.duels[0].taskId
  game = reducer(game, { type: 'reroll' })
  expect(game.duels[0].taskId).not.toBe(before)
  expect(game.duels[0].players).toHaveLength(groupSize(game.duels[0].taskId))
  for (let i = 0; i < 3; i++) game = win(game, 0)
  expect(bonusDue(game)).toBe(false)
  game = win(game, 0)
  expect(bonusDue(game)).toBe(true)
  game = reducer(game, { type: 'bonusDone' })
  expect(bonusDue(game)).toBe(false)
})
