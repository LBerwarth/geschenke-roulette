import { useState, type Dispatch } from 'react'
import { CATEGORY_LABEL, TASKS, TASK_IDS, type Category, type TaskId } from '../content/tasks'
import { duelCount } from '../game/draw'
import type { Action } from '../game/reducer'
import type { Game, Settings } from '../game/types'
import { Button } from '../ui/Button'

const MIN_PLAYERS = 3

const RULES = [
  { key: 'durationMin', label: 'Spieldauer', hint: 'App plant die Duelle danach', options: [30, 45, 60, 90], unit: ' Min' },
  { key: 'stealLimit', label: 'Klau-Limit pro Geschenk', hint: 'Ein Strich pro Klau aufs Papier', options: [2, 3, 4, 5], unit: '×' },
  { key: 'finaleMin', label: 'Chaos-Runde zur Halbzeit', hint: 'Alle 20 s ein neues Ereignis', options: [1, 2, 3], unit: ' Min' },
] as const

type Props = { game: Game; dispatch: Dispatch<Action>; onAbout: () => void }

export function Setup({ game, dispatch, onAbout }: Props) {
  const [names, setNames] = useState(() => (game.players.length ? game.players.map((p) => p.name) : ['', '', '', '']))
  const [settings, setSettings] = useState<Settings>({ ...game.settings, finaleMin: Math.min(3, game.settings.finaleMin) })

  const players = names.map((n) => n.trim()).filter(Boolean)
  const ready = players.length >= MIN_PLAYERS && settings.enabledTasks.length >= 2
  const setName = (i: number, name: string) => setNames(names.map((n, j) => (j === i ? name : n)))
  const toggleTask = (id: TaskId) =>
    setSettings({
      ...settings,
      enabledTasks: TASK_IDS.filter((t) => (t === id) !== settings.enabledTasks.includes(t)),
    })

  const start = () =>
    dispatch({
      type: 'start',
      players: players.map((name, i) => ({ id: `p${i}`, name })),
      settings,
      seed: Math.floor(Math.random() * 2 ** 32),
    })

  return (
    <main className="flex min-h-screen flex-col gap-8 px-14 py-12">
      <header className="flex flex-col gap-1.5">
        <span className="flex flex-wrap items-center justify-between gap-4 text-base font-semibold tracking-[0.12em] text-muted uppercase">
          Spieler &amp; Regeln
          <Button onClick={onAbout} className="min-h-11 rounded-full px-4.5 text-[15px] tracking-normal normal-case">
            Worum geht es?
          </Button>
        </span>
        <h1 className="font-display text-[56px] leading-none font-extrabold">Geschenke-Roulette</h1>
      </header>
      <div className="flex grow flex-wrap gap-8">
        <section className="flex min-w-80 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[22px] font-semibold">Spieler</h2>
            <span className="text-base text-muted">
              {players.length} Spieler · Namen braucht die App nur für die Duelle
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {names.map((name, i) => (
              <div key={i} className="flex h-14 items-center gap-3 rounded-[14px] bg-surface px-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-line text-lg font-semibold">
                  {name.trim()[0]?.toUpperCase() ?? i + 1}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(i, e.target.value)}
                  aria-label={`Name Spieler ${i + 1}`}
                  placeholder={`Spieler ${i + 1}`}
                  maxLength={16}
                  className="h-11 min-w-0 grow bg-transparent text-xl font-medium placeholder:text-muted/60"
                />
                <button
                  type="button"
                  onClick={() => setNames(names.filter((_, j) => j !== i))}
                  aria-label={`Spieler ${i + 1} entfernen`}
                  className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setNames([...names, ''])}
            className="flex h-12 cursor-pointer items-center gap-2.5 self-start rounded-xl border-2 border-dashed border-[#4A7A5E] px-5 text-[17px] font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Spieler hinzufügen
          </button>

          <h2 className="mt-4 text-[22px] font-semibold">Aufgaben</h2>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((category) => (
            <div key={category} className="flex flex-wrap items-center gap-2">
              <span className="w-40 text-base text-muted">{CATEGORY_LABEL[category]}</span>
              {TASK_IDS.filter((id) => TASKS[id].category === category).map((id) => {
                const on = settings.enabledTasks.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTask(id)}
                    className={`h-11 cursor-pointer rounded-full border-2 px-4 text-base font-semibold ${on ? 'border-gold bg-gold text-ink' : 'border-line text-muted'}`}
                  >
                    {TASKS[id].title}
                  </button>
                )
              })}
            </div>
          ))}
        </section>

        <section className="flex w-100 shrink-0 flex-col gap-5 rounded-[20px] bg-surface p-7">
          <h2 className="text-[22px] font-semibold">Regeln</h2>
          {RULES.map((rule) => (
            <label key={rule.key} className="flex items-center justify-between gap-3">
              <span className="flex flex-col gap-0.5">
                <span className="text-lg font-medium">{rule.label}</span>
                <span className="text-sm text-muted">{rule.hint}</span>
              </span>
              <select
                value={settings[rule.key]}
                onChange={(e) => setSettings({ ...settings, [rule.key]: Number(e.target.value) })}
                className="h-11 min-w-22 cursor-pointer rounded-[10px] bg-bg px-3 text-lg font-semibold text-gold"
              >
                {rule.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                    {rule.unit}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="grow" />
          <p className="text-sm leading-normal text-muted">
            Ablauf: 1 Verteilen · 2 ca. {duelCount(settings.durationMin)} Duelle (Gewinner klaut), Chaos-Runde zur
            Halbzeit · 3 Wunschrunde der Besten · erst danach auspacken
          </p>
          {!ready && <p className="text-sm text-muted">Mindestens {MIN_PLAYERS} Spieler und 2 Aufgaben nötig.</p>}
          <Button variant="gold" disabled={!ready} onClick={start} className="h-16 font-display text-2xl font-extrabold">
            Spiel starten
          </Button>
        </section>
      </div>
    </main>
  )
}
