import { Button } from '../ui/Button'
import { useHotkeys } from '../ui/useHotkeys'

const STEPS = [
  { title: 'Verteilen', text: 'Reihum zieht jede Person eine Ereigniskarte, bis alle ein Geschenk haben.' },
  {
    title: 'Duelle',
    text: 'Die App lost Spieler und kleine Aufgaben aus. Wer gewinnt, darf klauen. Zur Halbzeit mischt eine kurze Chaos-Runde alles durch.',
  },
  { title: 'Wunschrunde', text: 'Die Besten wählen zum Schluss ihr Wunschgeschenk. Erst danach wird ausgepackt.' },
]

export function Intro({ onDone }: { onDone: () => void }) {
  useHotkeys({ ' ': onDone, enter: onDone })
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-8 px-5 py-6 md:px-14 md:py-12">
      <header className="flex flex-col gap-3">
        <span className="text-base font-semibold tracking-[0.12em] text-muted uppercase">Willkommen</span>
        <h1 className="font-display text-[clamp(3rem,7vw,5rem)] leading-none font-extrabold">Geschenke-Roulette</h1>
        <p className="max-w-225 text-2xl leading-snug">
          Ein Geschenke-Spiel für Weihnachten mit Familie oder Freunden. Alle bringen ein verpacktes Geschenk mit – und
          statt sie einfach zu verteilen, wird darum gespielt: gezogen, geklaut, getauscht und gehandelt.
        </p>
        <p className="max-w-225 text-xl leading-snug text-muted">
          Wer am Ende welches Geschenk hat, ist halb so wichtig. Es geht um einen schönen gemeinsamen Abend, an dem alle
          mitmachen und viel gelacht wird.
        </p>
      </header>
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-2 rounded-3xl bg-surface p-7">
            <span className="font-display text-4xl font-extrabold text-gold">{i + 1}</span>
            <h2 className="font-display text-3xl font-extrabold">{step.title}</h2>
            <p className="text-lg leading-snug text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="max-w-225 text-lg leading-snug text-muted">
        Die App läuft auf dem Fernseher und zeigt nur an, gespielt wird im Raum. Eine Person bedient sie, alle anderen
        brauchen nichts. Namen und Spielstand bleiben auf diesem Gerät.
      </p>
      <Button variant="gold" onClick={onDone} className="h-16 self-start font-display text-2xl font-extrabold">
        Verstanden – Spiel einrichten
      </Button>
    </main>
  )
}
