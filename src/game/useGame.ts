import { useEffect, useReducer } from 'react'
import { initialGame, reducer } from './reducer'
import type { Game } from './types'

const KEY = 'geschenke-roulette'

function load(): Game {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...initialGame, ...JSON.parse(raw) } : initialGame
  } catch {
    return initialGame
  }
}

export function useGame() {
  const [game, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(game))
    } catch {
      // Speicher gesperrt (privater Modus): Spiel läuft ohne Sicherung weiter
    }
  }, [game])
  return [game, dispatch] as const
}
