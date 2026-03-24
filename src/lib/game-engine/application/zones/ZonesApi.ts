import type {EntityId, EntityMapBase} from '../../domain/entities/EntityTypes'
import type {ZoneService} from './ZoneService'

export class ZonesApi<T extends EntityMapBase> {
  
  constructor(private readonly zoneService: ZoneService<T>) {
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
    enabled = true) {
    
    return this.zoneService.add(sceneId, name, x, y, width, height, wayPointName, entityId, enabled)
  }
  
  public get(sceneId: string, name: string) {
    return this.zoneService.get(sceneId, name)
  }
}
