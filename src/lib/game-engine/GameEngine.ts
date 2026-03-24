import {SceneService} from './application/scene/SceneService'
import {GameMap} from './domain/navigation/GameMap'
import {HeroMovementService} from './application/navigation/HeroMovementService'
import {HeroMovementExecutor} from './application/navigation/HeroMovementExecuror'
import {GameApi} from './application/GameApi'
import {RenderingService} from './rendering/RenderingService'
import {ActiveGameSession} from './ActiveGameSession'
import type {GameDefinition} from './domain/GameDefinition'
import {EntityService} from './application/entities/EntityService'
import {ZoneService} from './application/zones/ZoneService'
import type {EntityMapBase} from './domain/entities/EntityTypes'
import {WayPoint} from './domain/navigation/WayPoint'
import {Orientation} from './domain/navigation/Orientation'
import type {SceneLayout} from './domain/layout/SceneLayout'
import {SceneRenderApi} from './rendering/entities/SceneRenderApi'
import {NavigationApi} from './application/navigation/NavigationApi'

export class GameEngine {

  private session: ActiveGameSession<any> | null = null

  public async startGame<T extends EntityMapBase>(gameDefinition: GameDefinition<T>): Promise<void> {

    this.session?.destroy()

    const game = gameDefinition.createGame()

    const map = new GameMap()
    const sceneService = new SceneService()
    const heroMovementService = new HeroMovementService(map, sceneService)
    const entityService = new EntityService(game.initialEntityState)
    const navigationApi = new NavigationApi(heroMovementService)
    const zoneService = new ZoneService(navigationApi, entityService)

    const gameApi = new GameApi(map, heroMovementService, entityService, zoneService)
    zoneService.registerApi(gameApi)

    const layoutsBySceneId = this.registerLayouts(gameApi, game.scenes)

    game.scenes.forEach(scene => {
      scene.setUpLogic(gameApi)
    })

    const renderingService = new RenderingService(zoneService, entityService)
    game.scenes.forEach(scene => {
      scene.setUpRendering(new SceneRenderApi(scene.id, (binding) => renderingService.registerEntityBinding(binding)))
    })

    const movementExecutor = new HeroMovementExecutor(
      map,
      heroMovementService.heroMovesCommands$,
      () => heroMovementService.getHeroRenderState(),
      updater => heroMovementService.updateHeroRenderState(updater))

    game.load(gameApi)

    await renderingService.start(
      game,
      layoutsBySceneId,
      sceneService.currentScene$,
      heroMovementService.heroRenderState$)

    this.session = new ActiveGameSession(renderingService, movementExecutor)
  }

  private registerLayouts<T extends EntityMapBase>(gameApi: GameApi<T>, scenes: Array<{id: string, setUpLayout: () => SceneLayout<T>}>): Map<string, SceneLayout<T>> {
    const layoutsBySceneId = new Map<string, SceneLayout<T>>()

    scenes.forEach(scene => {
      const layout = scene.setUpLayout()
      layoutsBySceneId.set(scene.id, layout)

      layout.waypoints.forEach(([name, x, y, scale, entryOrientation = null]) => {
        const wayPoint = new WayPoint(name, x, y, scale)
        if (entryOrientation !== null) {
          wayPoint.setEntryOrientation(entryOrientation)
        } else {
          wayPoint.setEntryOrientation(Orientation.S)
        }
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
