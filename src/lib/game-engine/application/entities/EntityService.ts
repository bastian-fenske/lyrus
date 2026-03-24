import {Subject} from 'rxjs'
import type {EntityId, EntityMapBase} from '../../domain/entities/EntityTypes'

export interface EntityStateChangeEvent<T extends EntityMapBase, K extends EntityId<T> = EntityId<T>> {
  entityId: K
  sceneId: string | null
  oldState: T[K]
  newState: T[K]
}

type EntityInteractionHandler<T extends EntityMapBase, K extends EntityId<T>> = (state: T[K]) => void
type EntityStateChangeHandler<T extends EntityMapBase, K extends EntityId<T>> = (newState: T[K], oldState: T[K], sceneId: string | null) => void

function cloneState<S>(state: S): S {
  if (typeof state === 'object' && state !== null) {
    return ({...(state as object)} as S)
  }
  return state
}

export class EntityService<T extends EntityMapBase> {

  private readonly globalState: Partial<Record<EntityId<T>, T[EntityId<T>]>> = {}
  private readonly useHandlers = new Map<EntityId<T>, Array<EntityInteractionHandler<T, EntityId<T>>>>()
  private readonly inspectHandlers = new Map<EntityId<T>, Array<EntityInteractionHandler<T, EntityId<T>>>>()
  private readonly stateChangeHandlers = new Map<EntityId<T>, Array<EntityStateChangeHandler<T, EntityId<T>>>>()

  private readonly _stateChanges$ = new Subject<EntityStateChangeEvent<T>>()
  public readonly stateChanges$ = this._stateChanges$.asObservable()

  constructor(private readonly initialState: T) {
    
    ;(Object.keys(initialState) as Array<EntityId<T>>)
      .forEach(entityId => {
        this.globalState[entityId] = cloneState(this.initialFor(entityId))
      })
  }

  public getState<K extends EntityId<T>>(entityId: K): T[K] {
    return cloneState(this.resolveState(entityId))
  }

  public setState<K extends EntityId<T>>(entityId: K, state: T[K]): void {
    const oldState = this.resolveState(entityId)
    const next = cloneState(state)

    this.globalState[entityId] = next
    this.notifyStateChanged(entityId, oldState, next, null)
    this._stateChanges$.next({entityId, sceneId: null, oldState, newState: next})
  }

  public patchState<K extends EntityId<T>>(entityId: K, partialState: Partial<T[K]>): void {
    const current = this.resolveState(entityId)
    this.setState(entityId, {...(current as object), ...(partialState as object)} as T[K])
  }

  public onUse<K extends EntityId<T>>(entityId: K, handler: EntityInteractionHandler<T, K>): void {
    const handlers = this.useHandlers.get(entityId) ?? []
    handlers.push(handler as EntityInteractionHandler<T, EntityId<T>>)
    this.useHandlers.set(entityId, handlers)
  }

  public onInspect<K extends EntityId<T>>(entityId: K, handler: EntityInteractionHandler<T, K>): void {
    const handlers = this.inspectHandlers.get(entityId) ?? []
    handlers.push(handler as EntityInteractionHandler<T, EntityId<T>>)
    this.inspectHandlers.set(entityId, handlers)
  }

  public onStateChange<K extends EntityId<T>>(entityId: K, handler: EntityStateChangeHandler<T, K>): void {
    const handlers = this.stateChangeHandlers.get(entityId) ?? []
    handlers.push(handler as EntityStateChangeHandler<T, EntityId<T>>)
    this.stateChangeHandlers.set(entityId, handlers)
  }

  public use<K extends EntityId<T>>(entityId: K): void {
    const handlers = this.useHandlers.get(entityId) ?? []
    const state = this.getState(entityId)
    handlers.forEach(handler => handler(state as T[EntityId<T>]))
  }

  public inspect<K extends EntityId<T>>(entityId: K): void {
    const handlers = this.inspectHandlers.get(entityId) ?? []
    const state = this.getState(entityId)
    handlers.forEach(handler => handler(state as T[EntityId<T>]))
  }

  private resolveState<K extends EntityId<T>>(entityId: K): T[K] {
    const state = this.globalState[entityId] ?? this.initialFor(entityId)
    return cloneState(state as T[K])
  }

  private initialFor<K extends EntityId<T>>(entityId: K): T[K] {
    return this.initialState[entityId] as T[K]
  }

  private notifyStateChanged<K extends EntityId<T>>(entityId: K, oldState: T[K], newState: T[K], sceneId: string | null): void {
    const handlers = this.stateChangeHandlers.get(entityId) ?? []
    handlers.forEach(handler => handler(newState as T[EntityId<T>], oldState as T[EntityId<T>], sceneId))
  }
}
