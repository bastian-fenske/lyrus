import type {EntityMapBase, EntityId} from '../../domain/entities/EntityTypes'
import {Zone} from './Zone'
import type {NavigationApi} from '../../api/NavigationApi'
import type {GameApi} from '../../api/GameApi'

export class ZoneService<T extends EntityMapBase> {

  private readonly zonesByScene = new Map<string, Map<string, Zone<T>>>()
  private api!: GameApi<T>

  constructor(
    private readonly navigationApi: NavigationApi<T>) {
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
      this.api.actions.submit('hero', {
        type: 'move',
        targetWayPointName: zone.wayPointName,
        targetSceneId: sceneId
      }, {
        mode: 'replace-current',
        blocking: true
      })
      this.api.actions.submit('hero', {
        type: 'use',
        entityId: zone.entityId
      }, {
        mode: 'enqueue',
        blocking: true
      })
      return
    }

    if (zone.wayPointName !== null) {
      this.navigationApi.moveTo(zone.wayPointName, sceneId)
      return
    }

    if (zone.entityId !== null) {
      this.api.actions.submit('hero', {
        type: 'use',
        entityId: zone.entityId
      }, {
        mode: 'replace-current',
        blocking: true
      })
    }
  }

  private getSceneZones(sceneId: string): Map<string, Zone<T>> {
    if (!this.zonesByScene.has(sceneId)) {
      this.zonesByScene.set(sceneId, new Map())
    }
    return this.zonesByScene.get(sceneId)!
  }
}
