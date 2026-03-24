import {Application, Assets, Sprite} from 'pixi.js'
import type {EntityMapBase, EntityId} from '../../domain/entities/EntityTypes'
import type {EntityService} from '../../application/entities/EntityService'
import type {EntityRenderBinding, EntityView} from './SceneRenderApi'

class SpriteEntityView implements EntityView {

  private textureUrl = ''

  constructor(private readonly sprite: Sprite) {
  }

  public get position(): { x: number; y: number } {
    return {x: this.sprite.x, y: this.sprite.y}
  }

  public set position(position: { x: number; y: number }) {
    this.sprite.x = position.x
    this.sprite.y = position.y
  }

  public get texture(): string {
    return this.textureUrl
  }

  public set texture(url: string) {
    this.textureUrl = url
    const texture = Assets.get(url)
    if (texture !== undefined) {
      this.sprite.texture = texture
    }
  }

  public get width(): number {
    return this.sprite.width
  }

  public set width(value: number) {
    this.sprite.width = value
  }

  public get height(): number {
    return this.sprite.height
  }

  public set height(value: number) {
    this.sprite.height = value
  }

  public get visible(): boolean {
    return this.sprite.visible
  }

  public set visible(value: boolean) {
    this.sprite.visible = value
  }

  public get alpha(): number {
    return this.sprite.alpha
  }

  public set alpha(value: number) {
    this.sprite.alpha = value
  }

  public get tint(): number {
    return this.sprite.tint
  }

  public set tint(value: number) {
    this.sprite.tint = value
  }

  public get zIndex(): number {
    return this.sprite.zIndex
  }

  public set zIndex(value: number) {
    this.sprite.zIndex = value
  }

  public playAnimation(_name: string): void {
    // Animation system is unchanged for now.
  }
}

interface RuntimeBinding<T extends EntityMapBase, K extends EntityId<T>> {
  binding: EntityRenderBinding<T, K>
  sprite: Sprite
  view: EntityView
}

export class EntityRendererService<T extends EntityMapBase> {

  private readonly bindings: RuntimeBinding<T, EntityId<T>>[] = []
  private currentSceneId: string | null = null

  constructor(
    private readonly app: Application,
    private readonly entityService: EntityService<T>
  ) {
  }

  public registerBinding<K extends EntityId<T>>(binding: EntityRenderBinding<T, K>): void {
    const sprite = new Sprite()
    sprite.zIndex = 20
    sprite.visible = false
    this.app.stage.addChild(sprite)

    const runtimeBinding: RuntimeBinding<T, EntityId<T>> = {
      binding: binding as unknown as EntityRenderBinding<T, EntityId<T>>,
      sprite,
      view: new SpriteEntityView(sprite)
    }

    this.bindings.push(runtimeBinding)
  }

  public renderScene(sceneId: string): void {
    this.currentSceneId = sceneId

    this.bindings.forEach(runtimeBinding => {
      const isVisible = runtimeBinding.binding.sceneId === sceneId
      runtimeBinding.sprite.visible = isVisible
      if (!isVisible) {
        return
      }

      const state = this.entityService.getState(runtimeBinding.binding.entityId)
      runtimeBinding.binding.handler(runtimeBinding.view, state, null)
    })
  }

  public onEntityStateChanged(entityId: EntityId<T>, oldState: T[EntityId<T>], newState: T[EntityId<T>], sceneId: string | null): void {
    const targetSceneId = sceneId ?? this.currentSceneId
    if (targetSceneId === null) {
      return
    }

    this.bindings
      .filter(runtimeBinding => runtimeBinding.binding.entityId === entityId && runtimeBinding.binding.sceneId === targetSceneId)
      .forEach(runtimeBinding => {
        runtimeBinding.binding.handler(runtimeBinding.view, newState, oldState)
      })
  }

  public destroy(): void {
    this.bindings.forEach(runtimeBinding => {
      runtimeBinding.sprite.removeFromParent()
      runtimeBinding.sprite.destroy()
    })
    this.bindings.splice(0, this.bindings.length)
    this.currentSceneId = null
  }
}
