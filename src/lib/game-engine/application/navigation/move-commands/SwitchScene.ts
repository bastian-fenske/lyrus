import type {HeroExecutionContext} from '../HeroExecutionContext'
import type {HeroMoveCommand} from './HeroMoveCommand'

export class SwitchScene implements HeroMoveCommand {

  constructor(private readonly sceneId: string) {
  }

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.setScene(this.sceneId)
  }

  cancel(): void {
  }
}
