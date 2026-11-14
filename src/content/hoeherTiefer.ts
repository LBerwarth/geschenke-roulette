export type HtItem = { label: string; value: number; display: string }
export type HtDeck = { name: string; items: HtItem[] }

// Quelle: en.wikipedia.org, List of highest-grossing Christmas films (weltweit, nicht inflationsbereinigt), abgerufen 13.11.2026
const FILME: [title: string, year: number, millionUsd: number][] = [
  ['Der Grinch', 2018, 553],
  ['Kevin – Allein zu Haus', 1990, 477],
  ['Kevin – Allein in New York', 1992, 359],
  ['Der Grinch (Realfilm)', 2000, 350],
  ['Disneys Eine Weihnachtsgeschichte', 2009, 325],
  ['Der Polarexpress', 2004, 315],
  ['Batmans Rückkehr', 1992, 267],
  ['Tatsächlich… Liebe', 2003, 245],
  ['Stirb langsam 2', 1990, 240],
  ['Buddy – Der Weihnachtself', 2003, 225],
  ['Liebe braucht keine Ferien', 2006, 206],
  ['Santa Clause – Eine schöne Bescherung', 1994, 191],
  ['Red One – Alarmstufe Weihnachten', 2024, 185],
  ['Während du schliefst', 1995, 182],
  ['Daddy’s Home 2', 2017, 181],
  ['Der Nussknacker und die vier Reiche', 2018, 174],
  ['Santa Clause 2', 2002, 173],
  ['Mein Schatz, unsere Familie und ich', 2008, 164],
  ['Gremlins', 1984, 154],
  ['Arthur Weihnachtsmann', 2011, 147],
]

// Quelle: en.wikipedia.org, List of cities in Germany by population (Destatis, Stand 31.12.2021), abgerufen 13.11.2026
const STAEDTE: [city: string, population: number][] = [
  ['Berlin', 3677472],
  ['Hamburg', 1906411],
  ['München', 1487708],
  ['Köln', 1073096],
  ['Frankfurt am Main', 759224],
  ['Stuttgart', 626275],
  ['Düsseldorf', 619477],
  ['Leipzig', 601866],
  ['Dortmund', 586852],
  ['Essen', 579432],
  ['Bremen', 563290],
  ['Dresden', 555351],
  ['Hannover', 535932],
  ['Nürnberg', 510632],
  ['Duisburg', 495152],
  ['Bochum', 363441],
  ['Wuppertal', 354572],
  ['Bielefeld', 334002],
  ['Bonn', 331885],
  ['Münster', 317713],
]

export const HT_SOURCE = 'Quelle: Wikipedia (EN), Stand siehe Fragenset'

export const HT_DECKS: HtDeck[] = [
  {
    name: 'Weihnachtsfilme: Einspielergebnis',
    items: FILME.map(([title, year, m]) => ({ label: `${title} (${year})`, value: m, display: `${m} Mio. $` })),
  },
  {
    name: 'Weihnachtsfilme: Erscheinungsjahr',
    items: FILME.map(([title, year]) => ({ label: title, value: year, display: String(year) })),
  },
  {
    name: 'Großstädte: Einwohner (31.12.2021)',
    items: STAEDTE.map(([city, n]) => ({ label: city, value: n, display: n.toLocaleString('de-DE') })),
  },
]
