// ENTWURF – von Lena prüfen
import type { TaskId } from './tasks'

// tasks leer = wird immer gebraucht
export const MATERIAL: { text: string; tasks: TaskId[] }[] = [
  { text: 'Ein verpacktes Geschenk pro Person', tasks: [] },
  { text: 'Dicker Stift für die Klau-Striche', tasks: [] },
  { text: 'Küchenwaage', tasks: ['gewicht'] },
  { text: 'Ca. 30 Plätzchen oder Nüsse', tasks: ['stapeln'] },
  { text: 'Geschenkband, 2 Stücke à ca. 1 m', tasks: ['schleife'] },
  { text: 'Zeitungspapier, Schere, Klebeband und 2 gleich große Bücher', tasks: ['einpacken'] },
  { text: 'Eine Mandarine', tasks: ['reaktion', 'loeffel'] },
  { text: 'Ein Esslöffel und freie Bahn bis zur Tür', tasks: ['loeffel'] },
]
