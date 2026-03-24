import type {GameMap} from '../../domain/navigation/GameMap'
import type {WayPoint} from '../../domain/navigation/WayPoint'
import {Path} from '../../domain/navigation/Path'
import {WayPointRef} from '../../domain/navigation/WayPointRef'

export class MapApi {
  
  constructor(private readonly map: GameMap) {
  }
  
  public addWayPoint(sceneId: string, wayPoint: WayPoint): WayPoint {
    this.map.addWayPoint(sceneId, wayPoint)
    return wayPoint
  }

  public getWayPoint(wayPointRef: string): WayPoint {
    const wayPoint = this.map.getWayPoint(wayPointRef)
    if (wayPoint === null) {
      throw new Error(`WayPoint not found: ${wayPointRef}`)
    }
    return wayPoint
  }
  
  public addPath(
    sceneId: string,
    fromWayPointName: string,
    toWayPointName: string,
    duration: number,
    bidirectional = true
  ): void {
    this.map.addPath(
      new Path(
        new WayPointRef(sceneId, fromWayPointName),
        new WayPointRef(sceneId, toWayPointName),
        duration),
      bidirectional)
  }
}
