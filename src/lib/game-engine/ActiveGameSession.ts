import {RenderingService} from './rendering/RenderingService'
import {HeroMovementExecutor} from './application/navigation/HeroMovementExecuror'
import type {EntityMapBase} from './domain/entities/EntityTypes'

export class ActiveGameSession<T extends EntityMapBase = EntityMapBase> {
  
  constructor(
    private readonly renderPipeline: RenderingService<T>,
    private readonly movementExecutor: HeroMovementExecutor) {
  }
  
  destroy(): void {
    this.renderPipeline.destroy()
    this.movementExecutor.destroy()
  }
}
