import type {EntityService} from '../entities/EntityService'
import type {ZoneService} from '../zones/ZoneService'
import type {EntityId, EntityMapBase} from '../../domain/entities/EntityTypes'
import type {GameApi} from '../GameApi'

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

export class SceneZoneHandle<T extends EntityMapBase> {

  constructor(
    private readonly sceneId: string,
    private readonly zoneName: string,
    private readonly zoneService: ZoneService<T>
  ) {
  }

  public onClick(handler: (api: GameApi<T>) => void): this {
    this.zoneService.get(this.sceneId, this.zoneName).clickHandler = handler
    return this
  }

  public setInteraction(wayPointName: string | null, entityId: EntityId<T> | null): this {
    const zone = this.zoneService.get(this.sceneId, this.zoneName)
    zone.wayPointName = wayPointName
    zone.entityId = entityId
    return this
  }

  public setEnabled(enabled: boolean): this {
    this.zoneService.get(this.sceneId, this.zoneName).enabled = enabled
    return this
  }
}

export class SceneZonesApi<T extends EntityMapBase> {

  constructor(
    private readonly sceneId: string,
    private readonly zoneService: ZoneService<T>
  ) {
  }

  public add(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    wayPointName: string | null = null,
    entityId: EntityId<T> | null = null,
    enabled = true
  ): SceneZoneHandle<T> {
    this.zoneService.add(this.sceneId, name, x, y, width, height, wayPointName, entityId, enabled)
    return new SceneZoneHandle(this.sceneId, name, this.zoneService)
  }

  public get(name: string): SceneZoneHandle<T> {
    return new SceneZoneHandle(this.sceneId, name, this.zoneService)
  }
}
