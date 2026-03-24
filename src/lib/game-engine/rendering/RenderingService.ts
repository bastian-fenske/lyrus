import type {Observable, Subscription} from 'rxjs'
import {combineLatest, merge} from 'rxjs'
import {map, shareReplay, tap} from 'rxjs/operators'
import {Application, Assets} from 'pixi.js'
import type {Game} from '../domain/Game'
import type {HeroRenderState} from '../application/navigation/HeroRenderState'
import {SceneRendererService} from './SceneRendererService'
import {HeroRendererService} from './HeroRendererService'
import {heroTextureUrls} from '../../../game/lyrus/assets/hero/heroTextures'
import type {EntityId, EntityMapBase} from '../domain/entities/EntityTypes'
import type {EntityService} from '../application/entities/EntityService'
import type {SceneLayout} from '../domain/layout/SceneLayout'
import {EntityRendererService} from './entities/EntityRendererService'
import type {ZoneService} from '../application/zones/ZoneService'
import type {EntityRenderBinding} from './entities/SceneRenderApi'

export class RenderingService<T extends EntityMapBase> {

  private readonly app: Application

  private readonly sceneRenderer: SceneRendererService<T>
  private readonly heroRenderer: HeroRendererService
  private readonly entityRenderer: EntityRendererService<T>
  private subscription: Subscription | null = null

  constructor(
    zoneService: ZoneService<T>,
    entityService: EntityService<T>,
    host: HTMLElement = document.body) {

    this.app = new Application()
    this.sceneRenderer = new SceneRendererService(this.app, zoneService)
    this.heroRenderer = new HeroRendererService(this.app)
    this.entityRenderer = new EntityRendererService(this.app, entityService)
    this.init(host)

    entityService.stateChanges$.subscribe(change => {
      this.entityRenderer.onEntityStateChanged(change.entityId, change.oldState, change.newState, change.sceneId)
    })
  }

  async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      width: 1024,
      height: 768,
      backgroundColor: 0x000000,
      eventMode: 'dynamic'
    })

    host.appendChild(this.app.canvas)
  }

  public registerEntityBinding(binding: EntityRenderBinding<T, EntityId<T>>): void {
    this.entityRenderer.registerBinding(binding)
  }

  public async start(
    _game: Game<T>,
    layoutsBySceneId: Map<string, SceneLayout<T>>,
    currentSceneId$: Observable<string>,
    heroState$: Observable<HeroRenderState>) {

    await this.preloadAssets(Array.from(layoutsBySceneId.values()).map(layout => layout.background))
    await this.preloadAssets(heroTextureUrls)

    const currentScene$ = currentSceneId$.pipe(
      map(sceneId => ({sceneId, layout: layoutsBySceneId.get(sceneId)!})),
      shareReplay({bufferSize: 1, refCount: true}))

    const sceneRender$ = currentScene$.pipe(
      tap(({sceneId, layout}) => {
        this.sceneRenderer.render(sceneId, layout)
        this.entityRenderer.renderScene(sceneId)
      }))

    const heroRender$ = combineLatest([heroState$, currentScene$]).pipe(
      tap(([heroState, {sceneId}]) => this.heroRenderer.render(heroState, sceneId)))

    this.subscription = merge(sceneRender$, heroRender$)
      .subscribe()
  }

  public destroy(): void {
    this.sceneRenderer.destroy()
    this.heroRenderer.destroy()
    this.entityRenderer.destroy()
    this.subscription?.unsubscribe()
  }

  private async preloadAssets(urls: string[]): Promise<void> {
    if (urls.length === 0) {
      return
    }

    await Assets.load(urls)
  }
}
