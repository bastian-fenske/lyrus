import type {GameMap} from '../../domain/navigation/GameMap'
import type {WayPoint} from '../../domain/navigation/WayPoint'

export class SceneWayPointsApi {

  constructor(
    private readonly sceneId: string,
    private readonly map: GameMap
  ) {
  }

  public get(name: string): WayPoint {
    const wayPoint = this.map.getWayPoint(`${this.sceneId}::${name}`)
    if (wayPoint === null) {
      throw new Error(`WayPoint not found: ${this.sceneId}::${name}`)
    }

    return wayPoint
  }
}
