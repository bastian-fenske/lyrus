import type {HeroExecutionContext} from '../HeroExecutionContext'

export interface HeroMoveCommand {
  execute(ctx: HeroExecutionContext): Promise<void>
  cancel(): void
}
