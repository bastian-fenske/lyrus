import type {HeroMoveCommand} from './HeroMoveCommand'
import type {HeroExecutionContext} from '../HeroExecutionContext'
import type {Orientation} from '../../../domain/navigation/Orientation'
import type {WayPointRef} from '../../../domain/navigation/WayPointRef'

export class PlaceHero implements HeroMoveCommand {

  constructor(
    private readonly wayPointRef: WayPointRef,
    private readonly orientation: Orientation
  ) {}

  async execute(ctx: HeroExecutionContext): Promise<void> {

    ctx.setScene(this.wayPointRef.sceneId)
    const targetWayPoint = ctx.map.getWayPoint(this.wayPointRef)
    if (targetWayPoint === null) {
      throw new Error(`WayPoint not found: ${this.wayPointRef}`)
    }

    ctx.updateHeroState(state => ({
      ...state,
      sceneId: this.wayPointRef.sceneId,
      x: targetWayPoint.x,
      y: targetWayPoint.y,
      scale: targetWayPoint.scale,
      orientation: this.orientation,
      anchorX: 0.5,
      anchorY: 0.81,
      visible: true
    }))
  }

  cancel() {}
}
