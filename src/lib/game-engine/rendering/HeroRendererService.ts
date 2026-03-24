import {Application, Assets, Sprite} from 'pixi.js'
import type {HeroRenderState} from '../application/navigation/HeroRenderState'
import {HERO_BASE_SIZE} from '../application/navigation/HeroRenderState'
import {getHeroTextureUrl} from '../../../game/lyrus/assets/hero/heroTextures'

export class HeroRendererService {

  private readonly hero = new Sprite()

  constructor(app: Application) {

    this.hero.zIndex = 10
    app.stage.addChild(this.hero)
  }

  public destroy(): void {
    this.hero.removeFromParent()
    this.hero.destroy()
  }

  public render(state: HeroRenderState, currentScene: string): void {
    this.hero.texture = Assets.get(getHeroTextureUrl(state.orientation))
    this.hero.anchor.set(state.anchorX, state.anchorY)
    this.hero.x = state.x
    this.hero.y = state.y

    const heroSize = state.scale * HERO_BASE_SIZE
    this.hero.width = heroSize
    this.hero.height = heroSize
    this.hero.visible = state.visible && state.sceneId === currentScene
  }
}
