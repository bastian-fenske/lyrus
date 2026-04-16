import type {HeroExecutionContext} from '../../../application/navigation/HeroExecutionContext'

export interface HeroCommand {
  execute(ctx: HeroExecutionContext): Promise<void>
  cancel(): void
}
