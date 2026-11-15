import { useState } from 'react'
import { Button } from '../ui/Button'
import { DuellShell, duelNames, type DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'
import { formatClock, useStopwatch } from '../ui/useStopwatch'

export function Stoppuhr(props: DuellProps) {
  const { a, b } = duelNames(props.game)
  const watch = useStopwatch()
  const [times, setTimes] = useState<number[]>([])
  const names = [a, b]
  const finished = times.length === 2

  const act = () => {
    if (watch.running) {
      setTimes([...times, watch.elapsedMs])
      watch.reset()
    } else {
      if (finished) setTimes([])
      watch.start()
    }
  }
  useHotkeys({ ' ': act })

  return (
    <DuellShell
      {...props}
      tag="Stoppuhr"
      action={<Button onClick={act}>{watch.running ? 'Stopp' : finished ? 'Neu starten' : 'Start'}</Button>}
    >
      <div className="flex w-full flex-col items-center justify-center gap-2.5 rounded-[28px] bg-surface p-7 text-center">
        <span className="text-[17px] font-semibold text-muted">
          {finished ? 'Beide Zeiten stehen' : `${names[times.length]} ${watch.running ? 'läuft' : 'ist dran'}`}
        </span>
        <span className="font-display text-[clamp(3.5rem,16vw,11rem)] leading-none font-extrabold text-gold tabular-nums">
          {formatClock(finished ? times[1] : watch.elapsedMs, true)}
        </span>
        {times.map((time, i) => (
          <span key={i} className="text-[17px] font-semibold text-muted">
            Zeit von {names[i]}: {formatClock(time, true)}
          </span>
        ))}
      </div>
    </DuellShell>
  )
}
