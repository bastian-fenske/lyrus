import type {EntityId, EntityMapBase} from '../domain/entities/EntityTypes'
import type {GameMap} from '../domain/navigation/GameMap'
import {ActionsApi} from './actions/ActionsApi'
import type {ActionService} from './actions/ActionService'
import type {EntityService} from './entities/EntityService'
import {MapApi} from './navigation/MapApi'
import {NavigationApi} from './navigation/NavigationApi'
import {EntityHandle, SceneZoneHandle} from './scene/SceneApi'
import type {ZoneService} from './zones/ZoneService'
import {ZonesApi} from './zones/ZonesApi'

export class GameApi<T extends EntityMapBase> {

  public readonly map: MapApi
  public readonly navigation: NavigationApi<T>
  public readonly actions: ActionsApi<T>
  public readonly zones: ZonesApi<T>

  constructor(
    map: GameMap,
    actionService: ActionService<T>,
    private readonly entityService: EntityService<T>,
    private readonly zoneService: ZoneService<T>) {
    
    this.map = new MapApi(map)
    this.actions = new ActionsApi(actionService)
    this.navigation = new NavigationApi(actionService)
    this.zones = new ZonesApi(this.zoneService)
  }

  public entity<K extends EntityId<T>>(entityId: K): EntityHandle<T, K> {
    return new EntityHandle(entityId, this.entityService, this)
  }

  public zone(sceneId: string, zoneName: string): SceneZoneHandle<T> {
    return new SceneZoneHandle(sceneId, zoneName, this.zoneService)
  }
}
