import type {HeroExecutionContext} from '../HeroExecutionContext'
import type {HeroMoveCommand} from './HeroMoveCommand'

export class InspectEntity implements HeroMoveCommand {

  constructor(private readonly entityId: string) {
  }

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.inspectEntity(this.entityId)
  }

  cancel(): void {
  }
}
