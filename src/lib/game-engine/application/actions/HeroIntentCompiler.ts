import type {EntityMapBase} from '../../domain/entities/EntityTypes'
import type {GameMap} from '../../domain/navigation/GameMap'
import {Orientation} from '../../domain/navigation/Orientation'
import {WayPointRef} from '../../domain/navigation/WayPointRef'
import {HeroMovementPlanner, type HeroMovementState} from '../navigation/HeroMovementPlanner'
import type {HeroMoveCommand} from '../navigation/move-commands/HeroMoveCommand'
import {InspectEntity} from '../navigation/move-commands/InspectEntity'
import {MoveTo} from '../navigation/move-commands/MoveTo'
import {PlaceHero} from '../navigation/move-commands/PlaceHero'
import {SwitchScene} from '../navigation/move-commands/SwitchScene'
import {TurnTo} from '../navigation/move-commands/TurnTo'
import {UseEntity} from '../navigation/move-commands/UseEntity'
import type {ActionIntent, InvestigateIntent, MoveIntent, UseIntent} from './ActionTypes'

export interface CompiledHeroIntent {
  commands: HeroMoveCommand[]
}

export class HeroIntentCompiler<T extends EntityMapBase> {

  private readonly planner = new HeroMovementPlanner()
  private readonly movementState: HeroMovementState = {
    current: null,
    traversal: null
  }
  private planVersion = 0

  constructor(
    private readonly map: GameMap
  ) {
  }

  public placeHero(target: WayPointRef, orientation: Orientation): CompiledHeroIntent {
    this.movementState.current = target
    this.movementState.traversal = null
    this.planVersion += 1

    return {
      commands: [
        //new SwitchScene(target.sceneId),
        new PlaceHero(target, orientation)]
    }
  }

  public compile(intent: ActionIntent<T>): CompiledHeroIntent {
    switch (intent.type) {
      case 'move':
        return this.compileMove(intent)
      case 'investigate':
        return this.compileInvestigate(intent)
      case 'use':
        return this.compileUse(intent)
      default:
        throw new Error(`Unsupported hero intent: ${(intent as {type: string}).type}`)
    }
  }

  private compileMove(intent: MoveIntent): CompiledHeroIntent {
    const resolvedSceneId = intent.targetSceneId
      ?? this.movementState.current?.sceneId
      ?? this.movementState.traversal?.to.sceneId

    if (resolvedSceneId === undefined) {
      throw new Error('No scene to move to')
    }

    const targetRef = new WayPointRef(resolvedSceneId, intent.targetWayPointName)

    if (!this.map.hasWayPoint(targetRef)) {
      throw new Error(`WayPoint "${intent.targetWayPointName}" not found in scene "${resolvedSceneId}"`)
    }

    const steps = this.planner.plan(this.movementState, this.map, targetRef)
    if (steps.length === 0) {
      if (this.movementState.current !== null && this.isSameRef(this.movementState.current, targetRef)) {
        return {
          commands: this.buildPortalCommands(targetRef)
        }
      }

      return {commands: []}
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

          this.movementState.current = null
          this.movementState.traversal = {
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
          if (this.movementState.traversal !== null) {
            this.movementState.traversal.elapsed = elapsed
          }
        },
        onComplete: () => {
          if (version !== this.planVersion) {
            return
          }

          this.movementState.current = step.to
          this.movementState.traversal = null
        },
        onCancel: () => {
          if (version !== this.planVersion) {
            return
          }
          this.planVersion += 1
        }
      }))
    }

    commands.push(...this.buildPortalCommands(targetRef))
    return {commands}
  }

  private compileInvestigate(intent: InvestigateIntent<T>): CompiledHeroIntent {
    const commands: HeroMoveCommand[] = []

    if (intent.targetWayPointName !== undefined) {
      const moveIntent = {
        type: 'move',
        targetWayPointName: intent.targetWayPointName
      } as const
      const commandsForMove = this.compileMove(intent.targetSceneId === undefined ? moveIntent : {
        ...moveIntent,
        targetSceneId: intent.targetSceneId
      }).commands
      commands.push(...commandsForMove)
    }

    commands.push(new InspectEntity(intent.entityId))

    return {commands}
  }

  private compileUse(intent: UseIntent<T>): CompiledHeroIntent {
    return {
      commands: [new UseEntity(intent.entityId)]
    }
  }

  private buildPortalCommands(wayPointRef: WayPointRef): HeroMoveCommand[] {
    const reachedWayPoint = this.map.getWayPoint(wayPointRef)
    const portal = reachedWayPoint?.portal ?? null
    if (portal === null) {
      return []
    }

    const destinationWayPoint = this.map.getWayPoint(portal)
    if (destinationWayPoint === null) {
      return []
    }

    const arrivalOrientation = reachedWayPoint?.portalTargetOrientation ?? destinationWayPoint.entryOrientation

    return [
      new SwitchScene(portal.sceneId),
      new PlaceHero(portal, arrivalOrientation),
      this.createCommitCurrentCommand(portal)
    ]
  }

  private createCommitCurrentCommand(target: WayPointRef): HeroMoveCommand {
    return {
      execute: async () => {
        this.movementState.current = target
        this.movementState.traversal = null
      },
      cancel: () => {}
    }
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
