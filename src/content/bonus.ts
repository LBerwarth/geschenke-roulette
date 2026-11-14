// ENTWURF – von Lena prüfen

// place: fester Platz, 'last', 'middle' oder 'dice' (App würfelt 1–6)
// {name} = ausgeloste Person auf dem Platz, {place} = Platz, {last} = Person auf dem letzten Platz
export type Bonus = { title: string; text: string; place: number | 'last' | 'middle' | 'dice' }

export const BONUS: Bonus[] = [
  {
    title: 'Platz 3 darf klauen!',
    text: 'Auf Platz 3 steht {name}. Klau dir ein Geschenk, das noch nicht gesperrt ist.',
    place: 3,
  },
  {
    title: 'Letzter Platz klaut!',
    text: 'Ganz hinten steht {name}. Klau dir ein Geschenk, das noch nicht gesperrt ist.',
    place: 'last',
  },
  {
    title: 'Platz 1 muss abgeben!',
    text: 'Vorne liegt {name}. Tausche dein Geschenk mit {last} vom letzten Platz. Tauschen gibt keinen Strich.',
    place: 1,
  },
  {
    title: 'Würfel bestimmt den Platz',
    text: 'Der Würfel zeigt {place}. Auf Platz {place} steht {name}. Du darfst klauen.',
    place: 'dice',
  },
  {
    title: 'Platz 2 tauscht mit dem letzten Platz',
    text: '{name} und {last} tauschen ihre Geschenke. Tauschen gibt keinen Strich.',
    place: 2,
  },
  {
    title: 'Die goldene Mitte klaut!',
    text: 'Genau in der Mitte steht {name}. Klau dir ein Geschenk, das noch nicht gesperrt ist.',
    place: 'middle',
  },
  {
    title: 'Letzter Platz bestimmt',
    text: '{name} bestimmt zwei andere, die ihre Geschenke tauschen.',
    place: 'last',
  },
  {
    title: 'Platz 1 verschenkt einen Klau',
    text: '{name} bestimmt, wer jetzt einmal klauen darf – nur nicht sich selbst.',
    place: 1,
  },
]
