import {Scene} from '../../../../lib/game-engine/domain/Scene'
import type {SceneLayout} from '../../../../lib/game-engine/domain/layout/SceneLayout'
import type {SceneRenderApi} from '../../../../lib/game-engine/rendering/entities/SceneRenderApi'
import type {LyrusEntityMap} from '../../LyrusEntities'
// @ts-ignore
import backgroundImage from './assets/background.png'
import type {GameApi} from '../../../../lib/game-engine/api/GameApi'
import {Orientation} from '../../../../lib/game-engine/domain/navigation/Orientation'

export class Forest extends Scene<LyrusEntityMap> {

  constructor() {
    super('forest')
  }

  public setUpLayout(): SceneLayout<LyrusEntityMap> {
    return {
      background: backgroundImage,
      waypoints: [
        ['back', 600, 530, 0.3, Orientation.S],
        ['center', 420, 620, 1],
        ['clearing', 320, 540, 0.8],
        ['cauldron-spot', 730, 600, 0.9]
      ],
      paths: [
        ['back', 'center', 0.65],
        ['center', 'clearing', 0.9],
        ['center', 'cauldron-spot', 0.8]
      ],
      zones: [
        ['back-zone', 550, 380, 160, 180, 'back'],
        ['key-zone', 250, 430, 170, 170, 'center', 'key'],
        ['cauldron-zone', 650, 420, 190, 220, 'cauldron-spot', 'cauldron']
      ]
    }
  }

  public setUpLogic(api: GameApi<LyrusEntityMap>): void {

    api.entity('cauldron').onUse((state, sceneApi) => {
      sceneApi.entity('cauldron').patchState({isBubbling: !state.isBubbling})
    })

    api.entity('key').onUse((_, api) => {
      alert('Oh, ein Schluessel!')
      const key = api.entity('key')
      key.patchState({collected: true})
      api.zones.get(this.id, 'key-zone').enabled = false // Won't trigger
    })
    
    api.map.getWayPoint('forest::back').setPortal('sorceress-hut-outside::forest-exit')
  }

  public setUpRendering(render: SceneRenderApi<LyrusEntityMap>): void {
    render.entity('key', (view, state) => {
      view.position = {x: 315, y: 520}
      view.width = 22
      view.height = 22
      view.tint = 0xe9c146
      view.alpha = 1
      view.visible = !state.collected
      view.zIndex = 35
    })

    render.entity('cauldron', (view, state) => {
      view.position = {x: 730, y: 520}
      view.width = 90
      view.height = 90
      view.visible = true
      view.tint = state.isBubbling ? 0x58d68d : 0x4a3f35
      view.alpha = state.isBubbling ? 1 : 0.85
      view.zIndex = 34
    })
  }
}
