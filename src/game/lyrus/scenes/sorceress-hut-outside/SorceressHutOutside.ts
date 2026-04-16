import {Scene} from '../../../../lib/game-engine/domain/Scene'
import type {SceneLayout} from '../../../../lib/game-engine/domain/layout/SceneLayout'
import {Orientation} from '../../../../lib/game-engine/domain/navigation/Orientation'
import type {SceneRenderApi} from '../../../../lib/game-engine/rendering/entities/SceneRenderApi'
import type {LyrusEntityMap} from '../../LyrusEntities'
// @ts-ignore
import backgroundImage from './assets/background.png'
// @ts-ignore
import doorTexture from './assets/door-closed.png'
import {Assets} from 'pixi.js'
import type {GameApi} from '../../../../lib/game-engine/api/GameApi'

export class SorceressHutOutside extends Scene<LyrusEntityMap> {

  constructor() {
    super('sorceress-hut-outside')
  }

  public setUpLayout(): SceneLayout<LyrusEntityMap> {
    return {
      background: backgroundImage,
      waypoints: [
        ['center', 400, 590, 1],
        ['door', 550, 480, 0.6, Orientation.SW],
        ['forest-exit', 620, 750, 1.5, Orientation.N, 'forest::back']
      ],
      paths: [
        ['center', 'door', 1.1],
        ['center', 'forest-exit', 1.3]
      ],
      zones: [
        ['door-zone', 520, 280, 100, 180],
        ['forest-zone', 470, 710, 280, 60, 'forest-exit']
      ]
    }
  }

  public setUpLogic(api: GameApi<LyrusEntityMap>): void {
    
    api.zone(this.id, 'door-zone').onClick(api => {
      api.navigation.moveTo('door')
      setTimeout(() => {
        
        if (!api.entity('key').getState().collected) {
          alert('Die Tür ist verschlossen!')
          api.navigation.placeHero('sorceress-hut-outside::door', Orientation.S)
          return
        }
        
        setTimeout(() => {
          api.entity('door').setState({isOpen: true})
          setTimeout(() => {
            api.navigation.placeHero('sorceress-hut-inside::entry', Orientation.N)
          }, 1000)
        }, 1000)
        
      }, 2000)
    })
    api.zone(this.id, 'forest-zone').setInteraction('forest-exit', null)

    api.entity('door').onUse((state, gameApi) => {
      gameApi.entity('door').patchState({isOpen: !state.isOpen})
    })
  }

  public async setUpRendering(render: SceneRenderApi<LyrusEntityMap>): Promise<void> {
    
    await Assets.load(doorTexture)
    
    render.entity('door', (view, state, oldState) => {
      view.position = {x: 454, y: 211}
      view.width = 234
      view.height = 279
      view.visible = !state.isOpen
      view.texture = doorTexture
      view.zIndex = 0

      if (oldState !== null && !oldState.isOpen && state.isOpen) {
        view.playAnimation('door_open')
      }
    })
  }
}
