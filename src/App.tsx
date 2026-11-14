import { BrowserRouter, Route, Routes } from 'react-router'
import { useGame } from './game/useGame'
import { Duell } from './screens/Duell'
import { Geheim } from './screens/Geheim'
import { Karten } from './screens/Karten'
import { Setup } from './screens/Setup'
import { Button } from './ui/Button'

function Organizer() {
  const [game, dispatch] = useGame()
  if (game.phase === 'setup') return <Setup game={game} dispatch={dispatch} />
  if (game.phase === 'cards') return <Karten game={game} dispatch={dispatch} />
  if (game.phase === 'duels') return <Duell game={game} dispatch={dispatch} />
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <p className="text-2xl">Phase „{game.phase}“ folgt im nächsten Schritt.</p>
      <Button onClick={() => dispatch({ type: 'reset' })}>Neues Spiel</Button>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Organizer />} />
        <Route path="/geheim" element={<Geheim />} />
      </Routes>
    </BrowserRouter>
  )
}
