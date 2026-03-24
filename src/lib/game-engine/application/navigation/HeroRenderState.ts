import {Orientation} from '../../domain/navigation/Orientation'

export const HERO_BASE_SIZE = 512

export interface HeroRenderState {
  sceneId: string | null
  x: number
  y: number
  scale: number
  orientation: Orientation
  anchorX: number
  anchorY: number
  visible: boolean
}

export const initialHeroRenderState: HeroRenderState = {
  sceneId: null,
  x: 0,
  y: 0,
  scale: 1,
  orientation: Orientation.S,
  anchorX: 0.5,
  anchorY: 0.81,
  visible: false
}
