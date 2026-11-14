// ENTWURF – von Lena prüfen
export type Card = { title: string; text: string }

// {limit} wird durch das Klau-Limit aus dem Setup ersetzt
export const KARTEN: Card[] = [
  { title: 'Greif zu!', text: 'Nimm dir ein Päckchen vom Tisch.' },
  { title: 'Das Größte', text: 'Nimm das größte Päckchen, das noch auf dem Tisch liegt.' },
  { title: 'Das Kleinste', text: 'Nimm das kleinste Päckchen, das noch auf dem Tisch liegt.' },
  { title: 'Blind gegriffen', text: 'Augen zu, einmal um dich selbst drehen, dann greif ein Päckchen vom Tisch.' },
  { title: 'Dein Nachbar wählt', text: 'Die Person links von dir sucht ein Päckchen vom Tisch für dich aus.' },
  { title: 'Schütteltest', text: 'Schüttle zwei Päckchen vom Tisch und behalte eins davon.' },
  {
    title: 'Die Runde entscheidet',
    text: 'Alle zeigen auf ein Päckchen auf dem Tisch. Du bekommst das mit den meisten Fingern.',
  },
  { title: 'Schönstes Papier', text: 'Nimm das Päckchen mit dem schönsten Geschenkpapier vom Tisch.' },
  { title: 'Das Schwerste', text: 'Heb zwei Päckchen vom Tisch an und nimm das schwerere.' },
  {
    title: 'Freie Wahl',
    text: 'Nimm ein Päckchen vom Tisch oder klau eins. Beim Klauen kommt ein Strich aufs Papier.',
  },
  {
    title: 'Klau-Zeit!',
    text: 'Nimm dir ein Päckchen von jemandem. Mach einen Strich aufs Papier – bei {limit} Strichen ist es gesperrt.',
  },
  {
    title: 'Klau von gegenüber',
    text: 'Klau das Päckchen der Person, die dir gegenübersitzt. Ein Strich aufs Papier.',
  },
  { title: 'Klau rechts', text: 'Klau das Päckchen der Person rechts von dir. Ein Strich aufs Papier.' },
  {
    title: 'Doppelter Zug',
    text: 'Nimm ein Päckchen vom Tisch. Danach darf die Person rechts von dir einmal klauen, mit Strich.',
  },
  {
    title: 'Robin Hood',
    text: 'Klau ein Päckchen und gib es jemandem, der noch keins hat. Ein Strich aufs Papier. Du selbst nimmst eins vom Tisch.',
  },
  {
    title: 'Klau oder Tisch?',
    text: 'Die Runde stimmt per Handzeichen ab: Musst du klauen oder vom Tisch nehmen?',
  },
  {
    title: 'Tausch mit links',
    text: 'Tausche dein Päckchen mit der Person links von dir. Tauschen zählt nicht als Klau.',
  },
  {
    title: 'Tausch mit rechts',
    text: 'Tausche dein Päckchen mit der Person rechts von dir. Tauschen zählt nicht als Klau.',
  },
  { title: 'Tauschhandel', text: 'Tausche mit einer Person deiner Wahl. Sie darf nicht ablehnen.' },
  {
    title: 'Karussell',
    text: 'Alle, die schon ein Päckchen haben, geben es eine Position nach links weiter. Danach nimmst du eins vom Tisch.',
  },
  {
    title: 'Fremdtausch',
    text: 'Bestimme zwei andere, die ihre Päckchen tauschen. Danach nimmst du dir eins vom Tisch.',
  },
  { title: 'Zurück auf den Tisch', text: 'Leg dein Päckchen zurück und nimm ein anderes vom Tisch.' },
  {
    title: 'Schutzengel',
    text: 'Nimm ein Päckchen vom Tisch. Bis du wieder dran bist, darf es dir niemand klauen.',
  },
  {
    title: 'Geschenk für nebenan',
    text: 'Such ein Päckchen vom Tisch für die Person rechts von dir aus, falls sie noch keins hat. Dann nimm dir selbst eins.',
  },
  {
    title: 'Tauschangebot',
    text: 'Nimm ein Päckchen vom Tisch und biete es zum Tausch an. Wer zuerst „Ich“ ruft, tauscht mit dir.',
  },
]
