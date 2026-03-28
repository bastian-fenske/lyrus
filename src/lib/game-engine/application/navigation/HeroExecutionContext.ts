import type {GameMap} from '../../domain/navigation/GameMap'
import type {HeroRenderState} from './HeroRenderState'

export interface HeroExecutionContext {
  map: GameMap
  getHeroState: () => HeroRenderState
  updateHeroState: (updater: (state: HeroRenderState) => HeroRenderState) => void
  setScene: (sceneId: string) => void
  inspectEntity: (entityId: string) => void
  requestAnimationFrame: (callback: FrameRequestCallback) => number
  cancelAnimationFrame: (id: number) => void
}
