import {BehaviorSubject} from 'rxjs'
import {initialHeroRenderState, type HeroRenderState} from '../navigation/HeroRenderState'

export class HeroPresentationService {

  private readonly _heroRenderState$ = new BehaviorSubject<HeroRenderState>(initialHeroRenderState)
  public readonly heroRenderState$ = this._heroRenderState$.asObservable()

  public getHeroRenderState(): HeroRenderState {
    return this._heroRenderState$.value
  }

  public updateHeroRenderState(updater: (state: HeroRenderState) => HeroRenderState): void {
    this._heroRenderState$.next(updater(this._heroRenderState$.value))
  }
}
