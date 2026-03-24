import {Orientation} from '../../../../lib/game-engine/domain/navigation/Orientation'

import heroN from './hero-N.png'
import heroNE from './hero-NE.png'
import heroE from './hero-E.png'
import heroSE from './hero-SE.png'
import heroS from './hero-S.png'
import heroSW from './hero-SW.png'
import heroW from './hero-W.png'
import heroNW from './hero-NW.png'

export const heroTextureByOrientation: Record<Orientation, string> = {
  [Orientation.N]: heroN,
  [Orientation.NE]: heroNE,
  [Orientation.E]: heroE,
  [Orientation.SE]: heroSE,
  [Orientation.S]: heroS,
  [Orientation.SW]: heroSW,
  [Orientation.W]: heroW,
  [Orientation.NW]: heroNW
}

export const heroTextureUrls = Object.values(heroTextureByOrientation)

export function getHeroTextureUrl(orientation: Orientation): string {
  return heroTextureByOrientation[orientation]
}
