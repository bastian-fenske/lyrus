import type {EntityMapBase, EntityId} from '../../domain/entities/EntityTypes'

export interface EntityView {
  position: {x: number, y: number}
  texture: string
  width: number
  height: number
  visible: boolean
  alpha: number
  tint: number
  zIndex: number
  playAnimation(name: string): void
}

export type EntityRenderHandler<State> = (view: EntityView, state: State, oldState: State | null) => void

export interface EntityRenderBinding<T extends EntityMapBase, K extends EntityId<T>> {
  sceneId: string
  entityId: K
  handler: EntityRenderHandler<T[K]>
}

export class SceneRenderApi<T extends EntityMapBase> {

  constructor(
    private readonly sceneId: string,
    private readonly registerBinding: (binding: EntityRenderBinding<T, EntityId<T>>) => void
  ) {
  }

  public entity<K extends EntityId<T>>(entityId: K, handler: EntityRenderHandler<T[K]>): void {
    this.registerBinding({
      sceneId: this.sceneId,
      entityId,
      handler
    } as unknown as EntityRenderBinding<T, EntityId<T>>)
  }
}
