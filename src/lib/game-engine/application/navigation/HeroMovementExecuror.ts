import type {GameMap} from '../../domain/navigation/GameMap'
import type {HeroMoveCommand} from './move-commands/HeroMoveCommand'
import type {Observable} from 'rxjs'
import type {Subscription} from 'rxjs'
import type {HeroExecutionContext} from './HeroExecutionContext'
import type {HeroRenderState} from './HeroRenderState'

export class HeroMovementExecutor {

  private pendingCommands: HeroMoveCommand[] | null = null
  private processing = false
  private activeCommand: HeroMoveCommand | null = null
  private readonly subscription: Subscription

  constructor(
    map: GameMap,
    heroMovementCommands$: Observable<HeroMoveCommand[]>,
    getHeroState: () => HeroRenderState,
    updateHeroState: (updater: (state: HeroRenderState) => HeroRenderState) => void) {

    const ctx: HeroExecutionContext = {
      map,
      getHeroState,
      updateHeroState,
      setScene: () => {},
      inspectEntity: () => {},
      requestAnimationFrame: callback => requestAnimationFrame(callback),
      cancelAnimationFrame: id => cancelAnimationFrame(id)
    }

    this.subscription = heroMovementCommands$
      .subscribe(commands => {
        this.enqueue(commands, ctx)
      })
  }

  private enqueue(commands: HeroMoveCommand[], ctx: HeroExecutionContext): void {
    this.pendingCommands = commands
    this.activeCommand?.cancel()

    if (!this.processing) {
      void this.process(ctx)
    }
  }
  
  private async process(ctx: HeroExecutionContext): Promise<void> {
    this.processing = true

    while (this.pendingCommands !== null) {
      const commands = this.pendingCommands
      this.pendingCommands = null

      for (const command of commands) {
        if (this.pendingCommands !== null) {
          command.cancel()
          break
        }

        this.activeCommand = command
        await command.execute(ctx)
        this.activeCommand = null

        if (this.pendingCommands !== null) {
          break
        }
      }
    }

    this.processing = false
  }
  
  public destroy(): void {
    this.subscription.unsubscribe()
    this.pendingCommands = null
    this.activeCommand?.cancel()
    this.activeCommand = null
  }
}
