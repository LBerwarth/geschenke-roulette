import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { DuellShell, type DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'

type Signal = { state: 'idle' } | { state: 'waiting'; delayMs: number } | { state: 'go' }

const LOOK = {
  idle: { bg: 'bg-surface text-muted', text: 'Bereit?' },
  waiting: { bg: 'bg-red text-white', text: 'Warten …' },
  go: { bg: 'bg-green text-white', text: 'Los!' },
}

export function Startsignal({ rounds, ...props }: DuellProps & { rounds: number }) {
  const [signal, setSignal] = useState<Signal>({ state: 'idle' })
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (signal.state !== 'waiting') return
    const id = setTimeout(() => setSignal({ state: 'go' }), signal.delayMs)
    return () => clearTimeout(id)
  }, [signal])

  const act = () => {
    if (signal.state === 'waiting') return setSignal({ state: 'idle' })
    setRound(signal.state === 'idle' && round > 0 ? round : round + 1)
    setSignal({ state: 'waiting', delayMs: 2000 + Math.random() * 4000 })
  }
  useHotkeys({ ' ': act })

  const label =
    signal.state === 'waiting' ? 'Abbrechen (Frühstart)' : round === 0 ? 'Start' : rounds > 1 ? 'Nächste Runde' : 'Nochmal'

  return (
    <DuellShell {...props} tag="Startsignal" action={<Button onClick={act}>{label}</Button>}>
      <div className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-[28px] p-7 text-center ${LOOK[signal.state].bg}`}>
        {rounds > 1 && round > 0 && (
          <span className="text-[17px] font-semibold">
            Runde {round} · Best of {rounds}
          </span>
        )}
        <span role="status" className="font-display text-[clamp(2.75rem,14vw,9.5rem)] leading-none font-extrabold">
          {LOOK[signal.state].text}
        </span>
      </div>
    </DuellShell>
  )
}
