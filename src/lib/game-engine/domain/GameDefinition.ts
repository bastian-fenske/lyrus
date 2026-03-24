import type {EntityMapBase} from './entities/EntityTypes'
import type {Game} from './Game'

export interface GameDefinition<T extends EntityMapBase = EntityMapBase> {
  id: string
  title: string
  description: string
  createGame: () => Game<T>
}
