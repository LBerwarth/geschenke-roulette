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
import { Button } from './ui/Button'

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
  if (game.phase === 'end') return <Ende {...props} />
  return (
    <div className="flex min-h-dvh flex-col [&>main]:min-h-0 [&>main]:grow">
      {game.phase === 'cards' ? (
        <Karten {...props} />
      ) : bonusDue(game) ? (
        <Bestenliste {...props} />
      ) : game.phase === 'duels' ? (
        <Duell {...props} />
      ) : game.phase === 'wish' ? (
        <Wunsch {...props} />
      ) : (
        <Chaos {...props} />
      )}
      <Abbruch onAbort={() => dispatch({ type: 'reset' })} />
    </div>
  )
}

function Abbruch({ onAbort }: { onAbort: () => void }) {
  const [asking, setAsking] = useState(false)
  const small = 'min-h-11 rounded-full px-4.5 text-[15px]'
  return (
    <footer className="flex flex-wrap items-center justify-end gap-3 px-5 pb-5 md:px-14">
      {asking ? (
        <>
          <span role="alert" className="text-[15px] text-muted">
            Spiel wirklich abbrechen? Punkte und Spielstand gehen verloren, Namen und Regeln bleiben.
          </span>
          <Button variant="white" className={small} onClick={onAbort}>
            Ja, abbrechen
          </Button>
          <Button className={small} onClick={() => setAsking(false)}>
            Weiterspielen
          </Button>
        </>
      ) : (
        <Button className={`${small} border-transparent text-muted`} onClick={() => setAsking(true)}>
          Spiel abbrechen
        </Button>
      )}
    </footer>
  )
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
