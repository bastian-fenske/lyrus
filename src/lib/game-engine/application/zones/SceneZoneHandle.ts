import type {ZoneService} from './ZoneService'
import type {EntityId, EntityMapBase} from '../../domain/entities/EntityTypes'
import type {GameApi} from '../../api/GameApi'

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
