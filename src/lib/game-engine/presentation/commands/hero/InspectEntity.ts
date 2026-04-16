import type {HeroExecutionContext} from '../../../application/navigation/HeroExecutionContext'
import type {HeroCommand} from './HeroCommand'

export class InspectEntity implements HeroCommand {

  constructor(private readonly entityId: string) {
  }

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.inspectEntity(this.entityId)
  }

  cancel(): void {
  }
}
