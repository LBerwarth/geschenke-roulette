import { useState } from 'react'
import {
  GEWICHT_PAECKCHEN,
  PINGPONG_KATEGORIEN,
  RUECKWAERTS_WOERTER,
  SCHAETZFRAGEN,
  WORTKETTE_STARTWOERTER,
} from '../content/anzeige'
import type { TaskId } from '../content/tasks'
import { Button } from '../ui/Button'
import { DuellShell, duelNames, type DuellProps } from '../ui/DuellShell'
import { useHotkeys } from '../ui/useHotkeys'

type Config = { eyebrow: string; items: string[]; note: (item: string) => string; next?: string; solution?: boolean }

const CONFIG: Partial<Record<TaskId, Config>> = {
  pingpong: {
    eyebrow: 'Kategorie',
    items: PINGPONG_KATEGORIEN,
    note: () => 'Die App zeigt nur die Kategorie, alles andere passiert im Raum.',
    next: 'Neue Kategorie',
  },
  wortkette: {
    eyebrow: 'Startwort',
    items: WORTKETTE_STARTWOERTER,
    note: (word) => `Weiter geht es mit ${word.at(-1)!.toUpperCase()} …`,
    next: 'Neues Startwort',
  },
  rueckwaerts: {
    eyebrow: 'Das Wort',
    items: RUECKWAERTS_WOERTER,
    note: () => 'Die Lösung erscheint erst auf Knopfdruck.',
    solution: true,
  },
  zahlen: {
    eyebrow: 'Frage',
    items: SCHAETZFRAGEN,
    note: () => 'Die App speichert keine Tipps, die merkt sich der Raum.',
    next: 'Andere Frage',
  },
  gewicht: {
    eyebrow: 'Gewogen wird',
    items: GEWICHT_PAECKCHEN,
    note: () => 'Die App wählt nur aus, welches. Gewogen wird echt.',
    next: 'Anderes Päckchen',
  },
}

export function Anzeige({ game, dispatch }: DuellProps) {
  const { duel, a, b } = duelNames(game)
  const config = CONFIG[duel.taskId]!
  const [solved, setSolved] = useState(false)
  const item = config.items[duel.contentIndex % config.items.length].replace('{a}', a).replace('{b}', b)
  const act = config.solution ? () => setSolved(!solved) : () => dispatch({ type: 'newContent' })
  useHotkeys({ ' ': act })

  return (
    <DuellShell
      game={game}
      dispatch={dispatch}
      tag="Nur Anzeige"
      action={<Button onClick={act}>{config.solution ? (solved ? 'Lösung verbergen' : 'Lösung zeigen') : config.next}</Button>}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 rounded-[28px] bg-cream px-10 py-8 text-ink">
        <span className="text-base font-semibold tracking-[0.12em] text-eyebrow uppercase">{config.eyebrow}</span>
        <span className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-extrabold">{item}</span>
        {solved ? (
          <span className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight font-extrabold tracking-[0.2em] text-eyebrow">
            {[...item.toUpperCase()].reverse().join(' ')}
          </span>
        ) : (
          <p className="text-xl leading-snug text-ink-soft">{config.note(item)}</p>
        )}
      </div>
    </DuellShell>
  )
}
