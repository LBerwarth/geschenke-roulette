import { useState, type Dispatch } from 'react'
import { CATEGORY_LABEL, TASKS, TASK_IDS, type Category, type TaskId } from '../content/tasks'
import { MATERIAL } from '../content/vorbereitung'
import { duelCount } from '../game/draw'
import type { Action } from '../game/reducer'
import type { Game, Settings } from '../game/types'
import { Button } from '../ui/Button'

const MIN_PLAYERS = 3

const RULES = [
  { key: 'durationMin', label: 'Spieldauer', hint: 'Ungefähr, ohne Auspacken', options: [30, 45, 60, 90], unit: ' Min' },
  { key: 'stealLimit', label: 'Klau-Limit pro Geschenk', hint: 'So oft darf ein Geschenk geklaut werden', options: [2, 3, 4, 5], unit: '×' },
  { key: 'finaleMin', label: 'Chaos-Runde zur Halbzeit', hint: 'Alle 20 s ein Ereignis für alle', options: [1, 2, 3], unit: ' Min' },
] as const

type Props = { game: Game; dispatch: Dispatch<Action>; onAbout: () => void }

export function Setup({ game, dispatch, onAbout }: Props) {
  const [names, setNames] = useState(() => (game.players.length ? game.players.map((p) => p.name) : ['', '', '', '']))
  const [settings, setSettings] = useState<Settings>({ ...game.settings, finaleMin: Math.min(3, game.settings.finaleMin) })

  const players = names.map((n) => n.trim()).filter(Boolean)
  const ready = players.length >= MIN_PLAYERS && settings.enabledTasks.length >= 2
  const setName = (i: number, name: string) => setNames(names.map((n, j) => (j === i ? name : n)))
  const enabled = (id: TaskId) => settings.enabledTasks.includes(id)
  const setTasks = (ids: TaskId[], on: boolean) =>
    setSettings({ ...settings, enabledTasks: TASK_IDS.filter((t) => (ids.includes(t) ? on : enabled(t))) })

  const ruleSelect = (rule: (typeof RULES)[number]) => (
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
  )

  const start = () =>
    dispatch({
      type: 'start',
      players: players.map((name, i) => ({ id: `p${i}`, name })),
      settings,
      seed: Math.floor(Math.random() * 2 ** 32),
    })

  return (
    <main className="flex min-h-dvh flex-col gap-8 px-5 py-6 md:px-14 md:py-12">
      <header className="flex flex-col gap-1.5">
        <span className="flex flex-wrap items-center justify-between gap-4 text-base font-semibold tracking-[0.12em] text-muted uppercase">
          Spiel einrichten
          <Button onClick={onAbout} className="min-h-11 rounded-full px-4.5 text-[15px] tracking-normal normal-case">
            Worum geht es?
          </Button>
        </span>
        <h1 className="font-display text-[clamp(2.25rem,8vw,3.5rem)] leading-none font-extrabold">Geschenke-Roulette</h1>
      </header>
      <div className="flex grow flex-wrap gap-8">
        <section className="flex min-w-80 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[22px] font-semibold">Spieler</h2>
            <span className="text-base text-muted">
              {players.length} eingetragen · alle, die ein Geschenk mitbringen
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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


          <h2 className="mt-4 text-[22px] font-semibold">Was hast du da?</h2>
          <p className="text-base text-muted">
            Nimm den Haken weg, wenn dir etwas fehlt. Die App lässt die passenden Spiele dann weg. Welche Spiele kommen,
            bleibt auch für dich eine Überraschung.
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {MATERIAL.map((m) => (
              <li key={m.text}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-lg">
                  {m.tasks.length ? (
                    <input
                      type="checkbox"
                      checked={m.tasks.some(enabled)}
                      onChange={(e) => setTasks(m.tasks, e.target.checked)}
                      className="size-5.5 shrink-0 accent-gold"
                    />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gold" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                  <span>
                    {m.text}
                    {!m.tasks.length && <span className="block text-sm text-muted">brauchst du auf jeden Fall</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <details className="mt-4 rounded-2xl border-2 border-line px-5 py-3">
            <summary className="min-h-11 cursor-pointer py-2 text-lg font-semibold">
              Für Kenner: Regeln und Spiele einzeln einstellen (verrät die Überraschung)
            </summary>
            <div className="flex flex-col gap-4 pt-3 pb-2">
              {RULES.slice(1).map(ruleSelect)}
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((category) => (
                <div key={category} className="flex flex-wrap items-center gap-2">
                  <span className="w-full text-base text-muted md:w-40">{CATEGORY_LABEL[category]}</span>
                  {TASK_IDS.filter((id) => TASKS[id].category === category).map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={enabled(id)}
                      onClick={() => setTasks([id], !enabled(id))}
                      className={`h-11 cursor-pointer rounded-full border-2 px-4 text-base font-semibold ${enabled(id) ? 'border-gold bg-gold text-ink' : 'border-line text-muted'}`}
                    >
                      {TASKS[id].title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </details>
        </section>

        <section className="flex w-full flex-col gap-5 self-start rounded-[20px] bg-surface p-5 md:w-100 md:shrink-0 md:p-7">
          <h2 className="text-[22px] font-semibold">Wie lange wollt ihr spielen?</h2>
          {ruleSelect(RULES[0])}
          <p className="text-base leading-normal text-muted">
            Das ergibt etwa {duelCount(settings.durationMin)} Spielrunden. Die App führt euch Schritt für Schritt durch
            den Abend, du musst vorher nichts wissen.
          </p>
          {players.length < MIN_PLAYERS && <p className="text-base text-muted">Trag mindestens {MIN_PLAYERS} Namen ein.</p>}
          {settings.enabledTasks.length < 2 && (
            <p className="text-base text-muted">Dir fehlt zu viel Material. Setz bei mindestens einer Sache den Haken.</p>
          )}
          <Button variant="gold" disabled={!ready} onClick={start} className="h-16 font-display text-2xl font-extrabold">
            Spiel starten
          </Button>
        </section>
      </div>
    </main>
  )
}
