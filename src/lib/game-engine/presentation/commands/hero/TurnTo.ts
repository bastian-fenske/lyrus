import type {HeroCommand} from './HeroCommand'
import type {Orientation} from '../../../domain/navigation/Orientation'
import type {HeroExecutionContext} from '../../../application/navigation/HeroExecutionContext'

export class TurnTo implements HeroCommand {

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
