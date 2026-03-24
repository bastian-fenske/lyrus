import type {GameApi} from '../application/GameApi'
import type {EntityMapBase} from './entities/EntityTypes'
import type {Scene} from './Scene'

export abstract class Game<T extends EntityMapBase> {

  public abstract readonly initialEntityState: T

  public abstract readonly scenes: Scene<T>[]

  public abstract load(api: GameApi<T>): void
}
