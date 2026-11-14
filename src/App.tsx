import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { bonusDue } from './game/reducer'
import { useGame } from './game/useGame'
import { Bestenliste } from './screens/Bestenliste'
import { Chaos } from './screens/Chaos'
import { Duell } from './screens/Duell'
import { Ende } from './screens/Ende'
import { Geheim } from './screens/Geheim'
import { Karten } from './screens/Karten'
import { Setup } from './screens/Setup'
import { Wunsch } from './screens/Wunsch'

function Organizer() {
  const [game, dispatch] = useGame()
  const props = { game, dispatch }
  if (game.phase === 'setup') return <Setup {...props} />
  if (game.phase === 'cards') return <Karten {...props} />
  if (game.phase === 'end') return <Ende {...props} />
  if (bonusDue(game)) return <Bestenliste {...props} />
  if (game.phase === 'duels') return <Duell {...props} />
  if (game.phase === 'wish') return <Wunsch {...props} />
  return <Chaos {...props} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Organizer />} />
        <Route path="/geheim" element={<Geheim />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}
