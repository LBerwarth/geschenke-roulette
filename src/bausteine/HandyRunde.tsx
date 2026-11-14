import { useEffect, useState } from 'react'
import { subSeed } from '../game/rng'
import { Button } from '../ui/Button'
import { DuellShell, duelNames, type DuellProps } from '../ui/DuellShell'
import { QrCode } from '../ui/QrCode'
import { useHotkeys } from '../ui/useHotkeys'
import { beep, formatClock, useStopwatch } from '../ui/useStopwatch'

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)

export function HandyRunde({ seconds, ...props }: DuellProps & { seconds: number }) {
  const { game } = props
  const { duel, a, b } = duelNames(game)
  const [round, setRound] = useState(0)
  const watch = useStopwatch()
  const remaining = seconds * 1000 - watch.elapsedMs
  const done = remaining <= 0
  const { running, stop } = watch

  useEffect(() => {
    if (!done || !running) return
    stop()
    beep()
  }, [done, running, stop])

  const explainer = [a, b][round % 2]
  const seed = subSeed(game.seed, game.duels.length * 1000 + round)
  const url = `${location.origin}/geheim?deck=${duel.taskId}&seed=${seed}`
  const nextRound = () => {
    setRound(round + 1)
    watch.reset()
  }
  const act = running ? watch.stop : done ? nextRound : watch.start
  const label = running ? 'Pause' : done ? `Weiter: ${[a, b][(round + 1) % 2]} erklärt` : watch.elapsedMs ? 'Weiter' : 'Start'
  useHotkeys({ ' ': act })

  return (
    <DuellShell {...props} tag="Fernseher · Begriff nur am Handy" action={<Button onClick={act}>{label}</Button>}>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 rounded-[28px] bg-surface px-10 py-8">
        <span className="text-base font-semibold tracking-[0.12em] text-gold uppercase">
          {explainer} erklärt · Runde {round + 1}
        </span>
        <span className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none font-extrabold">
          {done ? 'Zeit um!' : 'Ratet mit!'}
        </span>
        <p className="max-w-150 text-xl leading-snug text-muted">
          {done
            ? `${explainer} hält das Handy hoch und nennt die Treffer.`
            : `Den Begriff sieht nur ${explainer} auf dem Handy. Wer richtig rät, ruft es laut. Treffer zählt das Handy.`}
        </p>
        <span className="font-display text-[clamp(4rem,10vw,7.5rem)] leading-none font-extrabold text-gold tabular-nums">
          {formatClock(Math.ceil(Math.max(0, remaining) / 1000) * 1000)}
        </span>
        <p className="text-base text-muted">
          Am Ende nennen beide ihre Treffer vom Handy · der Organisator trägt den Sieger ein
        </p>
      </div>
      <div className="flex w-90 shrink-0 flex-col items-center justify-center gap-3 rounded-[28px] bg-cream p-6 text-center text-ink">
        <span className="text-base font-semibold tracking-[0.12em] text-eyebrow uppercase">Nur für {explainer}</span>
        <QrCode value={url} className="w-full max-w-70 rounded-xl" />
        <span className="text-[15px] leading-snug text-ink-soft">
          Mit der Handy-Kamera scannen, dann am Handy „Los“ tippen, sobald hier die Zeit startet.
        </span>
        {isLocal && (
          <span className="text-[13px] leading-snug text-eyebrow">
            Lokale Adresse: Der Code funktioniert am Handy erst auf der veröffentlichten Seite.
          </span>
        )}
      </div>
    </DuellShell>
  )
}
