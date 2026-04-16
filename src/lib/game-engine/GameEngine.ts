import {SceneService} from './application/scene/SceneService'
import {GameMap} from './domain/navigation/GameMap'
import {GameApi} from './api/GameApi'
import {RenderingService} from './rendering/RenderingService'
import {ActiveGameSession} from './ActiveGameSession'
import type {GameDefinition} from './domain/GameDefinition'
import {EntityService} from './application/entities/EntityService'
import {ZoneService} from './application/zones/ZoneService'
import type {EntityMapBase} from './domain/entities/EntityTypes'
import {WayPoint} from './domain/navigation/WayPoint'
import type {SceneLayout} from './domain/layout/SceneLayout'
import {SceneRenderApi} from './rendering/entities/SceneRenderApi'
import {NavigationApi} from './api/NavigationApi'
import {HeroIntentCompiler} from './application/actions/HeroIntentCompiler'
import {HeroPresentationRuntime} from './presentation/HeroPresentationRuntime'
import {HeroPresentationService} from './presentation/HeroPresentationService'
import {ActionService} from './application/actions/ActionService'
import {WayPointRef} from './domain/navigation/WayPointRef'

export class GameEngine {

  private session: ActiveGameSession<any> | null = null

  public async startGame<T extends EntityMapBase>(gameDefinition: GameDefinition<T>): Promise<void> {

    this.session?.destroy()

    const game = gameDefinition.createGame()

    const map = new GameMap()
    const sceneService = new SceneService()
    const heroPresentationService = new HeroPresentationService()
    const entityService = new EntityService(game.initialEntityState)
    const heroIntentCompiler = new HeroIntentCompiler<T>(map)
    const presentationRuntime = new HeroPresentationRuntime(
      map,
      () => heroPresentationService.getHeroRenderState(),
      updater => heroPresentationService.updateHeroRenderState(updater),
      sceneId => sceneService.goTo(sceneId),
      entityId => entityService.use(entityId as Extract<keyof T, string>),
      entityId => entityService.inspect(entityId as Extract<keyof T, string>))
    const actionService = new ActionService<T>(presentationRuntime, heroIntentCompiler)
    const navigationApi = new NavigationApi<T>(actionService)
    const zoneService = new ZoneService(navigationApi)

    const gameApi = new GameApi(map, actionService, entityService, zoneService)
    zoneService.registerApi(gameApi)

    const layoutsBySceneId = this.registerLayouts(gameApi, game.scenes)

    game.scenes.forEach(scene => {
      scene.setUpLogic(gameApi)
    })

    const renderingService = new RenderingService(zoneService, entityService)
    game.scenes.forEach(scene => {
      scene.setUpRendering(new SceneRenderApi(scene.id, (binding) => renderingService.registerEntityBinding(binding)))
    })

    game.load(gameApi)

    await renderingService.start(
      game,
      layoutsBySceneId,
      sceneService.currentScene$,
      heroPresentationService.heroRenderState$)

    this.session = new ActiveGameSession(renderingService, actionService, presentationRuntime)
  }

  private registerLayouts<T extends EntityMapBase>(gameApi: GameApi<T>, scenes: Array<{id: string, setUpLayout: () => SceneLayout<T>}>): Map<string, SceneLayout<T>> {
    const layoutsBySceneId = new Map<string, SceneLayout<T>>()

    scenes.forEach(scene => {
      const layout = scene.setUpLayout()
      layoutsBySceneId.set(scene.id, layout)

      layout.waypoints.forEach(([name, x, y, scale, entryOrientation = null, portalTarget = null]) => {
        const wayPoint = new WayPoint(name,
          x,
          y,
          scale,
          portalTarget ? WayPointRef.normalize(portalTarget): null,
          entryOrientation)
        gameApi.map.addWayPoint(scene.id, wayPoint)
      })

      layout.paths.forEach(([from, to, duration]) => {
        gameApi.map.addPath(scene.id, from, to, duration, true)
      })

      layout.zones.forEach(([name, x, y, width, height, wayPointName = null, entityId = null, enabled = true]) => {
        gameApi.zones.add(scene.id, name, x, y, width, height, wayPointName, entityId, enabled)
      })
    })

    return layoutsBySceneId
  }
}
