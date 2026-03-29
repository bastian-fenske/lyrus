import {Scene} from '../../../../lib/game-engine/domain/Scene'
import type {SceneLayout} from '../../../../lib/game-engine/domain/layout/SceneLayout'
import {Orientation} from '../../../../lib/game-engine/domain/navigation/Orientation'
import type {SceneRenderApi} from '../../../../lib/game-engine/rendering/entities/SceneRenderApi'
import type {LyrusEntityMap} from '../../LyrusEntities'
// @ts-ignore
import backgroundImage from './assets/background.png'
import type {GameApi} from '../../../../lib/game-engine/api/GameApi'

export class SorceressHutInside extends Scene<LyrusEntityMap> {

  constructor() {
    super('sorceress-hut-inside')
  }

  public setUpLayout(): SceneLayout<LyrusEntityMap> {
    return {
      background: backgroundImage,
      waypoints: [
        ['entry', 520, 1040, 2, Orientation.N],
        ['inside-center', 420, 560, 0.9]
      ],
      paths: [
        ['entry', 'inside-center', 1.8]
      ],
      zones: [
        ['entry-zone', 150, 700, 700, 120],
        ['center-zone', 360, 500, 130, 130]
      ]
    }
  }

  public setUpLogic(api: GameApi<LyrusEntityMap>): void {

    api.zone(this.id, 'entry-zone').setInteraction('entry', null)
    api.zone(this.id, 'center-zone').setInteraction('inside-center', null)
    
    api.map.getWayPoint('sorceress-hut-inside::entry').setPortal('sorceress-hut-outside::door')
  }

  public setUpRendering(_render: SceneRenderApi<LyrusEntityMap>): void {
  }
}
