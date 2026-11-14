export type Category = 'wort' | 'schaetzen' | 'geschick'

export const CATEGORY_LABEL: Record<Category, string> = {
  wort: 'Wortduelle',
  schaetzen: 'Schätzen',
  geschick: 'Geschick & Tempo',
}

export type Baustein =
  | { kind: 'anzeige' }
  | { kind: 'timer'; seconds: number; countUp?: boolean }
  | { kind: 'stoppuhr' }
  | { kind: 'startsignal'; rounds: number }
  | { kind: 'handy'; seconds: number }
  | { kind: 'hoehertiefer' }

type TaskDef = { category: Category; title: string; rules: string; baustein: Baustein }

export const TASKS = {
  pingpong: {
    category: 'wort',
    title: 'Kategorie-Pingpong',
    rules:
      'Abwechselnd etwas aus der Kategorie nennen. Wer stockt oder etwas wiederholt, verliert. Die Zuschauer zählen laut bis 5.',
    baustein: { kind: 'anzeige' },
  },
  wortkette: {
    category: 'wort',
    title: 'Wortkette',
    rules:
      'Der letzte Buchstabe ist der Anfang des nächsten Worts. Wer stockt oder ein Wort wiederholt, verliert. Die Zuschauer zählen laut bis 5.',
    baustein: { kind: 'anzeige' },
  },
  tabu: {
    category: 'wort',
    title: 'Verbotenes Wort',
    rules:
      'Erkläre den Begriff, ohne die verbotenen Wörter zu sagen. Die anderen raten. Wer in 60 Sekunden mehr Begriffe durchbringt, gewinnt.',
    baustein: { kind: 'handy', seconds: 60 },
  },
  silbe: {
    category: 'wort',
    title: 'Ein Wort, eine Silbe',
    rules:
      'Erkläre den Begriff nur mit einsilbigen Wörtern. Ein mehrsilbiges Wort ist ein Fehler, die Zuschauer passen auf. Wer in 60 Sekunden mehr Begriffe durchbringt, gewinnt.',
    baustein: { kind: 'handy', seconds: 60 },
  },
  rueckwaerts: {
    category: 'wort',
    title: 'Rückwärts buchstabieren',
    rules:
      'Wer das Wort rückwärts buchstabieren kann, haut auf den Tisch und legt los. Ein Fehler, und die andere Seite ist dran.',
    baustein: { kind: 'anzeige' },
  },
  zahlen: {
    category: 'schaetzen',
    title: 'Zahlen schätzen',
    rules: 'Beide sagen ihren Tipp laut. Danach zählen alle gemeinsam nach. Wer näher dran ist, gewinnt.',
    baustein: { kind: 'anzeige' },
  },
  zeitgefuehl: {
    category: 'schaetzen',
    title: 'Zeitgefühl',
    rules:
      'Beide stehen mit dem Rücken zum Fernseher. Der Timer läuft für alle anderen sichtbar. Wer glaubt, dass 30 Sekunden um sind, ruft „Stopp“. Wer näher an 30 ist, gewinnt.',
    baustein: { kind: 'timer', seconds: 30, countUp: true },
  },
  gewicht: {
    category: 'schaetzen',
    title: 'Gewicht schätzen',
    rules:
      'Beide halten das Geschenk kurz in der Hand und sagen ihren Tipp in Gramm laut. Dann kommt es auf die Küchenwaage. Wer näher dran ist, gewinnt.',
    baustein: { kind: 'anzeige' },
  },
  hoehertiefer: {
    category: 'schaetzen',
    title: 'Höher oder tiefer',
    rules:
      'Der Wert links ist bekannt. Ist der Wert rechts höher oder tiefer? Dann wird rechts zum neuen bekannten Wert. Abwechselnd raten, wer zuerst falsch liegt, verliert.',
    baustein: { kind: 'hoehertiefer' },
  },
  stapeln: {
    category: 'geschick',
    title: 'Stapeln',
    rules:
      'Baut in 30 Sekunden den höchsten Turm aus Plätzchen oder Nüssen. Beim Signal zählen alle, was noch steht.',
    baustein: { kind: 'timer', seconds: 30 },
  },
  schleife: {
    category: 'geschick',
    title: 'Geschenkband-Knoten',
    rules:
      'Bindet mit einer Hand eine Schleife um ein Geschenk. Wer fertig ist, ruft „Fertig“. Hält die Schleife, ist das der Sieg.',
    baustein: { kind: 'startsignal', rounds: 1 },
  },
  einpacken: {
    category: 'geschick',
    title: 'Einpack-Sprint',
    rules:
      'Packt in 90 Sekunden ein Buch mit Zeitungspapier ein. Danach stimmen alle per Handzeichen ab. Geschmackssache, eher als Spaßrunde.',
    baustein: { kind: 'timer', seconds: 90 },
  },
  loeffel: {
    category: 'geschick',
    title: 'Löffel balancieren',
    rules:
      'Trage eine Mandarine auf dem Löffel bis zur Tür und zurück. Fällt sie herunter, geht es zurück zum Start. Nacheinander, die schnellste Zeit gewinnt.',
    baustein: { kind: 'stoppuhr' },
  },
  reaktion: {
    category: 'geschick',
    title: 'Reaktion',
    rules:
      'Eine Mandarine liegt zwischen euch. Sobald der Bildschirm grün wird, schnappt sie euch. Wer zu früh greift, verliert die Runde. Best of 3.',
    baustein: { kind: 'startsignal', rounds: 3 },
  },
} satisfies Record<string, TaskDef>

export type TaskId = keyof typeof TASKS
export const TASK_IDS = Object.keys(TASKS) as TaskId[]
