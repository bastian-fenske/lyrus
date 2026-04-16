import type {HeroExecutionContext} from '../../../application/navigation/HeroExecutionContext'
import type {HeroCommand} from './HeroCommand'
import type {WayPoint} from '../../../domain/navigation/WayPoint'

interface MoveToHooks {
  onStart?: () => void
  onProgress?: (elapsed: number) => void
  onComplete?: () => void
  onCancel?: () => void
}

export class MoveTo implements HeroCommand {

  private cancelled = false
  private activeAnimation: number | null = null

  constructor(
    private readonly target: WayPoint,
    private readonly duration: number = 0.6,
    private readonly hooks: MoveToHooks = {}
  ) {}

  execute(ctx: HeroExecutionContext): Promise<void> {

    const heroState = ctx.getHeroState()

    const x0 = heroState.x
    const y0 = heroState.y
    const s0 = heroState.scale

    const x1 = this.target.x
    const y1 = this.target.y
    const s1 = this.target.scale

    const vx = (x1 - x0) / this.duration
    const vy = (y1 - y0) / this.duration
    const vs = (s1 - s0) / this.duration

    this.hooks.onStart?.()

    return new Promise(resolve => {

      let elapsed = 0
      let previousTime: number | null = null

      const move = (time: number) => {

        if (this.cancelled) {
          this.hooks.onProgress?.(elapsed)
          this.hooks.onCancel?.()
          if (this.activeAnimation !== null) {
            ctx.cancelAnimationFrame(this.activeAnimation)
            this.activeAnimation = null
          }
          resolve()
          return
        }

        if (previousTime === null) {
          previousTime = time
        }
        const dt = (time - previousTime) / 1000
        previousTime = time

        if (elapsed < this.duration) {
          elapsed = Math.min(this.duration, elapsed + dt)

          ctx.updateHeroState(state => ({
            ...state,
            x: x0 + vx * elapsed,
            y: y0 + vy * elapsed,
            scale: s0 + vs * elapsed
          }))
          this.hooks.onProgress?.(elapsed)
          this.activeAnimation = ctx.requestAnimationFrame(move)

        } else {
          ctx.updateHeroState(state => ({
            ...state,
            x: x1,
            y: y1,
            scale: s1
          }))

          this.hooks.onProgress?.(this.duration)
          this.hooks.onComplete?.()
          this.activeAnimation = null
          resolve()
        }
      }

      this.activeAnimation = ctx.requestAnimationFrame(move)
    })
  }

  cancel() {
    this.cancelled = true
  }
}
