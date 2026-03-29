import {RenderingService} from './rendering/RenderingService'
import type {EntityMapBase} from './domain/entities/EntityTypes'
import type {ActionService} from './application/actions/ActionService'
import type {HeroPresentationRuntime} from './presentation/HeroPresentationRuntime'

export class ActiveGameSession<T extends EntityMapBase = EntityMapBase> {
  
  constructor(
    private readonly renderPipeline: RenderingService<T>,
    private readonly actionService: ActionService<T>,
    private readonly presentationRuntime: HeroPresentationRuntime) {
  }
  
  destroy(): void {
    this.renderPipeline.destroy()
    this.actionService.destroy()
    this.presentationRuntime.destroy()
  }
}
