import type {ActionService} from '../application/actions/ActionService'
import type {EntityMapBase} from '../domain/entities/EntityTypes'
import {WayPointRef} from '../domain/navigation/WayPointRef'
import type {Orientation} from '../domain/navigation/Orientation'

export class NavigationApi<T extends EntityMapBase> {
  
  constructor(
    private readonly actionService: ActionService<T>) {
  }
  
  public placeHero(target: WayPointRef | string, orientation: Orientation): void {
    this.actionService.placeHero(WayPointRef.normalize(target), orientation)
  }
  
  public moveTo(targetWayPointName: string, targetSceneId?: string): void {
    const intent = {
      type: 'move',
      targetWayPointName
    } as const

    this.actionService.submit('hero', targetSceneId === undefined ? intent : {
      ...intent,
      targetSceneId
    }, {
      mode: 'replace-current',
      blocking: true
    })
  }
}
