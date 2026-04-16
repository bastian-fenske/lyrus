import type {HeroExecutionContext} from '../../../application/navigation/HeroExecutionContext'
import type {HeroCommand} from './HeroCommand'

export class UseEntity implements HeroCommand {

  constructor(private readonly entityId: string) {
  }

  async execute(ctx: HeroExecutionContext): Promise<void> {
    ctx.useEntity(this.entityId)
  }

  cancel(): void {
  }
}
