import { useEffect } from 'react'
import { Button } from '../ui/Button'
import { DuellShell, type DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'
import { beep, formatClock, useStopwatch } from '../ui/useStopwatch'

type Props = DuellProps & { seconds: number; countUp?: boolean }

export function Timer({ seconds, countUp, ...props }: Props) {
  const watch = useStopwatch()
  const remaining = seconds * 1000 - watch.elapsedMs
  const done = !countUp && remaining <= 0
  const { running, stop } = watch

  useEffect(() => {
    if (!done || !running) return
    stop()
    beep()
  }, [done, running, stop])

  const fresh = watch.elapsedMs === 0
  const act = running ? watch.stop : fresh ? watch.start : watch.reset
  useHotkeys({ ' ': act })

  return (
    <DuellShell
      {...props}
      tag={countUp ? 'Timer für die Zuschauer' : 'Timer'}
      action={<Button onClick={act}>{running ? 'Stopp' : fresh ? 'Start' : 'Zurücksetzen'}</Button>}
    >
      <div
        className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-[28px] p-7 text-center ${done ? 'bg-red text-white' : 'bg-surface'}`}
      >
        <span className={`text-[17px] font-semibold ${done ? '' : 'text-muted'}`}>
          {countUp ? 'Nur die Zuschauer schauen hin' : done ? 'Zeit um!' : 'Restzeit'}
        </span>
        <span
          aria-live="off"
          className={`font-display text-[clamp(6rem,18vw,12.5rem)] leading-none font-extrabold tabular-nums ${done ? '' : 'text-gold'}`}
        >
          {formatClock(countUp ? watch.elapsedMs : Math.ceil(Math.max(0, remaining) / 1000) * 1000)}
        </span>
        {countUp && <span className="text-[17px] font-semibold text-muted">Ziel: {seconds} Sekunden</span>}
      </div>
    </DuellShell>
  )
}
