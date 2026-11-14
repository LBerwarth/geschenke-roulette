import { Anzeige } from '../bausteine/Anzeige'
import { HandyRunde } from '../bausteine/HandyRunde'
import { HoeherTiefer } from '../bausteine/HoeherTiefer'
import { Startsignal } from '../bausteine/Startsignal'
import { Stoppuhr } from '../bausteine/Stoppuhr'
import { Timer } from '../bausteine/Timer'
import { TASKS, type Baustein } from '../content/tasks'
import type { DuellProps } from '../ui/DuellShell'

export function Duell(props: DuellProps) {
  const duel = props.game.duels.at(-1)!
  const key = duel.id + duel.taskId
  const baustein: Baustein = TASKS[duel.taskId].baustein
  switch (baustein.kind) {
    case 'anzeige':
      return <Anzeige key={key} {...props} />
    case 'timer':
      return <Timer key={key} {...props} seconds={baustein.seconds} countUp={baustein.countUp} />
    case 'stoppuhr':
      return <Stoppuhr key={key} {...props} />
    case 'startsignal':
      return <Startsignal key={key} {...props} rounds={baustein.rounds} />
    case 'handy':
      return <HandyRunde key={key} {...props} seconds={baustein.seconds} />
    case 'hoehertiefer':
      return <HoeherTiefer key={key + duel.contentIndex} {...props} />
  }
}
