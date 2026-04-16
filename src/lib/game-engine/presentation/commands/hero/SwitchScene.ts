import type {HeroExecutionContext} from '../../../application/navigation/HeroExecutionContext'
import type {HeroCommand} from './HeroCommand'

export class SwitchScene implements HeroCommand {

  constructor(private readonly sceneId: string) {
  }

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.setScene(this.sceneId)
  }

  cancel(): void {
  }
}
