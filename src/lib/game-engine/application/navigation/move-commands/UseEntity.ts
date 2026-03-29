import type {HeroExecutionContext} from '../HeroExecutionContext'
import type {HeroMoveCommand} from './HeroMoveCommand'

export class UseEntity implements HeroMoveCommand {

  constructor(private readonly entityId: string) {
  }

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.useEntity(this.entityId)
  }

  cancel(): void {
  }
}
