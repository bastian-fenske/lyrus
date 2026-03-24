import {Application, Assets, Graphics, Sprite} from 'pixi.js'
import type {SceneLayout} from '../domain/layout/SceneLayout'
import type {EntityMapBase} from '../domain/entities/EntityTypes'
import type {ZoneService} from '../application/zones/ZoneService'

const clickableAreaOpacity = .2

export class SceneRendererService<T extends EntityMapBase> {

  private currentBackground: Sprite | null = null
  private zoneSprites: Graphics[] = []

  constructor(
    private readonly app: Application,
    private readonly zoneService: ZoneService<T>
  ) {
  }

  public render(sceneId: string, layout: SceneLayout<T>): void {
    this.drawBackground(layout.background)
    this.drawZones(sceneId)
  }

  private drawBackground(url: string): void {
    if (this.currentBackground === null) {
      const {width, height} = this.app.screen
      const stageSize = {width, height}
      const background = Object.assign(Sprite.from(url), stageSize)
      this.currentBackground = this.app.stage.addChildAt(background, 0)
    }

    this.app.stage.setChildIndex(this.currentBackground, 0)
    this.currentBackground.texture = Assets.get(url)
  }

  private drawZones(sceneId: string): void {
    this.zoneSprites.forEach(sprite => {
      sprite.removeFromParent()
      sprite.destroy()
    })

    this.zoneSprites = this.zoneService.getForScene(sceneId)
      .map(zone => {
        const clickableArea = new Graphics()
        clickableArea.zIndex = 100
        clickableArea.rect(zone.x, zone.y, zone.width, zone.height)
        clickableArea.fill([1, 1, 1, clickableAreaOpacity])
        clickableArea.cursor = zone.enabled ? 'pointer' : 'default'
        clickableArea.onclick = () => this.zoneService.click(zone.sceneId, zone.name)
        return clickableArea
      })

    this.zoneSprites.forEach(clickableArea => {
      this.app.stage.addChild(clickableArea)
    })
  }

  public destroy(): void {
    this.zoneSprites.forEach(sprite => {
      sprite.removeFromParent()
      sprite.destroy()
    })
    this.zoneSprites = []

    if (this.currentBackground !== null) {
      this.currentBackground.removeFromParent()
      this.currentBackground.destroy()
      this.currentBackground = null
    }
  }
}
