import {Path} from './Path'
import {WayPoint} from './WayPoint'
import {WayPointRef} from './WayPointRef'

export class GameMap {

  public readonly wayPoints = new Map<string, WayPoint[]>()
  private readonly paths: Path[] = []

  public addWayPoint(sceneId: string, wayPoint: WayPoint): void {
    if (!this.wayPoints.has(sceneId)) {
      this.wayPoints.set(sceneId, [])
    }
    this.wayPoints.get(sceneId)!.push(wayPoint)
  }

  public addPath(path: Path, bidirectional = true): void {
    this.paths.push(path)
    if (bidirectional) {
      this.paths.push(new Path(path.to, path.from, path.duration))
    }
  }

  public getWayPointsForScene(sceneId: string): WayPoint[] {
    return this.wayPoints.get(sceneId) ?? []
  }

  public getWayPoint(wayPointRef: WayPointRef | string): WayPoint | null {
    wayPointRef = WayPointRef.normalize(wayPointRef)
    return this.getWayPointsForScene(wayPointRef.sceneId)
      .find(wayPoint => wayPoint.name === wayPointRef.wayPointName) ?? null
  }

  public getPath(from: WayPointRef, to: WayPointRef): Path | null {
    return this.paths.find(path => path.from === from && path.to === to) ?? null
  }

  public getNeighbors(from: WayPointRef): Path[] {
    return this.paths.filter(path => path.from.equals(from))
  }

  public hasWayPoint(ref: WayPointRef): boolean {
    return this.getWayPoint(ref) !== null
  }
}
