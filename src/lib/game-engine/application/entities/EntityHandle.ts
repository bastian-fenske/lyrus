import type {EntityId, EntityMapBase} from '../../domain/entities/EntityTypes'
import type {EntityService} from './EntityService'
import type {GameApi} from '../../api/GameApi'

export class EntityHandle<T extends EntityMapBase, K extends EntityId<T>> {
  
  constructor(
    private readonly entityId: K,
    private readonly entityService: EntityService<T>,
    private readonly gameApi: GameApi<T>) {
  }
  
  public getState(): T[K] {
    return this.entityService.getState(this.entityId)
  }
  
  public setState(state: T[K]): void {
    this.entityService.setState(this.entityId, state)
  }
  
  public patchState(partialState: Partial<T[K]>): void {
    this.entityService.patchState(this.entityId, partialState)
  }
  
  public onUse(handler: (state: T[K], api: GameApi<T>) => void): void {
    this.entityService.onUse(this.entityId, state => handler(state, this.gameApi))
  }
  
  public onInspect(handler: (state: T[K], api: GameApi<T>) => void): void {
    this.entityService.onInspect(this.entityId, state => handler(state, this.gameApi))
  }
  
  public onStateChange(handler: (state: T[K], oldState: T[K], api: GameApi<T>) => void): void {
    this.entityService.onStateChange(this.entityId, (state, oldState) => {
      handler(state, oldState, this.gameApi)
    })
  }
  
  public use(): void {
    this.entityService.use(this.entityId)
  }
  
  public inspect(): void {
    this.entityService.inspect(this.entityId)
  }
}
