import {BehaviorSubject} from 'rxjs'
import type {GameMap} from '../domain/navigation/GameMap'
import type {HeroMoveCommand} from '../application/navigation/move-commands/HeroMoveCommand'
import type {HeroRenderState} from '../rendering/HeroRenderState'
import type {PresentationActionState} from '../application/actions/ActionTypes'
import type {HeroExecutionContext} from '../application/navigation/HeroExecutionContext'

interface RunningAction {
  actorId: string
  commands: HeroMoveCommand[]
  cancelled: boolean
  activeCommand: HeroMoveCommand | null
}

export class HeroPresentationRuntime {

  private readonly runningByActionId = new Map<string, RunningAction>()
  private readonly presentationStates = new Map<string, PresentationActionState>()
  private readonly presentationState$ = new BehaviorSubject<PresentationActionState[]>([])

  constructor(
    private readonly map: GameMap,
    private readonly getHeroState: () => HeroRenderState,
    private readonly updateHeroState: (updater: (state: HeroRenderState) => HeroRenderState) => void,
    private readonly setScene: (sceneId: string) => void,
    private readonly useEntity: (entityId: string) => void,
    private readonly inspectEntity: (entityId: string) => void) {
  }

  public async execute(actionId: string, actorId: string, commands: HeroMoveCommand[]): Promise<'completed' | 'cancelled'> {
    const runningAction: RunningAction = {
      actorId,
      commands,
      cancelled: false,
      activeCommand: null
    }

    this.runningByActionId.set(actionId, runningAction)
    this.updatePresentationState({
      actionId,
      actorId,
      status: 'running',
      totalSteps: commands.length,
      currentStepIndex: 0,
      currentStepName: this.commandNameOf(commands, 0)
    })

    const ctx: HeroExecutionContext = {
      map: this.map,
      getHeroState: this.getHeroState,
      updateHeroState: this.updateHeroState,
      setScene: this.setScene,
      useEntity: this.useEntity,
      inspectEntity: this.inspectEntity,
      requestAnimationFrame: callback => requestAnimationFrame(callback),
      cancelAnimationFrame: id => cancelAnimationFrame(id)
    }

    for (let index = 0; index < commands.length; index += 1) {
      if (runningAction.cancelled) {
        this.finishAsCancelled(actionId)
        return 'cancelled'
      }

      const command = commands[index]
      if (command === undefined) {
        continue
      }
      runningAction.activeCommand = command

      this.updatePresentationState({
        actionId,
        actorId,
        status: 'running',
        totalSteps: commands.length,
        currentStepIndex: index,
        currentStepName: this.commandName(command)
      })

      await command.execute(ctx)
      runningAction.activeCommand = null

      if (runningAction.cancelled) {
        this.finishAsCancelled(actionId)
        return 'cancelled'
      }
    }

    this.runningByActionId.delete(actionId)
    this.updatePresentationState({
      actionId,
      actorId,
      status: 'completed',
      totalSteps: commands.length,
      currentStepIndex: commands.length,
      currentStepName: null
    })

    return 'completed'
  }

  public cancel(actionId: string): void {
    const running = this.runningByActionId.get(actionId)
    if (running === undefined) {
      return
    }

    running.cancelled = true
    running.activeCommand?.cancel()
  }

  public destroy(): void {
    for (const actionId of this.runningByActionId.keys()) {
      this.cancel(actionId)
    }
    this.runningByActionId.clear()
    this.presentationStates.clear()
    this.presentationState$.next([])
  }

  private finishAsCancelled(actionId: string): void {
    const running = this.runningByActionId.get(actionId)
    this.runningByActionId.delete(actionId)

    if (running === undefined) {
      return
    }

    this.updatePresentationState({
      actionId,
      actorId: running.actorId,
      status: 'cancelled',
      totalSteps: running.commands.length,
      currentStepIndex: 0,
      currentStepName: null
    })
  }

  private commandName(command: HeroMoveCommand): string {
    return command.constructor.name
  }

  private commandNameOf(commands: HeroMoveCommand[], index: number): string | null {
    const command = commands[index]
    if (command === undefined) {
      return null
    }
    return this.commandName(command)
  }

  private updatePresentationState(state: PresentationActionState): void {
    this.presentationStates.set(state.actionId, state)
    this.presentationState$.next(Array.from(this.presentationStates.values()))
  }
}
