import type {EntityMapBase} from '../../domain/entities/EntityTypes'
import type {ActionIntent, ActionState, PresentationActionState, SubmitActionOptions} from './ActionTypes'
import type {ActionService} from './ActionService'

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

  public getPresentationState(actionId: string): PresentationActionState | null {
    return this.actionService.getPresentationState(actionId)
  }
}
