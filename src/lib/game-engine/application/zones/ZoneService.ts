import type {EntityMapBase, EntityId} from '../../domain/entities/EntityTypes'
import {Zone} from './Zone'
import type {NavigationApi} from '../navigation/NavigationApi'
import type {EntityService} from '../entities/EntityService'
import type {GameApi} from '../GameApi'

export class ZoneService<T extends EntityMapBase> {

  private readonly zonesByScene = new Map<string, Map<string, Zone<T>>>()
  private api!: GameApi<T>

  constructor(
    private readonly navigationApi: NavigationApi,
    private readonly entityService: EntityService<T>) {
  }

  public add(
    sceneId: string,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    wayPointName: string | null = null,
    entityId: EntityId<T> | null = null,
    enabled = true
  ): Zone<T> {
    const zone = new Zone(sceneId, name, x, y, width, height, enabled, wayPointName, entityId)
    this.getSceneZones(sceneId).set(name, zone)
    return zone
  }

  public get(sceneId: string, name: string): Zone<T> {
    const zone = this.getSceneZones(sceneId).get(name)
    if (zone === undefined) {
      throw new Error(`Zone not found: ${sceneId}::${name}`)
    }
    return zone
  }

  public getForScene(sceneId: string): Zone<T>[] {
    return Array.from(this.getSceneZones(sceneId).values())
  }
  
  public registerApi(api: GameApi<T>): void {
    this.api = api
  }

  public click(sceneId: string, name: string): void {
    const zone = this.get(sceneId, name)
    if (!zone.enabled) {
      return
    }

    if (zone.clickHandler !== null) {
      zone.clickHandler(this.api)
      return
    }

    if (zone.wayPointName !== null && zone.entityId !== null) {
      this.navigationApi.moveTo(zone.wayPointName, sceneId)
      this.entityService.use(zone.entityId)
      return
    }

    if (zone.wayPointName !== null) {
      this.navigationApi.moveTo(zone.wayPointName, sceneId)
      return
    }

    if (zone.entityId !== null) {
      this.entityService.use(zone.entityId)
    }
  }

  private getSceneZones(sceneId: string): Map<string, Zone<T>> {
    if (!this.zonesByScene.has(sceneId)) {
      this.zonesByScene.set(sceneId, new Map())
    }
    return this.zonesByScene.get(sceneId)!
  }
}
