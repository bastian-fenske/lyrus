import {BehaviorSubject} from 'rxjs'
import {PlaceHero} from './move-commands/PlaceHero'
import type {HeroMoveCommand} from './move-commands/HeroMoveCommand'
import {TurnTo} from './move-commands/TurnTo'
import {MoveTo} from './move-commands/MoveTo'
import {Orientation} from '../../domain/navigation/Orientation'
import type {GameMap} from '../../domain/navigation/GameMap'
import {HeroMovementPlanner, type HeroMovementState} from './HeroMovementPlanner'
import {SceneService} from '../scene/SceneService'
import {WayPointRef} from '../../domain/navigation/WayPointRef'
import {initialHeroRenderState, type HeroRenderState} from './HeroRenderState'

export class HeroMovementService {

  private readonly _heroMoveCommands$ = new BehaviorSubject<HeroMoveCommand[]>([])
  public readonly heroMovesCommands$ = this._heroMoveCommands$.asObservable()
  private readonly _heroRenderState$ = new BehaviorSubject<HeroRenderState>(initialHeroRenderState)
  public readonly heroRenderState$ = this._heroRenderState$.asObservable()

  private readonly planner = new HeroMovementPlanner()
  private readonly state: HeroMovementState = {
    current: null,
    traversal: null
  }
  private planVersion = 0

  constructor(
    private readonly map: GameMap,
    private readonly sceneService: SceneService) {
  }

  public getHeroRenderState(): HeroRenderState {
    return this._heroRenderState$.value
  }

  public updateHeroRenderState(updater: (state: HeroRenderState) => HeroRenderState): void {
    this._heroRenderState$.next(updater(this._heroRenderState$.value))
  }

  public placeHero(target: WayPointRef, orientation: Orientation): void {

    this.state.current = target
    this.state.traversal = null
    this.planVersion += 1

    this.sceneService.goTo(target.sceneId)
    this._heroMoveCommands$.next([new PlaceHero(target, orientation)])
  }

  public moveTo(targetWayPointName: string, targetSceneId?: string): void {
    const resolvedScene = targetSceneId
      ?? this.state.current?.sceneId
      ?? this.state.traversal?.to.sceneId

    if (resolvedScene === undefined) {
      throw new Error('No scene to move to')
    }

    const targetRef = new WayPointRef(resolvedScene, targetWayPointName)

    if (!this.map.hasWayPoint(targetRef)) {
      throw new Error(`WayPoint "${targetWayPointName}" not found in scene "${resolvedScene}"`)
    }

    const steps = this.planner.plan(this.state, this.map, targetRef)

    if (steps.length === 0 && this.state.current !== null && this.isSameRef(this.state.current, targetRef)) {
      this.tryPortal(targetRef)
      return
    }

    const version = this.planVersion + 1
    this.planVersion = version

    const commands: HeroMoveCommand[] = []

    for (const step of steps) {
      const from = this.map.getWayPoint(step.from)
      const to = this.map.getWayPoint(step.to)
      if (from === null || to === null) {
        continue
      }

      const orientation = this.getOrientation(from.x, from.y, to.x, to.y)
      commands.push(new TurnTo(orientation))
      commands.push(new MoveTo(to, step.duration, {
        onStart: () => {
          if (version !== this.planVersion) {
            return
          }
          this.state.current = null
          this.state.traversal = {
            from: step.from,
            to: step.to,
            duration: step.duration,
            elapsed: 0
          }
        },
        onProgress: elapsed => {
          if (version !== this.planVersion) {
            return
          }
          if (this.state.traversal !== null) {
            this.state.traversal.elapsed = elapsed
          }
        },
        onComplete: () => {
          if (version !== this.planVersion) {
            return
          }

          this.state.current = step.to
          this.state.traversal = null
          this.tryPortal(step.to)
        }
      }))
    }

    this._heroMoveCommands$.next(commands)
  }

  private tryPortal(wayPointRef: WayPointRef): void {
    const reachedWayPoint = this.map.getWayPoint(wayPointRef)
    const portal = reachedWayPoint?.portal ?? null
    if (portal === null) {
      return
    }

    const destinationWayPoint = this.map.getWayPoint(portal)
    if (destinationWayPoint === null) {
      return
    }

    this.sceneService.goTo(portal.sceneId)
    const arrivalOrientation = reachedWayPoint?.portalTargetOrientation ?? destinationWayPoint.entryOrientation
    this.placeHero(portal, arrivalOrientation)
  }

  private isSameRef(a: WayPointRef, b: WayPointRef): boolean {
    return a.sceneId === b.sceneId && a.wayPointName === b.wayPointName
  }

  private getOrientation(x0: number, y0: number, x1: number, y1: number): Orientation {

    const angle = Math.atan2(y1 - y0, x1 - x0)
    const normalized = (angle + 2 * Math.PI) % (2 * Math.PI)

    const a = normalized / Math.PI * 8

    if (a < 1) return Orientation.E
    if (a < 3) return Orientation.SE
    if (a < 5) return Orientation.S
    if (a < 7) return Orientation.SW
    if (a < 9) return Orientation.W
    if (a < 11) return Orientation.NW
    if (a < 13) return Orientation.N
    if (a < 15) return Orientation.NE

    return Orientation.E
  }
}
