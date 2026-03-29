import {Game} from '../../lib/game-engine/domain/Game'
import type {Scene} from '../../lib/game-engine/domain/Scene'
import type {GameApi} from '../../lib/game-engine/api/GameApi'
import {Orientation} from '../../lib/game-engine/domain/navigation/Orientation'
import {SorceressHutOutside} from './scenes/sorceress-hut-outside/SorceressHutOutside'
import {SorceressHutInside} from './scenes/sorceress-hut-inside/SorceressHutInside'
import {Forest} from './scenes/forest/Forest'
import {initialEntityState, type LyrusEntityMap} from './LyrusEntities'

export class Lyrus extends Game<LyrusEntityMap> {

  public readonly initialEntityState = initialEntityState

  public readonly scenes: Scene<LyrusEntityMap>[] = [
    new SorceressHutOutside(),
    new SorceressHutInside(),
    new Forest()
  ]

  public load(api: GameApi<LyrusEntityMap>): void {
    api.navigation.placeHero('sorceress-hut-outside::center', Orientation.S)
  }
}
