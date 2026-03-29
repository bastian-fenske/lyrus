import type {SceneRenderApi} from '../rendering/entities/SceneRenderApi'
import type {EntityMapBase} from './entities/EntityTypes'
import type {SceneLayout} from './layout/SceneLayout'
import type {GameApi} from '../api/GameApi'

export abstract class Scene<T extends EntityMapBase> {

  protected constructor(public readonly id: string) {
  }

  public abstract setUpLayout(): SceneLayout<T>

  public abstract setUpLogic(api: GameApi<T>): void

  public abstract setUpRendering(render: SceneRenderApi<T>): void
}
