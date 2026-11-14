import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { bonusDue } from './game/reducer'
import { useGame } from './game/useGame'
import { Bestenliste } from './screens/Bestenliste'
import { Chaos } from './screens/Chaos'
import { Duell } from './screens/Duell'
import { Ende } from './screens/Ende'
import { Geheim } from './screens/Geheim'
import { Intro } from './screens/Intro'
import { Karten } from './screens/Karten'
import { Setup } from './screens/Setup'
import { Wunsch } from './screens/Wunsch'

const INTRO_SEEN = 'geschenke-roulette-intro'

function readFlag(key: string) {
  try {
    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // ohne Speicher erscheint die Einführung beim nächsten Besuch erneut
  }
}

function Organizer() {
  const [game, dispatch] = useGame()
  const [intro, setIntro] = useState(() => game.phase === 'setup' && !readFlag(INTRO_SEEN))
  const props = { game, dispatch }
  const closeIntro = () => {
    writeFlag(INTRO_SEEN)
    setIntro(false)
  }
  if (intro) return <Intro onDone={closeIntro} />
  if (game.phase === 'setup') return <Setup {...props} onAbout={() => setIntro(true)} />
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
