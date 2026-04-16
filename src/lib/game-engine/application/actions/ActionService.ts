import type {EntityMapBase} from '../../domain/entities/EntityTypes'
import type {Orientation} from '../../domain/navigation/Orientation'
import type {WayPointRef} from '../../domain/navigation/WayPointRef'
import type {HeroCommand} from '../../presentation/commands/hero/HeroCommand'
import type {HeroIntentCompiler} from './HeroIntentCompiler'
import type {ActionIntent, ActionState, ActorId, QueueMode, SubmitActionOptions} from './ActionTypes'
import type {HeroPresentationRuntime} from '../../presentation/HeroPresentationRuntime'

interface ActorQueue {
  queued: string[]
  running: Set<string>
}

interface ActionRecord<T extends EntityMapBase> {
  state: ActionState<T>
  actorId: ActorId
  blocking: boolean
  commands: HeroCommand[]
}

export class ActionService<T extends EntityMapBase> {

  private readonly actions = new Map<string, ActionRecord<T>>()
  private readonly actorQueues = new Map<ActorId, ActorQueue>()
  private actionCounter = 0

  constructor(
    private readonly runtime: HeroPresentationRuntime,
    private readonly heroIntentCompiler: HeroIntentCompiler<T>) {
  }

  public submit(actorId: ActorId, intent: ActionIntent<T>, options?: SubmitActionOptions): string {
    const actionId = this.createActionId(actorId)
    const mode = options?.mode ?? 'enqueue'
    const blocking = options?.blocking ?? (mode !== 'parallel')

    const commands = this.compile(actorId, intent)

    const state: ActionState<T> = {
      actionId,
      actorId,
      intent,
      status: 'queued',
      blocking,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      error: null
    }

    this.actions.set(actionId, {
      state,
      actorId,
      blocking,
      commands
    })

    const queue = this.getActorQueue(actorId)
    this.applyMode(mode, actorId, queue)
    queue.queued.push(actionId)

    void this.drainActor(actorId)
    return actionId
  }

  public placeHero(target: WayPointRef, orientation: Orientation): void {
    this.cancelActor('hero')
    const commands = this.heroIntentCompiler.placeHero(target, orientation).commands
    const actionId = this.createActionId('hero')

    const state: ActionState<T> = {
      actionId,
      actorId: 'hero',
      intent: {
        type: 'move',
        targetWayPointName: target.wayPointName,
        targetSceneId: target.sceneId
      },
      status: 'running',
      blocking: true,
      createdAt: Date.now(),
      startedAt: Date.now(),
      completedAt: null,
      error: null
    }

    const record: ActionRecord<T> = {
      state,
      actorId: 'hero',
      blocking: true,
      commands
    }

    this.actions.set(actionId, record)
    const queue = this.getActorQueue('hero')
    queue.running.add(actionId)
    void this.runAction(record)
  }

  public cancel(actionId: string): void {
    const record = this.actions.get(actionId)
    if (record === undefined) {
      return
    }

    const queue = this.getActorQueue(record.actorId)
    queue.queued = queue.queued.filter(candidate => candidate !== actionId)

    if (queue.running.has(actionId)) {
      this.runtime.cancel(actionId)
      return
    }

    this.markCancelled(record)
  }

  public cancelActor(actorId: ActorId): void {
    const queue = this.getActorQueue(actorId)

    for (const actionId of queue.queued) {
      const record = this.actions.get(actionId)
      if (record !== undefined) {
        this.markCancelled(record)
      }
    }
    queue.queued = []

    for (const actionId of queue.running) {
      this.runtime.cancel(actionId)
    }
  }

  public getState(actionId: string): ActionState<T> | null {
    return this.actions.get(actionId)?.state ?? null
  }

  public destroy(): void {
    for (const actorId of this.actorQueues.keys()) {
      this.cancelActor(actorId)
    }
  }

  private applyMode(mode: QueueMode, actorId: ActorId, queue: ActorQueue): void {
    if (mode !== 'replace-current') {
      return
    }

    this.cancelActor(actorId)
    queue.queued = []
  }

  private async drainActor(actorId: ActorId): Promise<void> {
    const queue = this.getActorQueue(actorId)

    while (queue.queued.length > 0 && !this.hasBlockingRunning(queue)) {
      const nextActionId = queue.queued.shift()
      if (nextActionId === undefined) {
        break
      }

      const record = this.actions.get(nextActionId)
      if (record === undefined || record.state.status === 'cancelled') {
        continue
      }

      this.markRunning(record)
      queue.running.add(nextActionId)
      if (record.blocking) {
        void this.runAction(record)
        return
      }
      void this.runAction(record)
    }
  }

  private async runAction(record: ActionRecord<T>): Promise<void> {
    const queue = this.getActorQueue(record.actorId)

    try {
      const result = await this.runtime.execute(record.state.actionId, record.actorId, record.commands)
      if (result === 'cancelled') {
        this.markCancelled(record)
      } else {
        this.markCompleted(record)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.markFailed(record, message)
    } finally {
      queue.running.delete(record.state.actionId)
      void this.drainActor(record.actorId)
    }
  }

  private compile(actorId: ActorId, intent: ActionIntent<T>): HeroCommand[] {
    if (actorId === 'hero') {
      return this.heroIntentCompiler.compile(intent).commands
    }
    return []
  }

  private hasBlockingRunning(queue: ActorQueue): boolean {
    for (const actionId of queue.running) {
      const record = this.actions.get(actionId)
      if (record?.blocking) {
        return true
      }
    }
    return false
  }

  private getActorQueue(actorId: ActorId): ActorQueue {
    const existing = this.actorQueues.get(actorId)
    if (existing !== undefined) {
      return existing
    }

    const created: ActorQueue = {
      queued: [],
      running: new Set<string>()
    }
    this.actorQueues.set(actorId, created)
    return created
  }

  private markRunning(record: ActionRecord<T>): void {
    record.state = {
      ...record.state,
      status: 'running',
      startedAt: Date.now(),
      completedAt: null,
      error: null
    }
    this.actions.set(record.state.actionId, record)
  }

  private markCancelled(record: ActionRecord<T>): void {
    record.state = {
      ...record.state,
      status: 'cancelled',
      completedAt: Date.now()
    }
    this.actions.set(record.state.actionId, record)
  }

  private markCompleted(record: ActionRecord<T>): void {
    record.state = {
      ...record.state,
      status: 'completed',
      completedAt: Date.now()
    }
    this.actions.set(record.state.actionId, record)
  }

  private markFailed(record: ActionRecord<T>, error: string): void {
    record.state = {
      ...record.state,
      status: 'failed',
      completedAt: Date.now(),
      error
    }
    this.actions.set(record.state.actionId, record)
  }

  private createActionId(actorId: ActorId): string {
    this.actionCounter += 1
    return `${actorId}-${this.actionCounter}`
  }
}
