import type {HeroMovementService} from './HeroMovementService'
import {WayPointRef} from '../../domain/navigation/WayPointRef'
import type {Orientation} from '../../domain/navigation/Orientation'

export class NavigationApi {
  
  constructor(
    private readonly heroMovementService: HeroMovementService) {
  }
  
  public placeHero(target: WayPointRef | string, orientation: Orientation): void {
    this.heroMovementService.placeHero(WayPointRef.normalize(target), orientation)
  }
  
  public moveTo(targetWayPointName: string, targetSceneId?: string): void {
    this.heroMovementService.moveTo(targetWayPointName, targetSceneId)
  }
}
