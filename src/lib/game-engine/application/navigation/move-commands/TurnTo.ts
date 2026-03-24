import type {HeroMoveCommand} from './HeroMoveCommand'
import type {Orientation} from '../../../domain/navigation/Orientation'
import type {HeroExecutionContext} from '../HeroExecutionContext'

export class TurnTo implements HeroMoveCommand {

  constructor(
    private readonly orientation: Orientation) {}

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.updateHeroState(state => ({
      ...state,
      orientation: this.orientation
    }))
  }

  cancel() {}
}
