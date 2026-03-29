import type {EntityMapBase} from '../domain/entities/EntityTypes'
import type {ActionIntent, ActionState, SubmitActionOptions} from '../application/actions/ActionTypes'
import type {ActionService} from '../application/actions/ActionService'

export class ActionsApi<T extends EntityMapBase> {

  constructor(private readonly actionService: ActionService<T>) {
  }

  public submit(actorId: string, intent: ActionIntent<T>, options?: SubmitActionOptions): string {
    return this.actionService.submit(actorId, intent, options)
  }

  public cancel(actionId: string): void {
    this.actionService.cancel(actionId)
  }

  public cancelActor(actorId: string): void {
    this.actionService.cancelActor(actorId)
  }

  public getState(actionId: string): ActionState<T> | null {
    return this.actionService.getState(actionId)
  }
}
