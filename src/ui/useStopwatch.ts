import { useEffect, useState } from 'react'

export function useStopwatch() {
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [base, setBase] = useState(0)
  const [now, setNow] = useState(0)
  const running = startedAt !== null

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(performance.now()), 50)
    return () => clearInterval(id)
  }, [running])

  const elapsedMs = base + (running ? Math.max(0, now - startedAt) : 0)
  const start = () => {
    const t = performance.now()
    setNow(t)
    setStartedAt(t)
  }
  const stop = () => {
    if (!running) return
    setBase(base + performance.now() - startedAt)
    setStartedAt(null)
  }
  const reset = () => {
    setBase(0)
    setStartedAt(null)
  }
  return { elapsedMs, running, start, stop, reset }
}

export function formatClock(ms: number, tenths = false) {
  const total = Math.max(0, ms)
  const minutes = Math.floor(total / 60000)
  const seconds = Math.floor(total / 1000) % 60
  const clock = `${minutes}:${String(seconds).padStart(2, '0')}`
  return tenths ? `${clock},${Math.floor(total / 100) % 10}` : clock
}

export function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    osc.frequency.value = 880
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
    osc.onended = () => ctx.close()
  } catch {
    // ohne Ton weiter, die Anzeige reicht
  }
}
