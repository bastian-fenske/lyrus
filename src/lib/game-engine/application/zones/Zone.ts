import type {EntityMapBase, EntityId} from '../../domain/entities/EntityTypes'
import type {GameApi} from '../../api/GameApi'

export class Zone<T extends EntityMapBase> {

  public enabled: boolean
  public clickHandler: ((api: GameApi<T>) => void) | null = null
  public wayPointName: string | null
  public entityId: EntityId<T> | null

  constructor(
    public readonly sceneId: string,
    public readonly name: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    enabled = true,
    wayPointName: string | null = null,
    entityId: EntityId<T> | null = null) {
    
    this.enabled = enabled
    this.wayPointName = wayPointName
    this.entityId = entityId
  }
}
